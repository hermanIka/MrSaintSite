/**
 * LOCAL STORAGE SERVICE
 * 
 * Remplace l'Object Storage Replit par un stockage fichier local.
 * Compatible avec n'importe quel hébergeur (Hostinger VPS, etc.).
 * Les fichiers sont servis via Express sur /uploads/*.
 */

import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";
import type { Request, Response } from "express";

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(UPLOADS_DIR);

export class LocalStorageService {
  getUploadsDir(): string {
    return UPLOADS_DIR;
  }

  getPublicUrl(objectPath: string): string {
    const appUrl = process.env.APP_URL || "http://localhost:5000";
    const filename = path.basename(objectPath);
    return `${appUrl}/uploads/${filename}`;
  }

  normalizeObjectEntityPath(filename: string): string {
    return `/uploads/${path.basename(filename)}`;
  }

  async saveFile(
    fileBuffer: Buffer,
    originalName: string,
    contentType: string
  ): Promise<{ objectPath: string; publicUrl: string }> {
    const ext = this.getExtension(originalName, contentType);
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, fileBuffer);

    const objectPath = `/uploads/${filename}`;
    const publicUrl = this.getPublicUrl(filename);
    return { objectPath, publicUrl };
  }

  async generateUploadToken(
    name: string,
    contentType: string,
    size: number
  ): Promise<{ uploadToken: string; objectPath: string }> {
    const ext = this.getExtension(name, contentType);
    const filename = `${randomUUID()}${ext}`;
    const objectPath = `/uploads/${filename}`;
    const uploadToken = Buffer.from(JSON.stringify({ filename, contentType, size })).toString("base64");
    return { uploadToken, objectPath };
  }

  async handleDirectUpload(req: Request, res: Response): Promise<void> {
    try {
      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const filename = path.basename(req.path);
        const filePath = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(filePath, buffer);
        res.status(200).json({ success: true });
      });
    } catch (err) {
      console.error("[LocalStorage] Upload error:", err);
      res.status(500).json({ error: "Erreur lors de l'upload" });
    }
  }

  async deleteFile(objectPath: string): Promise<void> {
    const filename = path.basename(objectPath);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async getSignedUploadUrl(name: string, contentType: string): Promise<{ uploadURL: string; objectPath: string }> {
    const ext = this.getExtension(name, contentType);
    const filename = `${randomUUID()}${ext}`;
    const objectPath = `/uploads/${filename}`;
    const appUrl = process.env.APP_URL || "http://localhost:5000";
    const uploadURL = `${appUrl}/api/upload/direct/${filename}`;
    return { uploadURL, objectPath };
  }

  serveFile(req: Request, res: Response): void {
    const filename = req.params.filename;
    if (!filename || filename.includes("..")) {
      res.status(400).json({ error: "Nom de fichier invalide" });
      return;
    }
    const filePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "Fichier introuvable" });
      return;
    }
    res.sendFile(filePath);
  }

  private getExtension(name: string, contentType: string): string {
    const nameExt = path.extname(name);
    if (nameExt) return nameExt;
    const mimeMap: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "application/pdf": ".pdf",
    };
    return mimeMap[contentType] || ".bin";
  }
}

export const localStorageService = new LocalStorageService();
