import AsyncStorage from '@react-native-async-storage/async-storage';

export type NarrationStyle = 'mission' | 'dj' | 'cool';

export type Settings = {
  /** 読み上げで呼びかける名前（空なら呼びかけない） */
  name: string;
  style: NarrationStyle;
  /** 端末の音声ID（未設定なら自動で日本語の一番良い声） */
  voiceId?: string;
  rate: number;
  pitch: number;
  /** 読み上げ前の効果音 */
  sound: boolean;
  /** 読み上げ中のBGM */
  bgm: boolean;
};

export const RATE_OPTIONS = [
  { value: 0.85, label: 'ゆっくり' },
  { value: 0.95, label: 'ふつう' },
  { value: 1.1, label: 'はやい' },
];
export const PITCH_OPTIONS = [
  { value: 0.78, label: '低め' },
  { value: 0.9, label: 'ふつう' },
  { value: 1.05, label: '高め' },
];

/** 古い設定値を、今ある選択肢の一番近いものに合わせる */
const snap = (value: number, options: { value: number }[]) =>
  options.reduce((best, o) => (Math.abs(o.value - value) < Math.abs(best - value) ? o.value : best), options[0].value);

export const defaultSettings: Settings = { name: '', style: 'mission', rate: 0.95, pitch: 0.9, sound: true, bgm: true };

export const STYLE_LABELS: Record<NarrationStyle, { label: string; desc: string }> = {
  mission: { label: 'ミッション', desc: '作戦会議風' },
  dj: { label: 'ラジオDJ', desc: '明るく軽快' },
  cool: { label: 'クール', desc: '静かで渋い' },
};

const KEY = 'settings.v1';

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultSettings;
    const s = { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) };
    return { ...s, rate: snap(s.rate, RATE_OPTIONS), pitch: snap(s.pitch, PITCH_OPTIONS) };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // 保存できなくても続行
  }
}
