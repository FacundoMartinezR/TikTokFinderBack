// src/types/express.d.ts
import type { User as PrismaUser } from '@prisma/client'; // opcional si querés alinear con Prisma

declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string | null;
      name?: string | null;
      avatar?: string | null;
      provider?: string | null;
      providerId?: string | null;
      stripeCustomer?: string | null;
      role?: string | null;
      // agregá aquí cualquier otro campo que uses en req.user
    }
  }
}

export {};
