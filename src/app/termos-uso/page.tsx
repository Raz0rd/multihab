'use client';

import Link from 'next/link';

export default function TermosUso() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-green-800 to-blue-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-yellow-400 hover:text-yellow-300 text-sm mb-4 inline-block">
            ← Voltar ao início
          </Link>
          <h1 className="text-3xl font-bold text-white">Termos de Uso</h1>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
            <p className="text-gray-600 leading-relaxed">
              Ao acessar e utilizar este site, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Descrição do Serviço</h2>
            <p className="text-gray-600 leading-relaxed">
              Nossa autoescola oferece serviços de orientação, apoio documental e formação teórica e prática para candidatos interessados no Programa de CNH Social. Não somos um órgão governamental e não realizamos a seleção de candidatos para o programa.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
              <p className="text-yellow-800 text-sm font-medium">
                ⚠️ A seleção para o Programa de CNH Social é de responsabilidade exclusiva do Detran e órgãos governamentais competentes.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Elegibilidade</h2>
            <p className="text-gray-600 leading-relaxed">
              Para utilizar nossos serviços, você deve ter pelo menos 18 anos de idade ou a idade mínima exigida para obtenção de CNH em sua categoria, e possuir capacidade legal para celebrar contratos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Responsabilidades do Usuário</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Ao utilizar nossos serviços, você se compromete a:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Fornecer informações verdadeiras, precisas e completas</li>
              <li>Manter seus dados atualizados</li>
              <li>Não utilizar o serviço para fins ilegais ou não autorizados</li>
              <li>Não fornecer documentos falsos ou adulterados</li>
              <li>Respeitar todas as leis e regulamentos aplicáveis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Limitações do Serviço</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Nossos serviços NÃO incluem:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Garantia de aprovação no Programa de CNH Social</li>
              <li>Seleção de candidatos para o programa governamental</li>
              <li>Emissão de CNH ou documentos oficiais</li>
              <li>Influência sobre decisões do Detran ou órgãos públicos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Pagamentos e Reembolsos</h2>
            <p className="text-gray-600 leading-relaxed">
              Os valores cobrados referem-se exclusivamente aos serviços de orientação, apoio documental e formação oferecidos pela autoescola. Políticas de reembolso estão sujeitas aos termos específicos de cada serviço contratado e à legislação vigente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Propriedade Intelectual</h2>
            <p className="text-gray-600 leading-relaxed">
              Todo o conteúdo deste site, incluindo textos, imagens, logotipos e design, é de propriedade da empresa ou licenciado para uso. É proibida a reprodução, distribuição ou uso não autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Limitação de Responsabilidade</h2>
            <p className="text-gray-600 leading-relaxed">
              Não nos responsabilizamos por decisões tomadas por órgãos governamentais, incluindo aprovação ou reprovação no Programa de CNH Social, nem por eventuais alterações nas regras do programa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Modificações dos Termos</h2>
            <p className="text-gray-600 leading-relaxed">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após sua publicação no site. O uso continuado dos serviços após as modificações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Legislação Aplicável</h2>
            <p className="text-gray-600 leading-relaxed">
              Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será submetida ao foro da comarca de Araruama/RJ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contato</h2>
            <p className="text-gray-600 leading-relaxed">
              Para dúvidas sobre estes Termos de Uso, entre em contato através do e-mail: contato@bestwayshopper.store
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
            <Link href="/politica-cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
              Política de Cookies
            </Link>
            <span className="text-gray-600">|</span>
            <span className="text-white text-sm">Termos de Uso</span>
          </div>
          <p className="text-gray-500 text-xs">© 2026 - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
