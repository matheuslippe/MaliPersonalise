import { repo } from "@/lib/db";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const settings = await repo().getSettings();
  return (
    <div className="max-w-[640px]">
      <h1 className="font-serif text-[34px] text-wine">Configurações</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
