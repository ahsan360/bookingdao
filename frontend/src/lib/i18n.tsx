'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import en, { type TranslationKeys } from '@/locales/en';
import bn from '@/locales/bn';

// ─── Types ──────────────────────────────────────────────────

export type Locale = 'en' | 'bn';

interface I18nContextType {
    locale: Locale;
    t: TranslationKeys;
    setLocale: (locale: Locale) => void;
}

// ─── Translations map ───────────────────────────────────────

const translations: Record<Locale, TranslationKeys> = { en, bn };

// ─── Context ────────────────────────────────────────────────

const I18nContext = createContext<I18nContextType>({
    locale: 'en',
    t: en,
    setLocale: () => {},
});

// ─── Provider ───────────────────────────────────────────────

export function I18nProvider({
    children,
    defaultLocale,
}: {
    children: ReactNode;
    defaultLocale?: Locale;
}) {
    const [locale, setLocaleState] = useState<Locale>(() => {
        // Priority: prop > localStorage > 'en'
        if (defaultLocale) return defaultLocale;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('locale') as Locale;
            if (stored && translations[stored]) return stored;
        }
        return 'en';
    });

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        if (typeof window !== 'undefined') {
            localStorage.setItem('locale', newLocale);
        }
    }, []);

    const value: I18nContextType = {
        locale,
        t: translations[locale],
        setLocale,
    };

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────

export function useTranslation() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within I18nProvider');
    }
    return context;
}

// ─── Language switcher component ────────────────────────────

export function LanguageSwitcher({ className }: { className?: string }) {
    const { locale, setLocale } = useTranslation();

    return (
        <button
            onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border border-slate-200 hover:bg-slate-50 ${className || ''}`}
            title={locale === 'en' ? 'বাংলায় পরিবর্তন করুন' : 'Switch to English'}
        >
            <span className="text-base">{locale === 'en' ? '🇧🇩' : '🇺🇸'}</span>
            <span className="text-slate-600">{locale === 'en' ? 'বাংলা' : 'EN'}</span>
        </button>
    );
}
