// app/api/register-company/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises'; // Usar 'fs/promises' para async/await
import path from 'path';

// Define o tipo para os dados da empresa, igual ao do frontend
interface CompanyData {
  companyName: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  description: string;
}

// Caminho para o nosso arquivo JSON de "banco de dados"
// Colocaremos na raiz do projeto, numa pasta 'data'
// Certifique-se de que o Next.js tenha permissão para escrever aqui durante o desenvolvimento.
const dataFilePath = path.join(process.cwd(), 'data', 'companies.json');

// Função para garantir que o diretório 'data' exista
async function ensureDataDirectoryExists() {
  try {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  } catch (error) {
    // Se o erro for que o diretório já existe, ignoramos.
    if ((error as NodeJS.ErrnoException)?.code !== 'EEXIST') {
      console.error("Erro ao criar diretório 'data':", error);
      throw error; // Relança outros erros
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDataDirectoryExists(); // Garante que o diretório 'data' exista

    const newCompanyData: CompanyData = await request.json();

    // Validação básica no backend (opcional, mas recomendada)
    if (!newCompanyData.companyName || !newCompanyData.cnpj || !newCompanyData.email) {
      return NextResponse.json(
        { message: 'Campos obrigatórios (Nome da Empresa, CNPJ, Email) não fornecidos.' },
        { status: 400 }
      );
    }

    let companies: CompanyData[] = [];

    try {
      // Tenta ler o arquivo existente
      const fileContents = await fs.readFile(dataFilePath, 'utf-8');
      if (fileContents) {
        companies = JSON.parse(fileContents);
      }
    } catch (error) {
      // Se o arquivo não existir (ENOENT) ou estiver vazio, iniciamos com um array vazio.
      // Ignoramos o erro se for 'ENOENT', pois é esperado na primeira vez.
      if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
        console.error('Erro ao ler o arquivo companies.json:', error);
        // Não relançamos aqui, pois podemos continuar com um array vazio.
      }
    }

    console.log("newCompanyData: ", newCompanyData)

    // Adiciona a nova empresa à lista
    companies.push(newCompanyData);

    // Escreve a lista atualizada de volta no arquivo
    await fs.writeFile(dataFilePath, JSON.stringify(companies, null, 2), 'utf-8');

    return NextResponse.json(
      { message: 'Empresa cadastrada com sucesso!', data: newCompanyData },
      { status: 201 } // 201 Created
    );

  } catch (error) {
    console.error('Erro no servidor ao processar o cadastro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return NextResponse.json(
      { message: 'Erro ao cadastrar empresa.', error: errorMessage },
      { status: 500 }
    );
  }
}

// Opcional: Adicionar um GET para visualizar os dados (para debugging)
export async function GET() {
  try {
    await ensureDataDirectoryExists();
    const fileContents = await fs.readFile(dataFilePath, 'utf-8');
    const companies = JSON.parse(fileContents);
    return NextResponse.json(companies, { status: 200 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      return NextResponse.json([], { status: 200 }); // Retorna array vazio se o arquivo não existir
    }
    console.error('Erro ao ler empresas:', error);
    return NextResponse.json({ message: 'Erro ao buscar empresas.' }, { status: 500 });
  }
}