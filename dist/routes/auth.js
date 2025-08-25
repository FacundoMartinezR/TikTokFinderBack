"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("../lib/passport"));
const jwt_1 = require("../lib/jwt");
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// helpers de cookie
const isProd = process.env.NODE_ENV === 'production';
const baseCookieOptions = {
    httpOnly: true,
    secure: isProd, // secure solo en producción
    sameSite: isProd ? 'none' : 'lax', // 'none' en prod para cross-site; 'lax' en dev
    path: '/',
    maxAge: 7 * 24 * 3600 * 1000, // 7 días en ms (res.cookie usa ms)
};
if (process.env.COOKIE_DOMAIN) {
    // p.ej. ".midominio.com" si querés compartir cookie entre subdominios
    baseCookieOptions.domain = process.env.COOKIE_DOMAIN;
}
// Google OAuth
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', { session: false }), async (req, res) => {
    try {
        // @ts-ignore
        const user = req.user;
        if (!user) {
            console.log('[auth/google/callback] No user found');
            return res.status(401).json({ ok: false, error: 'User not found' });
        }
        console.log('[auth/google/callback] User found', user);
        const token = (0, jwt_1.signToken)({ id: user.id, email: user.email, role: user.role });
        console.log('[auth/google/callback] JWT created', token);
        // Usa res.cookie en lugar de serializar manualmente
        res.cookie('token', token, baseCookieOptions);
        console.log('[auth/google/callback] Set cookie with options:', {
            ...baseCookieOptions,
            // no logueamos el token entero por seguridad
        });
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
    catch (err) {
        console.error('[auth/google/callback] ERROR', err);
        return res.status(500).json({ ok: false, error: 'Internal Server Error' });
    }
});
// Endpoint para obtener usuario logueado
router.get('/me', async (req, res) => {
    console.log('[/auth/me] Origin:', req.headers.origin);
    console.log('[/auth/me] Cookies:', req.cookies);
    const token = req.cookies?.token;
    if (!token)
        return res.status(401).json({ ok: false, error: 'Not authenticated' });
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.id } });
        if (!user)
            return res.status(401).json({ ok: false, error: 'User not found' });
        res.json({ ok: true, user });
    }
    catch (e) {
        res.status(401).json({ ok: false, error: 'Invalid token' });
    }
});
// Logout endpoint
router.post('/logout', (req, res) => {
    try {
        // clearCookie usa las mismas opciones para asegurarse de sobreescribir la cookie
        res.clearCookie('token', {
            ...baseCookieOptions,
            // para clearCookie asegúrate de poner maxAge/expiry acorde:
            expires: new Date(0),
            maxAge: 0,
        });
        return res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Error logging out' });
    }
});
exports.default = router;
