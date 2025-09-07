import express from "express";
import cookieParser from "cookie-parser";
import { verifyToken } from "../lib/jwt";
import { findUserById } from "../lib/db";
import { ensureProfileSchema, getProfile, upsertProfile, computeCompleteness } from "../lib/profile";

const router = express.Router();
router.use(cookieParser());

const ACCESS_COOKIE_NAME = "tb_access";

function parseAuth(req: express.Request) {
  const token = req.cookies?.[ACCESS_COOKIE_NAME] || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  const claims = verifyToken(token);
  return claims?.sub ?? null;
}

router.get("/", async (req, res) => {
  try {
    const uid = parseAuth(req);
    if (!uid) return res.status(401).json({ error: "unauthorized" });
    let user;
    try {
      await ensureProfileSchema();
      user = await findUserById(uid);
    } catch (e) {
      // DB not configured
      return res.status(503).json({ error: "storage_not_configured" });
    }
    const profile = await getProfile(uid);
    const completeness = computeCompleteness(user!, profile);
    res.json({ profile, completeness });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "error" });
  }
});

router.put("/", async (req, res) => {
  try {
    const uid = parseAuth(req);
    if (!uid) return res.status(401).json({ error: "unauthorized" });
    try {
      await ensureProfileSchema();
    } catch (e) {
      return res.status(503).json({ error: "storage_not_configured" });
    }
    const { bio, preferences, traits } = req.body ?? {};
    const updated = await upsertProfile(uid, { bio, preferences, traits });
    res.json({ profile: updated });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "error" });
  }
});

export default router;
