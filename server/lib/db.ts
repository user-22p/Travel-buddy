import { Pool } from "pg";
import crypto from "node:crypto";

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  username: string | null;
  created_at: Date;
}

export interface Account {
  id: string;
  user_id: string;
  provider: "google" | "instagram";
  provider_account_id: string; // e.g. Google sub or Instagram id
  access_token: string | null;
  refresh_token: string | null;
  expires_at: Date | null;
  created_at: Date;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
}

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      // Lazily create a pool with a dummy config to allow app to boot without DB
      // Any DB call will throw a clear error.
      throw new Error(
        "DATABASE_URL is not set. Please configure a Postgres database (e.g., Neon) and set DATABASE_URL."
      );
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

export async function ensureSchema() {
  const pool = getPool();
  await pool.query(`
    create table if not exists users (
      id uuid primary key,
      email text unique,
      name text,
      image text,
      username text unique,
      created_at timestamptz not null default now()
    );

    create table if not exists accounts (
      id uuid primary key,
      user_id uuid not null references users(id) on delete cascade,
      provider text not null,
      provider_account_id text not null unique,
      access_token text,
      refresh_token text,
      expires_at timestamptz,
      created_at timestamptz not null default now()
    );

    create table if not exists refresh_tokens (
      id uuid primary key,
      user_id uuid not null references users(id) on delete cascade,
      token_hash text not null unique,
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    );
  `);
}

export async function findUserByEmail(email: string) {
  const pool = getPool();
  const { rows } = await pool.query<User>("select * from users where email = $1", [email]);
  return rows[0] ?? null;
}

export async function findUserById(id: string) {
  const pool = getPool();
  const { rows } = await pool.query<User>("select * from users where id = $1", [id]);
  return rows[0] ?? null;
}

export async function findUserByAccount(provider: Account["provider"], providerAccountId: string) {
  const pool = getPool();
  const { rows } = await pool.query<User>(
    `select u.* from users u join accounts a on a.user_id = u.id where a.provider = $1 and a.provider_account_id = $2`,
    [provider, providerAccountId]
  );
  return rows[0] ?? null;
}

export async function createUser(data: { email?: string | null; name?: string | null; image?: string | null; username?: string | null }) {
  const pool = getPool();
  const id = crypto.randomUUID();
  const { rows } = await pool.query<User>(
    `insert into users (id, email, name, image, username) values ($1, $2, $3, $4, $5) returning *`,
    [id, data.email ?? null, data.name ?? null, data.image ?? null, data.username ?? null]
  );
  return rows[0];
}

export async function linkAccount(params: {
  userId: string;
  provider: Account["provider"];
  providerAccountId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: Date | null;
}) {
  const pool = getPool();
  const id = crypto.randomUUID();
  const { rows } = await pool.query<Account>(
    `insert into accounts (id, user_id, provider, provider_account_id, access_token, refresh_token, expires_at)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (provider_account_id) do update set user_id = excluded.user_id, access_token = excluded.access_token, refresh_token = excluded.refresh_token, expires_at = excluded.expires_at
     returning *`,
    [id, params.userId, params.provider, params.providerAccountId, params.accessToken ?? null, params.refreshToken ?? null, params.expiresAt ?? null]
  );
  return rows[0];
}

export async function createOrLinkUserFromGoogle(payload: { email: string; name?: string | null; picture?: string | null; sub: string; accessToken?: string | null; refreshToken?: string | null; expiresAt?: Date | null; }) {
  let user = await findUserByAccount("google", payload.sub);
  if (!user) {
    if (payload.email) {
      user = await findUserByEmail(payload.email);
    }
  }
  if (!user) {
    user = await createUser({ email: payload.email, name: payload.name ?? null, image: payload.picture ?? null });
  }
  await linkAccount({
    userId: user.id,
    provider: "google",
    providerAccountId: payload.sub,
    accessToken: payload.accessToken ?? null,
    refreshToken: payload.refreshToken ?? null,
    expiresAt: payload.expiresAt ?? null,
  });
  return user;
}

export async function createOrLinkUserFromInstagram(payload: { id: string; username: string; accessToken?: string | null; refreshToken?: string | null; expiresAt?: Date | null; existingUserId?: string | null; }) {
  // If user is logged in and linking, use existing user id
  if (payload.existingUserId) {
    await linkAccount({
      userId: payload.existingUserId,
      provider: "instagram",
      providerAccountId: payload.id,
      accessToken: payload.accessToken ?? null,
      refreshToken: payload.refreshToken ?? null,
      expiresAt: payload.expiresAt ?? null,
    });
    const u = await findUserById(payload.existingUserId);
    return u!;
  }
  // Else try by account
  let user = await findUserByAccount("instagram", payload.id);
  if (!user) {
    // Create a new user with username only
    user = await createUser({ username: payload.username });
  }
  await linkAccount({
    userId: user.id,
    provider: "instagram",
    providerAccountId: payload.id,
    accessToken: payload.accessToken ?? null,
    refreshToken: payload.refreshToken ?? null,
    expiresAt: payload.expiresAt ?? null,
  });
  return user;
}

export async function upsertRefreshToken(userId: string, plainToken: string, expiresAt: Date) {
  const pool = getPool();
  const id = crypto.randomUUID();
  const tokenHash = sha256(plainToken);
  await pool.query(
    `insert into refresh_tokens (id, user_id, token_hash, expires_at) values ($1, $2, $3, $4)
     on conflict (token_hash) do update set user_id = excluded.user_id, expires_at = excluded.expires_at`,
    [id, userId, tokenHash, expiresAt]
  );
}

export async function validateRefreshToken(plainToken: string) {
  const pool = getPool();
  const tokenHash = sha256(plainToken);
  const { rows } = await pool.query<RefreshToken>(
    `select * from refresh_tokens where token_hash = $1 and expires_at > now()`,
    [tokenHash]
  );
  const row = rows[0];
  if (!row) return null;
  const user = await findUserById(row.user_id);
  return user;
}

export async function revokeRefreshToken(plainToken: string) {
  const pool = getPool();
  const tokenHash = sha256(plainToken);
  await pool.query(`delete from refresh_tokens where token_hash = $1`, [tokenHash]);
}

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}
