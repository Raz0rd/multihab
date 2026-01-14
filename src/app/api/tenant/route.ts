import { NextRequest, NextResponse } from 'next/server';

// Configuração dos tenants - cada domínio tem sua própria tag do Google Ads
const TENANTS: Record<string, {
  googleAdsId: string;
  googleAdsConversionLabel: string;
}> = {
  // Domínio padrão/desenvolvimento
  'localhost': {
    googleAdsId: 'AW-17859172217',
    googleAdsConversionLabel: 'AW-17859172217/AxgvCOr_194bEPmu9cNC',
  },
  // Adicione novos domínios aqui:
  // 'meusite.com.br': {
  //   googleAdsId: 'AW-XXXXXXXXXX',
  //   googleAdsConversionLabel: 'AW-XXXXXXXXXX/XXXXXXXXXXX',
  // },
  // 'outrosite.com.br': {
  //   googleAdsId: 'AW-YYYYYYYYYY',
  //   googleAdsConversionLabel: 'AW-YYYYYYYYYY/YYYYYYYYYYY',
  // },
};

// Domínio padrão caso não encontre configuração
const DEFAULT_TENANT = {
  googleAdsId: 'AW-17859172217',
  googleAdsConversionLabel: 'AW-17859172217/AxgvCOr_194bEPmu9cNC',
};

function extractBaseDomain(host: string): string {
  // Remove porta se existir
  const domain = host.split(':')[0];
  
  // Remove 'www.' se existir
  return domain.replace(/^www\./, '');
}

export async function GET(request: NextRequest) {
  try {
    // Detecta o domínio pelo header Host da requisição
    const host = request.headers.get('host') || 'localhost';
    const baseDomain = extractBaseDomain(host);
    
    // Busca configuração do tenant pelo domínio
    const tenantConfig = TENANTS[baseDomain] || DEFAULT_TENANT;
    
    return NextResponse.json({
      success: true,
      domain: baseDomain,
      config: {
        googleAdsId: tenantConfig.googleAdsId,
        googleAdsConversionLabel: tenantConfig.googleAdsConversionLabel,
      }
    });
  } catch (error) {
    console.error('Erro ao detectar tenant:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao detectar configuração do tenant',
      config: DEFAULT_TENANT
    }, { status: 500 });
  }
}
