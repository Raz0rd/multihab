import { NextRequest, NextResponse } from 'next/server';

const UMBRELA_API_KEY = process.env.UMBRELA_API_KEY || '84f2022f-a84b-4d63-a727-1780e6261fe8';
const UMBRELA_BASE_URL = 'https://api-gateway.umbrellapag.com/api';
const UTMIFY_API_TOKEN = process.env.UTMIFY_API_TOKEN || 'U1htkxfFDFGP5Ts2wRP6IWw2nDrxJvJEPEHE';
const UTMIFY_API_URL = 'https://api.utmify.com.br/api-credentials/orders';

// Cache em memória para transações já enviadas ao UTMify (evita duplicação)
const utmifySentCache = new Map<string, { sentAt: Date, success: boolean }>();

// Limpar cache antigo a cada hora
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  Array.from(utmifySentCache.entries()).forEach(([key, value]) => {
    if (value.sentAt < oneHourAgo) {
      utmifySentCache.delete(key);
    }
  });
}, 60 * 60 * 1000);

// Função para enviar para UTMify com retry
async function enviarParaUtmifyComRetry(payload: any, transactionId: string, maxRetries = 3): Promise<boolean> {
  // Verificar se já enviamos com sucesso
  const cached = utmifySentCache.get(transactionId);
  if (cached?.success) {
    console.log(`⚠️ UTMify: Transação ${transactionId} já enviada anteriormente`);
    return true;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 UTMify tentativa ${attempt}/${maxRetries} para ${transactionId}...`);
      
      const response = await fetch(UTMIFY_API_URL, {
        method: 'POST',
        headers: {
          'x-api-token': UTMIFY_API_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`✅ UTMify: Transação ${transactionId} enviada com sucesso`);
        utmifySentCache.set(transactionId, { sentAt: new Date(), success: true });
        return true;
      }

      const errorText = await response.text();
      console.error(`❌ UTMify erro (tentativa ${attempt}):`, response.status, errorText);
      
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        console.error('⚠️ Erro de cliente, não faz retry');
        utmifySentCache.set(transactionId, { sentAt: new Date(), success: false });
        return false;
      }
      
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Aguardando ${waitTime}ms antes do retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    } catch (error) {
      console.error(`❌ UTMify erro de rede (tentativa ${attempt}):`, error);
      
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  utmifySentCache.set(transactionId, { sentAt: new Date(), success: false });
  return false;
}

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, utmParams } = body;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'ID da transação não fornecido' },
        { status: 400 }
      );
    }

    console.log('📊 UTMs recebidos na verificação:', utmParams);

    // Consultar status na Umbrela
    const response = await fetch(`${UMBRELA_BASE_URL}/user/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'x-api-key': UMBRELA_API_KEY,
        'User-Agent': 'UMBRELLAB2B/1.0'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Erro ao verificar transação' },
        { status: 500 }
      );
    }

    const result = await response.json();
    
    // A resposta da Umbrela vem em result.data
    const data = result.data || result;
    const pago = data.status === 'PAID';

    console.log('🔍 Status verificado:', {
      transactionId,
      status: data.status,
      pago
    });

    // Se pago, enviar para UTMify com status paid (com flag de duplicação e retry)
    if (pago) {
      let metadata = {};
      try {
        metadata = data.metadata ? JSON.parse(data.metadata) : {};
      } catch (e) {
        metadata = data.metadata || {};
      }
      const customer = data.customer || {};
      
      const utmifyPayload = {
        orderId: data.id,
        platform: 'Umbrela',
        paymentMethod: 'pix',
        status: 'paid',
        createdAt: data.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
        approvedDate: data.paidAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
        refundedAt: null,
        customer: {
          name: customer.name || (metadata as any).nome || 'Cliente',
          email: customer.email || (metadata as any).email || 'cliente@email.com',
          phone: customer.phone || (metadata as any).telefone || '11999999999',
          document: customer.document?.number || (metadata as any).cpf || '00000000000',
          country: 'BR',
          ip: '0.0.0.0'
        },
        products: [{
          id: data.id,
          name: 'Taxa de Validação Biométrica',
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: data.amount || 1459
        }],
        trackingParameters: {
          src: utmParams?.src || null,
          sck: utmParams?.sck || null,
          utm_source: utmParams?.utm_source || null,
          utm_campaign: utmParams?.utm_campaign || null,
          utm_medium: utmParams?.utm_medium || null,
          utm_content: utmParams?.utm_content || null,
          utm_term: utmParams?.utm_term || null,
          keyword: utmParams?.keyword || null,
          device: utmParams?.device || null,
          network: utmParams?.network || null
        },
        commission: {
          totalPriceInCents: data.amount || 1459,
          gatewayFeeInCents: 0,
          userCommissionInCents: data.amount || 1459
        },
        isTest: false
      };

      // Enviar com retry e flag de duplicação
      await enviarParaUtmifyComRetry(utmifyPayload, data.id);
    }

    return NextResponse.json({
      success: true,
      pago,
      status: data.status,
      transactionData: data
    });

  } catch (error) {
    console.error('Erro ao verificar transação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
