import { GoogleGenAI, Type } from "@google/genai";
import { type PromptOptions, type GeneratedPrompt, type Language, DialogueLine } from '../types';
import { UI_TEXTS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'A short, catchy title for the video.' },
    overall_prompt: { type: Type.STRING, description: 'A comprehensive, single-paragraph prompt combining all elements for an AI video generator like Sora or Veo.' },
    total_duration_seconds: { type: Type.NUMBER, description: 'The total length of the video in seconds.' },
    aspect_ratio: { type: Type.STRING, description: 'The aspect ratio of the video (e.g., "9:16").' },
    shots: {
      type: Type.ARRAY,
      description: 'An array of 10 distinct shots that make up the video.',
      items: {
        type: Type.OBJECT,
        properties: {
          shot_number: { type: Type.INTEGER },
          description: { type: Type.STRING, description: 'A detailed description of the action and visuals in this specific shot.' },
          camera_angle: { type: Type.STRING, description: 'The camera angle or movement for this shot.' },
          duration_seconds: { type: Type.NUMBER, description: 'The duration of this specific shot in seconds.' },
        },
        required: ['shot_number', 'description', 'camera_angle', 'duration_seconds'],
      },
    },
  },
  required: ['title', 'overall_prompt', 'total_duration_seconds', 'aspect_ratio', 'shots'],
};

export const generateVideoPrompt = async (options: PromptOptions, lang: Language): Promise<GeneratedPrompt> => {
  const { subject, style, setting, colorPalette, music, soundEffects, dialogue, cameraAngles, videoLength, aspectRatio } = options;

  const promptLanguage = lang === 'ko' ? 'Korean' : 'English';
  
  const dialogueString = dialogue
    .filter(d => d.speaker.trim() && d.line.trim())
    .map(d => `${d.speaker}: "${d.line}"`)
    .join('\n');


  const prompt = `
    You are an expert AI video director named "Jason". Your task is to create a detailed shot list for a short-form video for platforms like TikTok or Reels, designed for AI video generators like Sora and Veo.
    The final output must be in JSON format, adhering to the provided schema.
    All text descriptions in the JSON output (title, overall_prompt, shot descriptions) must be in ${promptLanguage}.

    User's Video Concept:
    - Main Subject: ${subject}
    - Visual Style: ${style}
    - Setting/Background: ${setting}
    - Color Palette: ${colorPalette}
    - Music/Soundtrack: ${music}
    - Key Sound Effects: ${soundEffects}
    - Dialogue/Narration:
${dialogueString || 'None'}
    - Total Video Length: ${videoLength} seconds
    - Aspect Ratio: ${aspectRatio}
    - Shot List (10 cuts): ${cameraAngles.join(', ')}

    Instructions:
    1. Create a compelling, coherent narrative or visual sequence across the 10 shots.
    2. The 'overall_prompt' should be a single, powerful paragraph that synthesizes all elements (visuals, audio, story) into one master prompt. This is the most important part.
    3. The total duration of all shots combined must equal the requested video length. Distribute the time logically across the 10 shots.
    4. Ensure the JSON is perfectly structured according to the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    // Gemini can sometimes wrap the JSON in markdown backticks
    const cleanedJsonText = jsonText.replace(/^```json\s*|```$/g, '');
    return JSON.parse(cleanedJsonText) as GeneratedPrompt;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error(UI_TEXTS[lang].error.geminiError);
  }
};

export const generateSuggestion = async (
  fieldType: 'subject' | 'style' | 'setting' | 'colorPalette' | 'music' | 'soundEffects' | 'dialogue',
  lang: Language
): Promise<string> => {
  const promptLanguage = lang === 'ko' ? 'Korean' : 'English';
  let instruction = '';

  switch (fieldType) {
    case 'subject':
      instruction = `Suggest a visually interesting and creative subject for a 10-second viral video. Be concise. Example: 'A cat riding a skateboard'. Respond in ${promptLanguage} with only the subject text, without any labels or quotes.`;
      break;
    case 'style':
      instruction = `Suggest a single, specific, and visually descriptive art style for an AI-generated video. Example: 'cinematic hyperrealism'. Respond in ${promptLanguage} with only the style name, without any labels or quotes.`;
      break;
    case 'setting':
      instruction = `Suggest a creative and vivid setting for a 10-second viral video. Be concise. Example: 'Streets of Neo-Seoul at night'. Respond in ${promptLanguage} with only the setting text, without any labels or quotes.`;
      break;
    case 'colorPalette':
      instruction = `Suggest a compelling and descriptive color palette for an AI-generated video. Be concise. Example: 'Vibrant neon and cyberpunk blues'. Respond in ${promptLanguage} with only the color palette text, without any labels or quotes.`;
      break;
    case 'music':
      instruction = `Suggest a music style or soundtrack for a 10-second viral video. Be concise. Example: 'Epic orchestral score'. Respond in ${promptLanguage} with only the music text, without any labels or quotes.`;
      break;
    case 'soundEffects':
      instruction = `Suggest key sound effects for a 10-second viral video. Be concise. Example: 'City ambiance, cat meow'. Respond in ${promptLanguage} with only the sound effects text, without any labels or quotes.`;
      break;
    case 'dialogue':
      instruction = `Suggest a short, 2-3 line dialogue for a 10-second viral video. It can be a one-on-one or multi-person conversation. Respond ONLY with a valid JSON array of objects in this format: \`[{"speaker": "string", "line": "string"}]\`. The language of the 'speaker' and 'line' values must be ${promptLanguage}. Do not include any other text or markdown formatting.`;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: instruction,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // faster response for suggestions
      }
    });
    
    if (fieldType === 'dialogue') {
      const cleanedJson = response.text.trim().replace(/^```json\s*|```$/g, '');
      // Basic validation
      try {
        JSON.parse(cleanedJson);
        return cleanedJson;
      } catch (e) {
        console.error("Failed to parse dialogue suggestion JSON:", cleanedJson);
        throw new Error("Received invalid JSON for dialogue suggestion.");
      }
    }

    return response.text.trim();
  } catch (error) {
    console.error(`Gemini suggestion API call failed for ${fieldType}:`, error);
    throw new Error(`Failed to generate suggestion for ${fieldType}.`);
  }
};