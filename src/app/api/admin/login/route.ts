import { cookieName, passwordConfigured, sessionToken, validPassword } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!passwordConfigured()) return NextResponse.json({ error: "Вход в панель основного сайта отключён. Используйте отдельную админку." }, { status: 503 });
  try {
    const body = await request.json();
    if (typeof body.password !== "string" || !validPassword(body.password)) {
      return NextResponse.json({ error: "Неверный пароль." }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(cookieName, sessionToken(), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch {
    return NextResponse.json({ error: "Не удалось войти." }, { status: 400 });
  }
}
