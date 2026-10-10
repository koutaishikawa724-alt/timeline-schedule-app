import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScheduleMap } from './types';

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
