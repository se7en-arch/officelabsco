import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const SECRET = process.env.ADMIN_SECRET ?? 'office-labs-admin-secret';
const ENV_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
const ENV_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';

async function sha256hex(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getCredentials(): Promise<{ username: string; passwordHash: string }> {
  try {
    const rows = await prisma.siteSettings.findMany({
      where: { key: { in: ['adminUsername', 'adminPasswordHash'] } },
    });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    if (map.adminPasswordHash) {
      return {
        username: map.adminUsername ?? ENV_USERNAME,
        passwordHash: map.adminPasswordHash,
      };
    }
  } catch {}
  return {
    username: ENV_USERNAME,
    passwordHash: await sha256hex(ENV_PASSWORD),
  };
}

async function makeToken(username: string, passwordHash: string): Promise<string> {
  return sha256hex(`${username}:${passwordHash}:${SECRET}`);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  const creds = await getCredentials();
  return token === await makeToken(creds.username, creds.passwordHash);
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const creds = await getCredentials();
  const inputHash = await sha256hex(password);
  return username === creds.username && inputHash === creds.passwordHash;
}

export async function getAdminToken(): Promise<string> {
  const creds = await getCredentials();
  return makeToken(creds.username, creds.passwordHash);
}
