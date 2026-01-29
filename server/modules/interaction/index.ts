import type { Express } from "express";
import { contactRoutes } from "./routes/contact";

export function registerInteractionRoutes(app: Express) {
  app.use("/api/contact", contactRoutes);
}
