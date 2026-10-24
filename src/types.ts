export type SfxCommand = {
  time_sec: number;
  sound_name: string;
  action: "play" | "trigger";
  volume: number;
  ai_prompt: string;
};

export type Shot = {
  shot_id: number;
  timestamp_start_sec: number;
  timestamp_end_sec: number;
  duration_sec: number;
  act: string;
  visual_description: string;
  voiceover_narration: string;
  subtitles: string;
  dynamic_typography: {text: string; style: string};
  sfx_commands: SfxCommand[];
};

export type Storyboard = {
  project_metadata: {
    title: string;
    format: string;
    target_platform: string;
    total_duration_seconds: number;
    fps: number;
    aspect_ratio: string;
    language: string;
  };
  storyboard: Shot[];
};
