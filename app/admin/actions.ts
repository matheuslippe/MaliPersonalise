"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, signIn, signOut } from "@/lib/auth";
import { repo } from "@/lib/db";
import { sendShipped } from "@/lib/email";
import { slugify } from "@/lib/slug";
import type { OrderStatus, Product } from "@/lib/types";

export async function loginAction(_prev: string | null, formData: FormData): Promise<string | null> {
  const error = await signIn(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
  if (error) return error;
  redirect("/admin/pedidos");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin/login");
}

const STATUSES = ["aguardando_pagamento", "pago", "em_producao", "enviado", "entregue", "cancelado"] as const;

export async function updateOrderAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = z.enum(STATUSES).parse(formData.get("status")) as OrderStatus;
  const trackingCode = String(formData.get("trackingCode") ?? "").trim().slice(0, 60) || null;
  const db = repo();
  const before = await db.getOrder(id);
  if (!before) return;
  const updated = await db.updateOrder(id, { status, trackingCode });
  if (updated && before.status !== "enviado" && status === "enviado") await sendShipped(updated);
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
}

const fieldSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().trim().min(1, "Campo de personalização sem nome").max(80),
  type: z.enum(["text", "textarea", "select", "color", "file"]),
  required: z.boolean(),
  options: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  maxLength: z.number().int().positive().max(1000).optional(),
  helpText: z.string().trim().max(200).optional(),
});

const productSchema = z.object({
  id: z.string().max(64).optional(),
  categoryId: z.string().min(1, "Escolha a categoria"),
  name: z.string().trim().min(2, "Informe o nome").max(120),
  slug: z.string().trim().max(120).optional(),
  description: z.string().trim().max(4000),
  basePrice: z.number().int().min(0),
  active: z.boolean(),
  featured: z.boolean(),
  weightG: z.number().int().min(1, "Informe o peso").max(30000),
  heightCm: z.number().min(1).max(100),
  widthCm: z.number().min(1).max(100),
  lengthCm: z.number().min(1).max(100),
  productionDays: z.number().int().min(0).max(60),
  placeholderColor: z.string().regex(/^#[0-9a-f]{6}$/i),
  images: z.array(z.object({ url: z.string().max(500), alt: z.string().max(200) })).max(10),
  variants: z
    .array(z.object({ id: z.string().min(1).max(64), name: z.string().trim().min(1, "Opção sem nome").max(80), priceDelta: z.number().int() }))
    .max(30),
  fields: z.array(fieldSchema).max(20),
});

export async function saveProductAction(json: string): Promise<{ error: string } | undefined> {
  await requireAdmin();
  const parsed = productSchema.safeParse(JSON.parse(json));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  const data = parsed.data;
  const db = repo();
  const existing = data.id ? await db.getProductById(data.id) : null;
  for (const f of data.fields) {
    if ((f.type === "select" || f.type === "color") && !f.options?.length) {
      return { error: `Adicione opções ao campo "${f.label}".` };
    }
  }
  const product: Product = {
    ...data,
    id: existing?.id ?? randomUUID(),
    slug: slugify(data.slug || data.name),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  try {
    await db.saveProduct(product);
  } catch (err) {
    return { error: (err as Error).message };
  }
  revalidatePath("/", "layout");
  redirect("/admin/produtos");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  await repo().deleteProduct(String(formData.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/produtos");
}

const settingsSchema = z.object({
  promoMessage: z.string().trim().max(160),
  whatsapp: z.string().transform((v) => v.replace(/\D/g, "")).refine((v) => !v || (v.length >= 12 && v.length <= 13), "WhatsApp deve ter DDI + DDD + número, ex.: 5511999999999"),
  instagram: z.string().trim().max(60).transform((v) => v.replace(/^@/, "")),
  originCep: z.string().transform((v) => v.replace(/\D/g, "")).refine((v) => !v || v.length === 8, "CEP de origem inválido"),
  pickupEnabled: z.boolean(),
  pickupAddress: z.string().trim().max(300),
});

export async function saveSettingsAction(_prev: string | null, formData: FormData): Promise<string | null> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    promoMessage: formData.get("promoMessage") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    instagram: formData.get("instagram") ?? "",
    originCep: formData.get("originCep") ?? "",
    pickupEnabled: formData.get("pickupEnabled") === "on",
    pickupAddress: formData.get("pickupAddress") ?? "",
  });
  if (!parsed.success) return parsed.error.issues[0].message;
  await repo().saveSettings(parsed.data);
  revalidatePath("/", "layout");
  return "Configurações salvas.";
}
