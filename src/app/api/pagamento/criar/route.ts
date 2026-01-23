import { NextRequest, NextResponse } from 'next/server';

const UTMIFY_API_TOKEN = process.env.UTMIFY_API_TOKEN || '';
const UTMIFY_API_URL = 'https://api.utmify.com.br/api-credentials/orders';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Função para gerar PIX via GhostPay
async function generatePixGhostPay(body: any) {
  const secretKey = process.env.GHOSTPAY_API_KEY
  const companyId = process.env.GHOSTPAY_COMPANY_ID
  
  console.log("\n👻 [GhostPay] Verificando autenticação:")
  console.log("  Secret Key:", secretKey ? "✓ Presente" : "✗ Ausente")
  console.log("  Company ID:", companyId ? "✓ Presente" : "✗ Ausente")
  
  if (!secretKey || !companyId) {
    console.error("❌ [GhostPay] Credenciais não configuradas")
    throw new Error("GHOSTPAY_API_KEY e GHOSTPAY_COMPANY_ID são obrigatórios")
  }

  console.log("📤 [GhostPay] Gerando PIX - Valor: R$", (body.valor / 100).toFixed(2))

  const ghostPayload = {
    amount: body.valor,
    paymentMethod: 'pix',
    customer: {
      name: body.nome,
      email: body.email,
      phone: body.telefone,
      document: {
        number: body.cpf,
        type: 'cpf'
      }
    },
    items: [
      {
        title: body.produto || 'Camiseta Algodão Premium',
        unitPrice: body.valor,
        quantity: 1,
        tangible: false
      }
    ]
  }
  
  const authString = Buffer.from(`${secretKey}:${companyId}`).toString('base64')
  
  console.log("🚀 [GhostPay] Enviando requisição para API...")
  
  const response = await fetch("https://api.ghostspaysv2.com/functions/v1/transactions", {
    method: "POST",
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ghostPayload),
  })

  console.log("📡 [GhostPay] Status:", response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error("❌ [GhostPay] ERROR RESPONSE:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    })
    
    throw new Error(`Erro na API GhostPay: ${response.status}`)
  }

  const data = await response.json()

  const transactionId = data.id || data.transaction_id || data.transactionId
  const pixCode = data.pix?.qrcode || data.pixCode || data.pix_code || data.code
  const qrCodeImage = data.qrCode || data.qr_code || data.qr_code_url || data.pix?.qr_code_url
  
  console.log("🔍 [GhostPay] DADOS EXTRAÍDOS:", {
    transactionId,
    pixCode: pixCode ? `${pixCode.substring(0, 50)}...` : null,
    qrCodeImage: qrCodeImage ? "Presente" : "Ausente"
  })

  return {
    transactionId,
    pixCode,
    qrCode: qrCodeImage,
    success: true
  }
}

// Função para gerar PIX via Umbrela
async function generatePixUmbrela(body: any) {
  const UMBRELA_API_KEY = process.env.UMBRELA_API_KEY || '84f2022f-a84b-4d63-a727-1780e6261fe8';
  const UMBRELA_BASE_URL = 'https://api-gateway.umbrellapag.com/api';
  
  console.log("\n☂️ [Umbrela] Gerando PIX - Valor: R$", (body.valor / 100).toFixed(2))

  const metadata = JSON.stringify({
    nome: body.nome,
    cpf: body.cpf,
    email: body.email,
    telefone: body.telefone,
    produto: body.produto || 'Camiseta Algodão Premium',
    valorEmReais: (body.valor / 100).toFixed(2),
    dataTransacao: new Date().toISOString()
  });

  const response = await fetch(`${UMBRELA_BASE_URL}/user/transactions`, {
    method: 'POST',
    headers: {
      'x-api-key': UMBRELA_API_KEY,
      'User-Agent': 'UMBRELLAB2B/1.0',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: body.valor,
      currency: 'BRL',
      paymentMethod: 'PIX',
      customer: {
        name: body.nome,
        email: body.email,
        document: {
          number: body.cpf,
          type: 'CPF'
        },
        phone: body.telefone,
        externalRef: '',
        address: {
          street: body.endereco?.street || 'Rua',
          streetNumber: body.endereco?.streetNumber || '0',
          complement: body.endereco?.complement || '',
          zipCode: body.endereco?.zipCode?.replace(/\D/g, '') || '00000000',
          neighborhood: body.endereco?.neighborhood || 'Centro',
          city: body.endereco?.city || 'São Paulo',
          state: body.endereco?.state || 'SP',
          country: 'br'
        }
      },
      shipping: {
        fee: 0,
        address: {
          street: body.endereco?.street || 'Rua',
          streetNumber: body.endereco?.streetNumber || '0',
          complement: body.endereco?.complement || '',
          zipCode: body.endereco?.zipCode?.replace(/\D/g, '') || '00000000',
          neighborhood: body.endereco?.neighborhood || 'Centro',
          city: body.endereco?.city || 'São Paulo',
          state: body.endereco?.state || 'SP',
          country: 'br'
        }
      },
      items: [{
        title: body.produto || 'Camiseta Algodão Premium',
        unitPrice: body.valor,
        quantity: 1,
        tangible: true,
        externalRef: ''
      }],
      pix: {
        expiresInDays: 1
      },
      postbackUrl: '',
      metadata: metadata,
      traceable: true,
      ip: '0.0.0.0'
    })
  });

  const result = await response.json();
  
  if (result.status === 200) {
    return {
      transactionId: result.data.id,
      pixCode: result.data.qrCode,
      qrCode: result.data.qrCode,
      success: true,
      status: result.data.status,
      expirationDate: result.data.pix?.expirationDate,
      amount: result.data.amount
    }
  }
  
  throw new Error('Erro ao criar transação Umbrela')
}

