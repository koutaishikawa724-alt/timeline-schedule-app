import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiaryMap, DiaryPhoto, ScheduleMap } from './types';

const KEY = 'schedule.v1';

export async function loadSchedules(): Promise<ScheduleMap> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ScheduleMap) : {};
  } catch {
    return {};
  }
}

export async function saveSchedules(map: ScheduleMap): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // 保存できなくてもアプリは動かし続ける
  }
}

const DIARY_KEY = 'diary.v1';

export async function loadDiary(): Promise<DiaryMap> {
  try {
    const raw = await AsyncStorage.getItem(DIARY_KEY);
    return raw ? (JSON.parse(raw) as DiaryMap) : {};
  } catch {
    return {};
  }
}

export async function saveDiary(map: DiaryMap): Promise<void> {
  try {
    await AsyncStorage.setItem(DIARY_KEY, JSON.stringify(map));
  } catch {
    // 保存できなくてもアプリは動かし続ける
  }
}

/** 日記の写真は大きいので、日ごとに別の場所へ保存する（本文の自動保存を重くしないため） */
const photoKey = (dayKey: string) => `diaryPhotos.v1:${dayKey}`;

export async function loadDiaryPhotos(dayKey: string): Promise<DiaryPhoto[]> {
  try {
    const raw = await AsyncStorage.getItem(photoKey(dayKey));
    return raw ? (JSON.parse(raw) as DiaryPhoto[]) : [];
  } catch {
    return [];
  }
}

export async function saveDiaryPhotos(dayKey: string, photos: DiaryPhoto[]): Promise<void> {
  try {
    if (photos.length) await AsyncStorage.setItem(photoKey(dayKey), JSON.stringify(photos));
    else await AsyncStorage.removeItem(photoKey(dayKey));
  } catch {
    // 保存できなくてもアプリは動かし続ける
  }
}

/** この端末に保存した予定・日記・写真をすべて消す */
export async function clearAllData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((k) => k === KEY || k === DIARY_KEY || k.startsWith('diaryPhotos.v1:'));
    if (ours.length) await AsyncStorage.multiRemove(ours);
  } catch {
    // 消せなかったものは次回また消せる
  }
}
