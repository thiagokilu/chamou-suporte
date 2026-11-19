export type UserRole = "ADMIN" | "AGENT" | "CLIENT" | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const USER_KEY = "tickets_user";
const TOKEN_KEY = "tickets_token";
export const DEMO_TOKEN = "demo-token";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Convert the different common /auth/me response envelopes into our user shape. */
export function normalizeUser(value: unknown): User | null {
  let candidate = asRecord(value);
  // APIs often wrap the profile in `data`, `user`, or `profile`.
  for (let depth = 0; candidate && depth < 4; depth += 1) {
    const nested = [candidate.user, candidate.profile, candidate.data]
      .map(asRecord)
      .find(Boolean);
    if (!nested) break;
    candidate = nested;
  }
  if (!candidate) return null;

  const id =
    candidate.id ??
    candidate.userId ??
    candidate.user_id ??
    candidate._id ??
    candidate.sub;
  const emailValue = candidate.email ?? candidate.mail;
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const nameValue = [
    candidate.name,
    candidate.username,
    candidate.nome,
    candidate.fullName,
    candidate.full_name,
    candidate.displayName,
  ].find(
    (item) => typeof item === "string" && item.trim() && item.trim() !== email,
  );
  const roleValue = candidate.role ?? candidate.userRole ?? candidate.user_role;
  const role = typeof roleValue === "string" ? roleValue.toUpperCase() : null;

  if ((typeof id !== "string" && typeof id !== "number") || !email) return null;
  if (role !== null && !["ADMIN", "AGENT", "CLIENT"].includes(role))
    return null;

  return {
    id: String(id),
    name:
      typeof nameValue === "string" ? nameValue.trim() : email.split("@")[0],
    email,
    role: role as UserRole,
  };
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${TOKEN_KEY}=`));
  return cookie ? decodeURIComponent(cookie.slice(TOKEN_KEY.length + 1)) : null;
}

export function getUserFromToken(): {
  id: string;
  email?: string;
  role?: string | null;
} | null {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return null;
    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const payload: unknown = JSON.parse(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")),
    );
    if (!payload || typeof payload !== "object") return null;

    const claims = payload as Record<string, unknown>;
    const id =
      claims.sub ?? claims.id ?? claims.userId ?? claims.user_id ?? claims.uid;
    if (typeof id !== "string" && typeof id !== "number") return null;

    return {
      id: String(id),
      email:
        typeof claims.email === "string"
          ? claims.email
          : typeof claims.mail === "string"
            ? claims.mail
            : undefined,
      role:
        typeof (claims.role ?? claims.userRole ?? claims.user_role) === "string"
          ? String(
              claims.role ?? claims.userRole ?? claims.user_role,
            ).toUpperCase()
          : null,
    };
  } catch {
    return null;
  }
}

export function isDemoMode(): boolean {
  return getStoredToken() === DEMO_TOKEN;
}

export function enterDemoMode() {
  setStoredToken(DEMO_TOKEN);
  setStoredUser({
    id: "demo-admin",
    name: "Administrador Demo",
    email: "admin@demo.com",
    role: "ADMIN",
  });
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  if (token) {
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; Max-Age=604800; SameSite=Lax${secure}`;
  } else {
    document.cookie = `${TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  }
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;

    const parsed = normalizeUser(JSON.parse(stored));
    if (!parsed) {
      localStorage.removeItem(USER_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) {
    const normalized = normalizeUser(user);
    if (normalized) localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    else localStorage.removeItem(USER_KEY);
  } else {
    localStorage.removeItem(USER_KEY);
  }
  window.dispatchEvent(new Event("tickets-user-change"));
}

export function clearStoredUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
  setStoredToken(null);
  window.dispatchEvent(new Event("tickets-user-change"));
}

export function isAdmin(user: User | null): boolean {
  return user?.role === "ADMIN";
}

export function isAgent(user: User | null): boolean {
  return user?.role === "AGENT";
}

export function isClient(user: User | null): boolean {
  return user?.role === "CLIENT";
}
