import { NextRequest, NextResponse } from 'next/server';

const UMBRELA_API_KEY = process.env.UMBRELA_API_KEY || '';
const UMBRELA_BASE_URL = 'https://api-gateway.umbrellapag.com/api';
const UTMIFY_API_TOKEN = process.env.UTMIFY_API_TOKEN || '';
const UTMIFY_API_URL = 'https://api.utmify.com.br/api-credentials/orders';

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

    console.log(`🔍 Verificando transação ${transactionId} no gateway: ${gateway}`);
    console.log(`📊 UTMs recebidos:`, utmParams);

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
      console.log(`⚠️ Não encontrado no ${gateway}, tentando outros...`);
      if (gateway !== 'ghostpay') result = await verificarGhostPay(transactionId);
      if (!result && gateway !== 'umbrela') result = await verificarUmbrela(transactionId);
      if (!result && gateway !== 'nitro') result = await verificarNitro(transactionId);
    }

    if (result && result.success) {
      const pago = result.pago;
      
      // Se pago, enviar para UTMify com status paid
      if (pago) {
        try {
          const rawData = result.data || {};
          const metadata = rawData.metadata ? JSON.parse(rawData.metadata) : {};
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
              name: customer.name || metadata.nome || 'Cliente',
              email: customer.email || metadata.email || 'cliente@email.com',
              phone: customer.phone || metadata.telefone || '11999999999',
              document: customer.document?.number || metadata.cpf || '00000000000',
              country: 'BR',
              ip: '0.0.0.0'
            },
            products: [{
              id: result.transactionId,
              name: metadata.produto || 'Assinatura Premium 002',
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
              utm_term: utmParams?.utm_term || null
            },
            commission: {
              totalPriceInCents: result.amount || 2274,
              gatewayFeeInCents: 0,
              userCommissionInCents: result.amount || 2274
            },
            isTest: false
          };

          console.log('📤 Enviando para UTMify (PIX PAGO):', utmifyPayload);

          await fetch(UTMIFY_API_URL, {
            method: 'POST',
            headers: {
              'x-api-token': UTMIFY_API_TOKEN,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(utmifyPayload)
          });

          console.log('✅ Status PAID enviado para UTMify');
        } catch (utmifyError) {
          console.error('⚠️ Erro ao enviar para UTMify:', utmifyError);
        }
      }

      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        status: result.status,
        pago: pago,
        amount: result.amount,
        paidAt: result.paidAt || null,
        customer: result.customer,
        gateway: result.gateway
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
