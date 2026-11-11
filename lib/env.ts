import "server-only";

export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  mpAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  mpWebhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
  melhorEnvioToken: process.env.MELHOR_ENVIO_TOKEN,
  melhorEnvioSandbox: process.env.MELHOR_ENVIO_SANDBOX !== "false",
  melhorEnvioUserAgent: process.env.MELHOR_ENVIO_USER_AGENT ?? "Mali Personalize",
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM ?? "Mali Personalizê <pedidos@example.com>",
  storeEmail: process.env.STORE_NOTIFY_EMAIL,
  adminEmails: (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean),
  adminPassword: process.env.ADMIN_PASSWORD, // apenas modo local
  sessionSecret: process.env.ADMIN_SESSION_SECRET ?? "dev-only-secret-change-me",
};

export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey && env.supabaseServiceKey);
export const hasMercadoPago = Boolean(env.mpAccessToken);
export const hasMelhorEnvio = Boolean(env.melhorEnvioToken);
