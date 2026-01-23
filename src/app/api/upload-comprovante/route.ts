import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const cpf = formData.get('cpf') as string;
    const renach = formData.get('renach') as string;

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
    const fileName = `comprovantes/${cpfLimpo}_${renach || 'norenach'}_${timestamp}.${ext}`;

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

    // Não retornar URL do Supabase para o frontend
    // Salvar apenas referência interna
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
