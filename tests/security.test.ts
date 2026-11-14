import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pickClientIp } from "@/lib/client-ip";
import { readJson } from "@/lib/http";

describe("pickClientIp", () => {
  it("ignora valores inventados pelo visitante no começo da lista", () => {
    expect(pickClientIp("1.1.1.1, 9.9.9.9, 203.0.113.7", null, 1)).toBe("203.0.113.7");
    expect(pickClientIp("203.0.113.7", null, 1)).toBe("203.0.113.7");
  });
  it("respeita o número de proxies confiáveis", () => {
    expect(pickClientIp("1.1.1.1, 203.0.113.7, 10.0.0.1", null, 2)).toBe("203.0.113.7");
    expect(pickClientIp("203.0.113.7", null, 3)).toBe("203.0.113.7");
  });
  it("usa x-real-ip ou um valor fixo quando não há lista", () => {
    expect(pickClientIp(null, "203.0.113.7", 1)).toBe("203.0.113.7");
    expect(pickClientIp("", null, 1)).toBe("desconhecido");
  });
});

describe("readJson", () => {
  const req = (body: string) => new Request("http://x/", { method: "POST", body });
  it("lê JSON válido e recusa lixo ou corpo grande demais", async () => {
    expect(await readJson(req('{"a":1}'))).toEqual({ a: 1 });
    expect(await readJson(req("{nope"))).toBeNull();
    expect(await readJson(req(JSON.stringify({ a: "x".repeat(500) })), 100)).toBeNull();
  });
});

describe("painel", () => {
  // Regressão da falha crítica: o layout sozinho não protege as páginas.
  const root = path.join(import.meta.dirname, "..", "app", "admin", "(painel)");
  const pages: string[] = [];
  const walk = (dir: string) => {
    for (const f of readdirSync(dir)) {
      const p = path.join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (f === "page.tsx") pages.push(p);
    }
  };
  walk(root);

  it("toda página do painel confere o login antes de qualquer outra coisa", () => {
    expect(pages.length).toBeGreaterThanOrEqual(7);
    for (const p of pages) {
      const src = readFileSync(p, "utf8");
      const body = src.slice(src.indexOf("export default"));
      const firstStatement = body.slice(body.indexOf("{\n") + 2).trimStart();
      expect(firstStatement.startsWith("await requireAdmin()"), p).toBe(true);
    }
  });
});

describe("ADMIN_SESSION_SECRET", () => {
  it("em produção não há valor padrão: segredo ausente ou fraco é recusado", async () => {
    const { vi } = await import("vitest");
    const { env } = await import("@/lib/env");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_SESSION_SECRET", "");
    expect(() => env.sessionSecret).toThrow(/ADMIN_SESSION_SECRET/);
    vi.stubEnv("ADMIN_SESSION_SECRET", "curto");
    expect(() => env.sessionSecret).toThrow();
    vi.stubEnv("ADMIN_SESSION_SECRET", "a".repeat(40));
    expect(env.sessionSecret).toBe("a".repeat(40));
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ADMIN_SESSION_SECRET", "");
    expect(env.sessionSecret).toBe("dev-only-secret-change-me");
    vi.unstubAllEnvs();
  });
});
