
import React, { useState, useEffect } from 'react';
import { type GeneratedPrompt } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface OutputDisplayProps {
  prompt: GeneratedPrompt | null;
  isLoading: boolean;
  error: string | null;
  T: any;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ prompt, isLoading, error, T }) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'json'>('prompt');
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
          <div className="animate-pulse text-indigo-400">
             <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.5 12C15.5 13.933 13.933 15.5 12 15.5C10.067 15.5 8.5 13.933 8.5 12C8.5 10.067 10.067 8.5 12 8.5C13.933 8.5 15.5 10.067 15.5 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <p className="mt-4 text-lg font-semibold">{T.output.loading}</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="p-8 text-center">
          <h3 className="text-xl font-bold text-red-400">{T.error.title}</h3>
          <p className="mt-2 text-red-300 bg-red-900/50 p-4 rounded-lg">{error}</p>
        </div>
      );
    }
    if (prompt) {
      const contentToDisplay = activeTab === 'json' ? JSON.stringify(prompt, null, 2) : prompt.overall_prompt;
      return (
        <div className="relative">
          <CopyButton textToCopy={contentToDisplay} T={T} />
          <pre className="bg-gray-900/70 p-6 rounded-b-lg text-left text-sm whitespace-pre-wrap overflow-x-auto font-mono leading-relaxed text-indigo-200">
            <code>{contentToDisplay}</code>
          </pre>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center p-12 text-center text-gray-500">
        <p>{T.output.waiting}</p>
      </div>
    );
  };
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-300">{T.output.title}</h2>
      <div className="bg-gray-800 border border-purple-500/30 rounded-lg shadow-lg shadow-purple-900/20 min-h-[200px] flex flex-col">
        {prompt && (
          <div className="flex border-b border-purple-500/30">
            <TabButton title={T.output.promptTab} isActive={activeTab === 'prompt'} onClick={() => setActiveTab('prompt')} />
            <TabButton title={T.output.jsonTab} isActive={activeTab === 'json'} onClick={() => setActiveTab('json')} />
          </div>
        )}
        <div className="flex-grow">{renderContent()}</div>
      </div>
    </div>
  );
};

const CopyButton: React.FC<{ textToCopy: string, T: any }> = ({ textToCopy, T }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <button onClick={handleCopy} className={`absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-all ${isCopied ? 'text-green-400' : 'text-gray-300'}`}>
      {isCopied ? (
        <div className="flex items-center space-x-2">
          <CheckIcon className="w-5 h-5" />
          <span>{T.output.copiedButton}</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <CopyIcon className="w-5 h-5" />
          <span>{T.output.copyButton}</span>
        </div>
      )}
    </button>
  );
};

const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void }> = ({ title, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${isActive ? 'bg-purple-600/30 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
      {title}
    </button>
);
