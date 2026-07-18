const USERS_KEY   = 'fairspace_users';
const SESSION_KEY = 'fairspace_session';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  avatar?: string;
}

export interface Session {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
}

export type AuthResult =
  | { ok: true;  session: Session }
  | { ok: false; field: 'name' | 'email' | 'password' | 'confirm'; message: string };

/* FNV-1a 32-bit + base64 suffix — deterministic, not reversible */
function hashPassword(password: string): string {
  const str = password + 'fs_$alt_7x9p';
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0') +
    btoa(unescape(encodeURIComponent(str))).replace(/[=+/]/g, '').slice(0, 18);
}

function getUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}

export function updateAvatar(userId: string, base64: string): void {
  if (typeof window === 'undefined') return;
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return;
  users[idx].avatar = base64;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const session = getSession();
  if (session) {
    session.avatar = base64;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function register(name: string, email: string, password: string, confirm: string): AuthResult {
  const trimName  = name.trim();
  const normEmail = email.toLowerCase().trim();

  if (!trimName)
    return { ok: false, field: 'name', message: 'Въведи своето пълно име.' };
  if (trimName.length < 2)
    return { ok: false, field: 'name', message: 'Името трябва да е поне 2 символа.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail))
    return { ok: false, field: 'email', message: 'Невалиден имейл адрес.' };
  if (password.length < 8)
    return { ok: false, field: 'password', message: 'Паролата трябва да е поне 8 символа.' };
  if (password !== confirm)
    return { ok: false, field: 'confirm', message: 'Паролите не съвпадат.' };

  const users = getUsers();
  if (users.some(u => u.email === normEmail))
    return { ok: false, field: 'email', message: 'Имейл адресът вече е регистриран.' };

  const user: StoredUser = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    name: trimName,
    email: normEmail,
    passwordHash: hashPassword(password),
    createdAt: Date.now(),
  };

  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  const session: Session = { userId: user.id, name: user.name, email: user.email, avatar: user.avatar };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, session };
}

export function login(email: string, password: string): AuthResult {
  const normEmail = email.toLowerCase().trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail))
    return { ok: false, field: 'email', message: 'Невалиден имейл адрес.' };
  if (!password)
    return { ok: false, field: 'password', message: 'Въведи парола.' };

  const users = getUsers();
  const user  = users.find(u => u.email === normEmail);

  if (!user)
    return { ok: false, field: 'email', message: 'Няма регистриран акаунт с този имейл.' };
  if (user.passwordHash !== hashPassword(password))
    return { ok: false, field: 'password', message: 'Грешна парола. Опитай отново.' };

  const session: Session = { userId: user.id, name: user.name, email: user.email, avatar: user.avatar };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, session };
}

export function logout(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(SESSION_KEY);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}
