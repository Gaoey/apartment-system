'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const switchLanguage = (newLocale: string) => {
    // Split pathname into segments
    const segments = pathname.split('/').filter(Boolean);
    
    // Remove the first segment if it's a locale
    if (segments.length > 0 && (segments[0] === 'th' || segments[0] === 'en')) {
      segments.shift();
    }
    
    // Build new path with new locale
    const pathWithoutLocale = segments.length > 0 ? '/' + segments.join('/') : '';
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    console.log('Language switch debug:', { 
      originalPathname: pathname, 
      segments,
      currentLocale: locale, 
      newLocale, 
      pathWithoutLocale, 
      finalNewPath: newPath 
    });
    
    // Use router.push for navigation
    router.push(newPath);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === locale);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
        aria-label={t('language')}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => switchLanguage(language.code)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors ${
                  locale === language.code 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-700'
                }`}
              >
                <span>{language.flag}</span>
                <span>{language.name}</span>
                {locale === language.code && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}