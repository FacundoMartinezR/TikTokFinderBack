"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const prisma_1 = require("./prisma");
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const providerId = profile.id;
        const email = profile.emails?.[0]?.value || `${providerId}@googleuser.com`; // fallback
        const name = profile.displayName || "Usuario Google";
        const avatar = profile.photos?.[0]?.value || null;
        // Busca por providerId + provider
        let user = await prisma_1.prisma.user.findFirst({
            where: { provider: 'google', providerId }
        });
        if (!user) {
            user = await prisma_1.prisma.user.create({
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
    }
    catch (err) {
        done(err);
    }
}));
exports.default = passport_1.default;
