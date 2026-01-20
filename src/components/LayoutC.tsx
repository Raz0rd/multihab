'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LayoutC() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    setIsLoading(true);
    const params = searchParams.toString();
    const url = params ? `/login?${params}` : '/login';
    setTimeout(() => {
      router.push(url);
    }, 4000);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a3d91]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white/80 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      margin: 0, 
      padding: 0, 
      fontFamily: 'Arial, Helvetica, sans-serif',
      background: '#f4f7fb',
      color: '#0a2a5c',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 700,
          marginBottom: '15px',
          color: '#0a3d91'
        }}>
          CNH SOCIAL DIGITAL
        </h1>
        
        <h2 style={{
          fontSize: '26px',
          marginBottom: '30px',
          fontWeight: 600
        }}>
          2025: A oportunidade de realizar o seu sonho
        </h2>

        <p style={{
          fontSize: '20px',
          marginBottom: '40px',
          fontWeight: 500
        }}>
          Informações sobre iniciativas de habilitação social no Brasil
        </p>

        <button
          onClick={handleClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a3d91',
            color: '#ffffff',
            textDecoration: 'none',
            padding: '18px 40px',
            fontSize: '20px',
            fontWeight: 600,
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 20px rgba(10, 61, 145, 0.25)'
          }}
        >
          Acessar informações
        </button>

        <p style={{
          marginTop: '20px',
          fontSize: '14px',
          color: '#555'
        }}>
          Ao clicar, você será direcionado para a página de cadastro.
        </p>

        <footer style={{
          marginTop: '80px',
          fontSize: '14px',
          color: '#555',
          lineHeight: 1.6
        }}>
          <p>
            Este site tem caráter informativo e direciona o usuário para uma página de cadastro.
          </p>
        </footer>
      </div>
    </div>
  );
}
