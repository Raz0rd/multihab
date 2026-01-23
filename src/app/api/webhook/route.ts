import { NextRequest, NextResponse } from 'next/server';

const UTMIFY_API_TOKEN = process.env.UTMIFY_API_TOKEN || '';
const UTMIFY_API_URL = 'https://api.utmify.com.br/api-credentials/orders';

// Cache em memória para transações já processadas (evita duplicação)
const processedTransactions = new Map<string, { processedAt: Date, utmifySent: boolean }>();

// Limpar cache antigo a cada hora
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  Array.from(processedTransactions.entries()).forEach(([key, value]) => {
    if (value.processedAt < oneHourAgo) {
      processedTransactions.delete(key);
    }
  });
}, 60 * 60 * 1000);

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Função para enviar para UTMify com retry
async function enviarParaUtmify(payload: any, maxRetries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 UTMify tentativa ${attempt}/${maxRetries}...`);
      
      const response = await fetch(UTMIFY_API_URL, {
        method: 'POST',
        headers: {
          'x-api-token': UTMIFY_API_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('✅ UTMify: Enviado com sucesso');
        return true;
      }

      const errorText = await response.text();
      console.error(`❌ UTMify erro (tentativa ${attempt}):`, response.status, errorText);
      
      // Se for erro 4xx (exceto 429), não adianta tentar novamente
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        console.error('⚠️ Erro de cliente, não faz retry');
        return false;
      }
      
      // Esperar antes de tentar novamente (exponential backoff)
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
  
  return false;
}

// Webhook para GhostPay
async function processarGhostPay(body: any) {
  const { id, status, amount, customer, metadata, paid_at } = body;
  
  if (status !== 'paid' && status !== 'approved') {
    return { processed: false, reason: 'Status não é pago' };
  }
  
  const transactionId = id;
  
  // Verificar se já processamos
  if (processedTransactions.has(transactionId)) {
    const cached = processedTransactions.get(transactionId);
    if (cached?.utmifySent) {
      console.log(`⚠️ Transação ${transactionId} já processada`);
      return { processed: true, reason: 'Já processado anteriormente' };
    }
  }
  
  const parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata || {};
  
  const utmifyPayload = {
    orderId: transactionId,
    platform: 'GhostPay',
    paymentMethod: 'pix',
    status: 'paid',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    approvedDate: paid_at || new Date().toISOString().replace('T', ' ').substring(0, 19),
    refundedAt: null,
    customer: {
      name: customer?.name || parsedMetadata?.nome || 'Cliente',
      email: customer?.email || parsedMetadata?.email || 'cliente@email.com',
      phone: customer?.phone || parsedMetadata?.telefone || '11999999999',
      document: customer?.document?.number || parsedMetadata?.cpf || '00000000000',
      country: 'BR',
      ip: '0.0.0.0'
    },
    products: [{
      id: transactionId,
      name: parsedMetadata?.produto || 'Camiseta Algodão Premium',
      planId: null,
      planName: null,
      quantity: 1,
      priceInCents: amount || 2274
    }],
    trackingParameters: {
      src: parsedMetadata?.utmParams?.src || null,
      sck: parsedMetadata?.utmParams?.sck || null,
      utm_source: parsedMetadata?.utmParams?.utm_source || null,
      utm_campaign: parsedMetadata?.utmParams?.utm_campaign || null,
      utm_medium: parsedMetadata?.utmParams?.utm_medium || null,
      utm_content: parsedMetadata?.utmParams?.utm_content || null,
      utm_term: parsedMetadata?.utmParams?.utm_term || null,
      keyword: parsedMetadata?.utmParams?.keyword || null,
      device: parsedMetadata?.utmParams?.device || null,
      network: parsedMetadata?.utmParams?.network || null
    },
    commission: {
      totalPriceInCents: amount || 2274,
      gatewayFeeInCents: 0,
      userCommissionInCents: amount || 2274
    },
    isTest: false
  };
  
  const utmifySent = await enviarParaUtmify(utmifyPayload);
  
  processedTransactions.set(transactionId, {
    processedAt: new Date(),
    utmifySent
  });
  
  return { processed: true, utmifySent, transactionId };
}

// Webhook para Umbrela
async function processarUmbrela(body: any) {
  const data = body.data || body;
  const { id, status, amount, customer, metadata, paidAt } = data;
  
  if (status !== 'PAID') {
    return { processed: false, reason: 'Status não é PAID' };
  }
  
  const transactionId = id;
  
  // Verificar se já processamos
  if (processedTransactions.has(transactionId)) {
    const cached = processedTransactions.get(transactionId);
    if (cached?.utmifySent) {
      console.log(`⚠️ Transação ${transactionId} já processada`);
      return { processed: true, reason: 'Já processado anteriormente' };
    }
  }
  
  const parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata || {};
  
  const utmifyPayload = {
    orderId: transactionId,
    platform: 'Umbrela',
    paymentMethod: 'pix',
    status: 'paid',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    approvedDate: paidAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
    refundedAt: null,
    customer: {
      name: customer?.name || parsedMetadata?.nome || 'Cliente',
      email: customer?.email || parsedMetadata?.email || 'cliente@email.com',
      phone: customer?.phone || parsedMetadata?.telefone || '11999999999',
      document: customer?.document?.number || parsedMetadata?.cpf || '00000000000',
      country: 'BR',
      ip: '0.0.0.0'
    },
    products: [{
      id: transactionId,
      name: parsedMetadata?.produto || 'Camiseta Algodão Premium',
      planId: null,
      planName: null,
      quantity: 1,
      priceInCents: amount || 2274
    }],
    trackingParameters: {
      src: parsedMetadata?.utmParams?.src || null,
      sck: parsedMetadata?.utmParams?.sck || null,
      utm_source: parsedMetadata?.utmParams?.utm_source || null,
      utm_campaign: parsedMetadata?.utmParams?.utm_campaign || null,
      utm_medium: parsedMetadata?.utmParams?.utm_medium || null,
      utm_content: parsedMetadata?.utmParams?.utm_content || null,
      utm_term: parsedMetadata?.utmParams?.utm_term || null,
      keyword: parsedMetadata?.utmParams?.keyword || null,
      device: parsedMetadata?.utmParams?.device || null,
      network: parsedMetadata?.utmParams?.network || null
    },
    commission: {
      totalPriceInCents: amount || 2274,
      gatewayFeeInCents: 0,
      userCommissionInCents: amount || 2274
    },
    isTest: false
  };
  
  const utmifySent = await enviarParaUtmify(utmifyPayload);
  
  processedTransactions.set(transactionId, {
    processedAt: new Date(),
    utmifySent
  });
  
  return { processed: true, utmifySent, transactionId };
}

// Webhook para Nitro
async function processarNitro(body: any) {
  const data = body.data || body;
  const { id, status, amount, customer, metadata, paid_at } = data;
  
  if (status !== 'pago' && status !== 'paid' && status !== 'approved') {
    return { processed: false, reason: 'Status não é pago' };
  }
  
  const transactionId = id;
  
  // Verificar se já processamos
  if (processedTransactions.has(transactionId)) {
    const cached = processedTransactions.get(transactionId);
    if (cached?.utmifySent) {
      console.log(`⚠️ Transação ${transactionId} já processada`);
      return { processed: true, reason: 'Já processado anteriormente' };
    }
  }
  
  const parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata || {};
  
  const utmifyPayload = {
    orderId: transactionId,
    platform: 'Nitro',
    paymentMethod: 'pix',
    status: 'paid',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    approvedDate: paid_at || new Date().toISOString().replace('T', ' ').substring(0, 19),
    refundedAt: null,
    customer: {
      name: customer?.name || parsedMetadata?.nome || 'Cliente',
      email: customer?.email || parsedMetadata?.email || 'cliente@email.com',
      phone: customer?.phone || parsedMetadata?.telefone || '11999999999',
      document: customer?.document?.number || parsedMetadata?.cpf || '00000000000',
      country: 'BR',
      ip: '0.0.0.0'
    },
    products: [{
      id: transactionId,
      name: parsedMetadata?.produto || 'Camiseta Algodão Premium',
      planId: null,
      planName: null,
      quantity: 1,
      priceInCents: amount ? amount * 100 : 2274
    }],
    trackingParameters: {
      src: parsedMetadata?.utmParams?.src || null,
      sck: parsedMetadata?.utmParams?.sck || null,
      utm_source: parsedMetadata?.utmParams?.utm_source || null,
      utm_campaign: parsedMetadata?.utmParams?.utm_campaign || null,
      utm_medium: parsedMetadata?.utmParams?.utm_medium || null,
      utm_content: parsedMetadata?.utmParams?.utm_content || null,
      utm_term: parsedMetadata?.utmParams?.utm_term || null,
      keyword: parsedMetadata?.utmParams?.keyword || null,
      device: parsedMetadata?.utmParams?.device || null,
      network: parsedMetadata?.utmParams?.network || null
    },
    commission: {
      totalPriceInCents: amount ? amount * 100 : 2274,
      gatewayFeeInCents: 0,
      userCommissionInCents: amount ? amount * 100 : 2274
    },
    isTest: false
  };
  
  const utmifySent = await enviarParaUtmify(utmifyPayload);
  
  processedTransactions.set(transactionId, {
    processedAt: new Date(),
    utmifySent
  });
  
  return { processed: true, utmifySent, transactionId };
}

// POST - Recebe webhook do gateway
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const gateway = request.headers.get('x-gateway') || 
                   request.nextUrl.searchParams.get('gateway') ||
                   detectarGateway(body);
    
    console.log('🔔 Webhook recebido:', { gateway, body: JSON.stringify(body).substring(0, 500) });
    
    let result;
    
    switch (gateway) {
      case 'ghostpay':
        result = await processarGhostPay(body);
        break;
      case 'umbrela':
        result = await processarUmbrela(body);
        break;
      case 'nitro':
        result = await processarNitro(body);
        break;
      default:
        // Tentar detectar automaticamente
        if (body.status === 'PAID' || body.data?.status === 'PAID') {
          result = await processarUmbrela(body);
        } else if (body.status === 'pago' || body.data?.status === 'pago') {
          result = await processarNitro(body);
        } else {
          result = await processarGhostPay(body);
        }
    }
    
    console.log('📋 Resultado webhook:', result);
    
    return NextResponse.json({ 
      success: true, 
      ...result 
    });
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

// GET - Verificar status (para testes)
export async function GET(request: NextRequest) {
  const transactionId = request.nextUrl.searchParams.get('transactionId');
  
  if (transactionId) {
    const cached = processedTransactions.get(transactionId);
    return NextResponse.json({
      success: true,
      transactionId,
      processed: !!cached,
      utmifySent: cached?.utmifySent || false,
      processedAt: cached?.processedAt || null
    });
  }
  
  return NextResponse.json({
    success: true,
    message: 'Webhook endpoint ativo',
    processedCount: processedTransactions.size
  });
}

// Detectar gateway pelo formato do payload
function detectarGateway(body: any): string {
  if (body.data?.status === 'PAID') return 'umbrela';
  if (body.status === 'PAID') return 'umbrela';
  if (body.status === 'pago' || body.data?.status === 'pago') return 'nitro';
  return 'ghostpay';
}
