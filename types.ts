export type Language = 'ko' | 'en';

export interface DialogueLine {
  speaker: string;
  line: string;
}

export interface PromptOptions {
  subject: string;
  style: string;
  setting: string;
  colorPalette: string;
  music: string;
  soundEffects: string;
  dialogue: DialogueLine[];
  cameraAngles: string[];
  videoLength: number;
  aspectRatio: string;
}

export interface Shot {
  shot_number: number;
  description: string;
  camera_angle: string;
  duration_seconds: number;
}

export interface GeneratedPrompt {
  title: string;
  overall_prompt: string;
  total_duration_seconds: number;
  aspect_ratio: string;
  shots: Shot[];
}

export interface InputFormHandles {
  triggerAllSuggestions: () => Promise<void>;
}