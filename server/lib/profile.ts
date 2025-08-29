import { getPool, ensureSchema } from "./db";

export interface Profile {
  user_id: string;
  bio: string | null;
  preferences: any | null; // JSONB
  traits: string[] | null;
  updated_at: Date;
}

export async function ensureProfileSchema() {
  await ensureSchema();
  const pool = getPool();
  await pool.query(`
    create table if not exists profiles (
      user_id uuid primary key references users(id) on delete cascade,
      bio text,
      preferences jsonb,
      traits text[],
      updated_at timestamptz not null default now()
    );
  `);
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const pool = getPool();
  const { rows } = await pool.query<Profile>("select * from profiles where user_id = $1", [userId]);
  return rows[0] ?? null;
}

export async function upsertProfile(userId: string, data: { bio?: string | null; preferences?: any | null; traits?: string[] | null; }) {
  const pool = getPool();
  const existing = await getProfile(userId);
  if (existing) {
    const merged = {
      bio: data.bio !== undefined ? data.bio : existing.bio,
      preferences: data.preferences !== undefined ? data.preferences : existing.preferences,
      traits: data.traits !== undefined ? data.traits : existing.traits,
    };
    const { rows } = await pool.query<Profile>(
      `update profiles set bio = $2, preferences = $3, traits = $4, updated_at = now() where user_id = $1 returning *`,
      [userId, merged.bio ?? null, merged.preferences ?? null, merged.traits ?? null]
    );
    return rows[0];
  } else {
    const { rows } = await pool.query<Profile>(
      `insert into profiles (user_id, bio, preferences, traits) values ($1, $2, $3, $4) returning *`,
      [userId, data.bio ?? null, data.preferences ?? null, data.traits ?? null]
    );
    return rows[0];
  }
}

export function computeCompleteness(user: { name?: string | null; email?: string | null; image?: string | null; username?: string | null }, profile: Profile | null) {
  let score = 0;
  const parts = [
    !!user.name,
    !!user.email || !!user.username,
    !!user.image,
    !!(profile && profile.bio && profile.bio.length > 20),
    !!(profile && profile.preferences),
    !!(profile && profile.traits && profile.traits.length >= 3),
  ];
  parts.forEach((p) => (score += p ? 1 : 0));
  const percent = Math.round((score / parts.length) * 100);
  return percent;
}
