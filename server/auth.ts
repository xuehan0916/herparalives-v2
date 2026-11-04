import "server-only";
import { cookies } from "next/headers";

const ACCESS = "herpara-access";
const REFRESH = "herpara-refresh";
export function authConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}
export async function authRequest(
  path: string,
  body?: unknown,
  token?: string,
) {
  if (!authConfigured()) return undefined;
  const base = process.env.SUPABASE_URL!.replace(/\/$/, "");
  if (!base.startsWith("https://") && !base.startsWith("http://127.0.0.1:"))
    return undefined;
  return fetch(base + "/auth/v1/" + path, {
    method: body ? "POST" : "GET",
    headers: {
      "content-type": "application/json",
      apikey: process.env.SUPABASE_ANON_KEY!,
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
}
export async function saveAuthSession(session: {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}) {
  const jar = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
  jar.set(ACCESS, session.access_token, {
    ...options,
    maxAge: Math.min(session.expires_in ?? 3600, 86400),
  });
  jar.set(REFRESH, session.refresh_token, {
    ...options,
    maxAge: 60 * 60 * 24 * 30,
  });
}
export async function clearAuthSession() {
  const jar = await cookies();
  jar.delete(ACCESS);
  jar.delete(REFRESH);
}
export async function currentUser() {
  const jar = await cookies();
  let access = jar.get(ACCESS)?.value;
  const refresh = jar.get(REFRESH)?.value;
  if (!access && refresh) {
    const response = await authRequest("token?grant_type=refresh_token", {
      refresh_token: refresh,
    });
    if (response?.ok) {
      const session = await response.json();
      if (session.access_token && session.refresh_token) {
        await saveAuthSession(session);
        access = session.access_token;
      }
    }
  }
  if (!access) return undefined;
  const response = await authRequest("user", undefined, access);
  if (!response?.ok) return undefined;
  const user = await response.json();
  if (!user.id) return undefined;
  const phone = typeof user.phone === "string" ? user.phone : "";
  return {
    userLabel: phone
      ? phone.slice(0, Math.max(0, phone.length - 8)) +
        " ···· " +
        phone.slice(-4)
      : "已登录的旅人",
  };
}
