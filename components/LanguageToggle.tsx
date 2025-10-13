
import React from 'react';
import { type Language } from '../types';

interface LanguageToggleProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, setLanguage }) => {
  return (
    <div className="absolute top-4 right-4 flex space-x-1 bg-gray-800 p-1 rounded-full border border-gray-700">
      <button
        onClick={() => setLanguage('ko')}
        className={`px-3 py-1 text-sm rounded-full transition-colors ${language === 'ko' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
      >
        🇰🇷 KO
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm rounded-full transition-colors ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
      >
        🇺🇸 EN
      </button>
    </div>
  );
};
