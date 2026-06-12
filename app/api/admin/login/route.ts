import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  checkCredentials,
  createSessionToken,
} from "@/lib/auth";

export async function POST(request: Request) {
  const { name, password } = (await request.json().catch(() => ({}))) as {
    name?: string;
    password?: string;
  };

  if (!name || !password || !checkCredentials(name, password)) {
    return NextResponse.json(
      { error: "Incorrect name or password." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true, name: name.toLowerCase() });
  response.cookies.set(SESSION_COOKIE, createSessionToken(name), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
