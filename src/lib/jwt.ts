// src/lib/jwt.ts
import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as Secret;

export function signToken(
  payload: object,
  expiresIn: SignOptions['expiresIn'] = '7d'
): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): any {
  // jwt.verify puede devolver string | object, devolvemos any para facilidad.
  // Si querés tiparlo más estrictamente, cambialo según tu payload.
  return jwt.verify(token, JWT_SECRET);
}
