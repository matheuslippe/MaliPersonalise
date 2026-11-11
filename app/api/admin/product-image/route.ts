import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/auth";
import { saveProductImage, UploadError } from "@/lib/storage";

export async function POST(req: Request) {
  if (!(await getAdminEmail())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Envie uma imagem" }, { status: 400 });
  try {
    return NextResponse.json({ url: await saveProductImage(file) });
  } catch (err) {
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("[product-image]", err);
    return NextResponse.json({ error: "Falha ao salvar a imagem" }, { status: 500 });
  }
}
