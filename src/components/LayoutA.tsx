import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LayoutA() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="bg-white">
        {/* Hero Section */}
        <section className="bg-blue py-12 text-white md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-4 text-2xl font-bold leading-tight md:mb-6 md:text-4xl lg:text-5xl">
              CNH Social 2026: Conquiste sua liberdade e independência
            </h1>
            <p className="mx-auto mb-6 max-w-4xl text-lg md:mb-8 md:text-xl lg:text-2xl">
              Mais de 150.000 vagas para CNH gratuita em todo o Brasil
            </p>
            <p className="mx-auto mb-8 max-w-3xl text-base md:mb-10 md:text-lg">
              O maior programa de CNH Social do Brasil já está com inscrições abertas e beneficiará milhões de brasileiros garantindo mobilidade e oportunidades em 2026.
            </p>
            <Link
              href="/login"
              className="text-blue inline-block rounded-full bg-white px-6 py-3 text-base font-semibold transition-colors hover:bg-gray-100 md:px-8 md:py-4 md:text-lg"
            >
              Acessar inscrições agora
            </Link>
          </div>
        </section>

        {/* Banner 1 */}
        <div className="w-full">
          <Link href="/login">
            <Image
              src="/banner-promocional-1.png"
              alt="CNH Social 2026 - Conquiste sua liberdade e independência"
              width={1920}
              height={400}
              className="h-auto w-full"
              priority
            />
          </Link>
        </div>

        {/* About Section */}
        <section className="bg-gray-50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mb-6 text-2xl font-bold text-gray-800 md:mb-8 md:text-3xl">
                O que é o CNH Social?
              </h2>
              <p className="mb-8 text-base text-gray-600 md:mb-8 md:text-lg">
                CNH Social é uma iniciativa dos governos estaduais, com apoio da Associação Nacional de Detrans (AND), que oferece a Carteira Nacional de Habilitação sem custo para pessoas de baixa renda. O programa visa promover a inclusão social e ampliar as oportunidades de trabalho e mobilidade urbana para milhões de brasileiros.
              </p>
              
              <div className="mt-8 grid gap-6 md:mt-12 md:grid-cols-3 md:gap-8">
                <div className="rounded-lg bg-white p-4 shadow-md md:p-6">
                  <div className="text-blue mb-3 text-3xl font-bold md:mb-4 md:text-4xl">150.000</div>
                  <h3 className="mb-2 text-lg font-semibold md:text-xl">Vagas CNH gratuita</h3>
                  <p className="text-sm text-gray-600 md:text-base">Para brasileiros de baixa renda em todo o país</p>
                </div>
                
                <div className="rounded-lg bg-white p-4 shadow-md md:p-6">
                  <div className="text-blue mb-3 text-3xl font-bold md:mb-4 md:text-4xl">27</div>
                  <h3 className="mb-2 text-lg font-semibold md:text-xl">Estados</h3>
                  <p className="text-sm text-gray-600 md:text-base">Cobertura nacional completa</p>
                </div>
                
                <div className="rounded-lg bg-white p-4 shadow-md md:p-6">
                  <div className="text-blue mb-3 text-3xl font-bold md:mb-4 md:text-4xl">5M</div>
                  <h3 className="mb-2 text-lg font-semibold md:text-xl">Brasileiros beneficiados</h3>
                  <p className="text-sm text-gray-600 md:text-base">Impacto social direto</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Banner 2 */}
        <div className="w-full">
          <Image
            src="/banner-promocional-2.png"
            alt="CNH Social 2026 - Você no caminho da sua habilitação"
            width={1920}
            height={400}
            className="h-auto w-full"
            priority
          />
        </div>

        {/* CTA Section */}
        <section className="bg-blue py-12 text-white md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">
              Não perca essa oportunidade!
            </h2>
            <p className="mx-auto mb-6 max-w-3xl text-sm md:mb-8 md:text-lg">
              O CNH Social representa uma das maiores iniciativas de inclusão social e mobilidade urbana do Brasil, impactando diretamente a qualidade de vida de milhões de brasileiros.
            </p>
            <Link
              href="/login"
              className="text-blue inline-block rounded-full bg-white px-8 py-3 text-lg font-semibold transition-colors hover:bg-gray-100 md:px-10 md:py-4 md:text-xl"
            >
              Começar Inscrição
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
