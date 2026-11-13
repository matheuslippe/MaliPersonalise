import "server-only";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { hasSupabase } from "./env";
import { supabaseAdmin } from "./db/supabase";
import { hmac } from "./sign";
import { UPLOAD_MAX_BYTES, UPLOAD_PATH_RE, UPLOAD_TYPES } from "./uploads";

const CUSTOMER_BUCKET = "customer-uploads";
const PRODUCT_BUCKET = "product-images";
const LOCAL_ROOT = path.join(process.cwd(), ".data");

export class UploadError extends Error {}

/** Gera um destino para o cliente enviar a arte direto ao storage (sem passar o arquivo pelo nosso servidor). */
export async function createCustomerUpload(input: { type: string; size: number }) {
  const ext = UPLOAD_TYPES[input.type];
  if (!ext) throw new UploadError("Formato não aceito. Envie PNG, JPG, WEBP ou PDF.");
  if (!(input.size > 0 && input.size <= UPLOAD_MAX_BYTES)) throw new UploadError("O arquivo deve ter até 10 MB.");

  const filePath = `${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${ext}`;

  if (hasSupabase) {
    const { data, error } = await supabaseAdmin().storage.from(CUSTOMER_BUCKET).createSignedUploadUrl(filePath);
    if (error || !data) throw new Error(error?.message ?? "Falha ao preparar upload");
    return { path: filePath, uploadUrl: data.signedUrl };
  }
  const token = hmac(`upload:${filePath}`);
  return {
    path: filePath,
    uploadUrl: `/api/upload/local?path=${encodeURIComponent(filePath)}&token=${token}`,
  };
}

export async function writeLocalCustomerUpload(filePath: string, body: ArrayBuffer) {
  if (!UPLOAD_PATH_RE.test(filePath)) throw new UploadError("Caminho inválido");
  if (body.byteLength > UPLOAD_MAX_BYTES) throw new UploadError("O arquivo deve ter até 10 MB.");
  const dest = path.join(LOCAL_ROOT, CUSTOMER_BUCKET, filePath);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(body));
}

export async function readLocalCustomerUpload(filePath: string) {
  if (!UPLOAD_PATH_RE.test(filePath)) throw new UploadError("Caminho inválido");
  return fs.readFile(path.join(LOCAL_ROOT, CUSTOMER_BUCKET, filePath));
}

export async function customerUploadExists(filePath: string): Promise<boolean> {
  if (!UPLOAD_PATH_RE.test(filePath)) return false;
  if (hasSupabase) {
    const dir = path.posix.dirname(filePath);
    const { data } = await supabaseAdmin()
      .storage.from(CUSTOMER_BUCKET)
      .list(dir, { search: path.posix.basename(filePath), limit: 1 });
    return Boolean(data?.length);
  }
  try {
    await fs.access(path.join(LOCAL_ROOT, CUSTOMER_BUCKET, filePath));
    return true;
  } catch {
    return false;
  }
}

/** URL temporária para o admin baixar a arte do cliente. */
export async function customerUploadUrl(filePath: string): Promise<string> {
  if (hasSupabase) {
    const { data, error } = await supabaseAdmin().storage.from(CUSTOMER_BUCKET).createSignedUrl(filePath, 60 * 60);
    if (error || !data) throw new Error(error?.message ?? "Falha ao gerar link");
    return data.signedUrl;
  }
  return `/api/admin/uploads?path=${encodeURIComponent(filePath)}`;
}

const IMAGE_TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/** Foto de produto enviada pelo admin. Retorna URL pública. */
export async function saveProductImage(file: File): Promise<string> {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new UploadError("Use PNG, JPG ou WEBP.");
  if (file.size > 4 * 1024 * 1024) throw new UploadError("A foto deve ter até 4 MB.");
  const name = `${randomUUID()}.${ext}`;
  const bytes = await file.arrayBuffer();

  if (hasSupabase) {
    const bucket = supabaseAdmin().storage.from(PRODUCT_BUCKET);
    const { error } = await bucket.upload(name, bytes, { contentType: file.type, cacheControl: "31536000" });
    if (error) throw new Error(error.message);
    return bucket.getPublicUrl(name).data.publicUrl;
  }
  const dest = path.join(LOCAL_ROOT, "media", name);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(bytes));
  return `/api/media/${name}`;
}

export async function readLocalMedia(name: string) {
  if (!/^[0-9a-f-]{36}\.(png|jpg|webp)$/.test(name)) throw new UploadError("Arquivo inválido");
  return fs.readFile(path.join(LOCAL_ROOT, "media", name));
}

