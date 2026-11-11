"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";
import { Button } from "@/components/Button";

const input = "w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[16px] text-wine focus:border-rose focus:outline-none";

export function LoginForm({ needsEmail }: { needsEmail: boolean }) {
  const [error, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="mt-6 space-y-4">
      {needsEmail && (
        <div>
          <label htmlFor="email" className="mb-1 block text-[15px] text-wine">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="username" required className={input} />
        </div>
      )}
      <div>
        <label htmlFor="password" className="mb-1 block text-[15px] text-wine">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
      </div>
      {error && <p role="alert" className="text-[14px] text-rose-dark">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
