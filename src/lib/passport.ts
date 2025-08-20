import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './prisma';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: `${process.env.BASE_URL}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const providerId = profile.id;
    const email = profile.emails?.[0]?.value || `${providerId}@googleuser.com`; // fallback
    const name = profile.displayName || "Usuario Google";
    const avatar = profile.photos?.[0]?.value || null;

    // Busca por providerId + provider
    let user = await prisma.user.findFirst({
      where: { provider: 'google', providerId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          provider: 'google',
          providerId,
          email,
          name,
          avatar
        }
      });
    }

    done(null, user);
  } catch (err) {
    done(err as Error);
  }
}));

export default passport;
