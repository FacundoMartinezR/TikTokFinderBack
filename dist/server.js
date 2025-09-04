"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // asegúrate de cargar .env lo antes posible
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const passport_1 = __importDefault(require("./lib/passport"));
const auth_1 = __importDefault(require("./routes/auth"));
const tiktokers_1 = __importDefault(require("./routes/tiktokers"));
const paypal_webhook_1 = __importDefault(require("./routes/paypal-webhook"));
const paypal_1 = __importDefault(require("./routes/paypal"));
const path_1 = __importDefault(require("path"));
const PORT = process.env.PORT ?? 4000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const MONGO_URL = process.env.DATABASE_URL;
const BACKEND_PUBLIC_URL = process.env.BACKEND_PUBLIC_URL; // opcional: setea en Render, ej: https://api-tu-app.onrender.com
const app = (0, express_1.default)();
// 👇 MUY IMPORTANTE para cookies secure detrás de proxy (Render)
app.set('trust proxy', 1);
// Middlewares básicos
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Allowed origins (usa FRONTEND_URL como principal)
const allowed = new Set([
    FRONTEND_URL,
    'http://localhost:5173',
    'https://tik-tok-finder.vercel.app',
    'http://localhost:3000'
]);
// Middleware CORS personalizado (acepta sin origin para webhooks/tools)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // permite llamadas sin origin (curl/postman/webhooks)
    if (!origin) {
        // no setear ACA Access-Control-Allow-Origin cuando no hay origin
        return next();
    }
    // allow if exact or if frontend url is a prefix (helpful en dev)
    const ok = Array.from(allowed).some(a => origin === a || origin.startsWith(a));
    if (!ok) {
        console.warn('CORS blocked origin:', origin);
        return res.status(403).send('Origin not allowed');
    }
    // Setear headers CORS de forma explícita
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});
// Simple request logger for debugging
app.use((req, res, next) => {
    console.log('[REQ]', req.method, req.path, 'Origin=', req.headers.origin, 'Incoming cookies=', req.headers.cookie);
    res.on('finish', () => {
        console.log('[RES]', req.method, req.path, 'status=', res.statusCode, 'set-cookie=', res.getHeader('set-cookie'));
    });
    next();
});
// CORS específico para webhook (permite cualquier origen)
app.use("/paypal-webhook", (0, cors_1.default)());
// Passport init
app.use(passport_1.default.initialize());
// --- Static serving for avatars ---
// asegúrate de que tus avatares estén en <projectRoot>/public/avatars/<file>
const avatarsDir = path_1.default.join(process.cwd(), "public", "avatars");
if (!fsExistsSync(avatarsDir)) {
    // no lanzar error en prod; solo aviso
    console.warn(`[WARN] avatars directory does not exist: ${avatarsDir}`);
}
app.use("/avatars", express_1.default.static(avatarsDir, {
    maxAge: "7d",
}));
// --- Middleware to normalize avatarUrl in JSON responses ---
// Intercepta res.json para transformar rutas relativas en absolutas
app.use((req, res, next) => {
    const origJson = res.json.bind(res);
    res.json = (body) => {
        try {
            const base = BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
            const transform = (obj) => {
                if (!obj || typeof obj !== 'object')
                    return obj;
                if (Array.isArray(obj)) {
                    return obj.map(transform);
                }
                const out = {};
                for (const k of Object.keys(obj)) {
                    const v = obj[k];
                    if ((k === 'avatarUrl' || k === 'avatar' || /avatar/i.test(k)) && typeof v === 'string' && v.length > 0) {
                        // detectar rutas relativas y tokens expirables de tiktokcdn (los dejamos si ya son absolutas)
                        if (v.startsWith('/avatars') || v.startsWith('avatars/') || v.includes('public/avatars')) {
                            // normalizar a /avatars/...
                            const rel = v.startsWith('/') ? v : `/${v}`;
                            out[k] = `${base}${rel.replace('/public', '')}`;
                            continue;
                        }
                        // si la URL ya es absoluta a tiktokcdn con query tokens -> opcionalmente la dejamos tal cual
                        out[k] = v;
                        continue;
                    }
                    // si el campo es un objeto/array, transformarlo recursivamente
                    out[k] = (typeof v === 'object' && v !== null) ? transform(v) : v;
                }
                return out;
            };
            const newBody = transform(body);
            return origJson(newBody);
        }
        catch (e) {
            console.warn('Error transforming response JSON for avatarUrl:', e);
            return origJson(body);
        }
    };
    next();
});
// Rutas
app.use('/auth', auth_1.default);
app.use('/api/tiktokers', tiktokers_1.default);
app.use("/paypal-webhook", paypal_webhook_1.default);
app.use('/paypal', paypal_1.default);
// root
app.get('/', (req, res) => res.json({ ok: true }));
// ejemplo para debug: devolver base pública
app.get('/_backend-info', (req, res) => {
    res.json({
        ok: true,
        backendPublicUrl: BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`,
        frontendAllowed: Array.from(allowed)
    });
});
// Helper para loggear errores con stack
function handleFatalError(err) {
    console.error('FATAL ERROR - server initialization failed');
    if (err instanceof Error) {
        console.error(err.stack);
    }
    else {
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
        await mongoose_1.default.connect(MONGO_URL, {});
        console.log('Mongoose conectado ✅');
        // listar rutas (útil en dev)
        function listEndpoints(app) {
            const routes = [];
            app._router.stack.forEach((middleware) => {
                if (middleware.route) {
                    routes.push(middleware.route);
                }
                else if (middleware.name === "router") {
                    middleware.handle.stack.forEach((handler) => {
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
        listEndpoints(app);
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
        });
    }
    catch (err) {
        handleFatalError(err);
    }
})();
// small helper (avoid importing fs at top only for exists sync)
function fsExistsSync(p) {
    try {
        const fs = require('fs');
        return fs.existsSync(p);
    }
    catch {
        return false;
    }
}
