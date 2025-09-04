// src/server.ts
import dotenv from 'dotenv';
dotenv.config();

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
import paypalRoutes from './routes/paypal';
import path from 'path';

const PORT = process.env.PORT ?? 4000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const MONGO_URL = process.env.DATABASE_URL;
const BACKEND_PUBLIC_URL = process.env.BACKEND_PUBLIC_URL; // opcional

const app = express();

// trust proxy para cookies seguras si estás detrás de proxy (Render)
app.set('trust proxy', 1);

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Allowed origins
const allowed = new Set<string>([
  FRONTEND_URL,
  'http://localhost:5173',
  'https://tik-tok-finder.vercel.app',
  'http://localhost:3000'
]);

// CORS personalizado
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  if (!origin) { next(); return; }

  const ok = Array.from(allowed).some(a => origin === a || origin.startsWith(a));
  if (!ok) {
    console.warn('CORS blocked origin:', origin);
    return res.status(403).send('Origin not allowed');
  }

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Simple request logger
app.use((req, res, next) => {
  console.log('[REQ]', req.method, req.path, 'Origin=', req.headers.origin, 'Incoming cookies=', req.headers.cookie);
  res.on('finish', () => {
    console.log('[RES]', req.method, req.path, 'status=', res.statusCode, 'set-cookie=', res.getHeader('set-cookie'));
  });
  next();
});

// CORS para webhook
app.use("/paypal-webhook", cors());

// Passport init
app.use(passport.initialize());

// Servir avatares estáticos
const avatarsDir = path.join(process.cwd(), "public", "avatars");
if (!fsExistsSync(avatarsDir)) {
  console.warn(`[WARN] avatars directory does not exist: ${avatarsDir}`);
}
app.use("/avatars", express.static(avatarsDir, {
  maxAge: "7d",
}));

// Transformar avatarUrl relativo a absoluto en JSON responses
app.use((req, res, next) => {
  const origJson = res.json.bind(res);
  res.json = (body?: any) => {
    try {
      const base = BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
      const transform = (obj: any): any => {
        if (!obj || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(transform);
        const out: any = {};
        for (const k of Object.keys(obj)) {
          const v = obj[k];
          if ((k === 'avatarUrl' || k === 'avatar' || /avatar/i.test(k)) && typeof v === 'string' && v.length > 0) {
            if (v.startsWith('/avatars') || v.startsWith('avatars/') || v.includes('public/avatars')) {
              const rel = v.startsWith('/') ? v : `/${v}`;
              out[k] = `${base}${rel.replace('/public', '')}`;
              continue;
            }
            out[k] = v;
            continue;
          }
          out[k] = (typeof v === 'object' && v !== null) ? transform(v) : v;
        }
        return out;
      };

      const newBody = transform(body);
      return origJson(newBody);
    } catch (e) {
      console.warn('Error transforming response JSON for avatarUrl:', e);
      return origJson(body);
    }
  };
  next();
});

// Rutas
app.use('/auth', authRoutes);
app.use('/api/tiktokers', tiktokerRoutes);
app.use("/paypal-webhook", paypalWebhookRouter);
app.use('/paypal', paypalRoutes);

app.get('/', (req, res) => res.json({ ok: true }));

app.get('/_backend-info', (req, res) => {
  res.json({
    ok: true,
    backendPublicUrl: BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`,
    frontendAllowed: Array.from(allowed)
  });
});

// Helper para loggear errores y salir
function handleFatalError(err: unknown) {
  console.error('FATAL ERROR - server initialization failed');
  if (err instanceof Error) {
    console.error(err.stack);
  } else {
    console.error(err);
  }
  process.exit(1);
}

// Validaciones env
if (!MONGO_URL) {
  handleFatalError(new Error('DATABASE_URL no está definida en .env'));
}
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET no definida.');
}
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('WARNING: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET no definidas.');
}

// Conexión a Mongo + levantar server
(async () => {
  try {
    console.log('Intentando conectar a MongoDB...');
    await mongoose.connect(MONGO_URL!, {});
    console.log('Mongoose conectado ✅');

    // --- listEndpoints robusto ---
    function listEndpoints(app: any) {
      try {
        const routes: any[] = [];
        const routerStack = app && app._router && Array.isArray(app._router.stack) ? app._router.stack : [];
        routerStack.forEach((middleware: any) => {
          if (!middleware) return;
          // ruta directa
          if (middleware.route) {
            routes.push(middleware.route);
            return;
          }
          // router montado (express.Router)
          if (middleware.name === 'router' && middleware.handle && Array.isArray(middleware.handle.stack)) {
            middleware.handle.stack.forEach((handler: any) => {
              if (!handler) return;
              if (handler.route) routes.push(handler.route);
            });
            return;
          }
          // en algunos casos el middleware puede contener .handle.route directamente
          if (middleware.handle && middleware.handle.route) {
            routes.push(middleware.handle.route);
            return;
          }
        });

        routes.forEach((route) => {
          if (!route) return;
          const methods = route.methods && typeof route.methods === 'object'
            ? Object.keys(route.methods).map((m) => m.toUpperCase()).join(", ")
            : '';
          console.log(`${methods.padEnd(10)} ${route.path}`);
        });
      } catch (e) {
        console.warn('Warning: listEndpoints failed to enumerate routes:', e);
      }
    }

    listEndpoints(app);

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    handleFatalError(err);
  }
})();

// helper para existsSync sin importar import al inicio
function fsExistsSync(p: string): boolean {
  try {
    const fs = require('fs');
    return fs.existsSync(p);
  } catch {
    return false;
  }
}
