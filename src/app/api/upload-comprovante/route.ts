import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const cpf = formData.get('cpf') as string;
    const renach = formData.get('renach') as string;
    const paymentId = formData.get('paymentId') as string;
    const amount = formData.get('amount') as string;
    const customerMessage = formData.get('customerMessage') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Arquivo não enviado' }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseToken = process.env.SUPABASE_TOKEN;

    if (!supabaseUrl || !supabaseToken) {
      console.error('Supabase não configurado');
      return NextResponse.json({ success: false, error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const cpfLimpo = cpf?.replace(/\D/g, '') || 'unknown';
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${cpfLimpo}_${renach || 'norenach'}_${timestamp}.${ext}`;

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload para Supabase Storage (bucket: comprovantes)
    // Primeiro tenta criar o bucket se não existir
    try {
      await fetch(`${supabaseUrl}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 'receipts',
          name: 'receipts',
          public: false
        })
      });
    } catch {
      // Bucket já existe, ignora
    }

    const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/receipts/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseToken}`,
        'Content-Type': file.type,
        'x-upsert': 'true'
      },
      body: buffer
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Erro no upload Supabase:', errorText);
      return NextResponse.json({ success: false, error: 'Erro ao fazer upload' }, { status: 500 });
    }
    
    console.log(`✅ Comprovante salvo: CPF ${cpfLimpo} | RENACH ${renach || 'N/A'}`);

    // Gerar URL do arquivo no bucket
    const receiptUrl = `${supabaseUrl}/storage/v1/object/receipts/${fileName}`;

    // Salvar registro na tabela payment_receipts
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/payment_receipts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseToken}`,
        'apikey': supabaseToken,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        payment_id: paymentId || null,
        receipt_url: receiptUrl,
        receipt_filename: fileName,
        ghost_status: 'pending',
        amount: amount ? Math.round(parseFloat(amount) * 100) : null,
        customer_message: customerMessage || null,
        resolved: false,
        created_at: new Date().toISOString()
      })
    });

    if (!insertResponse.ok) {
      const insertError = await insertResponse.text();
      console.error('❌ Erro ao salvar na tabela:', insertError);
      // Não falha o upload, apenas loga o erro
    } else {
      console.log(`📝 Registro salvo na tabela payment_receipts`);
    }

    return NextResponse.json({
      success: true,
      fileId: fileName,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}
