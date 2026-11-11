import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { env, hasSupabase } from "./env";
import { hmac, safeEqual } from "./sign";

const LOCAL_COOKIE = "mali_admin";
const SESSION_MS = 1000 * 60 * 60 * 12;

async function supabaseServer() {
  const store = await cookies();
  return createServerClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // chamado de um Server Component: o proxy renova a sessão
        }
      },
    },
  });
}

export async function getAdminEmail(): Promise<string | null> {
  if (hasSupabase) {
    const { data } = await (await supabaseServer()).auth.getUser();
    const email = data.user?.email?.toLowerCase();
    return email && env.adminEmails.includes(email) ? email : null;
  }
  const value = (await cookies()).get(LOCAL_COOKIE)?.value;
  if (!value) return null;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || Number(exp) < Date.now() || !safeEqual(hmac(`admin:${exp}`), sig)) return null;
  return "admin@local";
}

export async function requireAdmin(): Promise<string> {
  const email = await getAdminEmail();
  if (!email) redirect("/admin/login");
  return email;
}

export async function signIn(email: string, password: string): Promise<string | null> {
  if (hasSupabase) {
    if (!env.adminEmails.includes(email.toLowerCase())) return "E-mail ou senha incorretos.";
    const { error } = await (await supabaseServer()).auth.signInWithPassword({ email, password });
    return error ? "E-mail ou senha incorretos." : null;
  }
  if (!env.adminPassword) return "Defina ADMIN_PASSWORD no .env.local para usar o painel em modo local.";
  if (!safeEqual(password, env.adminPassword)) return "Senha incorreta.";
  const exp = String(Date.now() + SESSION_MS);
  (await cookies()).set(LOCAL_COOKIE, `${exp}.${hmac(`admin:${exp}`)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
  return null;
}

export async function signOut() {
  if (hasSupabase) await (await supabaseServer()).auth.signOut();
  (await cookies()).delete(LOCAL_COOKIE);
}
