import express from 'express';
import passport from '../lib/passport';
import { signToken, verifyToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';

const router = express.Router();

// helpers de cookie
const isProd = process.env.NODE_ENV === 'production';
const baseCookieOptions: any = {
  httpOnly: true,
  secure: true,                      // secure solo en producción
  sameSite: true,   // 'none' en prod para cross-site; 'lax' en dev
  path: '/',
  maxAge: 1 * 24 * 3600 * 1000,        // 1 día en ms (res.cookie usa ms)
};
if (process.env.COOKIE_DOMAIN) {
  // p.ej. ".midominio.com" si querés compartir cookie entre subdominios
  baseCookieOptions.domain = process.env.COOKIE_DOMAIN;
}

/**
 * Flow:
 * 1) /auth/google -> Google OAuth
 * 2) Google redirects to /auth/google/callback on the backend
 * 3) backend creates finalToken (long-lived JWT) and a short-lived exchangeToken
 *    that *contains* the finalToken (exchangeToken expires quickly).
 * 4) backend redirects browser to FRONTEND_URL/auth/exchange?code=<exchangeToken>
 * 5) frontend page POSTs the code to /auth/exchange (from the frontend origin).
 * 6) backend verifies exchangeToken and then sets the httpOnly cookie properly.
 */

// Google OAuth (start)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback - create exchangeToken and redirect to frontend
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      if (!user) {
        console.log('[auth/google/callback] No user found');
        return res.redirect(`${process.env.FRONTEND_URL}/auth/fail`);
      }

      console.log('[auth/google/callback] User found', { id: user.id, email: user.email });

      // 1) final token (the one we want as cookie)
      const finalToken = signToken({ id: user.id, email: user.email, role: user.role });

      // 2) exchange token (short-lived). We embed the finalToken inside.
      //    We add an explicit exp claim to keep it very short-lived (2 minutes).
      //    If your signToken implementation overrides exp, adapt accordingly.
      const nowSec = Math.floor(Date.now() / 1000);
      const exchangePayload: any = {
        uid: user.id,
        exchangeFor: finalToken,
        // expiration in ~2 minutes
        exp: nowSec + 120,
      };
      const exchangeToken = signToken(exchangePayload);

      // Redirect browser to frontend exchange page with the short code
      // frontend will POST this code to /auth/exchange to receive the cookie
      const redirectTo = `${process.env.FRONTEND_URL}/auth/exchange?code=${encodeURIComponent(exchangeToken)}`;
      console.log('[auth/google/callback] Redirecting to exchange page', redirectTo);
      return res.redirect(redirectTo);
    } catch (err) {
      console.error('[auth/google/callback] ERROR', err);
      return res.status(500).json({ ok: false, error: 'Internal Server Error' });
    }
  }
);

// Exchange endpoint: frontend posts short code -> backend verifies and sets cookie
router.post('/exchange', express.json(), async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ ok: false, error: 'Missing code' });

    let payload: any;
    try {
      payload = verifyToken(code);
    } catch (verifyErr) {
      console.warn('[auth/exchange] verifyToken failed', verifyErr);
      return res.status(401).json({ ok: false, error: 'Invalid or expired code' });
    }

    const finalToken = payload?.exchangeFor;
    if (!finalToken) {
      console.warn('[auth/exchange] exchangeFor missing in payload', payload);
      return res.status(400).json({ ok: false, error: 'Invalid code payload' });
    }

    // set cookie now: this request is initiated from the frontend origin,
    // so cookie will be accepted by the browser (not a third-party response).
    res.cookie('token', finalToken, baseCookieOptions);
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
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Error logging out' });
  }
});

export default router;
