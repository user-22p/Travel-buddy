import type { RequestHandler } from "express";
import cookieParser from "cookie-parser";
import express from "express";
import crypto from "node:crypto";
import {
  ensureSchema,
  createOrLinkUserFromGoogle,
  createOrLinkUserFromInstagram,
  findUserById,
  validateRefreshToken,
  upsertRefreshToken,
  revokeRefreshToken,
} from "../lib/db";
import { signAccessToken, signRefreshToken, verifyToken } from "../lib/jwt";

const router = express.Router();

// Attach cookie parser specifically for this router
router.use(cookieParser());

const FRONTEND_URL = process.env.FRONTEND_URL || "/";
const COOKIE_SECURE = process.env.NODE_ENV === "production";
const ACCESS_COOKIE_NAME = "tb_access";
const REFRESH_COOKIE_NAME = "tb_refresh";

function setAuthCookies(res: express.Response, userId: string) {
  const access = signAccessToken(userId);
  const refresh = signRefreshToken(userId);
  const refreshExp = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  res.cookie(ACCESS_COOKIE_NAME, access, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
  });
  res.cookie(REFRESH_COOKIE_NAME, refresh, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
  });
  // Persist refresh token hash
  void upsertRefreshToken(userId, refresh, refreshExp);
}

function clearAuthCookies(res: express.Response) {
  res.clearCookie(ACCESS_COOKIE_NAME, { path: "/" });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });
}

function getEnv(name: string) {
  return process.env[name] || null;
}

function ensureTrailingSlash(url: string) {
  return url.endsWith("/") ? url : url + "/";
}

// Providers availability endpoint
router.get("/providers", (req, res) => {
  const googleOk = !!(getEnv("GOOGLE_CLIENT_ID") && getEnv("GOOGLE_CLIENT_SECRET") && getEnv("GOOGLE_REDIRECT_URI"));
  const igOk = !!(getEnv("IG_CLIENT_ID") && getEnv("IG_CLIENT_SECRET") && getEnv("IG_REDIRECT_URI"));
  res.json({ google: googleOk, instagram: igOk });
});

function buildStateCookieName(provider: string) {
  return `oauth_state_${provider}`;
}

function parseAuth(req: express.Request) {
  const token = req.cookies?.[ACCESS_COOKIE_NAME] || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  const claims = verifyToken(token);
  return claims?.sub ?? null;
}

// Google OAuth
router.get("/google", async (req, res) => {
  const clientId = getEnv("GOOGLE_CLIENT_ID");
  const redirectUri = getEnv("GOOGLE_REDIRECT_URI");
  if (!clientId || !redirectUri) {
    return res.status(503).json({ error: "Google OAuth not configured" });
  }
  const state = crypto.randomBytes(16).toString("hex");
  const link = req.query.link === "1" ? "1" : "0";
  const statePayload = JSON.stringify({ s: state, l: link });
  res.cookie(buildStateCookieName("google"), statePayload, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    maxAge: 1000 * 60 * 10,
    path: "/",
  });
  const scope = encodeURIComponent("openid email profile");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${encodeURIComponent(state)}`;
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  try {
    await ensureSchema();
    const code = req.query.code as string;
    const state = req.query.state as string;
    const stateCookie = req.cookies[buildStateCookieName("google")];
    if (!code || !state || !stateCookie) return res.status(400).send("Invalid request");
    const parsed = JSON.parse(stateCookie) as { s: string; l: string };
    if (parsed.s !== state) return res.status(400).send("State mismatch");

    const clientId = getEnv("GOOGLE_CLIENT_ID");
    const clientSecret = getEnv("GOOGLE_CLIENT_SECRET");
    const redirectUri = getEnv("GOOGLE_REDIRECT_URI");
    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(503).send("Google OAuth not configured");
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) {
      const t = await tokenRes.text();
      return res.status(400).send(`Token exchange failed: ${t}`);
    }
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token as string;
    const idToken = tokenJson.id_token as string | undefined;

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await userInfoRes.json();
    const email = profile.email as string;
    const name = profile.name as string | undefined;
    const picture = (profile.picture as string | undefined) ?? null;
    const sub = (profile.id as string | undefined) ?? "";

    const linking = parsed.l === "1";
    let userIdToLink: string | null = null;
    if (linking) {
      const uid = parseAuth(req);
      if (!uid) return res.status(401).send("Not authenticated to link account");
      userIdToLink = uid;
    }

    const user = await createOrLinkUserFromGoogle({
      email,
      name: name ?? null,
      picture,
      sub,
      accessToken,
      refreshToken: tokenJson.refresh_token ?? null,
      expiresAt: tokenJson.expires_in ? new Date(Date.now() + tokenJson.expires_in * 1000) : null,
    });

    if (linking && userIdToLink && user.id !== userIdToLink) {
      return res.status(409).send("This Google account is linked to another user");
    }

    setAuthCookies(res, user.id);
    res.redirect(ensureTrailingSlash(FRONTEND_URL) + "dashboard");
  } catch (e: any) {
    res.status(500).send(e?.message || "OAuth error");
  }
});

// Instagram OAuth (Basic Display API)
router.get("/instagram", async (req, res) => {
  const clientId = getEnv("IG_CLIENT_ID");
  const redirectUri = getEnv("IG_REDIRECT_URI");
  if (!clientId || !redirectUri) {
    return res.status(503).json({ error: "Instagram OAuth not configured" });
  }
  const state = crypto.randomBytes(16).toString("hex");
  const link = req.query.link === "1" ? "1" : "0";
  const statePayload = JSON.stringify({ s: state, l: link });
  res.cookie(buildStateCookieName("instagram"), statePayload, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    maxAge: 1000 * 60 * 10,
    path: "/",
  });
  const url = `https://api.instagram.com/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent("user_profile")}&response_type=code&state=${encodeURIComponent(state)}`;
  res.redirect(url);
});

