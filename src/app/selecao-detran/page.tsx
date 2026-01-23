'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GovLayout from '@/components/GovLayout';

interface DetranOption {
  estado: string;
  sigla: string;
  vagas: number;
}

const detransDisponiveis: DetranOption[] = [
  { estado: 'Acre', sigla: 'AC', vagas: 46 },
  { estado: 'Alagoas', sigla: 'AL', vagas: 57 },
  { estado: 'Amapá', sigla: 'AP', vagas: 83 },
  { estado: 'Amazonas', sigla: 'AM', vagas: 71 },
  { estado: 'Bahia', sigla: 'BA', vagas: 88 },
  { estado: 'Ceará', sigla: 'CE', vagas: 73 },
  { estado: 'Distrito Federal', sigla: 'DF', vagas: 98 },
  { estado: 'Espírito Santo', sigla: 'ES', vagas: 72 },
  { estado: 'Goiás', sigla: 'GO', vagas: 73 },
  { estado: 'Maranhão', sigla: 'MA', vagas: 65 },
  { estado: 'Mato Grosso', sigla: 'MT', vagas: 54 },
  { estado: 'Mato Grosso do Sul', sigla: 'MS', vagas: 61 },
  { estado: 'Minas Gerais', sigla: 'MG', vagas: 92 },
  { estado: 'Pará', sigla: 'PA', vagas: 77 },
  { estado: 'Paraíba', sigla: 'PB', vagas: 68 },
  { estado: 'Paraná', sigla: 'PR', vagas: 85 },
  { estado: 'Pernambuco', sigla: 'PE', vagas: 79 },
  { estado: 'Piauí', sigla: 'PI', vagas: 52 },
  { estado: 'Rio de Janeiro', sigla: 'RJ', vagas: 94 },
  { estado: 'Rio Grande do Norte', sigla: 'RN', vagas: 63 },
  { estado: 'Rio Grande do Sul', sigla: 'RS', vagas: 87 },
  { estado: 'Rondônia', sigla: 'RO', vagas: 48 },
  { estado: 'Roraima', sigla: 'RR', vagas: 41 },
  { estado: 'Santa Catarina', sigla: 'SC', vagas: 76 },
  { estado: 'São Paulo', sigla: 'SP', vagas: 99 },
  { estado: 'Sergipe', sigla: 'SE', vagas: 55 },
  { estado: 'Tocantins', sigla: 'TO', vagas: 47 },
];

export default function SelecaoDetranPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [userCpf, setUserCpf] = useState('');
  const [userNascimento, setUserNascimento] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [userUf, setUserUf] = useState('');

  const formatCpf = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  useEffect(() => {
    const userData = localStorage.getItem('usuarioLogado');
    if (userData) {
      const user = JSON.parse(userData);
      const primeiroNome = user.nome?.split(' ')[0] || '';
      setUserName(primeiroNome.toUpperCase());
      setUserFullName(user.nome?.toUpperCase() || '');
      setUserCpf(user.cpf || '');
      setUserNascimento(user.dataNascimento || '');
    }

    // Tentar pegar UF do usuário do localStorage
    const userBasicData = localStorage.getItem('userBasicData');
    if (userBasicData) {
      const data = JSON.parse(userBasicData);
      if (data.uf) {
        setUserUf(data.uf);
      }
    }
  }, []);

  const handleSelectDetran = (detran: DetranOption) => {
    setIsLoading(detran.sigla);
    
    // Salvar seleção no localStorage
    const userBasicData = JSON.parse(localStorage.getItem('userBasicData') || '{}');
    localStorage.setItem('userBasicData', JSON.stringify({
      ...userBasicData,
      detranSelecionado: detran.estado,
      detranSigla: detran.sigla
    }));

    setTimeout(() => {
      router.push('/chat');
    }, 800);
  };

  const handleBack = () => {
    router.push('/taxa');
  };

  // Ordenar para mostrar o estado do usuário primeiro (se disponível)
  const sortedDetrans = [...detransDisponiveis].sort((a, b) => {
    if (a.sigla === userUf) return -1;
    if (b.sigla === userUf) return 1;
    return a.estado.localeCompare(b.estado);
  });

  return (
    <GovLayout userName={userName} breadcrumbItems={['Cadastro', 'Seleção DETRAN']}>
      <div className="w-full max-w-2xl mx-auto">
        {/* Dados do Usuário */}
        <div className="mb-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Nome Completo</p>
            <div className="border border-gray-300 rounded-md p-3 bg-white">
              <p className="text-gray-800">{userFullName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">CPF</p>
              <div className="border border-gray-300 rounded-md p-3 bg-white">
                <p className="text-gray-800">{formatCpf(userCpf)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nascimento</p>
              <div className="border border-gray-300 rounded-md p-3 bg-white">
                <p className="text-gray-800">{userNascimento}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Parabéns */}
        <div className="bg-green-50 rounded-lg p-5 mb-6">
          <div className="text-center">
            <h4 className="text-base font-semibold text-green-800 mb-3">Parabéns! Cadastro Aprovado com Sucesso</h4>
            <p className="text-sm text-green-700 leading-relaxed">
              Prezado(a) <strong>{userFullName}</strong>, CPF <strong>{formatCpf(userCpf)}</strong>, informamos que sua solicitação foi analisada e <strong>APROVADA</strong> pelo Sistema Nacional de Habilitação.
            </p>
            <p className="text-sm text-green-700 leading-relaxed mt-2">
              O(A) senhor(a) está apto(a) a obter a Carteira Nacional de Habilitação (CNH) de forma <strong>gratuita</strong>, sem a necessidade de frequentar autoescola, conforme as diretrizes do Programa CNH do Brasil.
            </p>
            <p className="text-sm text-green-700 leading-relaxed mt-2">
              Para dar continuidade ao processo, selecione abaixo o DETRAN correspondente ao seu estado de residência.
            </p>
          </div>
        </div>

        {/* Título da seleção */}
        <h4 className="text-center text-[#1351B4] font-semibold text-lg mb-4">Selecione o DETRAN do seu Estado</h4>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {sortedDetrans.map((detran) => (
            <div 
              key={detran.sigla}
              className={`flex items-center justify-between p-3 bg-white rounded-md border shadow-sm hover:shadow-md hover:border-[#1351B4] transition-all ${
                detran.sigla === userUf ? 'border-[#1351B4] bg-[#1351B4]/5' : 'border-gray-300'
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium text-gray-800">
                  Detran {detran.estado}
                  {detran.sigla === userUf && (
                    <span className="ml-2 text-xs text-[#1351B4] font-semibold">(Seu estado)</span>
                  )}
                </span>
                <span className="text-sm text-[#1351B4] font-semibold bg-[#1351B4]/10 px-2 py-0.5 rounded-sm w-fit">
                  {detran.vagas} vagas
                </span>
              </div>
              <button 
                onClick={() => handleSelectDetran(detran)}
                disabled={isLoading !== null}
                className="bg-[#1351B4] hover:bg-[#0D3C8C] text-white px-5 py-2 rounded-md text-sm font-medium transition-all shadow-sm hover:shadow-md whitespace-nowrap disabled:opacity-70 flex items-center gap-2"
              >
                {isLoading === detran.sigla ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Aguarde...</span>
                  </>
                ) : (
                  'Iniciar Processo'
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <button 
            type="button" 
            onClick={handleBack}
            className="border-2 border-[#1351B4] text-[#1351B4] font-semibold py-3 px-8 rounded-full text-base transition-all hover:bg-[#1351B4]/5 min-w-[140px]"
          >
            Voltar
          </button>
        </div>
      </div>
    </GovLayout>
  );
}
