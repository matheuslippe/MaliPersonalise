# Mali Personalizê — loja virtual

Site com catálogo e venda direta de papelaria personalizada (agendas, planners, bottons, lembrancinhas), seguindo o design do Figma.

**Stack:** Next.js 16 (App Router) · Tailwind CSS 4 · Supabase (Postgres, Storage, Auth) · Mercado Pago Checkout Pro · Melhor Envio · Resend (e-mails) · deploy na Vercel.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # defina ao menos ADMIN_PASSWORD
npm run dev
```

Sem as chaves externas o site funciona em **modo de desenvolvimento**:

| Serviço | Sem configuração |
| --- | --- |
| Supabase | dados em `.data/db.json`, com produtos de exemplo |
| Mercado Pago | o pedido abre com o botão "Simular pagamento aprovado" |
| Melhor Envio | cotação fictícia (PAC/SEDEX "simulado") |
| Resend | os e-mails só aparecem no log |

Em produção (`NODE_ENV=production`) esses modos ficam bloqueados.

- Loja: http://localhost:3000
- Painel: http://localhost:3000/admin (senha = `ADMIN_PASSWORD`)

```bash
npm test        # testes unitários (preço, validação, webhook, CPF)
npm run lint
npm run build
```

## Colocando no ar

1. **Supabase**: crie o projeto e rode `supabase/migrations/20261111000000_init.sql` no SQL Editor (tabelas, RLS, buckets e categorias). Em *Authentication → Users*, crie o usuário da Mali e coloque o e-mail em `ADMIN_EMAILS`.
2. **Mercado Pago**: em *Suas integrações*, crie a aplicação, copie o Access Token (comece com o de teste) e configure o webhook com URL `https://SEU-DOMINIO/api/webhooks/mercadopago` e o evento **Pagamentos**. Copie a assinatura secreta para `MERCADOPAGO_WEBHOOK_SECRET`.
3. **Melhor Envio**: gere o token (comece pelo sandbox, `MELHOR_ENVIO_SANDBOX=true`) e informe o CEP de origem no painel em *Configurações*.
4. **Resend**: verifique o domínio e defina `RESEND_API_KEY`, `EMAIL_FROM` e `STORE_NOTIFY_EMAIL`.
5. **Vercel**: importe o repositório, cadastre as variáveis do `.env.example` e defina `NEXT_PUBLIC_SITE_URL` com o domínio `https`.
6. No painel, cadastre os produtos com fotos, preços, opções, campos de personalização e medidas da embalagem.

## Como funciona

- **Personalização**: cada produto tem campos configuráveis (texto, texto longo, lista, cor, upload). As artes vão direto do navegador para o bucket privado `customer-uploads` por URL assinada, e só o painel gera links temporários para baixar.
- **Checkout**: o servidor recalcula preço e frete (ignora valores vindos do navegador), confirma que os arquivos existem, grava o pedido e redireciona para o Mercado Pago.
- **Pagamento**: o webhook valida `x-signature`, consulta o pagamento na API do MP e atualiza o pedido de forma idempotente. Ao aprovar, envia e-mail para a cliente e para a Mali. A página de retorno também confere o pagamento na API.
- **Painel**: pedidos com filtro por status, personalização e artes, alteração de status e rastreio (ao marcar "Enviado", a cliente recebe e-mail), CRUD de produtos e configurações da loja (barra promocional, WhatsApp, Instagram, CEP de origem, retirada).

## Estrutura

```
app/(loja)/         páginas públicas (início, produtos, sacola, checkout, pedido…)
app/admin/          painel (login, pedidos, produtos, configurações) + server actions
app/api/            frete, checkout, upload, webhook Mercado Pago, mídia local
components/         componentes visuais (Header, Landing, ProductForm, CheckoutForm…)
lib/db/             repositório: Supabase ou arquivo local
lib/                preço, validação, frete, pagamentos, e-mail, auth, storage
supabase/migrations esquema do banco
tests/              testes unitários (Vitest)
```

## Pendências do conteúdo

- Fotos reais: os blocos coloridos do Figma aparecem até cadastrar as fotos no painel. A foto do hero e a foto decorativa do contato estão como placeholder em `components/Landing.tsx` (props `heroImage` e `image`).
- Revisar preços, medidas e textos dos produtos de exemplo (`lib/seed-data.ts`).
- Política de trocas e privacidade (LGPD).
