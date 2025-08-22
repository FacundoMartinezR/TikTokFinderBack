import express from 'express';
import passport from '../lib/passport';
import { signToken, verifyToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';
import cookie from "cookie";

const router = express.Router();

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      if (!user) {
        console.log('[auth/google/callback] No user found');
        return res.status(401).json({ ok: false, error: 'User not found' });
      }

      console.log('[auth/google/callback] User found', user);

      const token = signToken({ id: user.id, email: user.email, role: user.role });
      console.log('[auth/google/callback] JWT created', token);

      const isProd = process.env.NODE_ENV === 'production';
      const serialized = cookie.serialize('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'none',
        path: '/',
        maxAge: 7 * 24 * 3600,
      });

      console.log('[auth/google/callback] Serialized Set-Cookie:', serialized);
      res.setHeader('Set-Cookie', serialized);

      return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (err) {
      console.error('[auth/google/callback] ERROR', err);
      return res.status(500).json({ ok: false, error: 'Internal Server Error' });
    }
  }
);

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

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

export default router;
