'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckCircle, Download, MessageCircle } from 'lucide-react';

export default function SucessoBPage() {
  const [userName, setUserName] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [renach, setRenach] = useState('');
  const [categoria, setCategoria] = useState('B');
  const [detranSelecionado, setDetranSelecionado] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('usuarioLogado');
    if (userData) {
      const user = JSON.parse(userData);
      const primeiroNome = user.nome?.split(' ')[0] || '';
      setUserName(primeiroNome.toUpperCase());
      setUserFullName(user.nome || '');
    }

    const userBasicData = localStorage.getItem('userBasicData');
    if (userBasicData) {
      const data = JSON.parse(userBasicData);
      setDetranSelecionado(data.detranSelecionado || 'Acre');
      setCategoria(data.categoria || 'B');
    }

    // Gerar RENACH aleatório se não existir
    const storedRenach = localStorage.getItem('renach');
    if (storedRenach) {
      setRenach(storedRenach);
    } else {
      const newRenach = Math.floor(Math.random() * 90000000000 + 10000000000).toString();
      setRenach(newRenach);
      localStorage.setItem('renach', newRenach);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white px-6 py-3 flex justify-between items-center border-b">
        <div className="flex items-center">
          <Image src="/logo645.png" alt="Logo gov.br" width={70} height={24} className="mr-8" />
        </div>
        <div className="flex items-center gap-6">
          <button className="bg-[#1351B4] text-white rounded-full px-4 py-1.5 flex items-center text-sm">
            <i className="fas fa-user mr-2"></i>
            <span>{userName}</span>
          </button>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-gray-100 px-6 py-3 flex items-center">
        <div className="relative mr-3">
          <Image src="/gov-avatar.png" alt="Atendimento" width={28} height={28} className="rounded-full" />
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
        </div>
        <span className="text-gray-500 text-sm font-light">Atendimento Gov.br</span>
      </nav>

      {/* Content */}
      <main className="flex-1 bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-20 h-20 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Cadastro Ativado com Sucesso!</h1>
            <p className="text-gray-600 mb-6">
              Prezado(a) {userFullName}, seu cadastro no Programa CNH do Brasil foi ativado com sucesso.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-xs text-gray-500">Nº RENACH</p>
                  <p className="font-bold text-[#1351B4] text-lg">{renach}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">CATEGORIA</p>
                  <p className="font-bold text-gray-800 text-lg">{categoria}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">STATUS</p>
                  <p className="font-bold text-green-600 text-lg">ATIVO</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">DETRAN</p>
                  <p className="font-bold text-gray-800 text-lg">{detranSelecionado}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
              <h3 className="font-bold text-[#1351B4] mb-2">Próximos Passos:</h3>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Baixe o aplicativo oficial do Programa CNH do Brasil</li>
                <li>Faça login com seu CPF</li>
                <li>Inicie as aulas teóricas imediatamente</li>
                <li>Após conclusão, agende suas aulas práticas</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-[#1351B4] text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#0D3A8C] transition-colors">
                <Download className="w-5 h-5" />
                Baixar Aplicativo
              </button>
              <button className="bg-green-500 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors">
                <MessageCircle className="w-5 h-5" />
                Suporte WhatsApp
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700">
            <p className="font-bold text-yellow-800 mb-1">Importante:</p>
            <p>
              Guarde seu número de RENACH ({renach}). Ele será necessário para acessar o aplicativo 
              e acompanhar seu processo de habilitação.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
