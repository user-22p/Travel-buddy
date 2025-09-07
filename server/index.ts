import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import authRouter, { meHandler, logoutHandler, refreshHandler } from "./routes/auth";
import profileRouter from "./routes/profile";

export function createServer() {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: (origin, cb) => cb(null, origin || true),
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.use("/api/auth", authRouter);
  app.get("/api/auth/me", meHandler);
  app.post("/api/auth/logout", logoutHandler);
  app.post("/api/auth/refresh", refreshHandler);

  // Profile routes
  app.use("/api/profile", profileRouter);

  return app;
}
