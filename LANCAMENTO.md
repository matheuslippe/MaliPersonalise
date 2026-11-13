# Checklist de lançamento — Mali Personalizê

Roteiro para o dia em que a verba entrar e a gente colocar o site no ar na **Hostinger**.
O código já está pronto: daqui pra frente é contratar, criar as contas, colar as chaves e testar.
Faça na ordem. Cada passo depende dos anteriores.

> Tempo estimado: uma tarde. A propagação do domínio pode levar algumas horas.

---

## 0. Antes do dia: o que pedir para a Mali

- [ ] **Fotos dos produtos**: quadradas (1200 × 1200 px é ótimo), fundo limpo, até 4 MB cada. Pelo menos 1 por produto.
- [ ] **Foto principal do topo do site** e **foto decorativa** da seção "Vamos criar algo lindo?"
- [ ] **Lista de produtos** com:
  - nome, descrição e preço;
  - opções (ex.: "Kit com 10 / 20 / 50") e quanto cada uma acrescenta no preço;
  - o que o cliente personaliza (nome, cor, frase, arte…), se é obrigatório e o limite de letras;
  - prazo de produção em dias úteis;
  - **peso e medidas da embalagem pronta para envio** (peso em gramas, altura × largura × comprimento em cm). Sem isso o frete sai errado.
- [ ] **Dados da empresa**: razão social, CNPJ, endereço (pode ser só cidade/UF, se ela preferir), e-mail de atendimento e WhatsApp com DDD.
- [ ] **CEP de onde saem os envios.**
- [ ] **Revisão das políticas** de trocas e de privacidade (`/politicas/trocas` e `/politicas/privacidade`) com o contador ou advogado.

---

## 1. Hostinger: hospedagem, domínio e e-mail

- [ ] Contratar **Business Web Hosting** (ou um plano **Cloud**). ⚠️ Os planos *Single* e *Premium* **não** rodam o site, porque ele precisa de Node.js.
- [ ] Registrar o domínio **malipersonalize.com.br** no **CNPJ** da Mali. No plano anual o domínio costuma vir grátis no primeiro ano.
- [ ] hPanel → **E-mails** → criar as caixas:
  - [ ] `pedidos@malipersonalize.com.br`: o site envia os e-mails por ela. **Anote a senha.**
  - [ ] `contato@malipersonalize.com.br`: atendimento (opcional).

## 2. Supabase: banco de dados e fotos (gratuito)

- [ ] Criar conta em **supabase.com** → *New project* → região **South America (São Paulo)**. Anote a senha do banco.
- [ ] Menu **SQL Editor** → colar e rodar **nesta ordem** (cada um num "New query"):
  1. [ ] `supabase/migrations/20261111000000_init.sql`
  2. [ ] `supabase/migrations/20261112000000_upload_log.sql`
  3. [ ] `supabase/seed.sql`: opcional, cria os 4 produtos de exemplo
- [ ] **Authentication → Users → Add user**: criar o login da Mali (e-mail + senha) e marcar *Auto confirm*.
- [ ] **Project Settings → API**: copiar *Project URL*, a chave **anon/publishable** e a chave **service_role/secret**.

## 3. Mercado Pago: pagamentos (conta no CNPJ)

- [ ] Entrar em **mercadopago.com.br/developers** com a conta da empresa → **Suas integrações → Criar aplicação**, tipo *Pagamentos online / Checkout Pro*.
- [ ] Copiar o **Access Token de produção** (começa com `APP_USR-`). O de teste (`TEST-`) serve só para testes.
- [ ] O webhook fica para o passo 6, depois que o site estiver no ar.

## 4. Melhor Envio: frete (conta no CNPJ)

- [ ] Criar conta em **melhorenvio.com.br** com o CNPJ.
- [ ] **Integrações → Permissões de acesso → Gerar novo token**, com permissão de cotação de frete. Copiar o token.

## 5. Publicar o site na Hostinger

- [ ] hPanel → **Websites → Adicionar site → Node.js web app → Importar do GitHub**.
- [ ] Instalar o app da Hostinger no GitHub e liberar o repositório **matheuslippe/MaliPersonalise**.
- [ ] Configurar:
  - Branch: `main`
  - Versão do Node: **22**
  - Comando de build: `npm run build`
  - Comando de início: `npm start`
