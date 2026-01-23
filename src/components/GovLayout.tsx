'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaEllipsisV, FaCookieBite, FaTh, FaUser, FaBars, FaSearch, FaHome, FaChevronRight, FaFacebookF, FaYoutube, FaInstagram, FaLinkedinIn, FaDice } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface GovLayoutProps {
  children: React.ReactNode;
  userName?: string;
  showBreadcrumb?: boolean;
  breadcrumbItems?: string[];
}

interface UserData {
  nome?: string;
  nascimento?: string;
  mae?: string;
  email?: string;
}

export default function GovLayout({ children, userName, showBreadcrumb = true, breadcrumbItems }: GovLayoutProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('usuarioLogado');
    if (saved) {
      setUserData(JSON.parse(saved));
    }
  }, []);

  const mascarNascimento = (data: string): string => {
    if (!data) return '**/**/****';
    const partes = data.split('/');
    if (partes.length === 3) {
      return `${partes[0].charAt(0)}*/**/${partes[2].slice(0, 2)}**`;
    }
    return '**/**/****';
  };

  const mascarNome = (nome: string): string => {
    if (!nome) return '***';
    const partes = nome.split(' ');
    return partes.map(parte => {
      if (parte.length <= 2) return parte;
      return parte.slice(0, 2) + '*'.repeat(Math.min(parte.length - 2, 4));
    }).join(' ');
  };

  const mascarEmail = (email: string): string => {
    if (!email) return '***@***.com';
    const [local, dominio] = email.split('@');
    if (!local || !dominio) return '***@***.com';
    const localMascarado = local.slice(0, 3) + '****';
    return `${localMascarado}@${dominio}`;
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header Gov.br */}
      <header style={{ backgroundColor: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Image 
            src="/logo645.png" 
            alt="Logo gov.br" 
            width={70} 
            height={24} 
            style={{ marginRight: '32px' }}
          />
          <button aria-label="Menu de links" style={{ border: 'none', color: 'rgb(20, 81, 180)', fontSize: '14px', marginLeft: '32px', cursor: 'pointer', background: 'none', padding: '0px' }}>
            <FaEllipsisV style={{ fontSize: '16px' }} />
          </button>
          <div style={{ borderLeft: '1px solid rgb(204, 204, 204)', height: '24px', margin: '0px 16px' }}></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={{ border: 'none', color: 'rgb(20, 81, 180)', cursor: 'pointer', marginLeft: '24px', background: 'none', padding: '0px' }}>
            <FaCookieBite style={{ fontSize: '16px' }} />
          </button>
          <button type="button" aria-label="Sistemas" style={{ border: 'none', color: 'rgb(20, 81, 180)', cursor: 'pointer', marginLeft: '24px', background: 'none', padding: '0px' }}>
            <FaTh style={{ fontSize: '16px' }} />
          </button>
          <div style={{ position: 'relative' }}>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowUserMenu(prev => !prev);
              }}
              style={{ backgroundColor: 'rgb(20, 81, 180)', color: 'white', border: 'none', borderRadius: '9999px', padding: '6px 16px', display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer', marginLeft: '24px' }}
            >
              <FaUser style={{ color: 'white', marginRight: '8px', fontSize: '16px' }} />
              <span>{userName || 'Entrar'}</span>
            </button>
            
            {/* Submenu */}
            {showUserMenu && (
              <>
                <div 
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                  onClick={() => setShowUserMenu(false)}
                />
                <div style={{ position: 'absolute', right: 0, marginTop: '8px', width: '288px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb', zIndex: 50 }}>
                  <div style={{ padding: '16px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>Nome completo</p>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>{userData?.nome || 'Nome do Usuário'}</p>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>Nascimento</p>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>{mascarNascimento(userData?.nascimento || '')}</p>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>Mãe</p>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>{mascarNome(userData?.mae || '')}</p>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>E-mail</p>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>{mascarEmail(userData?.email || '')}</p>
                    </div>
                    <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '14px', color: '#1351B4', cursor: 'default', marginBottom: '8px' }}>Editar meus dados</p>
                      <p style={{ fontSize: '14px', color: '#1351B4', cursor: 'default' }}>Sair</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav style={{ backgroundColor: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={{ border: 'none', color: 'rgb(20, 81, 180)', display: 'flex', alignItems: 'center', cursor: 'pointer', background: 'none', padding: '0px' }}>
          <FaBars style={{ marginRight: '10px', fontSize: '16px' }} />
          <span style={{ color: 'rgb(102, 102, 102)', fontSize: '1rem', fontWeight: 300, lineHeight: '20px', paddingTop: '2px' }}>Ministério dos Transportes</span>
        </button>
        <button aria-label="Pesquisar" style={{ border: 'none', color: 'rgb(20, 81, 180)', fontSize: '16px', cursor: 'pointer', background: 'none', padding: '0px' }}>
          <FaSearch />
        </button>
      </nav>

      {/* Breadcrumb */}
      {showBreadcrumb && (
        <div className="px-4 py-3">
          <nav className="flex items-center text-sm text-gray-600 flex-wrap gap-1">
            <FaHome className="text-[#1351B4] text-xs" />
            <FaChevronRight className="text-gray-400 text-xs mx-1" />
            <span className="text-[#1351B4]">Programa CNH do Brasil</span>
            {breadcrumbItems?.map((item, index) => (
              <span key={index} className="flex items-center">
                <FaChevronRight className="text-gray-400 text-xs mx-1" />
                <span className={index === breadcrumbItems.length - 1 ? "font-semibold text-gray-700" : "text-[#1351B4]"} style={{ fontSize: '0.8125rem' }}>
                  {item}
                </span>
              </span>
            ))}
          </nav>
        </div>
      )}

      <div className="border-b border-gray-200"></div>

      {/* Main Content */}
      <main id="main-signin" className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer Gov.br */}
      <footer className="text-white mt-auto w-full" style={{ backgroundColor: 'rgb(7, 29, 65)', display: 'block' }}>
        <div className="px-6 py-8">
          <span className="text-3xl font-bold italic text-white mb-8 block">gov.br</span>
          
          <div className="border-t border-white/20 pt-6">
            <div className="space-y-0">
              <div className="flex justify-between items-center py-4 border-b border-white/20">
                <span className="font-semibold">ASSUNTOS</span>
                <FaChevronRight className="text-white/70 rotate-90" />
              </div>
              <div className="flex justify-between items-center py-4 border-b border-white/20">
                <span className="font-semibold">ACESSO À INFORMAÇÃO</span>
                <FaChevronRight className="text-white/70 rotate-90" />
              </div>
              <div className="flex justify-between items-center py-4 border-b border-white/20">
                <span className="font-semibold">COMPOSIÇÃO</span>
                <FaChevronRight className="text-white/70 rotate-90" />
              </div>
              <div className="flex justify-between items-center py-4 border-b border-white/20">
                <span className="font-semibold">CANAIS DE ATENDIMENTO</span>
                <FaChevronRight className="text-white/70 rotate-90" />
              </div>
              <div className="flex justify-between items-center py-4 border-b border-white/20">
                <span className="font-semibold">CENTRAL DE CONTEÚDOS</span>
                <FaChevronRight className="text-white/70 rotate-90" />
              </div>
              <div className="flex justify-between items-center py-4 border-b border-white/20">
                <span className="font-semibold">SERVIÇOS</span>
                <FaChevronRight className="text-white/70 rotate-90" />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-white/80">
            <FaDice />
            <span>Redefinir Cookies</span>
          </div>

          <div className="mt-8">
            <p className="font-semibold mb-4">REDES SOCIAIS</p>
            <div className="flex gap-4">
              <FaXTwitter size={20} />
              <FaYoutube size={20} />
              <FaFacebookF size={20} />
              <FaDice size={20} />
              <FaInstagram size={20} />
              <FaLinkedinIn size={20} />
            </div>
          </div>
        </div>
      </footer>

      {/* VLibras Icon */}
      <div className="fixed right-4 top-1/2 z-50 cursor-pointer transition-transform duration-300 ease-in-out" style={{ transform: 'translateY(calc(-50% - 20px))' }}>
        <Image src="/access_icon.svg" alt="VLibras" width={40} height={40} />
      </div>

      {/* Back to Top Button */}
      <button 
        className="fixed right-4 bottom-4 z-50 bg-[#1351B4] p-3 rounded-full shadow-lg hover:bg-[#0D3C8C] transition-colors"
        aria-label="Voltar ao topo"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <FaChevronRight className="text-white rotate-[-90deg]" size={16} />
      </button>
    </div>
  );
}
