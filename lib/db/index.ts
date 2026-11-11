import "server-only";
import { hasSupabase } from "../env";
import { localRepo } from "./local";
import { supabaseRepo } from "./supabase";
import type { Repo } from "./repo";

export function repo(): Repo {
  if (hasSupabase) return supabaseRepo;
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_LOCAL_DB !== "true") {
    throw new Error("Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY.");
  }
  return localRepo;
}
