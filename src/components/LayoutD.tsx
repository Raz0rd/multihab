'use client';

import { useEffect, useMemo, useState } from 'react';

type TenantConfig = {
  layout?: string;
  landingHtml?: string;
};

type TenantsFile = {
  tenants?: Record<string, TenantConfig>;
};

function extractBaseDomain(hostname: string) {
  return hostname.replace(/^www\./, '');
}

export default function LayoutD() {
  const [isLoading, setIsLoading] = useState(true);
  const [html, setHtml] = useState<string>('');

  const defaultHtml = useMemo(() => {
    return `
<div style="min-height:100vh;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;padding:24px;">
  <div style="max-width:860px;width:100%;background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:28px;">
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="width:40px;height:40px;border-radius:12px;background:#0a3d91;"></div>
      <div>
        <div style="font-size:14px;font-weight:700;">Portal informativo</div>
        <div style="font-size:12px;color:#64748b;">Conteúdo configurado por tenant</div>
      </div>
    </div>

    <h1 style="margin-top:18px;font-size:28px;line-height:1.2;font-weight:800;">Whitepage (layout D)</h1>
    <p style="margin-top:10px;font-size:16px;line-height:1.6;color:#334155;">
      Configure o HTML desta página via <code>tenants.json</code> usando o campo <code>landingHtml</code>.
    </p>

    <div style="margin-top:18px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
      <a data-cta href="/inicio" style="display:inline-block;background:#0a3d91;color:#fff;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:700;">
        Continuar
      </a>
      <span style="font-size:13px;color:#64748b;">O link acima preserva ?utm automaticamente</span>
    </div>
  </div>
</div>`;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const host = extractBaseDomain(window.location.hostname);
        const response = await fetch(`/tenants.json?t=${Date.now()}`, { cache: 'no-store' });
        const data = (await response.json()) as TenantsFile;
        const tenant = data?.tenants?.[host];
        const nextHtml = tenant?.landingHtml || defaultHtml;
        if (!cancelled) setHtml(nextHtml);
      } catch {
        if (!cancelled) setHtml(defaultHtml);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [defaultHtml]);

  useEffect(() => {
    if (isLoading) return;

    const search = window.location.search || '';

    const links = Array.from(document.querySelectorAll<HTMLElement>('[data-cta]'));
    links.forEach((el) => {
      if (el instanceof HTMLAnchorElement) {
        try {
          const url = new URL(el.getAttribute('href') || '/', window.location.origin);
          const nextHref = `${url.pathname}${search}`;
          el.setAttribute('href', nextHref);
        } catch {
          // ignore
        }
        return;
      }

      const rawHref = el.getAttribute('data-href') || el.getAttribute('href') || '/inicio';
      el.addEventListener(
        'click',
        (ev) => {
          ev.preventDefault();
          window.location.href = `${rawHref}${search}`;
        },
        { once: true }
      );
    });
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-900/10 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
