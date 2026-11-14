import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminHome() {
  await requireAdmin(); // cada página confere o login: o layout sozinho não protege
  redirect("/admin/pedidos");
}
