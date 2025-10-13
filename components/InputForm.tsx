import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { type PromptOptions, type Language, type InputFormHandles, type DialogueLine } from '../types';
import { ART_STYLES, CAMERA_ANGLES, ASPECT_RATIOS, SHOT_COUNT } from '../constants';
import { generateSuggestion } from '../services/geminiService';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { ShuffleIcon } from './icons/ShuffleIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface InputFormProps {
  onSubmit: (options: PromptOptions) => void;
  T: any;
  isLoading: boolean;
}

const initialShots = Array(SHOT_COUNT).fill(CAMERA_ANGLES[0].value);
const initialDialogue = [{ speaker: '', line: '' }];

// Helper sub-component for inputs with AI suggestion capability
const SuggestibleInputField: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  onSuggest: () => Promise<void>;
  placeholder: string;
  required?: boolean;
  datalistId?: string;
}> = ({ label, value, onChange, onSuggest, placeholder, required, datalistId }) => {
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSuggestClick = async () => {
    setIsSuggesting(true);
    try {
      await onSuggest();
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          list={datalistId}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg shadow-sm py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
        />
        <button
          type="button"
          onClick={handleSuggestClick}
          disabled={isSuggesting}
          className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-400 hover:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-wait"
          aria-label={`Generate suggestion for ${label}`}
        >
          {isSuggesting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <SparklesIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};


export const InputForm = forwardRef<InputFormHandles, InputFormProps>(({ onSubmit, T, isLoading }, ref) => {
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState(ART_STYLES[0].value);
  const [setting, setSetting] = useState('');
  const [colorPalette, setColorPalette] = useState('');
  const [music, setMusic] = useState('');
  const [soundEffects, setSoundEffects] = useState('');
  const [dialogue, setDialogue] = useState<DialogueLine[]>(initialDialogue);
  const [videoLength, setVideoLength] = useState(8);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0].value);
  const [cameraAngles, setCameraAngles] = useState<string[]>(initialShots);
  const [isSuggestingDialogue, setIsSuggestingDialogue] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ subject, style, setting, colorPalette, music, soundEffects, dialogue, videoLength, aspectRatio, cameraAngles });
  };
  
  const handleAngleChange = (index: number, value: string) => {
    const newAngles = [...cameraAngles];
    newAngles[index] = value;
    setCameraAngles(newAngles);
  };

  const randomizeAngles = () => {
    const newAngles = Array.from({ length: SHOT_COUNT }, () => 
      CAMERA_ANGLES[Math.floor(Math.random() * CAMERA_ANGLES.length)].value
    );
    setCameraAngles(newAngles);
  };

  const handleDialogueChange = (index: number, field: 'speaker' | 'line', value: string) => {
    const newDialogue = [...dialogue];
    newDialogue[index][field] = value;
    setDialogue(newDialogue);
  };
  
  const addDialogueLine = () => {
    setDialogue([...dialogue, { speaker: '', line: '' }]);
  };

  const removeDialogueLine = (index: number) => {
    const newDialogue = dialogue.filter((_, i) => i !== index);
    // Ensure there's always at least one line
    if (newDialogue.length === 0) {
      setDialogue(initialDialogue);
    } else {
      setDialogue(newDialogue);
    }
  };

  const currentLang = T.header.title.includes("제작소") ? 'ko' : 'en';

  // Suggestion Handler Factory
  const createSuggestionHandler = (
    fieldType: 'subject' | 'style' | 'setting' | 'colorPalette' | 'music' | 'soundEffects',
    setter: (value: string) => void
  ) => {
    return async () => {
      try {
        const suggestion = await generateSuggestion(fieldType, currentLang as Language);
        setter(suggestion);
      } catch (e) {
        console.error(`Suggestion failed for ${fieldType}:`, e);
      }
    };
  };

  const handleSuggestSubject = createSuggestionHandler('subject', setSubject);
  const handleSuggestStyle = createSuggestionHandler('style', setStyle);
  const handleSuggestSetting = createSuggestionHandler('setting', setSetting);
  const handleSuggestColorPalette = createSuggestionHandler('colorPalette', setColorPalette);
  const handleSuggestMusic = createSuggestionHandler('music', setMusic);
  const handleSuggestSoundEffects = createSuggestionHandler('soundEffects', setSoundEffects);
  
  const handleSuggestDialogue = async () => {
    setIsSuggestingDialogue(true);
    try {
      const suggestionJson = await generateSuggestion('dialogue', currentLang as Language);
      const suggestedDialogue = JSON.parse(suggestionJson) as DialogueLine[];
      if (suggestedDialogue && suggestedDialogue.length > 0) {
        setDialogue(suggestedDialogue);
      }
    } catch (e) {
      console.error(`Suggestion failed for dialogue:`, e);
    } finally {
      setIsSuggestingDialogue(false);
    }
  };

  // Expose function to parent via ref
  useImperativeHandle(ref, () => ({
    async triggerAllSuggestions() {
      await handleSuggestSubject();
      await handleSuggestStyle();
      await handleSuggestSetting();
      await handleSuggestColorPalette();
      await handleSuggestMusic();
      await handleSuggestSoundEffects();
      await handleSuggestDialogue();
    },
  }));

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SuggestibleInputField
          label={T.form.subject}
          value={subject}
          onChange={setSubject}
          onSuggest={handleSuggestSubject}
          placeholder={T.form.subjectPlaceholder}
          required
        />
        <SuggestibleInputField
          label={T.form.style}
          value={style}
          onChange={setStyle}
          onSuggest={handleSuggestStyle}
          placeholder="e.g., Cinematic"
          datalistId="art-styles-list"
          required
        />
        <datalist id="art-styles-list">
          {ART_STYLES.map(s => <option key={s.value} value={s[currentLang]} />)}
        </datalist>
        <SuggestibleInputField
          label={T.form.setting}
          value={setting}
          onChange={setSetting}
          onSuggest={handleSuggestSetting}
          placeholder={T.form.settingPlaceholder}
          required
        />
        <SuggestibleInputField
          label={T.form.colorPalette}
          value={colorPalette}
          onChange={setColorPalette}
          onSuggest={handleSuggestColorPalette}
          placeholder={T.form.colorPalettePlaceholder}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SuggestibleInputField
            label={T.form.music}
            value={music}
            onChange={setMusic}
            onSuggest={handleSuggestMusic}
            placeholder={T.form.musicPlaceholder}
        />
        <SuggestibleInputField
            label={T.form.soundEffects}
            value={soundEffects}
            onChange={setSoundEffects}
            onSuggest={handleSuggestSoundEffects}
            placeholder={T.form.soundEffectsPlaceholder}
        />
      </div>

      {/* Dialogue Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-200">{T.form.dialogue}</h3>
            <button 
              type="button" 
              onClick={handleSuggestDialogue} 
              disabled={isSuggestingDialogue}
              className="flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
            >
              {isSuggestingDialogue ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                  <SparklesIcon className="w-4 h-4" />
              )}
              <span>{T.form.dialogueSuggestion}</span>
            </button>
        </div>
        <div className="space-y-4">
          {dialogue.map((d, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={d.speaker}
                onChange={(e) => handleDialogueChange(index, 'speaker', e.target.value)}
                placeholder={T.form.speakerPlaceholder}
                className="w-1/3 bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <input
                type="text"
                value={d.line}
                onChange={(e) => handleDialogueChange(index, 'line', e.target.value)}
                placeholder={T.form.linePlaceholder}
                className="flex-grow bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button type="button" onClick={() => removeDialogueLine(index)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={addDialogueLine} className="flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors mt-2">
            <PlusIcon className="w-4 h-4" />
            <span>{T.form.addDialogueLine}</span>
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{T.form.videoLength}</label>
          <div className="flex items-center space-x-4">
            <input type="range" min="6" max="10" value={videoLength} onChange={(e) => setVideoLength(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
            <span className="font-mono text-indigo-300 w-8 text-center">{videoLength}s</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{T.form.aspectRatio}</label>
          <div className="flex space-x-2 rounded-lg bg-gray-700 p-1">
            {ASPECT_RATIOS.map((ratio) => (
              <button key={ratio.value} type="button" onClick={() => setAspectRatio(ratio.value)} className={`w-full rounded-md py-2 text-sm font-medium transition-colors ${aspectRatio === ratio.value ? 'bg-indigo-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600'}`}>
                {ratio.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-200">{T.form.shots}</h3>
            <button type="button" onClick={randomizeAngles} className="flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                <ShuffleIcon className="w-4 h-4" />
                <span>{T.form.randomizeButton}</span>
            </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {cameraAngles.map((angle, index) => (
                <div key={index}>
                    <label className="block text-xs font-medium text-gray-400 mb-1">{T.form.shotLabel} {index + 1}</label>
                    <select value={angle} onChange={(e) => handleAngleChange(index, e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                        {CAMERA_ANGLES.map(ca => <option key={ca.value} value={ca.value}>{ca[currentLang]}</option>)}
                    </select>
                </div>
            ))}
        </div>
      </div>
      
      <div className="pt-4">
        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center space-x-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>{T.form.generatingButton}</span>
            </>
          ) : (
            <>
              <MagicWandIcon className="w-6 h-6" />
              <span>{T.form.generateButton}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
});