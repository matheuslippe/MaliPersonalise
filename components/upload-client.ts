import { UPLOAD_MAX_BYTES, UPLOAD_TYPES } from "@/lib/uploads";

/** Envia um arquivo do cliente direto para o storage e devolve o caminho salvo. */
export async function uploadCustomerFile(file: File): Promise<string> {
  if (!UPLOAD_TYPES[file.type]) throw new Error("Formato não aceito. Envie PNG, JPG, WEBP ou PDF.");
  if (file.size > UPLOAD_MAX_BYTES) throw new Error("O arquivo deve ter até 10 MB.");
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: file.type, size: file.size }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Não foi possível enviar o arquivo.");
  const put = await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!put.ok) throw new Error("Falha no envio do arquivo. Tente novamente.");
  return data.path as string;
}
