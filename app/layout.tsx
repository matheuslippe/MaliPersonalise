import type { Metadata } from "next";
import { Inter, Tinos } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const tinos = Tinos({
  variable: "--font-tinos",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Mali Personalizê — Papelaria personalizada", template: "%s · Mali Personalizê" },
  description:
    "Agendas, planners, bottons e lembrancinhas personalizados feitos com carinho para deixar cada momento com a sua cara.",
  openGraph: { siteName: "Mali Personalizê", locale: "pt_BR", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${tinos.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
