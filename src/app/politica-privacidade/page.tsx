'use client';

import Link from 'next/link';

export default function PoliticaPrivacidade() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-green-800 to-blue-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-yellow-400 hover:text-yellow-300 text-sm mb-4 inline-block">
            ← Voltar ao início
          </Link>
          <h1 className="text-3xl font-bold text-white">Política de Privacidade</h1>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Informações Gerais</h2>
            <p className="text-gray-600 leading-relaxed">
              Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações pessoais quando você utiliza nosso site e serviços. Ao acessar nosso site, você concorda com a coleta e uso de informações de acordo com esta política.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Coleta de Dados</h2>
            <p className="text-gray-600 leading-relaxed">
              Coletamos informações que você nos fornece diretamente, incluindo nome, CPF, data de nascimento, endereço, telefone e e-mail. Também coletamos automaticamente informações sobre seu dispositivo e navegação através de cookies e tecnologias similares.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Uso das Informações</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Utilizamos suas informações para:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Processar sua solicitação de serviços</li>
              <li>Entrar em contato sobre sua inscrição</li>
              <li>Melhorar nossos serviços e experiência do usuário</li>
              <li>Enviar comunicações relevantes sobre o serviço</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Compartilhamento de Dados</h2>
            <p className="text-gray-600 leading-relaxed">
              Não vendemos suas informações pessoais. Podemos compartilhar dados com parceiros necessários para a prestação do serviço, sempre respeitando a legislação vigente, incluindo a Lei Geral de Proteção de Dados (LGPD).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Segurança</h2>
            <p className="text-gray-600 leading-relaxed">
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Seus Direitos</h2>
            <p className="text-gray-600 leading-relaxed mb-3">De acordo com a LGPD, você tem direito a:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Confirmar a existência de tratamento de dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Revogar consentimento a qualquer momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contato</h2>
            <p className="text-gray-600 leading-relaxed">
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato através dos canais disponíveis em nosso site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Atualizações</h2>
            <p className="text-gray-600 leading-relaxed">
              Esta política pode ser atualizada periodicamente. Recomendamos que você revise esta página regularmente para se manter informado sobre eventuais alterações.
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
            <span className="text-white text-sm">Política de Privacidade</span>
            <span className="text-gray-600">|</span>
            <Link href="/politica-cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
              Política de Cookies
            </Link>
          </div>
          <p className="text-gray-500 text-xs">© 2026 - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
