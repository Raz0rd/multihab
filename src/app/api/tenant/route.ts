import { NextRequest, NextResponse } from 'next/server';

// Multi-tenant REAL: Configuração por domínio via arquivo JSON
// Edite /public/tenants.json para adicionar/alterar tenants SEM rebuild

interface TenantConfig {
  googleAdsId: string;
  googleAdsConversionLabel: string;
  fluxo?: 'a' | 'b';
}

interface TenantsFile {
  tenants: Record<string, TenantConfig>;
}

// Cache em memória com TTL de 60 segundos
let tenantsCache: TenantsFile | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 60 segundos

async function loadTenants(baseUrl: string): Promise<TenantsFile> {
  const now = Date.now();
  
  // Retorna cache se válido
  if (tenantsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return tenantsCache;
  }
  
  // Carrega do arquivo JSON (com cache-busting)
  const response = await fetch(`${baseUrl}/tenants.json?t=${now}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Falha ao carregar tenants.json');
  }
  
  tenantsCache = await response.json();
  cacheTimestamp = now;
  
  return tenantsCache!;
}

function extractBaseDomain(host: string): string {
  return host.split(':')[0].replace(/^www\./, '');
}

export async function GET(request: NextRequest) {
  try {
    const host = request.headers.get('host') || 'localhost';
    const baseDomain = extractBaseDomain(host);
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    
    const tenantsData = await loadTenants(baseUrl);
    const tenantConfig = tenantsData.tenants[baseDomain];
    
    // Se não houver config para este domínio, retorna null
    if (!tenantConfig || !tenantConfig.googleAdsId) {
      return NextResponse.json({
        success: true,
        domain: baseDomain,
        config: null
      });
    }
    
    return NextResponse.json({
      success: true,
      domain: baseDomain,
      config: {
        googleAdsId: tenantConfig.googleAdsId,
        googleAdsConversionLabel: tenantConfig.googleAdsConversionLabel,
        fluxo: tenantConfig.fluxo || 'a',
      }
    });
  } catch (error) {
    console.error('Erro ao carregar tenant:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao carregar configuração',
      config: null
    }, { status: 500 });
  }
}
