'use client';

import { ThemeSwitcher } from '@/components/shared/theme-switcher';

export function Header() {
    return (
        <header className="flex items-center justify-between p-4 border-b">
            <h1 className="text-lg font-semibold">Meta Chat</h1>
            <ThemeSwitcher />
        </header>
    );
}
