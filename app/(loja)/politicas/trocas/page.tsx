import type { Metadata } from "next";
import { repo } from "@/lib/db";
import { Prose, contactLine } from "../Prose";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Trocas e devoluções" };

export default async function ReturnsPolicy() {
  const settings = await repo().getSettings();
  const contato = contactLine(settings);
  return (
    <Prose title="Trocas e devoluções" updated="12/11/2026">
      <p>
        Nossos produtos são feitos sob encomenda, um a um, com a personalização que você escolhe. Por isso, pedimos que confira com
        carinho nomes, frases, cores e arquivos antes de finalizar a compra.
      </p>

      <h2>Cancelamento antes da produção</h2>
      <p>
        Se o pedido ainda não entrou em produção, você pode cancelar e receber o valor integral de volta. É só falar com a gente {contato}
        {" "}informando o número do pedido.
      </p>

      <h2>Direito de arrependimento</h2>
      <p>
        Nas compras pela internet, o Código de Defesa do Consumidor (art. 49) garante o direito de desistir em até 7 dias corridos a
        partir do recebimento. Para exercer esse direito, entre em contato {contato} dentro desse prazo. Combinaremos a devolução do
        produto e o reembolso dos valores pagos, incluindo o frete.
      </p>

      <h2>Defeitos ou erros na personalização</h2>
      <p>
        Se o produto chegar com defeito, avaria no transporte ou com a personalização diferente do que você pediu, avise em até 7 dias
        após o recebimento, de preferência com fotos. Refazemos o produto ou devolvemos o valor, como preferir, sem custo para você.
      </p>
      <p>Pela lei, o prazo para reclamar de defeitos aparentes em produtos não duráveis é de 30 dias e, em produtos duráveis, de 90 dias.</p>

      <h2>Como o reembolso é feito</h2>
      <ul>
        <li>Pix ou boleto: devolução por Pix na conta indicada por você.</li>
        <li>Cartão de crédito: estorno pelo Mercado Pago; o crédito aparece na fatura conforme o prazo da operadora do cartão.</li>
      </ul>

      <h2>Prazos</h2>
      <p>
        Cada produto informa o prazo de produção. O prazo exibido no frete já soma a produção e o transporte. Atrasos da transportadora
        acompanhamos junto com você pelo código de rastreio.
      </p>
    </Prose>
  );
}
