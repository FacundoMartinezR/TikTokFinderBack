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
import stripe from 'stripe';
import cookie from 'cookie';

const PORT = process.env.PORT ?? 4000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const MONGO_URL = process.env.DATABASE_URL;

const app = express();

// 👇 MUY IMPORTANTE para cookies secure detrás de proxy (Render)
app.set('trust proxy', 1);

// Middlewares básicos
app.use(express.json());
app.use(cookieParser());
const allowed = [FRONTEND_URL, 'http://localhost:5173', 'https://tik-tok-finder.vercel.app'];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow curl/postman
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin not allowed: ${origin}`));
  },
  credentials: true,
}));

// Opcional: preflight
app.options('*', cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin not allowed: ${origin}`));
  },
  credentials: true,
}));


app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  }
}));

// log para ver exactamente qué headers envía el servidor
app.use((req, res, next) => {
  // log incoming cookies
  console.log('[REQUEST] origin=', req.headers.origin, ' cookies=', req.headers.cookie);
  // log response set-cookie cuando termine la respuesta
  res.on('finish', () => {
    console.log('[RESPONSE] set-cookie header=', res.getHeader('set-cookie'));
  });
  next();
});

// Passport init
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.on("finish", () => {
    console.log("Cookies enviadas:", res.getHeader("set-cookie"));
  });
  next();
});

// Rutas
app.use('/auth', authRoutes);
app.use('/api/tiktokers', tiktokerRoutes);

app.get('/', (req, res) => res.json({ ok: true }));

app.get('/test-set-cookie', (req, res) => {
  const token = 'TEST-TOKEN-' + Date.now();
  const serialized = cookie.serialize('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 60 * 60,
    domain: process.env.BACKEND_COOKIE_DOMAIN || 'tiktokfinder.onrender.com'
  });
  res.setHeader('Set-Cookie', serialized);
  res.json({ ok: true, serialized });
});

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

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    handleFatalError(err);
  }
})();
