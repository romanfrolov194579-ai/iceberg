import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "iceberg_admin";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function passwordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function validPassword(value: string) {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password && safeEqual(value, password));
}

export function sessionToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return "";
  return createHmac("sha256", password).update("soundcloud-iceberg-admin-session-v1").digest("hex");
}

export async function isAdminAuthorized(request?: Request) {
  const apiSecret = process.env.ADMIN_API_TOKEN;
  const authorization = request?.headers.get("authorization") || "";
  const prefix = "Bearer ";
  const bearer = authorization.slice(0, prefix.length).toLowerCase() === prefix.toLowerCase()
    ? authorization.slice(prefix.length).trim()
    : "";
  if (apiSecret && bearer && safeEqual(bearer, apiSecret)) return true;

  if (passwordConfigured()) {
    const token = (await cookies()).get(cookieName)?.value || "";
    return safeEqual(token, sessionToken());
  }

  return process.env.NODE_ENV !== "production";
}

export { cookieName };
