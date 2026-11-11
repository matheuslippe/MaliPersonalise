import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/env";
import { hmac, safeEqual } from "@/lib/sign";
import { UploadError, writeLocalCustomerUpload } from "@/lib/storage";

/** Destino de upload apenas no modo local (sem Supabase). */
export async function PUT(req: Request) {
  if (hasSupabase) return new NextResponse(null, { status: 404 });
  const url = new URL(req.url);
  const path = url.searchParams.get("path") ?? "";
  const token = url.searchParams.get("token") ?? "";
  if (!safeEqual(token, hmac(`upload:${path}`))) return NextResponse.json({ error: "Token inválido" }, { status: 403 });
  try {
    await writeLocalCustomerUpload(path, await req.arrayBuffer());
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
