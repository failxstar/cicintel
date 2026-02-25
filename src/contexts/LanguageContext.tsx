import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'ta';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: any; // Translations object
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        // Load saved language from localStorage
        const saved = localStorage.getItem('swachh_nagar_language') as Language;
        if (saved && ['en', 'hi', 'ta'].includes(saved)) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('swachh_nagar_language', lang);
    };

    // Simple translations placeholder
    const translations = {
        en: { home: 'Home', reports: 'Reports', profile: 'Profile' },
        hi: { home: 'होम', reports: 'रिपोर्ट', profile: 'प्रोफ़ाइल' },
        ta: { home: 'முகப்பு', reports: 'அறிக்கைகள்', profile: 'சுயவிவரம்' }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
