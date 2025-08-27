// src/routes/auth.ts
import express from 'express';
import passport from '../lib/passport';
import { signToken, verifyToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

const router = express.Router();

// helpers de cookie
const baseCookieOptions: any = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: '/',
  maxAge: 7 * 24 * 3600 * 1000,
};
if (process.env.COOKIE_DOMAIN) {
  baseCookieOptions.domain = process.env.COOKIE_DOMAIN;
}

/**
 * Exchange store (in-memory)
 * key -> { finalToken, expiresAt }
 *
 * WARNING: esto es temporal y funciona solo en servidores con memoria persistente.
 * Para producción con varias instancias usar Redis o guardar en DB.
 */
type ExchangeEntry = { finalToken: string; expiresAt: number };
const exchangeStore = new Map<string, ExchangeEntry>();

// Limpieza periódica de entries expiradas (cada 30s)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of exchangeStore.entries()) {
    if (val.expiresAt <= now) exchangeStore.delete(key);
  }
}, 30_000);

/**
 * Google OAuth start
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * Google callback
 * - crea finalToken (JWT con signToken)
 * - genera un code aleatorio corto (hex) y lo guarda en exchangeStore -> finalToken
 * - redirige al frontend /auth/exchange?code=<code>
 */
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      if (!user) {
        console.warn('[auth/google/callback] No user from passport');
        return res.redirect(`${process.env.FRONTEND_URL}/auth/fail`);
      }

      console.log('[auth/google/callback] user found', { id: user.id, email: user.email });

      // CREA solo el finalToken (NO lo pieses como cookie aquí)
      const finalToken = signToken({ id: user.id, email: user.email, role: user.role });

      // GUARDA finalToken en exchangeStore (o genera exchange JWT)
      const code = crypto.randomBytes(24).toString('hex');
      exchangeStore.set(code, { finalToken, expiresAt: Date.now() + 2 * 60 * 1000 });

      console.log('[auth/google/callback] created exchange code (not cookie) ->', code);
      return res.redirect(`${process.env.FRONTEND_URL}/auth/exchange?code=${code}`);
    } catch (err) {
      console.error('[auth/google/callback] ERROR', err);
      return res.status(500).send('Internal Server Error');
    }
  }
);

router.post('/exchange', express.json(), async (req, res) => {
  try {
    const { code } = req.body;
    console.log('[auth/exchange] received code:', code);
    const entry = exchangeStore.get(code);
    if (!entry) {
      console.warn('[auth/exchange] invalid/expired code');
      return res.status(401).json({ ok: false, error: 'Invalid or expired code' });
    }

    // One-time: borrar el code
    exchangeStore.delete(code);

    // Aquí SETEAMOS la cookie (petición iniciada por el frontend)
    res.cookie('token', entry.finalToken, baseCookieOptions);
    console.log('[auth/exchange] set cookie for domain:', req.hostname || req.headers.host, 'cookieOptions:', baseCookieOptions);
    return res.json({ ok: true });
  } catch (err) {
    console.error('[auth/exchange] ERROR', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
});


// Endpoint para obtener usuario logueado
router.get('/me', async (req, res) => {
  console.log('[/auth/me] Origin:', req.headers.origin);
  console.log('[/auth/me] Cookies:', req.cookies);

  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ ok: false, error: 'Not authenticated' });

  try {
    const payload: any = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ ok: false, error: 'User not found' });

    res.json({ ok: true, user });
  } catch (e) {
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
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Error logging out' });
  }
});

export default router;
