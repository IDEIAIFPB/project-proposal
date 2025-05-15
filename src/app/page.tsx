'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompanyFormData } from "./_types/company";
import axios, { AxiosError } from 'axios';

// import { CompanyFormData } from '@/_types/company'; // Ajuste o caminho se sua interface estiver em outro local

export default function CompaniesListPage() {
  const [companies, setCompanies] = useState<CompanyFormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/company');

        if (response.status != 200) {
          const errorData = response.data.error;
          throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }
        const data: CompanyFormData[] = response.data;
        setCompanies(data);
      } catch (err: any) {
        console.error("Falha ao buscar empresas:", err);
        setError(err.message || "Não foi possível carregar os dados das empresas.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Empresas Cadastradas
          </h1>
          <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm">
            Cadastrar Nova Empresa
          </Link>
        </div>

        {isLoading && (
          <div className="text-center text-gray-700 dark:text-gray-300 py-10">
            <p className="text-xl">Carregando empresas...</p>
            {/* Você pode adicionar um spinner aqui */}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Erro!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {!isLoading && !error && companies.length === 0 && (
          <div className="text-center text-gray-700 dark:text-gray-300 py-10">
            <p className="text-xl">Nenhuma empresa cadastrada ainda.</p>
          </div>
        )}

        {!isLoading && !error && companies.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nome da Empresa
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    E-mail
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Telefone
                  </th>
                  {/* <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Detalhes</span>
                  </th> */}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {companies.map((company, index) => (
                  <tr key={company.cnpj || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{company.companyName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{company.cnpj}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{company.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {company.phone}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href="#" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">
                        Ver Detalhes
                      </a>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}