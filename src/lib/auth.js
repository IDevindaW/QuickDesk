import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("2h")
    .sign(secret);
}

export async function getSession() {
  const store = await cookies();
  const token = store.get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload; // { id, name, role }
  } catch {
    return null;
  }
}

export async function setSessionCookie(token) {
  const store = await cookies();
  store.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete("token");
}