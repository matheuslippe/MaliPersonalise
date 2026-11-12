import { NextResponse } from "next/server";
import { z } from "zod";
import { createCustomerUpload, UploadError } from "@/lib/storage";
import { allowUpload, clientKey } from "@/lib/rate-limit";

const schema = z.object({ type: z.string().max(100), size: z.number().int().positive() });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  if (!(await allowUpload(clientKey(req)))) {
    return NextResponse.json(
      { error: "Muitos envios em pouco tempo. Aguarde um pouco ou fale com a gente pelo WhatsApp." },
      { status: 429 },
    );
  }
  try {
    return NextResponse.json(await createCustomerUpload(parsed.data));
  } catch (err) {
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("[upload]", err);
    return NextResponse.json({ error: "Não foi possível enviar o arquivo." }, { status: 500 });
  }
}
