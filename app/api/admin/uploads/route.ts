import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/auth";
import { hasSupabase } from "@/lib/env";
import { readLocalCustomerUpload } from "@/lib/storage";

const TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", pdf: "application/pdf" };

/** Download das artes dos clientes no modo local (admin). */
export async function GET(req: Request) {
  if (hasSupabase) return new NextResponse(null, { status: 404 });
  if (!(await getAdminEmail())) return new NextResponse(null, { status: 401 });
  const path = new URL(req.url).searchParams.get("path") ?? "";
  try {
    const file = await readLocalCustomerUpload(path);
    return new NextResponse(new Uint8Array(file), {
      headers: { "Content-Type": TYPES[path.split(".").pop()!], "Content-Disposition": `inline; filename="${path.split("/").pop()}"` },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
