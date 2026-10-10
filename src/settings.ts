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
};

export const defaultSettings: Settings = { name: '', style: 'mission', rate: 1.0, pitch: 0.92, sound: true };

export const STYLE_LABELS: Record<NarrationStyle, { label: string; desc: string }> = {
  mission: { label: 'ミッション', desc: '作戦会議風' },
  dj: { label: 'ラジオDJ', desc: '明るく軽快' },
  cool: { label: 'クール', desc: '静かで渋い' },
};

const KEY = 'settings.v1';

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) } : defaultSettings;
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
