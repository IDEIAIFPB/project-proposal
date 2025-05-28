'use client';

import { ThemeSwitcher } from '@/components/shared/theme-switcher';
import { Button } from '@/components/ui/button';
import { LayoutGrid, ListFilter, LogOut, MessageSquareText, Settings, Users } from 'lucide-react';

export function Sidebar() {
    // O ícone "CO" da imagem pode ser um logo ou um ícone genérico. Usando <Users /> como placeholder.
    return (
        <div className="w-20 bg-gray-100 dark:bg-zinc-900 border-r dark:border-zinc-800 flex flex-col items-center py-5 space-y-6 h-screen">
            {/* Ícone superior (CO) */}
            <Button variant="ghost" size="icon" className="text-black-600 dark:text-black-400 mb-6">
                <Users className="h-8 w-8" /> {/* Ajuste o tamanho conforme necessário */}
            </Button>

            <nav className="flex flex-col items-center space-y-4 flex-grow">
                <Button
                    variant="ghost"
                    size="icon"
                    title="Dashboard"
                    className="text-gray-500 dark:text-gray-400 hover:text-black-600 dark:hover:text-black-400 h-10 w-10"
                >
                    <LayoutGrid className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    title="Filtros"
                    className="text-gray-500 dark:text-gray-400 hover:text-black-600 dark:hover:text-black-400 h-10 w-10"
                >
                    <ListFilter className="h-5 w-5" />
                </Button>
                {/* Estado ativo para o ícone de chat */}
                <Button
                    variant="ghost"
                    size="icon"
                    title="Chats"
                    className="text-black-600 dark:text-black-400 bg-black-100 dark:bg-black-500 dark:bg-opacity-20 h-10 w-10"
                >
                    <MessageSquareText className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    title="Configurações"
                    className="text-gray-500 dark:text-gray-400 hover:text-black-600 dark:hover:text-black-400 h-10 w-10"
                >
                    <Settings className="h-5 w-5" />
                </Button>
            </nav>

            <div className="mt-auto flex flex-col items-center space-y-4">
                <ThemeSwitcher />
                <Button
                    variant="ghost"
                    size="icon"
                    title="Sair"
                    className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 h-10 w-10"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
