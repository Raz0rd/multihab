'use client';

import { useState, useEffect, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CloakerGateProps {
  children: ReactNode;
}

function LandingPage({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Disclaimer Banner no Topo */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 py-2 px-4 text-center">
        <p className="text-xs md:text-sm text-gray-900 font-medium">
          ⚠️ Esta autoescola não é um órgão governamental. O programa é de responsabilidade do Detran.
        </p>
      </div>

      {/* Hero Section com Imagem de Fundo */}
      <div className="relative flex items-center justify-center py-16 md:py-24">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/faixa.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-green-800/80 to-blue-900/90"></div>
        </div>

        {/* Conteúdo Central */}
        <div className="relative z-10 text-center px-6 py-12 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Programa de CNH Social
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-4 drop-shadow">
            Saiba Como Participar
          </p>
          <p className="text-base md:text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Ajudamos candidatos a entender os critérios do programa governamental de CNH subsidiada e oferecemos suporte aos aprovados.
          </p>
          
          {/* Botão Central */}
          <button
            onClick={onContinue}
            className="inline-block bg-gradient-to-r from-green-500 via-green-400 to-yellow-400 hover:from-green-600 hover:via-green-500 hover:to-yellow-500 text-gray-900 font-bold text-lg md:text-xl px-10 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Iniciar Verificação de Elegibilidade
          </button>
          
          <p className="text-white/60 text-sm mt-6">
            Consulte os requisitos do programa
          </p>
        </div>
      </div>

      {/* Bloco Explicativo: Como Funciona */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Como Funciona o Programa de CNH Social
          </h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-8">
            <p className="text-gray-700 leading-relaxed">
              O Programa de CNH Social é uma iniciativa do governo estadual que oferece subsídio parcial ou total para a obtenção da carteira de habilitação a pessoas que atendem aos critérios estabelecidos pelo Detran.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
              A seleção dos candidatos é feita exclusivamente pelos órgãos oficiais.
            </p>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Qual é o papel da nossa autoescola?
          </h3>
          <p className="text-gray-600 mb-6">Nossa autoescola atua oferecendo:</p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Orientação</h4>
              <p className="text-gray-600 text-sm">Orientação sobre o processo de inscrição</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Documentação</h4>
              <p className="text-gray-600 text-sm">Apoio na organização de documentos</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Formação</h4>
              <p className="text-gray-600 text-sm">Formação teórica e prática para aprovados</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-800 text-sm text-center font-medium">
              ⚠️ Não realizamos a seleção nem garantimos vagas no programa.
            </p>
          </div>
        </div>
      </section>

      {/* Prova Social */}
      <section className="py-10 px-4 bg-gradient-to-r from-blue-900 via-green-800 to-blue-900">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center text-white">
            <div>
              <p className="text-3xl font-bold mb-2">+10 Anos</p>
              <p className="text-white/80 text-sm">Experiência em formação de condutores</p>
            </div>
            <div>
              <p className="text-3xl font-bold mb-2">Credenciada</p>
              <p className="text-white/80 text-sm">Autoescola devidamente credenciada</p>
            </div>
            <div>
              <p className="text-3xl font-bold mb-2">+5.000</p>
              <p className="text-white/80 text-sm">Alunos atendidos</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">A autoescola oferece a CNH gratuitamente?</h3>
              <p className="text-gray-600">Não. O programa é governamental. A autoescola oferece suporte aos candidatos aprovados.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">A inscrição garante aprovação?</h3>
              <p className="text-gray-600">Não. A seleção é feita pelo Detran conforme critérios oficiais.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Quem pode participar?</h3>
              <p className="text-gray-600">Pessoas que atendem aos critérios definidos pelo programa estadual.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Verifique sua Elegibilidade
          </h2>
          <p className="text-gray-600 mb-8">
            Consulte os requisitos do programa e veja se você pode participar.
          </p>
          <button
            onClick={onContinue}
            className="inline-block bg-gradient-to-r from-green-500 via-green-400 to-yellow-400 hover:from-green-600 hover:via-green-500 hover:to-yellow-500 text-gray-900 font-bold text-lg px-10 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Continuar para Análise de Perfil
          </button>
        </div>
      </section>

      {/* Footer Completo */}
      <footer className="bg-gray-900 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Dados da Empresa */}
          <div className="grid md:grid-cols-2 gap-8 mb-8 text-gray-400 text-sm">
            <div>
              <h4 className="text-white font-semibold mb-3">Dados da Empresa</h4>
              <p className="mb-1"><strong>Razão Social:</strong> 52.649.419 JOAO BATISTA SOUZA DE FARIA JUNIOR</p>
              <p className="mb-1"><strong>CNPJ:</strong> 52.649.419/0001-72</p>
              <p className="mb-1"><strong>Porte:</strong> Micro Empresa</p>
              <p><strong>Desde:</strong> 23/10/2023</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Localização</h4>
              <p className="mb-1">Rua Samambaia, 29</p>
              <p className="mb-1">Bairro Picada - Araruama/RJ</p>
              <p className="mb-1">CEP: 28984-712</p>
              <p className="mb-1"><strong>Tel:</strong> (24) 6521-16</p>
              <p><strong>E-mail:</strong> contato@bestwayshopper.store</p>
            </div>
          </div>

          {/* Links */}
          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-4">
              <Link href="/politica-privacidade" className="text-gray-400 hover:text-white text-sm transition-colors">
                Política de Privacidade
              </Link>
              <span className="text-gray-700 hidden md:inline">|</span>
              <Link href="/politica-cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Política de Cookies
              </Link>
              <span className="text-gray-700 hidden md:inline">|</span>
              <Link href="/termos-uso" className="text-gray-400 hover:text-white text-sm transition-colors">
                Termos de Uso
              </Link>
            </div>
            <p className="text-gray-500 text-xs text-center">
              © 2026 - Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CloakerGate({ children }: CloakerGateProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [isBot, setIsBot] = useState(false);
  const [userClicked, setUserClicked] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleContinue = () => {
    setUserClicked(true);
    setChecking(true);
    
    // Verificações anti-bot
    const detectBot = (): boolean => {
      // 1. Detectar webdriver (headless browsers)
      if (navigator.webdriver) return true;
      
      // 2. Detectar automação
      const dominated = (window as any).domAutomation || (window as any).domAutomationController;
      if (dominated) return true;
      
      // 3. Verificar plugins (bots geralmente não têm)
      if (navigator.plugins.length === 0) return true;
      
      // 4. Verificar linguagens
      if (!navigator.languages || navigator.languages.length === 0) return true;
      
      // 5. Detectar PhantomJS
      if ((window as any).callPhantom || (window as any)._phantom) return true;
      
      // 6. Detectar Selenium
      if ((window as any).__selenium_unwrapped || (window as any).__webdriver_evaluate) return true;
      
      // 7. Verificar dimensões da tela (bots podem ter 0)
      if (window.outerWidth === 0 || window.outerHeight === 0) return true;
      
      // 8. Canvas fingerprint test
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return true;
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('test', 2, 2);
        const dataURL = canvas.toDataURL();
        if (dataURL === 'data:,') return true;
      } catch {
        return true;
      }
      
      return false;
    };

    // Verificar após um pequeno delay
    setTimeout(() => {
      const botDetected = detectBot();
      setIsBot(botDetected);
      setIsVerified(true);
      setChecking(false);
    }, 1500);
  };

  // Mostra landing page até o usuário clicar
  if (!userClicked) {
    return <LandingPage onContinue={handleContinue} />;
  }

  // Verificando após clique - mostra loading
  if (checking || !isVerified) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-green-800 to-blue-900">
        <div className="text-center text-white px-6">
          <div className="w-16 h-16 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-8"></div>
          <h1 className="text-xl font-medium mb-3">Verificando elegibilidade...</h1>
          <p className="text-white/60 text-sm">Por favor, aguarde...</p>
        </div>
      </div>
    );
  }

  // Se for bot, mostra loading infinito
  if (isBot) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-green-800 to-blue-900">
        <div className="text-center text-white px-6">
          <div className="w-16 h-16 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-8"></div>
          <h1 className="text-xl font-medium mb-3">Carregando...</h1>
          <p className="text-white/60 text-sm">Por favor, aguarde...</p>
        </div>
      </div>
    );
  }

  // Usuário verificado - mostra conteúdo real
  return <>{children}</>;
}
