import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";

export function hmac(value: string, secret = env.sessionSecret): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}
