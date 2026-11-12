import type { Metadata } from "next";
import { repo } from "@/lib/db";
import { Prose, contactLine } from "../Prose";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Privacidade" };

export default async function PrivacyPolicy() {
  const settings = await repo().getSettings();
  const contato = contactLine(settings);
  const controller = settings.legalName
    ? `${settings.legalName}${settings.cnpj ? `, CNPJ ${settings.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")}` : ""}`
    : "Mali Personalizê";
  return (
    <Prose title="Política de privacidade" updated="12/11/2026">
      <p>
        Esta política explica como <strong>{controller}</strong> trata seus dados pessoais neste site, conforme a Lei Geral de Proteção
        de Dados (Lei 13.709/2018).
      </p>

      <h2>Quais dados coletamos</h2>
      <ul>
        <li>No pedido: nome, e-mail, telefone/WhatsApp, CPF e endereço de entrega.</li>
        <li>Na personalização: textos, escolhas e arquivos (fotos ou artes) que você envia.</li>
        <li>No pagamento: o status e o número da transação. Dados de cartão são digitados no Mercado Pago e não passam por nós.</li>
      </ul>

      <h2>Para que usamos</h2>
      <ul>
        <li>Produzir, entregar e dar suporte ao seu pedido (execução de contrato).</li>
        <li>Emitir documentos fiscais e cumprir obrigações legais (o CPF é exigido para nota fiscal e envio).</li>
        <li>Avisar sobre o andamento do pedido por e-mail ou WhatsApp.</li>
      </ul>
      <p>Não vendemos seus dados e não enviamos propaganda sem o seu consentimento.</p>

      <h2>Com quem compartilhamos</h2>
      <ul>
        <li>Mercado Pago: processamento do pagamento.</li>
        <li>Melhor Envio e transportadoras (como Correios): cálculo de frete e entrega.</li>
        <li>Supabase: armazenamento do banco de dados e dos arquivos enviados.</li>
        <li>Hostinger: hospedagem do site e envio de e-mails.</li>
      </ul>
      <p>Alguns desses serviços podem armazenar dados fora do Brasil, com as garantias previstas na LGPD.</p>

      <h2>Por quanto tempo guardamos</h2>
      <p>
        Os dados do pedido são mantidos pelo prazo exigido pela legislação fiscal e de defesa do consumidor. Os arquivos de
        personalização podem ser apagados depois da entrega, a seu pedido.
      </p>

      <h2>Cookies e armazenamento no navegador</h2>
      <p>
        Usamos o armazenamento do seu navegador apenas para guardar a sacola de compras. Não usamos cookies de publicidade ou de
        rastreamento.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir a confirmação, o acesso, a correção, a portabilidade ou a exclusão dos seus dados, além de informações sobre o
        compartilhamento. Fale com a gente {contato}.
      </p>
    </Prose>
  );
}
