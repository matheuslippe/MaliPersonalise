import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Painel", template: "%s · Painel Mali" }, robots: { index: false, follow: false } };

export default function AdminRoot({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-full flex-1 bg-cream">{children}</div>;
}
