import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense } from "react";
import UtmCapture from "@/components/UtmCapture";
import GoogleAdsScript from "@/components/GoogleAdsScript";

export const metadata: Metadata = {
  title: "CNH Social 2026 - Carteira Nacional de Habilitação Gratuita",
  description: "Faça hoje mesmo a sua inscrição para a CNH Social 2026 de forma gratuita.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Google Ads carregado dinamicamente via API de tenant */}
      </head>
      <body>
        <GoogleAdsScript />
        <AuthProvider>
          <Suspense fallback={null}>
            <UtmCapture />
          </Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
