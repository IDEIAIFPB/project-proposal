// app/page.tsx
'use client';

import FormCompany from "../_components/FormCompany";

export default function Home() {
  const handleSuccess = () => {
    console.log('Formulário enviado com sucesso pela página!');
    // Aqui você pode, por exemplo, redirecionar o usuário
    // router.push('/dashboard');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl flex overflow-hidden">
        {/* Coluna da Esquerda (Imagem/Promo) */}
        <div
          className="w-1/2 hidden md:flex flex-col justify-center items-start p-12 text-white"
          style={{
            // Você pode usar uma imagem de fundo real aqui
            backgroundImage: "url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1120&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="bg-black bg-opacity-40 p-8 rounded-lg">
            <h1 className="text-3xl font-bold mb-4">
              Cadastrar empresa
            </h1>
          </div>
        </div>

        {/* Coluna da Direita (Formulário) */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center">
          <FormCompany onFormSubmitSuccess={handleSuccess} />
        </div>
      </div>
    </main>
  );
}