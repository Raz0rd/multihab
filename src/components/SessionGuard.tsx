'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SessionGuardProps {
  children: React.ReactNode;
}

// Páginas que não precisam de verificação de sessão
const PUBLIC_PAGES = ['/', '/login', '/inicio', '/desconectado'];

export default function SessionGuard({ children }: SessionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Ignorar páginas públicas
    if (PUBLIC_PAGES.includes(pathname)) {
      setIsValidSession(true);
      return;
    }

    const SESSION_KEY = 'sessionTimestamp';
    const SESSION_ID_KEY = 'sessionId';
    const MAX_SESSION_AGE = 30 * 60 * 1000; // 30 minutos

    const currentTime = Date.now();
    const savedTimestamp = localStorage.getItem(SESSION_KEY);
    const savedSessionId = localStorage.getItem(SESSION_ID_KEY);
    const currentSessionId = sessionStorage.getItem('currentSessionId');

    // Gerar ID único para esta sessão (tab)
    if (!currentSessionId) {
      const newSessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('currentSessionId', newSessionId);
      
      // Se já existe uma sessão salva e é diferente, é um F5 ou nova aba
      if (savedSessionId && savedSessionId !== newSessionId) {
        // Verificar se a sessão anterior ainda é válida (não expirou)
        if (savedTimestamp && (currentTime - parseInt(savedTimestamp)) < MAX_SESSION_AGE) {
          // F5 detectado - sessão ainda válida mas ID diferente
          handleDisconnect();
          return;
        }
      }
      
      // Salvar nova sessão
      localStorage.setItem(SESSION_ID_KEY, newSessionId);
      localStorage.setItem(SESSION_KEY, currentTime.toString());
      setIsValidSession(true);
    } else {
      // Sessão já existe nesta tab - verificar se é a mesma
      if (savedSessionId === currentSessionId) {
        // Atualizar timestamp
        localStorage.setItem(SESSION_KEY, currentTime.toString());
        setIsValidSession(true);
      } else {
        // ID diferente - possível manipulação
        handleDisconnect();
      }
    }
  }, [pathname]);

  // Detectar beforeunload (F5, fechar aba, navegar para fora)
  useEffect(() => {
    if (PUBLIC_PAGES.includes(pathname)) return;

    const handleBeforeUnload = () => {
      // Marcar que houve tentativa de sair
      localStorage.setItem('sessionInterrupted', 'true');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Ao carregar, verificar se foi interrompido
    const wasInterrupted = localStorage.getItem('sessionInterrupted');
    if (wasInterrupted === 'true') {
      localStorage.removeItem('sessionInterrupted');
      handleDisconnect();
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  const handleDisconnect = () => {
    // Limpar todos os dados de sessão e pagamento
    localStorage.removeItem('sessionTimestamp');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('currentTransactionChat');
    localStorage.removeItem('currentTransaction');
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('userBasicData');
    localStorage.removeItem('vagasMesesCNH');
    sessionStorage.clear();
    
    setShowModal(true);
    setIsValidSession(false);
  };

  const handleRedirect = () => {
    setShowModal(false);
    router.push('/');
  };

  // Loading enquanto verifica
  if (isValidSession === null && !PUBLIC_PAGES.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1351B4]"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      
      {/* Modal de Desconexão */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Sessão Encerrada</h2>
              <p className="text-gray-600 mb-6">
                Você foi desconectado por motivos de segurança. Por favor, inicie o processo novamente.
              </p>
              <button
                onClick={handleRedirect}
                className="w-full bg-[#1351B4] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0D3A8C] transition-colors"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
