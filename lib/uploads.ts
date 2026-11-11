// Regras compartilhadas entre cliente e servidor para arquivos enviados pelos clientes.
export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const UPLOAD_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
};
export const UPLOAD_PATH_RE = /^\d{4}-\d{2}\/[0-9a-f-]{36}\.(png|jpg|webp|pdf)$/;