- [ ] **Variáveis de ambiente**: preencher todas da tabela abaixo.
- [ ] Ligar o site ao domínio **malipersonalize.com.br** e ativar o **SSL** (https).

### De onde vem cada variável

| Variável | Valor / de onde vem |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://malipersonalize.com.br` |
| `ADMIN_SESSION_SECRET` | texto aleatório com 32+ caracteres (gere um em um gerador de senhas) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → chave **anon / publishable** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → chave **service_role / secret**. ⚠️ Nunca compartilhe essa chave. |
| `ADMIN_EMAILS` | e-mail do login criado no passo 2 |
| `MERCADOPAGO_ACCESS_TOKEN` | Mercado Pago → Access Token de produção (`APP_USR-…`) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Mercado Pago → Webhooks → assinatura secreta (passo 6) |
| `MELHOR_ENVIO_TOKEN` | Melhor Envio → token gerado no passo 4 |
| `MELHOR_ENVIO_SANDBOX` | `false` |
| `MELHOR_ENVIO_USER_AGENT` | `Mali Personalize (contato@malipersonalize.com.br)` |
| `SMTP_HOST` | `smtp.hostinger.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `pedidos@malipersonalize.com.br` |
| `SMTP_PASS` | senha da caixa `pedidos@` |
| `EMAIL_FROM` | `Mali Personalizê <pedidos@malipersonalize.com.br>` |
| `STORE_NOTIFY_EMAIL` | e-mail que recebe o aviso de cada pedido pago |

`ADMIN_PASSWORD` **não** é usada em produção (o login é pelo Supabase) e pode ficar vazia.

> **Dica:** antes de colar na Hostinger, monte as variáveis num arquivo `.env.producao` no seu notebook e rode
> `npm run check:env -- .env.producao`. O comando mostra ✓ ou ✗ em cada item, sem exibir as senhas. Não envie esse arquivo para o GitHub: ele já está no `.gitignore`.

## 6. Webhook do Mercado Pago

- [ ] Mercado Pago → Suas integrações → sua aplicação → **Webhooks → Configurar notificações** (modo produção):
  - URL: `https://malipersonalize.com.br/api/webhooks/mercadopago`
  - Evento: **Pagamentos**
- [ ] Copiar a **assinatura secreta**, colar em `MERCADOPAGO_WEBHOOK_SECRET` na Hostinger e **publicar de novo** (Redeploy).

## 7. Configurar a loja pelo painel

Acesse `https://malipersonalize.com.br/admin` e entre com o login do passo 2.

- [ ] **Configurações**: razão social, CNPJ, endereço, e-mail de atendimento, WhatsApp (com 55 + DDD), Instagram, **CEP de origem**, retirada (se houver) e mensagem da barra do topo.
- [ ] **Produtos**: cadastrar ou ajustar cada produto com fotos, preço, opções, campos de personalização, prazo, peso e medidas. Se rodou o `seed.sql`, revise ou oculte os produtos de exemplo.

## 8. Teste final (com dinheiro de verdade)

- [ ] Abrir o site no celular e no computador e navegar por todas as páginas.
- [ ] Fazer uma compra de **valor baixo com Pix**, de ponta a ponta, com upload de arte.
- [ ] Conferir que:
  - [ ] o frete apareceu com valores reais;
  - [ ] depois do Pix, o pedido mudou para **"Pago"** sozinho, sinal de que o webhook está funcionando;
  - [ ] chegou o e-mail de confirmação para o cliente e o aviso para a loja (veja também o spam);
  - [ ] o pedido aparece no painel com a arte para baixar.
- [ ] **Estornar** o pagamento pelo Mercado Pago e conferir o pedido como "Cancelado".
- [ ] Marcar um pedido como "Enviado" com código de rastreio e conferir o e-mail.

## 9. Depois de no ar

- [ ] Cadastrar o site no **Google Search Console** e enviar o sitemap: `https://malipersonalize.com.br/sitemap.xml`
- [ ] Colocar o link do site na bio do Instagram.
- [ ] Atualizações: cada `git push` na branch `main` publica de novo sozinho na Hostinger.
