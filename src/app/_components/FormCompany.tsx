// app/components/FormCompany.tsx
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Interface para os dados do formulário da empresa
interface CompanyFormData {
    companyName: string;
    cnpj: string;
    email: string;
    phone: string;
    address: string;
    description: string;
}

interface CompanyFormProps {
    onFormSubmitSuccess?: (data: CompanyFormData) => void; // Callback opcional para sucesso
    onFormSubmitError?: (error: any) => void; // Callback opcional para erro
}

export default function FormCompany({ onFormSubmitSuccess, onFormSubmitError }: CompanyFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<CompanyFormData>({
        defaultValues: {
            companyName: '',
            cnpj: '',
            email: '',
            phone: '',
            address: '',
            description: '',
        },
    });

    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const router = useRouter();

    const onSubmit: SubmitHandler<CompanyFormData> = async (data) => {
        setSubmitMessage(null);
        try {
            console.log('Dados do formulário da empresa (enviando com Axios):', data);

            // Endpoint da API para registrar a empresa
            const response = await axios.post('/api/company', data);
            console.log('Resposta da API (Axios):', response.data);
            if (response.status < 200 || response.status >= 300) {
                throw new Error(response.data.message || 'Falha ao enviar formulário');
            }

            setSubmitMessage('Empresa cadastrada com sucesso!');

            router.push('./');

            reset();
            if (onFormSubmitSuccess) {
                onFormSubmitSuccess(data);
            }
        } catch (error) {
            console.error('Erro ao enviar formulário da empresa (Axios):', error);
            let errorMessage = 'Erro ao cadastrar empresa. Tente novamente.';

            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<any>;
                if (axiosError.response) {
                    errorMessage = `Erro do servidor: ${axiosError.response.status} - ${axiosError.response.data?.message || axiosError.message}`;
                } else if (axiosError.request) {
                    errorMessage = 'Nenhuma resposta do servidor. Verifique sua conexão.';
                } else {
                    errorMessage = `Erro na requisição: ${axiosError.message}`;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            setSubmitMessage(errorMessage);
            if (onFormSubmitError) {
                onFormSubmitError(error);
            }
        }
    };

    // Funções auxiliares de estilo (mantidas do seu original)
    const getInputClasses = (fieldName: keyof CompanyFormData) => {
        let baseClasses = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
        if (errors[fieldName]) {
            baseClasses += " border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";
        }
        return baseClasses;
    };

    const labelClasses = "block mb-2 text-sm font-medium text-gray-900 dark:text-white";
    const errorTextClasses = "mt-1 text-xs text-red-600 dark:text-red-400";

    return (
        <div className="w-full max-w-3xl p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                Cadastro de Empresa
            </h1>

            {submitMessage && (
                <div className={`mb-6 p-4 rounded-md text-sm ${submitMessage.includes('sucesso') ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'}`}>
                    {submitMessage}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="grid gap-6 mb-6 md:grid-cols-2">
                    {/* Nome da Empresa */}
                    <div>
                        <label htmlFor="companyName" className={labelClasses}>
                            Nome da Empresa <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="companyName"
                            {...register('companyName', {
                                required: 'Nome da empresa é obrigatório.',
                            })}
                            className={getInputClasses('companyName')}
                            aria-invalid={errors.companyName ? "true" : "false"}
                        />
                        {errors.companyName && <p className={errorTextClasses} role="alert">{errors.companyName.message}</p>}
                    </div>

                    {/* CNPJ */}
                    <div>
                        <label htmlFor="cnpj" className={labelClasses}>
                            CNPJ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="cnpj"
                            {...register('cnpj', {
                                required: 'CNPJ é obrigatório.',
                                pattern: {
                                    value: /^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/,
                                    message: 'CNPJ inválido. Use XX.XXX.XXX/XXXX-XX ou 14 dígitos.',
                                },
                            })}
                            placeholder="00.000.000/0000-00"
                            className={getInputClasses('cnpj')}
                            aria-invalid={errors.cnpj ? "true" : "false"}
                        />
                        {errors.cnpj && <p className={errorTextClasses} role="alert">{errors.cnpj.message}</p>}
                    </div>
                </div>

                <div className="grid gap-6 mb-6 md:grid-cols-2">
                    {/* E-mail */}
                    <div>
                        <label htmlFor="email" className={labelClasses}>
                            E-mail de Contato <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            {...register('email', {
                                required: 'E-mail é obrigatório.',
                                pattern: {
                                    value: /\S+@\S+\.\S+/,
                                    message: 'E-mail inválido.',
                                },
                            })}
                            placeholder="contato@empresa.com"
                            className={getInputClasses('email')}
                            aria-invalid={errors.email ? "true" : "false"}
                        />
                        {errors.email && <p className={errorTextClasses} role="alert">{errors.email.message}</p>}
                    </div>

                    {/* Telefone */}
                    <div>
                        <label htmlFor="phone" className={labelClasses}>
                            Telefone
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            {...register('phone', {
                                // pattern: {
                                //   value: /^\(\d{2}\) \d{4,5}-\d{4}$/,
                                //   message: 'Telefone inválido. Use (XX) XXXXX-XXXX.'
                                // }
                            })}
                            placeholder="(00) 00000-0000"
                            className={getInputClasses('phone')}
                            aria-invalid={errors.phone ? "true" : "false"}
                        />
                        {errors.phone && <p className={errorTextClasses} role="alert">{errors.phone.message}</p>}
                    </div>
                </div>

                {/* Endereço Completo */}
                <div className="mb-6">
                    <label htmlFor="address" className={labelClasses}>
                        Endereço (Rua, Número, Complemento)
                    </label>
                    <input
                        type="text"
                        id="address"
                        {...register('address')}
                        className={getInputClasses('address')}
                        aria-invalid={errors.address ? "true" : "false"}
                    />
                    {errors.address && <p className={errorTextClasses} role="alert">{errors.address.message}</p>}
                </div>

                {/* Descrição */}
                <div className="mb-6">
                    <label htmlFor="description" className={labelClasses}>
                        Breve Descrição da Empresa
                    </label>
                    <textarea
                        id="description"
                        rows={4}
                        {...register('description', {
                            maxLength: {
                                value: 500,
                                message: 'Descrição não pode exceder 500 caracteres.'
                            }
                        })}
                        className={getInputClasses('description')}
                        placeholder="Fale um pouco sobre sua empresa..."
                        aria-invalid={errors.description ? "true" : "false"}
                    ></textarea>
                    {errors.description && <p className={errorTextClasses} role="alert">{errors.description.message}</p>}
                </div>

                {/* Container para os botões de ação */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    {/* Botão Cancelar agora é um Link estilizado */}
                    <Link
                        href="/" // "./" é o mesmo que "/" para a raiz
                        className="w-full sm:w-auto flex-1 text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:focus:ring-gray-600"
                    >
                        Cancelar
                    </Link>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto flex-1 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Enviando...' : 'Cadastrar Empresa'}
                    </button>
                </div>
            </form>
        </div>
    );
}