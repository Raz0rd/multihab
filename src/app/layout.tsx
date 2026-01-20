import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense } from "react";
import UtmCapture from "@/components/UtmCapture";
import GoogleAdsScript from "@/components/GoogleAdsScript";
import { promises as fs } from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "CNH Social 2026 - Carteira Nacional de Habilitação Gratuita",
  description: "Faça hoje mesmo a sua inscrição para a CNH Social 2026 de forma gratuita.",
  icons: {
    icon: "/icon.png",
  },
};

async function getTenantConfig() {
  try {
    const headersList = headers();
    const host = headersList.get("host") || "localhost";
    const baseDomain = host.split(":")[0].replace(/^www\./, "");

    const tenantsPath = path.join(process.cwd(), "public", "tenants.json");
    const tenantsFile = await fs.readFile(tenantsPath, "utf-8");
    const tenantsData = JSON.parse(tenantsFile);

    const config = tenantsData.tenants[baseDomain];
    if (config && config.googleAdsId) {
      return config;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tenantConfig = await getTenantConfig();

  return (
    <html lang="pt-BR">
      <head>
        {tenantConfig && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__TENANT_CONFIG__=${JSON.stringify(tenantConfig)};`,
            }}
          />
        )}
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