// Função para gerar PIX via Nitro Pagamento (sem UTMs, referer falsificado)
async function generatePixNitro(body: any) {
  const pkKey = process.env.NITRONOVAPKKEY
  const skKey = process.env.NITRONOVASKKEY
  
  console.log("\n⚡ [Nitro] Verificando autenticação:")
  console.log("  PK Key:", pkKey ? "✓ Presente" : "✗ Ausente")
  console.log("  SK Key:", skKey ? "✓ Presente" : "✗ Ausente")
  
  if (!pkKey || !skKey) {
    console.error("❌ [Nitro] Credenciais não configuradas")
    throw new Error("NITRONOVAPKKEY e NITRONOVASKKEY são obrigatórios")
  }

  // Nitro usa valor em reais, não centavos
  const valorEmReais = body.valor / 100
  
  console.log("📤 [Nitro] Gerando PIX - Valor: R$", valorEmReais.toFixed(2))

  const nitroPayload = {
    amount: valorEmReais,
    payment_method: 'pix',
    description: body.produto || 'Camiseta Algodão Premium',
    items: [
      {
        title: body.produto || 'Camiseta Algodão Premium',
        unitPrice: body.valor,
        quantity: 1,
        tangible: false
      }
    ],
    customer: {
      name: body.nome,
      email: body.email,
      document: body.cpf,
      phone: body.telefone
    },
    metadata: {
      nome: body.nome,
      cpf: body.cpf,
      email: body.email,
      telefone: body.telefone,
      produto: body.produto || 'Camiseta Algodão Premium',
      valorEmReais: valorEmReais.toFixed(2),
      dataTransacao: new Date().toISOString()
    },
    postbackUrl: ''
  }
  
  const authString = Buffer.from(`${pkKey}:${skKey}`).toString('base64')
  
  console.log("🚀 [Nitro] Enviando requisição para API...")
  
  const response = await fetch("https://api.nitropagamento.app", {
    method: "POST",
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/json',
      'Referer': 'https://lojasroupa.com.br',
      'Origin': 'https://lojasroupa.com.br'
    },
    body: JSON.stringify(nitroPayload),
  })

  console.log("📡 [Nitro] Status:", response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error("❌ [Nitro] ERROR RESPONSE:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    })
    
    throw new Error(`Erro na API Nitro: ${response.status}`)
  }

  const data = await response.json()

  if (!data.success) {
    console.error("❌ [Nitro] Resposta sem sucesso:", data)
    throw new Error('Erro ao criar transação Nitro')
  }

  const transactionId = data.data?.id
  const pixCode = data.data?.pix_code
  const qrCodeImage = data.data?.pix_qr_code ? `data:image/png;base64,${data.data.pix_qr_code}` : null
  
  console.log("🔍 [Nitro] DADOS EXTRAÍDOS:", {
    transactionId,
    pixCode: pixCode ? `${pixCode.substring(0, 50)}...` : null,
    qrCodeImage: qrCodeImage ? "Presente" : "Ausente",
    status: data.data?.status
  })

  return {
    transactionId,
    pixCode,
    qrCode: qrCodeImage || pixCode,
    success: true,
    status: data.data?.status,
    expirationDate: data.data?.expires_at,
    amount: data.data?.amount ? data.data.amount * 100 : body.valor
  }
}

