// src/routes/paypal.ts
import express from "express";
import fetch from "node-fetch";
import { prisma } from "../lib/prisma";
import { verifyToken } from "../lib/jwt";

const router = express.Router();

// Credenciales y API de PayPal
const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_PLAN_ID = process.env.PAYPAL_PLAN_ID;
const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // Sandbox

if (!PAYPAL_CLIENT || !PAYPAL_SECRET || !PAYPAL_PLAN_ID) {
  console.error("⚠️ PAYPAL_CLIENT_ID, PAYPAL_SECRET o PAYPAL_PLAN_ID no están definidas en .env");
}

/**
 * Obtener token de acceso de PayPal (comprueba res.ok y devuelve errores claros)
 */
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`PayPal token endpoint returned non-json: ${text}`);
  }

  if (!res.ok) {
    // devolver mensaje claro con status y cuerpo
    throw new Error(`Failed to get PayPal token (status ${res.status}): ${JSON.stringify(data)}`);
  }

  if (!data.access_token) {
    throw new Error(`No access_token in PayPal response: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

/**
 * Intenta extraer userId del request:
 * 1) JWT en cookie "token" (si existe) usando verifyToken
 * 2) Authorization Bearer header (si existe)
 * 3) req.body.userId (si el frontend lo envía)
 */
function extractUserIdFromReq(req: express.Request): string | undefined {
  try {
    const cookieToken = (req.cookies && req.cookies.token) || undefined;
    if (cookieToken) {
      const payload: any = verifyToken(cookieToken);
      if (payload?.id) return payload.id;
    }
  } catch (e) {
    console.log("No se pudo extraer userId del token en cookie (ok si se envía en el body):", (e as Error).message);
  }

  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const bearer = authHeader.split(" ")[1];
      const payload: any = verifyToken(bearer);
      if (payload?.id) return payload.id;
    }
  } catch (e) {
    console.log("No se pudo extraer userId del Authorization header:", (e as Error).message);
  }

  // fallback a body
  if (req.body && req.body.userId) return req.body.userId;

  return undefined;
}

/**
 * POST /paypal/create-subscription
 * Body (recommended): { userId: "<user-id>" }  (o tener JWT cookie)
 */
router.post("/create-subscription", async (req, res) => {
  try {
    console.log("Iniciando creación de suscripción...");

    // obtiene userId desde token o body
    const userId = extractUserIdFromReq(req);
    if (!userId) {
      return res.status(400).json({
        error: "userId_missing",
        message: "No se encontró userId. Enviar userId en body o incluir token JWT en cookies/Authorization header.",
      });
    }
    console.log("userId detectado:", userId);

    if (!PAYPAL_PLAN_ID) {
      return res.status(500).json({ error: "server_missing_paypal_plan", message: "PAYPAL_PLAN_ID no definido en .env" });
    }

    const accessToken = await getAccessToken();
    console.log("PayPal access token obtenido (ok)");

    const subscriptionPayload = {
      plan_id: PAYPAL_PLAN_ID,
      application_context: {
        brand_name: "InfluencerFinder",
        return_url: `${process.env.FRONTEND_URL}/paypal-success`,
        cancel_url: `${process.env.FRONTEND_URL}/dashboard`,
      },
    };

    const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriptionPayload),
    });

    const respText = await response.text();
    let data;
    try {
      data = JSON.parse(respText);
    } catch (e) {
      console.error("Respuesta no JSON de PayPal:", respText);
      return res.status(500).json({ error: "paypal_non_json_response", details: respText });
    }

    console.log("Respuesta de PayPal:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      // PayPal devolvió error, pasarlo al frontend para debugging
      return res.status(500).json({ error: "paypal_error_creating_subscription", status: response.status, details: data });
    }

    if (!data.id) {
      return res.status(500).json({ error: "no_subscription_id", details: data });
    }

    // Guardar subscriptionId en la DB
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { paypalSubscriptionId: data.id },
      });
      console.log(`Subscription ID ${data.id} guardada para user ${userId}`);
    } catch (dbErr) {
      console.error("Error guardando subscriptionId en DB:", dbErr);
      return res.status(500).json({ error: "db_save_error", message: "Falló al guardar subscriptionId en DB", details: `${dbErr}` });
    }

    // Obtener link de aprobación
    const approveLink = data.links?.find((l: any) => l.rel === "approve")?.href;
    if (!approveLink) {
      return res.status(500).json({ error: "no_approve_link", details: data });
    }

    // Responder con lo necesario para redirigir al frontend
    return res.json({ subscriptionId: data.id, approveLink });
  } catch (err) {
    console.error("Error en create-subscription:", err);
    return res.status(500).json({ error: "server_error", details: `${err}` });
  }
});

/**
 * POST /paypal/check-subscription
 * Body: { userId?: string, subscriptionId?: string }
 *
 * Si se pasa subscriptionId lo usa directamente; si no, usa userId -> user.paypalSubscriptionId
 */
router.post("/check-subscription", async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    console.log("Token para check-subscription obtenido");

    const { userId: bodyUserId, subscriptionId: bodySubscriptionId } = req.body ?? {};

    let subscriptionId = bodySubscriptionId as string | undefined;
    let userId = bodyUserId as string | undefined;

    // Si no recibimos subscriptionId, tratar de obtener userId (token o body)
    if (!subscriptionId) {
      userId = userId ?? extractUserIdFromReq(req); // intenta de nuevo por token/header/cookie
      if (!userId) {
        return res.status(400).json({ success: false, error: "missing_userId_or_subscriptionId" });
      }

      // obtener user y subscriptionId desde DB
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.paypalSubscriptionId) {
        return res.status(404).json({ success: false, error: "no_subscription_record" });
      }
      subscriptionId = user.paypalSubscriptionId;
    }

    // llamar a PayPal para obtener estado
    const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });

    const respText = await response.text();
    let data;
    try {
      data = JSON.parse(respText);
    } catch (e) {
      console.error("PayPal returned non-json in check:", respText);
      return res.status(500).json({ success: false, error: "paypal_non_json_response", details: respText });
    }

    console.log("Status suscripción PayPal:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(500).json({ success: false, error: "paypal_error_checking", details: data });
    }

    if (data.status === "ACTIVE") {
      // si tenemos userId, actualizar rol
      if (userId) {
        await prisma.user.update({ where: { id: userId }, data: { role: "PAID" } });
        console.log(`User ${userId} actualizado a PAID`);
      }
      return res.json({ success: true, status: data.status });
    }

    // no está active
    return res.json({ success: false, status: data.status, data });
  } catch (err) {
    console.error("Error en check-subscription:", err);
    return res.status(500).json({ success: false, error: "server_error", details: `${err}` });
  }
});

/**
 * POST /paypal/cancel-subscription
 * Body: { subscriptionId?: string, userId?: string }
 */
router.post("/cancel-subscription", async (req, res) => {
  try {
    let { subscriptionId, userId } = req.body ?? {};

    // Si no viene subscriptionId, intentar obtenerlo desde userId
    if (!subscriptionId) {
      userId = userId ?? extractUserIdFromReq(req);
      if (!userId) return res.status(400).json({ error: "missing_userId_or_subscriptionId" });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.paypalSubscriptionId) {
        return res.status(404).json({ error: "no_subscription_record" });
      }
      subscriptionId = user.paypalSubscriptionId;
    }

    // Validar que tenemos subscriptionId
    if (!subscriptionId) return res.status(400).json({ error: "subscriptionId_missing" });

    const accessToken = await getAccessToken();

    // Cancelar suscripción en PayPal
    const cancelReq = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason: "User requested cancellation" }),
    });

    if (!cancelReq.ok) {
      const text = await cancelReq.text();
      console.error("PayPal cancel failed:", text);
      return res.status(500).json({ error: "paypal_cancel_failed", details: text });
    }

    console.log(`Subscription ${subscriptionId} cancellation requested by user ${userId || "unknown"}`);

    // Actualización de rol no se hace aquí; lo hace el webhook usando subscriptionId

    return res.json({ ok: true, message: "Cancel request sent. Rol actualizado vía webhook." });
  } catch (err) {
    console.error("Error canceling subscription:", err);
    return res.status(500).json({ error: "server_error", details: `${err}` });
  }
});


export default router;
