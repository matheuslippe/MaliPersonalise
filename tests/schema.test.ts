import { describe, expect, it } from "vitest";
import { checkoutSchema, isValidCpf } from "@/lib/checkout-schema";
import { lineKey } from "@/lib/cart-store";
import { parseBRL } from "@/lib/money";

describe("isValidCpf", () => {
  it("valida dígitos verificadores", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("529.982.247-24")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
  });
});

describe("checkoutSchema", () => {
  it("normaliza telefone, CPF e CEP", () => {
    const r = checkoutSchema.parse({
      items: [{ productId: "p", variantId: null, quantity: 1, personalization: {} }],
      customer: { name: "Ana Souza", email: "ANA@EXEMPLO.COM", phone: "(11) 98888-7777", cpf: "529.982.247-25" },
      shippingServiceId: "1",
      address: { cep: "01310-100", street: "Av. Paulista", number: "1000", district: "Bela Vista", city: "São Paulo", state: "sp" },
    });
    expect(r.customer).toMatchObject({ email: "ana@exemplo.com", phone: "11988887777", cpf: "52998224725" });
    expect(r.address).toMatchObject({ cep: "01310100", state: "SP" });
  });
});

describe("lineKey", () => {
  it("agrupa itens com a mesma personalização, independente da ordem", () => {
    const a = lineKey({ productId: "p", variantId: "v", personalization: { a: "1", b: "2" } });
    const b = lineKey({ productId: "p", variantId: "v", personalization: { b: "2", a: "1" } });
    expect(a).toBe(b);
    expect(lineKey({ productId: "p", variantId: "v", personalization: { a: "x" } })).not.toBe(a);
  });
});

describe("parseBRL", () => {
  it("entende formatos brasileiros", () => {
    expect(parseBRL("49,90")).toBe(4990);
    expect(parseBRL("R$ 1.049,90")).toBe(104990);
    expect(parseBRL("35")).toBe(3500);
  });
});
