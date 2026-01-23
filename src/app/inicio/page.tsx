'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

function InicioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleEntrar = () => {
    setIsLoading(true);
    const params = searchParams.toString();
    const url = params ? `/login?${params}` : '/login';
    setTimeout(() => {
      router.push(url);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1351B4]/20 border-t-[#1351B4] rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-[#1351B4] text-sm font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex flex-1">
        {/* Left Content */}
        <div className="w-full lg:w-1/2 p-6 lg:p-16 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
          <div className="mb-6">
            <Image 
              src="/transferir3.png" 
              alt="Logo CNH Social Digital" 
              width={200} 
              height={80}
              className="max-w-[150px] lg:max-w-[200px]"
            />
          </div>
          
          <h1 className="text-[#0c377a] text-2xl lg:text-4xl font-bold mb-2">
            CNH Social Digital
          </h1>
          <h2 className="text-[#0c377a] text-lg lg:text-2xl font-medium mb-6 lg:mb-8">
            2025: A Oportunidade de Realizar o Seu Sonho
          </h2>
          
          <p className="text-gray-700 text-base lg:text-xl mb-6 lg:mb-8">
            O primeiro programa de inclusão social para habilitação no Brasil
          </p>
          
          <button
            onClick={handleEntrar}
            className="flex items-center justify-center gap-2 bg-[#1351b4] hover:bg-[#1c62d2] text-white rounded-full px-6 lg:px-8 py-3 lg:py-4 text-base font-medium transition-colors w-full max-w-[280px] lg:max-w-[300px]"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white"/>
            </svg>
            <span>Entrar com o gov.br</span>
          </button>
          
          <button
            onClick={handleEntrar}
            className="mt-4 text-[#1351b4] hover:underline text-base"
          >
            Saiba o que é o programa CNH Social Digital
          </button>
          
          <div className="mt-8 lg:mt-12 text-[#0c377a] font-medium text-base lg:text-lg">
            <p>Mais brasileiros dirigindo pelo país!</p>
            <p>Conseguir sua CNH não é um sonho distante!</p>
          </div>
        </div>
        
        {/* Right Content - Hidden on mobile */}
        <div className="hidden lg:block w-1/2 relative overflow-hidden" style={{ borderRadius: '0 0 0 200px' }}>
          <Image 
            src="/transferir2.png" 
            alt="Pessoas felizes com CNH Social" 
            fill
            className="object-cover object-center"
          />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full">
        <Image 
          src="/transferir.png" 
          alt="Banner decorativo" 
          width={1920}
          height={40}
          className="w-full h-10 object-cover"
        />
      </footer>
      
      {/* Accessibility Button */}
      <div className="fixed bottom-5 right-5 bg-[#1351b4] w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#1c62d2] transition-colors">
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9H15V22H13V16H11V22H9V9H3V7H21V9Z"/>
        </svg>
      </div>
    </div>
  );
}

export default function InicioPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1351B4]/20 border-t-[#1351B4] rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-[#1351B4] text-sm font-medium">Carregando...</p>
        </div>
      </div>
    }>
      <InicioContent />
    </Suspense>
  );
}
