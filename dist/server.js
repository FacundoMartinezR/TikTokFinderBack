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
const express_session_1 = __importDefault(require("express-session"));
const prisma_1 = require("./lib/prisma");
const PORT = process.env.PORT ?? 4000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const MONGO_URL = process.env.DATABASE_URL;
const app = (0, express_1.default)();
// Middlewares básicos
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use((0, express_session_1.default)({
    secret: "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // en dev false, en prod true con https
    }
}));
// Passport init (sin sessions)
app.use(passport_1.default.initialize());
// Rutas
app.use('/auth', auth_1.default);
app.use('/api/tiktokers', tiktokers_1.default);
app.get('/', (req, res) => res.json({ ok: true }));
app.post("/user/upgrade", async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { role: "PAID" },
        });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to upgrade user" });
    }
});
const paypal_1 = __importDefault(require("./routes/paypal"));
app.use('/paypal', paypal_1.default);
// Helper para loggear errores con stack
function handleFatalError(err) {
    console.error('FATAL ERROR - server initialization failed');
    // si es Error mostramos stack, si es otro tipo mostramos el objeto
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
        await mongoose_1.default.connect(MONGO_URL, {
        // opciones aquí si las necesitás (opcional)
        });
        console.log('Mongoose conectado ✅');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }
    catch (err) {
        handleFatalError(err);
    }
})();
