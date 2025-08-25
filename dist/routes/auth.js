"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.ts
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("../lib/passport"));
const jwt_1 = require("../lib/jwt");
const prisma_1 = require("../lib/prisma");
const crypto_1 = __importDefault(require("crypto"));
const router = express_1.default.Router();
// helpers de cookie
const baseCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: true,
    path: '/',
    maxAge: 7 * 24 * 3600 * 1000,
};
if (process.env.COOKIE_DOMAIN) {
    baseCookieOptions.domain = process.env.COOKIE_DOMAIN;
}
const exchangeStore = new Map();
// Limpieza periódica de entries expiradas (cada 30s)
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of exchangeStore.entries()) {
        if (val.expiresAt <= now)
            exchangeStore.delete(key);
    }
}, 30000);
/**
 * Google OAuth start
 */
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
/**
 * Google callback
 * - crea finalToken (JWT con signToken)
 * - genera un code aleatorio corto (hex) y lo guarda en exchangeStore -> finalToken
 * - redirige al frontend /auth/exchange?code=<code>
 */
router.get('/google/callback', passport_1.default.authenticate('google', { session: false }), async (req, res) => {
    try {
        // @ts-ignore
        const user = req.user;
        if (!user) {
            console.warn('[auth/google/callback] no user returned by passport');
            return res.redirect(`${process.env.FRONTEND_URL}/auth/fail`);
        }
        console.log('[auth/google/callback] user found', { id: user.id, email: user.email });
        // 1) Generar finalToken con tu helper (el que usarás como cookie)
        const finalToken = (0, jwt_1.signToken)({ id: user.id, email: user.email, role: user.role });
        // 2) Generar code aleatorio y guardarlo en store con TTL (2 minutos)
        const code = crypto_1.default.randomBytes(24).toString('hex'); // ~48 chars
        const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutos
        exchangeStore.set(code, { finalToken, expiresAt });
        // 3) Redirigir al frontend con el code en query
        const redirectTo = `${process.env.FRONTEND_URL}/auth/exchange?code=${encodeURIComponent(code)}`;
        console.log('[auth/google/callback] redirecting to', redirectTo);
        return res.redirect(redirectTo);
    }
    catch (err) {
        console.error('[auth/google/callback] ERROR', err);
        return res.status(500).send('Internal Server Error');
    }
});
/**
 * Exchange endpoint
 * - frontend POST { code }
 * - backend valida el code en exchangeStore y sets cookie con finalToken
 */
router.post('/exchange', express_1.default.json(), async (req, res) => {
    try {
        const { code } = req.body;
        if (!code)
            return res.status(400).json({ ok: false, error: 'Missing code' });
        const entry = exchangeStore.get(code);
        if (!entry)
            return res.status(401).json({ ok: false, error: 'Invalid or expired code' });
        if (entry.expiresAt <= Date.now()) {
            exchangeStore.delete(code);
            return res.status(401).json({ ok: false, error: 'Code expired' });
        }
        // Borrar el code (one-time)
        exchangeStore.delete(code);
        // Setear cookie con finalToken (petición vino desde el frontend)
        res.cookie('token', entry.finalToken, baseCookieOptions);
        return res.json({ ok: true });
    }
    catch (err) {
        console.error('[auth/exchange] ERROR', err);
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
        console.error('[/auth/me] verifyToken error', e);
        res.status(401).json({ ok: false, error: 'Invalid token' });
    }
});
// Logout endpoint
router.post('/logout', (req, res) => {
    try {
        res.clearCookie('token', {
            ...baseCookieOptions,
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
