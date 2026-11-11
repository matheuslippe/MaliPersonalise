"use client";

import { useActionState } from "react";
import type { Settings } from "@/lib/types";
import { saveSettingsAction } from "../../actions";

const input = "mt-1 w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-[16px] text-wine focus:border-rose focus:outline-none";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [message, action, pending] = useActionState(saveSettingsAction, null);
  return (
    <form action={action} className="mt-6 space-y-5 rounded-[14px] border border-line bg-white p-6">
      <label className="block text-[15px] text-wine">
        Mensagem da barra promocional
        <input name="promoMessage" defaultValue={settings.promoMessage} maxLength={160} className={input} />
      </label>
      <label className="block text-[15px] text-wine">
        WhatsApp (com DDI e DDD)
        <input name="whatsapp" defaultValue={settings.whatsapp} placeholder="5511999999999" inputMode="numeric" className={input} />
      </label>
      <label className="block text-[15px] text-wine">
        Instagram
        <input name="instagram" defaultValue={settings.instagram} placeholder="malipersonalize_" className={input} />
      </label>
      <label className="block text-[15px] text-wine">
        CEP de origem dos envios
        <input name="originCep" defaultValue={settings.originCep} inputMode="numeric" placeholder="00000-000" className={input} />
        <span className="mt-1 block text-[13px] text-ink">Usado para calcular o frete no Melhor Envio.</span>
      </label>
      <label className="flex items-center gap-3 text-[15px] text-wine">
        <input type="checkbox" name="pickupEnabled" defaultChecked={settings.pickupEnabled} className="size-4 accent-rose" />
        Oferecer retirada sem custo
      </label>
      <label className="block text-[15px] text-wine">
        Endereço ou instruções de retirada
        <input name="pickupAddress" defaultValue={settings.pickupAddress} className={input} />
      </label>
      {message && <p role="status" className="text-[14px] text-wine">{message}</p>}
      <button disabled={pending} className="h-11 rounded-full bg-rose px-8 text-white hover:bg-rose-dark disabled:opacity-60">
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
