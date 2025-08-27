// src/server.ts
import dotenv from 'dotenv';
dotenv.config(); // asegúrate de cargar .env lo antes posible

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import passport from './lib/passport';
import authRoutes from './routes/auth';
import tiktokerRoutes from './routes/tiktokers';
import session from 'express-session';
import { prisma } from './lib/prisma';
import paypalWebhookRouter from "./routes/paypal-webhook";


const PORT = process.env.PORT ?? 4000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const MONGO_URL = process.env.DATABASE_URL;

const app = express();

// 👇 MUY IMPORTANTE para cookies secure detrás de proxy (Render)
app.set('trust proxy', 1);

// Middlewares básicos
app.use(express.json());
app.use(cookieParser());
const allowed = [
  (process.env.FRONTEND_URL || 'http://localhost:3000'),
  'http://localhost:5173',
  'https://tik-tok-finder.vercel.app'
];
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  // permite llamadas sin origin (curl/postman/webhooks)
  if (!origin) {
    next();
    return;
  }

  const ok = allowed.some(a => origin === a || origin.startsWith(a));
  if (!ok) {
    console.warn('CORS blocked origin:', origin);
    // si querés devolver 403 en preflight, podés hacerlo; por ahora solo bloqueamos los headers
    return res.status(403).send('Origin not allowed');
  }

  // Setear headers CORS de forma explícita
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  // permitir los headers que usás (content-type para POST JSON)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // exponer headers si necesitás (no es necesario para set-cookie)
  res.setHeader('Vary', 'Origin');

  // si es preflight, responder OK
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use((req, res, next) => {
  console.log('[REQ]', req.method, req.path, 'Origin=', req.headers.origin, 'Incoming cookies=', req.headers.cookie);
  res.on('finish', () => {
    console.log('[RES]', req.method, req.path, 'set-cookie=', res.getHeader('set-cookie'), 'ACAO=', res.getHeader('Access-Control-Allow-Origin'), 'ACAC=', res.getHeader('Access-Control-Allow-Credentials'));
  });
  next();
});

// CORS específico para webhook (permite cualquier origen)
app.use("/paypal-webhook", cors());

/* Opcional: preflight
app.options('*', cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin not allowed: ${origin}`));
  },
  credentials: true,
}));
*/

/*app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  }
}));*/


/* log para ver exactamente qué headers envía el servidor
app.use((req, res, next) => {
  // log incoming cookies
  console.log('[REQUEST] origin=', req.headers.origin, ' cookies=', req.headers.cookie);
  // log response set-cookie cuando termine la respuesta
  res.on('finish', () => {
    console.log('[RESPONSE] set-cookie header=', res.getHeader('set-cookie'));
  });
  next();
});
*/

// Passport init
app.use(passport.initialize());
//app.use(passport.session());

app.use((req, res, next) => {
  res.on("finish", () => {
    console.log("Cookies enviadas:", res.getHeader("set-cookie"));
  });
  next();
});

// Rutas
app.use('/auth', authRoutes);
app.use('/api/tiktokers', tiktokerRoutes);
app.use("/paypal-webhook", paypalWebhookRouter);

app.get('/', (req, res) => res.json({ ok: true }));

/*
app.get('/test-set-cookie', (req, res) => {
  const token = 'TEST-TOKEN-' + Date.now();
  const serialized = cookie.serialize('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 60 * 60,
  });
  res.setHeader('Set-Cookie', serialized);
  res.json({ ok: true, serialized });
});
*/

/*
app.get('/health', (req, res) => {
  console.log('[HEALTH] ping received');
  res.json({ ok: true, time: Date.now() });
});
*/

 app.post("/user/upgrade", async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: "PAID" },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to upgrade user" });
  }
}); 

import paypalRoutes from './routes/paypal';
app.use('/paypal', paypalRoutes);



// Helper para loggear errores con stack
function handleFatalError(err: unknown) {
  console.error('FATAL ERROR - server initialization failed');
  // si es Error mostramos stack, si es otro tipo mostramos el objeto
  if (err instanceof Error) {
    console.error(err.stack);
  } else {
    console.error(err);
  }
  process.exit(1);
}

// Validaciones simples de env
if (!MONGO_URL) {
  handleFatalError(new Error('DATABASE_URL no está definida en .env'));
}
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET no definida. Asegurate de setearla en .env para producción.');
}
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('WARNING: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET no definidas — auth Google no funcionará hasta setearlas.');
}

// Conexión a Mongo + levantar server con manejo de errores
(async () => {
  try {
    console.log('Intentando conectar a MongoDB...');
    await mongoose.connect(MONGO_URL!, {
      // opciones aquí si las necesitás (opcional)
    });
    console.log('Mongoose conectado ✅');
    function listEndpoints(app: any) {
  const routes: any[] = [];
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      // rutas directas
      routes.push(middleware.route);
    } else if (middleware.name === "router") {
      // rutas de routers
      middleware.handle.stack.forEach((handler: any) => {
        let route = handler.route;
        route && routes.push(route);
      });
    }
  });

  routes.forEach((route) => {
    const methods = Object.keys(route.methods)
      .map((m) => m.toUpperCase())
      .join(", ");
    console.log(`${methods.padEnd(10)} ${route.path}`);
  });
}

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
} catch (err) {
  handleFatalError(err);
}
})();