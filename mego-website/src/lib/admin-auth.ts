import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "mego_admin_session";

function getSecret() {
  return process.env.ADMIN_PASSWORD || "";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret() || "fallback-secret").update(value).digest("hex");
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  const token = sign("mego-admin");
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return token === sign("mego-admin");
}

export function checkAdminPassword(password: string) {
  const secret = getSecret();
  if (!secret) return false;
  return password === secret;
}
