import AsyncStorage from '@react-native-async-storage/async-storage';

export type NarrationStyle = 'mission' | 'dj' | 'cool';

export type Settings = {
  /** ブリーフィングで呼びかける名前（空なら呼びかけない） */
  name: string;
  style: NarrationStyle;
};

export const defaultSettings: Settings = { name: '', style: 'mission' };

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
    return { name: s.name, style: s.style };
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
