'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Home, Building, FileText, Settings } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();

  const navItems = [
    { href: `/${locale}`, icon: Home, label: t('apartments'), isHome: true },
    { href: `/${locale}/apartments`, icon: Building, label: t('apartments') },
    { href: `/${locale}/bills`, icon: FileText, label: t('bills') },
    { href: `/${locale}/settings`, icon: Settings, label: t('settings') },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href={`/${locale}`} className="text-xl font-bold text-gray-900">
              Bill Renting System
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              {navItems.slice(1).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}