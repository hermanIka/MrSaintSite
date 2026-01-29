/**
 * ADMIN MODULE - Authentication
 * 
 * Système d'authentification simple par token JWT
 */

import { Request, Response, NextFunction } from "express";
import * as crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "mr-saint-admin-secret-key-2024";
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 heures

interface TokenPayload {
  adminId: string;
  username: string;
  exp: number;
}

const activeSessions: Map<string, TokenPayload> = new Map();

export function generateToken(adminId: string, username: string): string {
  const payload: TokenPayload = {
    adminId,
    username,
    exp: Date.now() + TOKEN_EXPIRY,
  };
  
  const tokenData = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(tokenData)
    .digest("hex");
  
  const token = Buffer.from(tokenData).toString("base64") + "." + signature;
  activeSessions.set(token, payload);
  
  return token;
}

// Set to track invalidated tokens (for logout functionality)
const invalidatedTokens: Set<string> = new Set();

export function verifyToken(token: string): TokenPayload | null {
  try {
    // Check if token was explicitly invalidated (logout)
    if (invalidatedTokens.has(token)) {
      return null;
    }
    
    const [dataBase64, signature] = token.split(".");
    if (!dataBase64 || !signature) return null;
    
    const tokenData = Buffer.from(dataBase64, "base64").toString("utf-8");
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(tokenData)
      .digest("hex");
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    const payload: TokenPayload = JSON.parse(tokenData);
    
    if (payload.exp < Date.now()) {
      return null;
    }
    
    // Re-add to active sessions if valid (supports server restarts)
    if (!activeSessions.has(token)) {
      activeSessions.set(token, payload);
    }
    
    return payload;
  } catch {
    return null;
  }
}

export function invalidateToken(token: string): void {
  activeSessions.delete(token);
  invalidatedTokens.add(token);
}

export interface AuthenticatedRequest extends Request {
  admin?: TokenPayload;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Non autorisé" });
    return;
  }
  
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    res.status(401).json({ error: "Token invalide ou expiré" });
    return;
  }
  
  req.admin = payload;
  next();
}
