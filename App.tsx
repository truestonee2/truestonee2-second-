import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { LanguageToggle } from './components/LanguageToggle';
import { generateVideoPrompt } from './services/geminiService';
import { type PromptOptions, type GeneratedPrompt, type Language, type InputFormHandles, type HistoryItem } from './types';
import { UI_TEXTS } from './constants';
import { Footer } from './components/Footer';
import { RefreshCwIcon } from './components/icons/RefreshCwIcon';
import { HistoryIcon } from './components/icons/HistoryIcon';
import { HistoryPanel } from './components/HistoryPanel';


const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('ko');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<InputFormHandles>(null);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const T = UI_TEXTS[language];

  // Load history from localStorage on initial mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('promptHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error("Failed to load history from localStorage:", err);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('promptHistory', JSON.stringify(history));
    } catch (err) {
      console.error("Failed to save history to localStorage:", err);
    }
  }, [history]);

  const handleGeneratePrompt = useCallback(async (options: PromptOptions) => {
    setIsLoading(true);
    setError(null);
    setGeneratedPrompt(null);
    try {
      const result = await generateVideoPrompt(options, language);
      setGeneratedPrompt(result);
      // Add new item to history
      setHistory(prev => [
        {
          id: new Date().toISOString(),
          timestamp: Date.now(),
          options: options,
          result: result,
        },
        ...prev.slice(0, 49) // Keep history to a max of 50 items
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : T.error.unknown);
    } finally {
      setIsLoading(false);
    }
  }, [language, T.error.unknown]);

  const handleOverallRefresh = async () => {
    if (!formRef.current) return;
    setIsRefreshingAll(true);
    try {
      await formRef.current.triggerAllSuggestions();
    } catch (e) {
      console.error("Overall refresh failed", e);
    } finally {
      setIsRefreshingAll(false);
    }
  };

  const handleLoadFromHistory = (item: HistoryItem) => {
    if (formRef.current) {
      formRef.current.setFormState(item.options);
    }
    setGeneratedPrompt(item.result);
    setIsHistoryOpen(false);
  };

  const handleDeleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleClearOutput = () => {
    setGeneratedPrompt(null);
    setError(null);
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans antialiased">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="absolute top-4 left-4 flex items-center space-x-2">
            <button
              onClick={handleOverallRefresh}
              disabled={isRefreshingAll}
              className="flex items-center justify-center w-10 h-10 bg-gray-800 p-1 rounded-full border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-wait"
              aria-label="Refresh all suggestions"
            >
              {isRefreshingAll ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <RefreshCwIcon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center justify-center w-10 h-10 bg-gray-800 p-1 rounded-full border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              aria-label={T.history.title}
            >
              <HistoryIcon className="w-5 h-5" />
            </button>
        </div>
        <LanguageToggle language={language} setLanguage={setLanguage} />
        <Header T={T} />
        <OutputDisplay 
          prompt={generatedPrompt} 
          isLoading={isLoading} 
          error={error}
          T={T}
          language={language}
          onClear={handleClearOutput}
        />
        <div className="mt-8 bg-gray-800 border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-900/20">
          <InputForm ref={formRef} onSubmit={handleGeneratePrompt} T={T} isLoading={isLoading} />
        </div>
        <Footer T={T} />
      </main>
      <HistoryPanel 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoad={handleLoadFromHistory}
        onDelete={handleDeleteFromHistory}
        onClear={handleClearHistory}
        T={T}
      />
    </div>
  );
};

export default App;