router.get("/instagram/callback", async (req, res) => {
  try {
    await ensureSchema();
    const code = req.query.code as string;
    const state = req.query.state as string;
    const stateCookie = req.cookies[buildStateCookieName("instagram")];
    if (!code || !state || !stateCookie) return res.status(400).send("Invalid request");
    const parsed = JSON.parse(stateCookie) as { s: string; l: string };
    if (parsed.s !== state) return res.status(400).send("State mismatch");

    const clientId = getEnv("IG_CLIENT_ID");
    const clientSecret = getEnv("IG_CLIENT_SECRET");
    const redirectUri = getEnv("IG_REDIRECT_URI");
    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(503).send("Instagram OAuth not configured");
    }

    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }),
    });
    if (!tokenRes.ok) {
      const t = await tokenRes.text();
      return res.status(400).send(`Token exchange failed: ${t}`);
    }
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token as string;
    const userId = String(tokenJson.user_id);

    // Fetch username
    const userRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${encodeURIComponent(accessToken)}`);
    if (!userRes.ok) {
      const t = await userRes.text();
      return res.status(400).send(`User fetch failed: ${t}`);
    }
    const userJson = await userRes.json();
    const username = userJson.username as string;

    const linking = parsed.l === "1";
    let currentUserId: string | null = null;
    if (linking) {
      const uid = parseAuth(req);
      if (!uid) return res.status(401).send("Not authenticated to link account");
      currentUserId = uid;
    }

    const user = await createOrLinkUserFromInstagram({
      id: userId,
      username,
      accessToken,
      existingUserId: currentUserId ?? undefined,
    });

    setAuthCookies(res, user.id);
    res.redirect(ensureTrailingSlash(FRONTEND_URL) + "dashboard");
  } catch (e: any) {
    res.status(500).send(e?.message || "OAuth error");
  }
});

// Auth helpers
export const meHandler: RequestHandler = async (req, res) => {
  try {
    const uid = parseAuth(req);
    if (!uid) return res.status(401).json({ user: null });
    const user = await findUserById(uid);
    if (!user) return res.status(401).json({ user: null });
    res.json({ user: { id: user.id, email: user.email, name: user.name, image: user.image, username: user.username } });
  } catch (e) {
    res.status(500).json({ user: null });
  }
};

export const logoutHandler: RequestHandler = async (_req, res) => {
  clearAuthCookies(res);
  res.json({ ok: true });
};

export const refreshHandler: RequestHandler = async (req, res) => {
  const refresh = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!refresh) return res.status(401).json({ ok: false });
  const claims = verifyToken(refresh);
  if (!claims || claims.typ !== "refresh") return res.status(401).json({ ok: false });
  const user = await validateRefreshToken(refresh);
  if (!user) return res.status(401).json({ ok: false });
  setAuthCookies(res, user.id);
  res.json({ ok: true });
};

export default router;
