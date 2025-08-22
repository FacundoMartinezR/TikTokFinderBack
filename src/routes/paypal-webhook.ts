import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

router.post("/", express.json(), async (req, res) => {
  console.log("[PAYPAL WEBHOOK] evento recibido:", JSON.stringify(req.body, null, 2));
  const event = req.body;

  try {
    const subscriptionId = event.resource?.id;
    if (!subscriptionId) {
      console.warn("[PayPal Webhook] No subscriptionId found in event:", event);
      return res.status(400).send("No subscriptionId in event");
    }

    // Buscar usuario por subscriptionId
    const user = await prisma.user.findFirst({ where: { paypalSubscriptionId: subscriptionId } });
    if (!user) {
      console.warn("[PayPal Webhook] No user found for subscriptionId:", subscriptionId);
      return res.status(404).send("No user for subscriptionId");
    }

    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        console.log(`[PayPal Webhook] Subscription activated for user ${user.id}`);
        await prisma.user.update({ where: { id: user.id }, data: { role: "PAID" } });
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
        console.log(`[PayPal Webhook] Subscription cancelled/expired for user ${user.id}`);
        await prisma.user.update({ where: { id: user.id }, data: { role: "FREE", paypalSubscriptionId: null } });
        break;

      case "PAYMENT.SALE.DENIED":
      case "PAYMENT.SALE.REFUSED":
        console.log(`[PayPal Webhook] Payment failed for user ${user.id}, setting role to FREE`);
        await prisma.user.update({ where: { id: user.id }, data: { role: "FREE" } });
        break;

      default:
        console.log("[PayPal Webhook] Event ignored:", event.event_type);
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("[PayPal Webhook] Error processing event:", err);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
