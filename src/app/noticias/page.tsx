'use client';

import Link from 'next/link';
import Image from 'next/image';

const noticias = [
  {
    id: 1,
    titulo: 'Governo amplia vagas para CNH Social em 2026',
    resumo: 'Programa estadual de habilitação gratuita terá mais de 50 mil novas vagas disponíveis para candidatos de baixa renda em todo o estado.',
    data: '15 de Janeiro de 2026',
    categoria: 'Programa CNH Social',
    destaque: true,
  },
  {
    id: 2,
    titulo: 'Detran anuncia novo calendário de inscrições',
    resumo: 'As inscrições para o programa de CNH Social seguem abertas até março. Confira os requisitos e documentos necessários.',
    data: '14 de Janeiro de 2026',
    categoria: 'Inscrições',
    destaque: false,
  },
  {
    id: 3,
    titulo: 'Novas regras para primeira habilitação entram em vigor',
    resumo: 'Contran atualiza resolução sobre processo de habilitação com mudanças no exame teórico e prático.',
    data: '12 de Janeiro de 2026',
    categoria: 'Legislação',
    destaque: false,
  },
  {
    id: 4,
    titulo: 'Como se preparar para o exame teórico do Detran',
    resumo: 'Especialistas dão dicas valiosas para quem vai fazer a prova teórica. Saiba o que mais cai no exame.',
    data: '10 de Janeiro de 2026',
    categoria: 'Dicas',
    destaque: false,
  },
  {
    id: 5,
    titulo: 'Documentos necessários para CNH Social',
    resumo: 'Lista completa de documentos que você precisa reunir para se inscrever no programa de habilitação gratuita.',
    data: '08 de Janeiro de 2026',
    categoria: 'Documentação',
    destaque: false,
  },
  {
    id: 6,
    titulo: 'Beneficiários do CadÚnico têm prioridade no programa',
    resumo: 'Famílias inscritas no Cadastro Único têm preferência na seleção para CNH Social. Entenda os critérios.',
    data: '05 de Janeiro de 2026',
    categoria: 'Programa CNH Social',
    destaque: false,
  },
];

export default function Noticias() {
  const noticiaDestaque = noticias.find(n => n.destaque);
  const outrasNoticias = noticias.filter(n => !n.destaque);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Portal de Notícias
              </h1>
              <p className="text-blue-200 text-sm">CNH Social e Trânsito</p>
            </div>
            <Link 
              href="/" 
              className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Verificar Elegibilidade
            </Link>
          </div>
        </div>
        
        {/* Barra de categorias */}
        <div className="bg-blue-950">
          <div className="max-w-6xl mx-auto px-4">
            <nav className="flex gap-6 py-3 overflow-x-auto">
              <span className="text-yellow-400 font-medium text-sm whitespace-nowrap cursor-pointer hover:text-yellow-300">
                Todas
              </span>
              <span className="text-gray-300 text-sm whitespace-nowrap cursor-pointer hover:text-white">
                CNH Social
              </span>
              <span className="text-gray-300 text-sm whitespace-nowrap cursor-pointer hover:text-white">
                Legislação
              </span>
              <span className="text-gray-300 text-sm whitespace-nowrap cursor-pointer hover:text-white">
                Dicas
              </span>
              <span className="text-gray-300 text-sm whitespace-nowrap cursor-pointer hover:text-white">
                Inscrições
              </span>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Notícia Destaque */}
        {noticiaDestaque && (
          <article className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="md:flex">
              <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-green-600 p-8 flex items-center justify-center min-h-[250px]">
                <div className="text-center">
                  <svg className="w-20 h-20 text-white/80 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span className="text-white/60 text-sm">DESTAQUE</span>
                </div>
              </div>
              <div className="md:w-1/2 p-8">
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {noticiaDestaque.categoria}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {noticiaDestaque.titulo}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {noticiaDestaque.resumo}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{noticiaDestaque.data}</span>
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1">
                    Ler mais
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Grid de Notícias */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Últimas Notícias</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outrasNoticias.map((noticia) => (
              <article 
                key={noticia.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="bg-gradient-to-br from-gray-700 to-gray-900 h-40 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div className="p-5">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mb-3">
                    {noticia.categoria}
                  </span>
                  <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {noticia.titulo}
                  </h4>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {noticia.resumo}
                  </p>
                  <span className="text-gray-400 text-xs">{noticia.data}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">
            Quer saber se você pode participar do CNH Social?
          </h3>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Faça uma verificação rápida e descubra se você atende aos requisitos do programa governamental.
          </p>
          <Link 
            href="/"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3 rounded-full transition-colors"
          >
            Verificar Elegibilidade Agora
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-3">Portal de Notícias</h4>
              <p className="text-gray-400 text-sm">
                Informações atualizadas sobre CNH Social, trânsito e habilitação.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Links Úteis</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Verificar Elegibilidade</Link></li>
                <li><Link href="/politica-privacidade" className="text-gray-400 hover:text-white transition-colors">Política de Privacidade</Link></li>
                <li><Link href="/politica-cookies" className="text-gray-400 hover:text-white transition-colors">Política de Cookies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Contato</h4>
              <p className="text-gray-400 text-sm">contato@bestwayshopper.store</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-500 text-xs">© 2026 - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
