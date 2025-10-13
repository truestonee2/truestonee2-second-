import React from 'react';
import { type HistoryItem } from '../types';
import { XIcon } from './icons/XIcon';
import { TrashIcon } from './icons/TrashIcon';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  T: any;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onLoad, onDelete, onClear, T }) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-gray-800 border-l border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-panel-title"
      >
        <div className="h-full flex flex-col">
          <header className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800/80 backdrop-blur-sm">
            <h2 id="history-panel-title" className="text-lg font-semibold text-white">{T.history.title}</h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700">
              <XIcon className="w-6 h-6" />
              <span className="sr-only">Close panel</span>
            </button>
          </header>
          
          {history.length === 0 ? (
            <div className="flex-grow flex items-center justify-center text-gray-500">
              <p>{T.history.empty}</p>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto">
              <ul>
                {history.map(item => (
                  <li key={item.id} className="border-b border-gray-700 p-4 hover:bg-gray-700/50 transition-colors">
                    <p className="font-semibold text-indigo-300 truncate">{item.result.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={() => onLoad(item)} className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors">
                        {T.history.load}
                      </button>
                      <button onClick={() => onDelete(item.id)} className="p-2 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-600 transition-colors" aria-label="Delete item">
                         <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {history.length > 0 && (
            <footer className="p-4 border-t border-gray-700 sticky bottom-0 bg-gray-800/80 backdrop-blur-sm">
              <button
                onClick={onClear}
                className="w-full py-2 text-sm bg-red-800 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                {T.history.clearAll}
              </button>
            </footer>
          )}
        </div>
      </aside>
    </>
  );
};
