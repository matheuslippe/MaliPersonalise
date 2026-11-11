import { describe, expect, it } from "vitest";
import { buildOrderItems, unitPrice, validatePersonalization } from "@/lib/pricing";
import { seedProducts } from "@/lib/seed-data";

const agenda = seedProducts.find((p) => p.id === "prod-agenda-2027")!;
const bottons = seedProducts.find((p) => p.id === "prod-bottons")!;
const upload = "2026-11/123e4567-e89b-12d3-a456-426614174000.png";

describe("unitPrice", () => {
  it("soma o acréscimo da variação", () => {
    expect(unitPrice(agenda, "v-wireo")).toBe(8990);
    expect(unitPrice(agenda, "v-costurada")).toBe(10490);
  });
});

describe("validatePersonalization", () => {
  it("exige campos obrigatórios", () => {
    expect(validatePersonalization(agenda, {})).toHaveLength(2);
  });
  it("respeita limite de caracteres e opções", () => {
    const errs = validatePersonalization(agenda, { "f-nome": "x".repeat(25), "f-cor": "Azul neon" });
    expect(errs.join(" ")).toMatch(/até 24/);
    expect(errs.join(" ")).toMatch(/opção inválida/);
  });
  it("rejeita caminho de arquivo forjado", () => {
    expect(validatePersonalization(bottons, { "f-arte": "../../etc/passwd" })).toHaveLength(1);
    expect(validatePersonalization(bottons, { "f-arte": upload })).toHaveLength(0);
  });
  it("rejeita campos desconhecidos", () => {
    expect(validatePersonalization(bottons, { "f-arte": upload, hack: "1" })).toHaveLength(1);
  });
});

describe("buildOrderItems", () => {
  it("usa o preço do banco e calcula o subtotal", () => {
    const { items, subtotal, errors } = buildOrderItems(seedProducts, [
      { productId: agenda.id, variantId: "v-costurada", quantity: 2, personalization: { "f-nome": "Ana", "f-cor": "Lilás" } },
      { productId: bottons.id, variantId: "v-20", quantity: 1, personalization: { "f-arte": upload } },
    ]);
    expect(errors).toEqual([]);
    expect(items[0].unitPrice).toBe(10490);
    expect(subtotal).toBe(10490 * 2 + 6000);
    expect(items[0].personalization.map((p) => p.label)).toEqual(["Nome na capa", "Cor da capa"]);
  });
  it("exige variação válida", () => {
    const { errors } = buildOrderItems(seedProducts, [
      { productId: agenda.id, variantId: "nao-existe", quantity: 1, personalization: { "f-nome": "Ana", "f-cor": "Lilás" } },
    ]);
    expect(errors[0]).toMatch(/escolha uma opção/);
  });
  it("recusa produto inativo ou inexistente", () => {
    const inactive = { ...agenda, active: false };
    const { errors } = buildOrderItems([inactive], [
      { productId: agenda.id, variantId: "v-wireo", quantity: 1, personalization: {} },
      { productId: "x", variantId: null, quantity: 1, personalization: {} },
    ]);
    expect(errors).toHaveLength(2);
  });
});
