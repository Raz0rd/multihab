import { NextRequest, NextResponse } from 'next/server';

const UMBRELA_API_KEY = process.env.UMBRELA_API_KEY || '';
const UMBRELA_BASE_URL = 'https://api-gateway.umbrellapag.com/api';
const UTMIFY_API_TOKEN = process.env.UTMIFY_API_TOKEN || '';
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
      
      // Se for erro 4xx (exceto 429), não adianta tentar novamente
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        console.error('⚠️ Erro de cliente, não faz retry');
        utmifySentCache.set(transactionId, { sentAt: new Date(), success: false });
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
  
  utmifySentCache.set(transactionId, { sentAt: new Date(), success: false });
  return false;
}

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Verificar via GhostPay
async function verificarGhostPay(transactionId: string) {
  const secretKey = process.env.GHOSTPAY_API_KEY;
  const companyId = process.env.GHOSTPAY_COMPANY_ID;
  
  if (!secretKey || !companyId) {
    return null;
  }
  
  const authString = Buffer.from(`${secretKey}:${companyId}`).toString('base64');
  
  const response = await fetch(`https://api.ghostspaysv2.com/functions/v1/transactions/${transactionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) return null;
  
  const data = await response.json();
  return {
    success: true,
    transactionId: data.id,
    status: data.status,
    pago: data.status === 'paid' || data.status === 'approved',
    amount: data.amount,
    paidAt: data.paid_at || null,
    gateway: 'ghostpay',
    customer: data.customer || null,
    data: data
  };
}

// Verificar via Umbrela
async function verificarUmbrela(transactionId: string) {
  const response = await fetch(
    `${UMBRELA_BASE_URL}/user/transactions/${transactionId}`,
    {
      method: 'GET',
      headers: {
        'x-api-key': UMBRELA_API_KEY,
        'User-Agent': 'UMBRELLAB2B/1.0'
      }
    }
  );

  const result = await response.json();
  
  if (result.status === 200) {
    return {
      success: true,
      transactionId: result.data.id,
      status: result.data.status,
      pago: result.data.status === 'PAID',
      amount: result.data.amount,
      paidAt: result.data.paidAt || null,
      customer: result.data.customer,
      gateway: 'umbrela',
      data: result.data
    };
  }
  
  return null;
}

// Verificar via Nitro Pagamento
async function verificarNitro(transactionId: string) {
  const pkKey = process.env.NITRONOVAPKKEY;
  const skKey = process.env.NITRONOVASKKEY;
  
  if (!pkKey || !skKey) {
    return null;
  }
  
  const authString = Buffer.from(`${pkKey}:${skKey}`).toString('base64');
  
  const response = await fetch(`https://api.nitropagamento.app/transactions/${transactionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) return null;
  
  const result = await response.json();
  
  if (result.success && result.data) {
    const data = result.data;
    return {
      success: true,
      transactionId: data.id,
      status: data.status,
      pago: data.status === 'pago' || data.status === 'paid' || data.status === 'approved',
      amount: data.amount ? data.amount * 100 : 0,
      paidAt: data.paid_at || null,
      gateway: 'nitro',
      customer: data.customer || null,
      data: data
    };
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, utmParams } = body;
    const gateway = process.env.PAYMENT_GATEWAY || 'ghostpay';

    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID da transação não fornecido' },
        { status: 400 }
      );
    }

    // Log simplificado sem expor gateway

    // Verificar no gateway configurado primeiro
    let result = null;
    
    if (gateway === 'umbrela') {
      result = await verificarUmbrela(transactionId);
    } else if (gateway === 'ghostpay') {
      result = await verificarGhostPay(transactionId);
    } else if (gateway === 'nitro') {
      result = await verificarNitro(transactionId);
    }
    
    // Se não encontrou, tenta nos outros gateways
    if (!result) {
      console.log(`⚠️ TX ${transactionId.substring(0, 8)}... não encontrado, tentando fallback...`);
      if (gateway !== 'ghostpay') result = await verificarGhostPay(transactionId);
      if (!result && gateway !== 'umbrela') result = await verificarUmbrela(transactionId);
      if (!result && gateway !== 'nitro') result = await verificarNitro(transactionId);
    }

    if (result && result.success) {
      const pago = result.pago;
      const customerData = result.customer || result.data?.customer || {};
      const cpf = typeof customerData === 'object' ? (customerData.document || customerData.cpf || 'N/A') : 'N/A';
      console.log(`🔍 TX: ${transactionId.substring(0, 8)}... | CPF: ${cpf} | Status: ${pago ? 'PAGO ✅' : 'Pendente'}`);
      
      // Se pago, enviar para UTMify com status paid (com flag de duplicação e retry)
      if (pago) {
        const rawData = result.data || {};
        let metadata = {};
        try {
          metadata = rawData.metadata ? JSON.parse(rawData.metadata) : {};
        } catch (e) {
          metadata = rawData.metadata || {};
        }
        const customer = result.customer || rawData.customer || {};
        
        const utmifyPayload = {
          orderId: result.transactionId,
          platform: result.gateway === 'umbrela' ? 'Umbrela' : result.gateway === 'nitro' ? 'Nitro' : 'GhostPay',
          paymentMethod: 'pix',
          status: 'paid',
          createdAt: rawData.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
          approvedDate: result.paidAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
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
            id: result.transactionId,
            name: (metadata as any).produto || 'Assinatura Premium 002',
            planId: null,
            planName: null,
            quantity: 1,
            priceInCents: result.amount || 2274
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
            totalPriceInCents: result.amount || 2274,
            gatewayFeeInCents: 0,
            userCommissionInCents: result.amount || 2274
          },
          isTest: false
        };

        // Enviar com retry e flag de duplicação
        await enviarParaUtmifyComRetry(utmifyPayload, result.transactionId);
      }

      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        status: result.status,
        pago: pago,
        amount: result.amount,
        paidAt: result.paidAt || null,
        customer: result.customer
      });
    }

    return NextResponse.json(
      { error: 'Erro ao verificar transação', details: result },
      { status: 500 }
    );

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
