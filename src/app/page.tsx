import { Suspense } from 'react';
import { headers } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';
import CloakerGate from '@/components/CloakerGate';
import LayoutA from '@/components/LayoutA';
import LayoutB from '@/components/LayoutB';
import LayoutC from '@/components/LayoutC';
import LayoutD from '@/components/LayoutD';

async function getTenantLayout() {
  try {
    const headersList = headers();
    const host = headersList.get('host') || 'localhost';
    const baseDomain = host.split(':')[0].replace(/^www\./, '');

    const tenantsPath = path.join(process.cwd(), 'public', 'tenants.json');
    const tenantsFile = await fs.readFile(tenantsPath, 'utf-8');
    const tenantsData = JSON.parse(tenantsFile);

    const config = tenantsData.tenants[baseDomain];
    return config?.layout || 'a';
  } catch {
    return 'a';
  }
}

export default async function Home() {
  const layout = await getTenantLayout();

  // Layout B (estilo gov.br) - sem CloakerGate
  if (layout === 'b') {
    return (
      <Suspense fallback={<div></div>}>
        <LayoutB />
      </Suspense>
    );
  }

  // Layout C (safe page Google Ads) - sem CloakerGate
  if (layout === 'c') {
    return (
      <Suspense fallback={<div></div>}>
        <LayoutC />
      </Suspense>
    );
  }

  // Layout D (HTML via tenants.json) - sem CloakerGate
  if (layout === 'd') {
    return (
      <Suspense fallback={<div></div>}>
        <LayoutD />
      </Suspense>
    );
  }

  // Layout A (padrão) - usa CloakerGate
  return (
    <CloakerGate>
      <LayoutA />
    </CloakerGate>
  );
}
