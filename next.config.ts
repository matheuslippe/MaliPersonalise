import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const dev = process.env.NODE_ENV !== "production";
const supabaseOrigin = supabaseHost ? ` https://${supabaseHost}` : "";

// CSP: só carrega scripts, estilos e imagens do próprio site (e imagens/arquivos do Supabase).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${supabaseOrigin}`,
  "font-src 'self' data:",
  `connect-src 'self' https://viacep.com.br${supabaseOrigin}${dev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'", // ninguém pode abrir o site (nem o painel) dentro de outro site
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // páginas com dados pessoais nunca ficam em cache de proxy
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/pedido/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
  // Dados de loja/admin são dinâmicos (Supabase, cookies); usamos o modelo clássico de cache.
  cacheComponents: false,
  partialPrefetching: false,
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
