# Mali Personalizê — loja virtual

> 🚀 **Vai colocar no ar?** Siga o [checklist de lançamento](LANCAMENTO.md).

Site com catálogo e venda direta de papelaria personalizada (agendas, planners, bottons, lembrancinhas), seguindo o design do Figma.

**Stack:** Next.js 16 (App Router) · Tailwind CSS 4 · Supabase (Postgres, Storage, Auth) · Mercado Pago Checkout Pro · Melhor Envio · e-mail por SMTP (Hostinger) · hospedagem Node.js na Hostinger.

## Rodando localmente

```bash
npm install
copy .env.example .env.local    # Windows (cmd). No Mac/Linux: cp .env.example .env.local
npm run dev
```

Sem as chaves externas o site funciona em **modo de desenvolvimento**:

| Serviço | Sem configuração |
| --- | --- |
| Supabase | dados em `.data/db.json`, com produtos de exemplo |
| Mercado Pago | o pedido abre com o botão "Simular pagamento aprovado" |
| Melhor Envio | cotação fictícia (PAC/SEDEX "simulado") |
| SMTP | os e-mails só aparecem no log |

Em produção (`NODE_ENV=production`) esses modos ficam bloqueados.

- Loja: http://localhost:3000
- Painel: http://localhost:3000/admin (senha = `ADMIN_PASSWORD`)

```bash
npm test        # testes unitários (preço, validação, webhook, CPF)
npm run lint
npm run build
```

## Colocando no ar (Hostinger)

Ordem sugerida. Faça tudo primeiro em **modo teste** (credenciais de teste do Mercado Pago e `MELHOR_ENVIO_SANDBOX=true`) e só depois troque para produção.

1. **Hostinger: plano e domínio.** Contrate o **Business Web Hosting** ou um plano **Cloud**. Os planos Single/Premium não rodam Node.js. Registre `malipersonalize.com.br` no CNPJ.
2. **Hostinger: e-mail.** Em hPanel → E-mails, crie `pedidos@malipersonalize.com.br` (o site envia por ela) e, se quiser, `contato@`.
3. **Supabase.** Crie o projeto (região *South America – São Paulo*). No SQL Editor, rode **em ordem**:
   - `supabase/migrations/20261111000000_init.sql`
   - `supabase/migrations/20261112000000_upload_log.sql`
   - `supabase/seed.sql` (opcional: produtos de exemplo)

   Em *Authentication → Users → Add user*, crie o login da Mali e coloque o e-mail em `ADMIN_EMAILS`.
4. **Mercado Pago (conta no CNPJ).** Em *Suas integrações*, crie uma aplicação do tipo Checkout Pro e copie o Access Token.
5. **Melhor Envio (conta no CNPJ).** Em *Integrações → Permissões de acesso*, gere o token com as permissões de cotação (`shipping-calculate`).
6. **Publicar.** hPanel → *Websites* → *Adicionar site* → **Node.js web app** → importar do GitHub:
   - Instale o app da Hostinger no GitHub e libere o repositório `MaliPersonalise`.
   - Branch `main`, Node **22**, comando de build `npm run build`, comando de início `npm start`.
   - Cadastre as variáveis de ambiente do `.env.example` com `NEXT_PUBLIC_SITE_URL=https://malipersonalize.com.br`.
   - Ligue o site ao domínio. A cada `git push` na `main`, a Hostinger publica de novo.
7. **Webhook do Mercado Pago.**
   - URL: `https://malipersonalize.com.br/api/webhooks/mercadopago`, evento **Pagamentos**.
   - Copie a assinatura secreta para `MERCADOPAGO_WEBHOOK_SECRET` e publique de novo.
8. **Painel `/admin`.**
   - Em *Configurações*: dados da empresa (razão social, CNPJ, endereço, e-mail), WhatsApp, CEP de origem.
   - Em *Produtos*: fotos, preços e medidas.
9. **Teste real.**
   - Compra de valor baixo com Pix.
   - Confira o pedido virando "Pago", o e-mail chegando e o pedido no painel.
   - Estorne pelo Mercado Pago.

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
- Revisar os textos de `app/(loja)/politicas/` (trocas e privacidade) com o contador ou advogado da Mali.
