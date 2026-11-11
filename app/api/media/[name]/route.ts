import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/env";
import { readLocalMedia } from "@/lib/storage";

const TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

/** Fotos de produto no modo local. Em produção as fotos vêm do bucket público do Supabase. */
export async function GET(_req: Request, ctx: RouteContext<"/api/media/[name]">) {
  if (hasSupabase) return new NextResponse(null, { status: 404 });
  const { name } = await ctx.params;
  try {
    const file = await readLocalMedia(name);
    return new NextResponse(new Uint8Array(file), {
      headers: { "Content-Type": TYPES[name.split(".").pop()!], "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
