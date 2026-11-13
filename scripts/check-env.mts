// Confere se as variáveis de ambiente estão prontas para PRODUÇÃO (Hostinger).
// Não usa a internet e nunca mostra os valores, só ✓ / ✗ / !.
//
// Uso:  npm run check:env                  (lê .env.local)
//       npm run check:env -- .env.producao (lê outro arquivo)
import { existsSync, readFileSync } from "node:fs";

const file = process.argv[2] ?? ".env.local";
if (!existsSync(file)) {
  console.error(`Arquivo ${file} não encontrado. Copie o .env.example e preencha.`);
  process.exit(1);
}

const env: Record<string, string> = {};
for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i < 1) continue;
  let value = line.slice(i + 1).trim();
  if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
  env[line.slice(0, i).trim()] = value;
}

const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
type Result = "ok" | "erro" | "aviso";
const results: { group: string; label: string; status: Result; hint?: string }[] = [];
let group = "";
const check = (label: string, ok: boolean, hint: string, level: Result = "erro") =>
  results.push({ group, label, status: ok ? "ok" : level, hint: ok ? undefined : hint });
const v = (k: string) => env[k] ?? "";

group = "Site";
check("NEXT_PUBLIC_SITE_URL com https", /^https:\/\/[^/\s]+$/.test(v("NEXT_PUBLIC_SITE_URL")),
  "use o domínio final, ex.: https://malipersonalize.com.br (sem barra no final)");
check("Modo de arquivo local desligado", v("ALLOW_LOCAL_DB") !== "true", "remova ALLOW_LOCAL_DB");
check("ADMIN_SESSION_SECRET forte", v("ADMIN_SESSION_SECRET").length >= 32 && !v("ADMIN_SESSION_SECRET").startsWith("troque"),
  "texto aleatório com 32+ caracteres (protege links de upload e o limite de envios)");

group = "Supabase";
check("NEXT_PUBLIC_SUPABASE_URL", /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(v("NEXT_PUBLIC_SUPABASE_URL")),
  "Project Settings → API → Project URL (https://xxxx.supabase.co)");
check("NEXT_PUBLIC_SUPABASE_ANON_KEY", /^(eyJ|sb_publishable_)/.test(v("NEXT_PUBLIC_SUPABASE_ANON_KEY")),
  "Project Settings → API → chave anon / publishable");
check("SUPABASE_SERVICE_ROLE_KEY", /^(eyJ|sb_secret_)/.test(v("SUPABASE_SERVICE_ROLE_KEY")) &&
  v("SUPABASE_SERVICE_ROLE_KEY") !== v("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  "Project Settings → API → chave service_role / secret (diferente da anon)");
const admins = v("ADMIN_EMAILS").split(",").map((s) => s.trim()).filter(Boolean);
check("ADMIN_EMAILS", admins.length > 0 && admins.every((e) => EMAIL.test(e)),
  "e-mail(s) do login da Mali criado em Authentication → Users, separados por vírgula");

group = "Mercado Pago";
const mp = v("MERCADOPAGO_ACCESS_TOKEN");
check("MERCADOPAGO_ACCESS_TOKEN preenchido", mp.length > 20, "Suas integrações → Credenciais de produção → Access Token");
check("Token de PRODUÇÃO (não de teste)", mp.startsWith("APP_USR-"),
  "token começando com TEST- só serve para testes; use o de produção", "aviso");
check("MERCADOPAGO_WEBHOOK_SECRET", v("MERCADOPAGO_WEBHOOK_SECRET").length >= 16,
  "Suas integrações → Webhooks → assinatura secreta (crie o webhook primeiro)");

group = "Melhor Envio";
check("MELHOR_ENVIO_TOKEN", v("MELHOR_ENVIO_TOKEN").length > 20, "Integrações → Permissões de acesso → Gerar token");
check("MELHOR_ENVIO_SANDBOX=false", v("MELHOR_ENVIO_SANDBOX") === "false",
  "em produção precisa ser false (e o token tem que ser da conta real, não do sandbox)");
check("MELHOR_ENVIO_USER_AGENT com e-mail", /\(.+@.+\)/.test(v("MELHOR_ENVIO_USER_AGENT")),
  'formato exigido: "Mali Personalize (contato@malipersonalize.com.br)"');

group = "E-mail (Hostinger)";
check("SMTP_HOST", v("SMTP_HOST").length > 3, "smtp.hostinger.com");
check("SMTP_PORT numérica", /^\d+$/.test(v("SMTP_PORT")), "465");
check("SMTP_USER é um e-mail", EMAIL.test(v("SMTP_USER")), "a caixa criada no hPanel, ex.: pedidos@malipersonalize.com.br");
check("SMTP_PASS", v("SMTP_PASS").length > 0, "a senha dessa caixa de e-mail");
check("EMAIL_FROM", /<[^@\s]+@[^>\s]+>/.test(v("EMAIL_FROM")), 'ex.: Mali Personalizê <pedidos@malipersonalize.com.br>');
check("EMAIL_FROM usa a mesma caixa do SMTP", v("EMAIL_FROM").includes(`<${v("SMTP_USER")}>`),
  "remetente diferente da caixa costuma cair no spam", "aviso");
check("STORE_NOTIFY_EMAIL", EMAIL.test(v("STORE_NOTIFY_EMAIL")), "e-mail que recebe aviso de cada pedido pago", "aviso");

const icon = { ok: "✓", erro: "✗", aviso: "!" } as const;
console.log(`\nConferindo ${file} para produção`);
let last = "";
for (const r of results) {
  if (r.group !== last) console.log(`\n${r.group}`);
  last = r.group;
  console.log(`  ${icon[r.status]} ${r.label}${r.hint ? `  → ${r.hint}` : ""}`);
}
const errors = results.filter((r) => r.status === "erro").length;
const warns = results.filter((r) => r.status === "aviso").length;
console.log(
  errors
    ? `\n${errors} item(ns) para corrigir${warns ? ` e ${warns} aviso(s)` : ""}. Ainda não está pronto para produção.\n`
    : `\nTudo certo para produção${warns ? ` (com ${warns} aviso(s))` : ""}.\n`,
);
process.exit(errors ? 1 : 0);