export async function POST(request: NextRequest) {
  try {
    const gateway = process.env.PAYMENT_GATEWAY || 'ghostpay';
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🚀 [GATEWAY] Iniciando geração de PIX")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🎯 [GATEWAY] Gateway selecionado:", gateway)
    console.log("🔑 [ENV] PAYMENT_GATEWAY:", process.env.PAYMENT_GATEWAY)
    console.log("🔑 [ENV] GHOSTPAY_API_KEY:", process.env.GHOSTPAY_API_KEY ? "✓ Presente" : "❌ Ausente")
    console.log("🔑 [ENV] GHOSTPAY_COMPANY_ID:", process.env.GHOSTPAY_COMPANY_ID ? "✓ Presente" : "❌ Ausente")
    
    const body = await request.json();
    
    const {
      valor,
      nome,
      email,
      cpf,
      telefone,
      produto,
      endereco,
      utmParams
    } = body;

    // Validações básicas
    if (!valor || !nome || !cpf) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Limpar CPF (apenas números)
    const cpfLimpo = cpf.replace(/\D/g, '');

    // Gerar email único a partir do nome se não tiver ou for genérico
    const emailStr = typeof email === 'string' ? email : '';
    const emailInvalido = !emailStr || emailStr === 'usuario@email.com' || emailStr.includes('usuario');
    
    let emailGerado = email;
    if (emailInvalido) {
      const dominios = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br', 'live.com'];
      const dominioAleatorio = dominios[Math.floor(Math.random() * dominios.length)];
      const randomStr = Math.random().toString(36).substring(2, 6);
      
      // Pegar primeiro nome e sobrenome, remover acentos e caracteres especiais
      const nomeLimpo = nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z\s]/g, '')
        .trim()
        .split(/\s+/);
      
      const primeiroNome = nomeLimpo[0] || 'user';
      const sobrenome = nomeLimpo[nomeLimpo.length - 1] || '';
      
      emailGerado = `${primeiroNome}${sobrenome}${randomStr}@${dominioAleatorio}`;
    }

    // Limpar telefone (apenas números)
    const telefoneClean = telefone?.replace(/\D/g, '') || '';
    
    // Se não tiver telefone, gerar baseado no CPF para ser único
    const telefoneValido = telefoneClean.length >= 10 ? telefoneClean : `11${cpfLimpo.substring(0, 9)}`;

    // Log para debug
    console.log('📦 Payload recebido:', { nome, cpf: cpfLimpo, email: emailGerado, telefone: telefoneValido });

    // Preparar dados para o gateway
    const paymentData = {
      valor,
      nome,
      email: emailGerado,
      cpf: cpfLimpo,
      telefone: telefoneValido,
      produto: produto || 'Camiseta Algodão Premium',
      endereco
    };

    // Chamar gateway apropriado
    let result: any;
    
    if (gateway === 'ghostpay') {
      result = await generatePixGhostPay(paymentData);
    } else if (gateway === 'umbrela') {
      result = await generatePixUmbrela(paymentData);
    } else if (gateway === 'nitro') {
      result = await generatePixNitro(paymentData);
    } else {
      // Padrão: GhostPay
      result = await generatePixGhostPay(paymentData);
    }

    if (result.success) {
      // Enviar para UTMify - PIX Gerado (waiting_payment)
      try {
        const utmifyPayload = {
          orderId: result.transactionId,
          platform: gateway === 'ghostpay' ? 'GhostPay' : gateway === 'nitro' ? 'Nitro' : 'Umbrela',
          paymentMethod: 'pix',
          status: 'waiting_payment',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          approvedDate: null,
          refundedAt: null,
          customer: {
            name: nome,
            email: emailGerado,
            phone: telefoneValido,
            document: cpfLimpo,
            country: 'BR',
            ip: '0.0.0.0'
          },
          products: [{
            id: result.transactionId,
            name: produto || 'Camiseta Algodão Premium',
            planId: null,
            planName: null,
            quantity: 1,
            priceInCents: valor
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
            totalPriceInCents: valor,
            gatewayFeeInCents: 0,
            userCommissionInCents: valor
          },
          isTest: false
        };

        console.log('📤 Enviando para UTMify (PIX Gerado):', utmifyPayload);

        await fetch(UTMIFY_API_URL, {
          method: 'POST',
          headers: {
            'x-api-token': UTMIFY_API_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(utmifyPayload)
        });

        console.log('✅ Enviado para UTMify com sucesso');
      } catch (utmifyError) {
        console.error('⚠️ Erro ao enviar para UTMify:', utmifyError);
      }

      console.log('✅ [GATEWAY] PIX gerado com sucesso!');
      console.log('   - Transaction ID:', result.transactionId);
      console.log('   - Gateway:', gateway);
      console.log('   - Valor: R$', (valor / 100).toFixed(2));

      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        qrCode: result.qrCode || result.pixCode,
        pixCode: result.pixCode,
        status: result.status || 'pending',
        expirationDate: result.expirationDate,
        amount: result.amount || valor
      });
    }

    // Erro ao gerar PIX
    return NextResponse.json(
      { error: 'Erro ao criar transação no gateway de pagamento' },
      { status: 500 }
    );

  } catch (error) {
    console.error('💥 [GATEWAY] ERRO:', error instanceof Error ? error.message : 'Unknown error');
    
    const userMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    
    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}
