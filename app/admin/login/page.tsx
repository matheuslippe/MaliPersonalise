import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/Logo";
import { hasSupabase } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[16px] bg-white p-8 shadow-sm">
        <div className="text-center">
          <Logo href={null} />
          <p className="mt-4 text-[15px] text-ink">Painel administrativo</p>
        </div>
        <LoginForm needsEmail={hasSupabase} />
      </div>
    </div>
  );
}
