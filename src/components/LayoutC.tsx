'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LayoutC() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextUrl = useMemo(() => {
    const params = searchParams.toString();
    return params ? `/inicio?${params}` : '/inicio';
  }, [searchParams]);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push(nextUrl);
    }, 900);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a3d91]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white/80 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0a3d91]" />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">Portal informativo</div>
              <div className="text-xs text-slate-600">CNH Social Digital</div>
            </div>
          </div>
          <div className="text-xs text-slate-500">Acesso rápido</div>
        </header>

        <main className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Informações e orientações sobre habilitação social
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-700">
              Nesta página você encontra um resumo informativo e acesso à próxima etapa.
              Ao continuar, você será direcionado para a área de autenticação.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={handleClick}
                className="inline-flex items-center justify-center rounded-xl bg-[#0a3d91] px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#08357f] focus:outline-none focus:ring-2 focus:ring-[#0a3d91]/40"
              >
                Continuar
              </button>
              <div className="text-sm text-slate-600">
                Próximo passo: <span className="font-medium">/inicio</span>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold text-slate-900">O que você vai encontrar</div>
                <div className="mt-2 text-sm text-slate-600">
                  Requisitos, etapas e orientações gerais para seguir com o processo.
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold text-slate-900">Tempo estimado</div>
                <div className="mt-2 text-sm text-slate-600">
                  Menos de 1 minuto para avançar para a próxima página.
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">Resumo</div>
              <div className="mt-3 space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#0a3d91]" />
                  <div>Conteúdo com caráter informativo.</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#0a3d91]" />
                  <div>Continue para acessar a próxima etapa do fluxo.</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#0a3d91]" />
                  <div>Parâmetros de URL são mantidos ao avançar.</div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
                Ao clicar em <span className="font-semibold">Continuar</span>, você será direcionado automaticamente.
              </div>
            </div>
          </aside>
        </main>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-500">
          Este site tem caráter informativo e direciona o usuário para a próxima etapa do fluxo.
        </footer>
      </div>
    </div>
  );
}
