"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
// src/lib/jwt.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
function signToken(payload, expiresIn = '7d') {
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
}
function verifyToken(token) {
    // jwt.verify puede devolver string | object, devolvemos any para facilidad.
    // Si querés tiparlo más estrictamente, cambialo según tu payload.
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
