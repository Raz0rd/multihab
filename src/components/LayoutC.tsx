'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type TenantConfig = {
  cnpj?: string;
};

type TenantsFile = {
  tenants?: Record<string, TenantConfig>;
};

function extractBaseDomain(hostname: string) {
  return hostname.replace(/^www\./, '');
}

export default function LayoutC() {
  const [isLoading, setIsLoading] = useState(false);
  const [cnpj, setCnpj] = useState<string>('');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextUrl = useMemo(() => {
    const params = searchParams.toString();
    return params ? `/inicio?${params}` : '/inicio';
  }, [searchParams]);

  useEffect(() => {
    async function loadTenant() {
      try {
        const host = extractBaseDomain(window.location.hostname);
        const response = await fetch(`/tenants.json?t=${Date.now()}`, { cache: 'no-store' });
        const data = (await response.json()) as TenantsFile;
        const tenant = data?.tenants?.[host];
        if (tenant?.cnpj) {
          setCnpj(tenant.cnpj);
        }
      } catch {
        // ignore
      }
    }
    loadTenant();
  }, []);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push(nextUrl);
    }, 900);
  };

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d9488]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white/80 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <header className="bg-white px-4 py-4 flex justify-between items-center border-b-2 border-[#0d9488]">
        <div className="text-xl font-bold text-[#0d9488]">Portal CNH Social Info</div>
        <button
          onClick={handleClick}
          className="bg-[#0d9488] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#0b8578] transition-colors"
        >
          Entrar
        </button>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0d9488] to-[#3b82f6] text-white py-12 px-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          CNH Social 2026: Habilitação Gratuita
        </h1>
        <p className="text-lg opacity-90">
          Saiba como obter sua CNH gratuitamente através do programa social
        </p>
      </section>

      {/* Content */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[#0d9488] text-xl font-bold mb-6">O que é o CNH Social?</h2>
          <p className="text-slate-600 leading-relaxed mb-8">
            Programa governamental que oferece habilitação gratuita para pessoas de baixa renda 
            cadastradas no CadÚnico. Inclui aulas teóricas, práticas, exames e todas as taxas.
          </p>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 p-6 rounded-lg border-l-4 border-[#0d9488]">
              <strong className="text-slate-800 block mb-2">Quem pode participar?</strong>
              <span className="text-slate-500 text-sm">
                Cadastro no CadÚnico, renda até 2 salários mínimos, maior de 18 anos
              </span>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg border-l-4 border-[#3b82f6]">
              <strong className="text-slate-800 block mb-2">100% Gratuito</strong>
              <span className="text-slate-500 text-sm">
                Todas as despesas cobertas pelo governo
              </span>
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-3 mb-8">
            <div 
              className="bg-slate-50 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => toggleFaq(0)}
            >
              <div className="p-4 font-semibold text-slate-800 flex justify-between items-center">
                Preciso pagar algo?
                <span className="text-[#0d9488]">{faqOpen === 0 ? '−' : '+'}</span>
              </div>
              {faqOpen === 0 && (
                <div className="px-4 pb-4 text-slate-500">
                  Não! O programa é 100% gratuito.
                </div>
              )}
            </div>

            <div 
              className="bg-slate-50 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => toggleFaq(1)}
            >
              <div className="p-4 font-semibold text-slate-800 flex justify-between items-center">
                Como verifico se tenho direito?
                <span className="text-[#0d9488]">{faqOpen === 1 ? '−' : '+'}</span>
              </div>
              {faqOpen === 1 && (
                <div className="px-4 pb-4 text-slate-500">
                  Consulte seu cadastro no CadÚnico e verifique se sua renda familiar é até 2 salários mínimos.
                </div>
              )}
            </div>

            <div 
              className="bg-slate-50 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => toggleFaq(2)}
            >
              <div className="p-4 font-semibold text-slate-800 flex justify-between items-center">
                Quanto tempo demora?
                <span className="text-[#0d9488]">{faqOpen === 2 ? '−' : '+'}</span>
              </div>
              {faqOpen === 2 && (
                <div className="px-4 pb-4 text-slate-500">
                  O processo completo leva de 3 a 6 meses.
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={handleClick}
              className="bg-[#f59e0b] text-slate-800 px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#d97706] transition-colors"
            >
              Verificar Elegibilidade
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-8 px-4 text-center">
        {cnpj && (
          <div className="mb-4">
            <span className="text-white font-semibold">CNPJ: </span>
            <span className="text-sm">{cnpj}</span>
          </div>
        )}
        <p className="text-xs text-slate-400">
          Este portal tem caráter informativo. Não somos órgão governamental. 
          Informações baseadas em dados públicos sobre o programa CNH Social.
        </p>
      </footer>
    </div>
  );
}
