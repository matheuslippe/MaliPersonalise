import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { Order } from "./types";
import { ORDER_STATUS_LABEL } from "./types";
import { env } from "./env";
import { formatBRL } from "./money";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function orderHtml(order: Order, intro: string) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.quantity}× ${esc(i.productName)}${i.variantName ? ` — ${esc(i.variantName)}` : ""}</td><td style="text-align:right">${formatBRL(i.unitPrice * i.quantity)}</td></tr>`,
    )
    .join("");
  return `<div style="font-family:Arial,sans-serif;color:#6e404d;max-width:560px">
  <h1 style="font-family:Georgia,serif;color:#570f26;font-weight:400">Mali Personalizê</h1>
  <p>${intro}</p>
  <p><strong>Pedido ${esc(order.code)}</strong> · ${ORDER_STATUS_LABEL[order.status]}</p>
  <table style="width:100%;border-collapse:collapse">${rows}
  <tr><td style="padding:6px 0">Entrega: ${esc(order.shipping.name)}</td><td style="text-align:right">${formatBRL(order.shipping.price)}</td></tr>
  <tr><td style="padding:6px 0"><strong>Total</strong></td><td style="text-align:right"><strong>${formatBRL(order.total)}</strong></td></tr></table>
  <p><a href="${env.siteUrl}/pedido/${order.id}" style="color:#d45270">Acompanhar pedido</a></p>
</div>`;
}

let transporter: Transporter | null = null;

/** SMTP da caixa de e-mail da Hostinger (smtp.hostinger.com:465). */
function smtp(): Transporter | null {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) return null;
  transporter ??= nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  });
  return transporter;
}

async function send(to: string, subject: string, html: string) {
  const t = smtp();
  if (!t) {
    console.info(`[email] (SMTP não configurado) para=${to} assunto="${subject}"`);
    return;
  }
  try {
    await t.sendMail({ from: env.emailFrom, to, subject, html, replyTo: env.storeEmail ?? undefined });
  } catch (err) {
    // falha de e-mail não pode derrubar o webhook de pagamento
    console.error("[email] falha ao enviar", err);
  }
}

export async function sendPaymentConfirmed(order: Order) {
  await send(
    order.customer.email,
    `Recebemos seu pagamento — pedido ${order.code}`,
    orderHtml(order, `Oi, ${esc(order.customer.name.split(" ")[0])}! Seu pagamento foi aprovado e já vamos começar a produzir seu pedido com muito carinho ♡`),
  );
  if (env.storeEmail) {
    await send(env.storeEmail, `Novo pedido pago: ${order.code}`, orderHtml(order, `Novo pedido de ${esc(order.customer.name)}.`));
  }
}

export async function sendShipped(order: Order) {
  await send(
    order.customer.email,
    `Seu pedido ${order.code} foi enviado`,
    orderHtml(
      order,
      `Seu pedido está a caminho!${order.trackingCode ? ` Código de rastreio: <strong>${esc(order.trackingCode)}</strong>.` : ""}`,
    ),
  );
}
