'use client';

import Link from 'next/link';

export default function PoliticaCookies() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-green-800 to-blue-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-yellow-400 hover:text-yellow-300 text-sm mb-4 inline-block">
            ← Voltar ao início
          </Link>
          <h1 className="text-3xl font-bold text-white">Política de Cookies</h1>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. O que são Cookies?</h2>
            <p className="text-gray-600 leading-relaxed">
              Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você visita nosso site. Eles nos ajudam a melhorar sua experiência de navegação e fornecer funcionalidades personalizadas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Tipos de Cookies que Utilizamos</h2>
            
            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Cookies Essenciais</h3>
                <p className="text-gray-600 text-sm">
                  Necessários para o funcionamento básico do site. Sem eles, algumas funcionalidades podem não funcionar corretamente.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Cookies de Desempenho</h3>
                <p className="text-gray-600 text-sm">
                  Coletam informações sobre como você usa nosso site, ajudando-nos a melhorar seu desempenho e usabilidade.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Cookies de Marketing</h3>
                <p className="text-gray-600 text-sm">
                  Utilizados para rastrear visitantes em sites e exibir anúncios relevantes. Incluem cookies de plataformas como Google Ads.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Cookies de Funcionalidade</h3>
                <p className="text-gray-600 text-sm">
                  Permitem que o site lembre suas preferências e escolhas para proporcionar uma experiência mais personalizada.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cookies de Terceiros</h2>
            <p className="text-gray-600 leading-relaxed">
              Utilizamos serviços de terceiros que podem definir cookies em seu dispositivo, incluindo Google Analytics e Google Ads para análise de tráfego e publicidade. Estes serviços têm suas próprias políticas de privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Gerenciamento de Cookies</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Você pode controlar e gerenciar cookies através das configurações do seu navegador. A maioria dos navegadores permite:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Ver quais cookies estão armazenados e excluí-los individualmente</li>
              <li>Bloquear cookies de terceiros</li>
              <li>Bloquear cookies de sites específicos</li>
              <li>Bloquear todos os cookies</li>
              <li>Excluir todos os cookies ao fechar o navegador</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              Note que desabilitar cookies pode afetar a funcionalidade do site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Consentimento</h2>
            <p className="text-gray-600 leading-relaxed">
              Ao continuar navegando em nosso site, você concorda com o uso de cookies conforme descrito nesta política. Você pode retirar seu consentimento a qualquer momento alterando as configurações do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Atualizações</h2>
            <p className="text-gray-600 leading-relaxed">
              Esta política de cookies pode ser atualizada periodicamente para refletir mudanças em nossas práticas ou por razões operacionais, legais ou regulatórias.
            </p>
          </section>

          <p className="text-gray-500 text-sm pt-6 border-t">
            Última atualização: Janeiro de 2026
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="/politica-privacidade" className="text-gray-400 hover:text-white text-sm transition-colors">
              Política de Privacidade
            </Link>
            <span className="text-gray-600">|</span>
            <span className="text-white text-sm">Política de Cookies</span>
          </div>
          <p className="text-gray-500 text-xs">© 2026 - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
