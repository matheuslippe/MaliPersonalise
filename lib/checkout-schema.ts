import { z } from "zod";

const digits = (s: string) => s.replace(/\D/g, "");

export const cartItemSchema = z.object({
  productId: z.string().min(1).max(64),
  variantId: z.string().max(64).nullable(),
  quantity: z.number().int().min(1).max(99),
  personalization: z.record(z.string().max(64), z.string().max(1000)),
});
export type CartItemInput = z.infer<typeof cartItemSchema>;

export const cepSchema = z
  .string()
  .transform(digits)
  .refine((v) => v.length === 8, "CEP inválido");

export function isValidCpf(raw: string): boolean {
  const cpf = digits(raw);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

export const shippingQuoteSchema = z.object({
  cep: cepSchema,
  items: z.array(cartItemSchema.pick({ productId: true, quantity: true })).min(1).max(50),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Carrinho vazio").max(50),
  customer: z.object({
    name: z.string().trim().min(3, "Informe seu nome completo").max(120),
    email: z.string().trim().toLowerCase().email("E-mail inválido").max(200),
    phone: z
      .string()
      .transform(digits)
      .refine((v) => v.length >= 10 && v.length <= 11, "Telefone inválido"),
    cpf: z.string().transform(digits).refine(isValidCpf, "CPF inválido"),
  }),
  shippingServiceId: z.string().min(1, "Escolha uma forma de entrega").max(32),
  address: z
    .object({
      cep: cepSchema,
      street: z.string().trim().min(2, "Informe a rua").max(200),
      number: z.string().trim().min(1, "Informe o número").max(20),
      complement: z.string().trim().max(100).optional(),
      district: z.string().trim().min(2, "Informe o bairro").max(100),
      city: z.string().trim().min(2, "Informe a cidade").max(100),
      state: z.string().trim().length(2, "UF inválida").toUpperCase(),
    })
    .nullable(),
  notes: z.string().trim().max(1000).default(""),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export function isValidCnpj(raw: string): boolean {
  const c = raw.replace(/\D/g, "");
  if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false;
  const digit = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + Number(c[i]) * w, 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return digit(12) === Number(c[12]) && digit(13) === Number(c[13]);
}
