import express from 'express';
import passport from '../lib/passport';
import { signToken, verifyToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    // @ts-ignore
    const user = req.user;
    if (!user) {
      return res.status(401).json({ ok: false, error: 'User not found' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 3600 * 1000, // 7 días
    });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

// Endpoint para obtener usuario logueado
router.get('/me', async (req, res) => {
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
