import React, { useEffect, useState } from 'react';
import { Image, Keyboard, Modal, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { DiaryEntry, DiaryMap, DiaryPhoto } from '../types';
import { loadDiaryPhotos, saveDiaryPhotos } from '../storage';
import MoodFace from './MoodFace';
import { colors } from '../theme';
import { addDays, dateKey, fromKey, weekday } from '../date';

type Props = {
  diary: DiaryMap;
  selectedKey: string;
  onChange: (key: string, entry: DiaryEntry | null) => void;
  onSelect: (key: string) => void;
};

export const MOODS = ['最高', 'いい', 'ふつう', 'いまいち', 'つらい'];

const shortDate = (key: string) => {
  const d = fromKey(key);
  return `${d.getMonth() + 1}/${d.getDate()}（${weekday(d)}）`;
};

/** 1日に貼れる写真の枚数 */
const MAX_PHOTOS = 6;

const clock = (ms: number) => {
  const d = new Date(ms);
  return `${d.getHours()}:${`${d.getMinutes()}`.padStart(2, '0')}`;
};

/** その日の日記を書く画面。書いたそばから自動で保存する */
export default function DiaryView({ diary, selectedKey, onChange, onSelect }: Props) {
  const { width } = useWindowDimensions();
  const [focused, setFocused] = useState(false);
  const [photos, setPhotos] = useState<DiaryPhoto[]>([]);
  const [viewing, setViewing] = useState<DiaryPhoto | null>(null);
  const [photoError, setPhotoError] = useState('');
  const entry = diary[selectedKey];
  const text = entry?.text ?? '';

  // 日を切り替えたら、その日の写真を読み込む
  useEffect(() => {
    let alive = true;
    setPhotos([]);
    setPhotoError('');
    loadDiaryPhotos(selectedKey).then((p) => alive && setPhotos(p));
    return () => {
      alive = false;
    };
  }, [selectedKey]);

  const update = (patch: Partial<DiaryEntry>) => {
    const next = { text, mood: entry?.mood, photos: entry?.photos, ...patch, updatedAt: Date.now() };
    // 何も書いていない日は残さない
    onChange(selectedKey, next.text.trim() || next.mood !== undefined || next.photos ? next : null);
  };

  const setDayPhotos = (next: DiaryPhoto[]) => {
    setPhotos(next);
    saveDiaryPhotos(selectedKey, next);
    update({ photos: next.length || undefined });
  };

  const addPhotos = async () => {
    setPhotoError('');
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: MAX_PHOTOS - photos.length,
        // 端末の中に保存するので、小さめに圧縮して文字データとして持つ
        quality: 0.35,
        base64: true,
      });
      if (res.canceled) return;
      const added = res.assets
        .filter((a) => a.base64 || a.uri.startsWith('data:'))
        .map((a, i) => ({
          id: `${Date.now()}-${i}`,
          uri: a.base64 ? `data:${a.mimeType ?? 'image/jpeg'};base64,${a.base64}` : a.uri,
          width: a.width || 1,
          height: a.height || 1,
        }));
      setDayPhotos([...photos, ...added].slice(0, MAX_PHOTOS));
    } catch {
      setPhotoError('写真を開けませんでした。設定アプリで写真へのアクセスを許可してください。');
    }
  };

  const tile = Math.floor((Math.min(width, 560) - 40 - 16) / 3);

  const sel = fromKey(selectedKey);
  const prevKey = dateKey(addDays(sel, -1));
  const nextKey = dateKey(addDays(sel, 1));
  const recent = Object.keys(diary)
    .filter((k) => k !== selectedKey)
    .sort((a, b) => (a < b ? 1 : -1))
    .slice(0, 10);

  return (
    <View style={{ marginTop: 18 }}>
      <View style={styles.nav}>
        <Pressable onPress={() => onSelect(prevKey)} hitSlop={8} style={styles.navBtn}>
          <Text style={styles.navText}>‹ {shortDate(prevKey)}</Text>
        </Pressable>
        <Pressable onPress={() => onSelect(nextKey)} hitSlop={8} style={styles.navBtn}>
          <Text style={styles.navText}>{shortDate(nextKey)} ›</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>気分</Text>
      <View style={styles.moods}>
        {MOODS.map((label, i) => {
          const active = entry?.mood === i;
          return (
            <Pressable
              key={label}
              onPress={() => update({ mood: active ? undefined : i })}
              style={[styles.mood, active && styles.moodActive]}
            >
              <MoodFace level={i} color={active ? colors.accent : colors.textSub} />
              <Text style={[styles.moodLabel, active && { color: colors.text }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.labelRow}>
        <Text style={styles.label}>日記</Text>
        {focused && (
          <Pressable onPress={() => Keyboard.dismiss()} hitSlop={8}>
            <Text style={styles.done}>完了</Text>
          </Pressable>
        )}
      </View>
      <TextInput
        value={text}
        onChangeText={(t) => update({ text: t })}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="どんな一日でしたか？ 思ったことを自由に書きましょう"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        multiline
        textAlignVertical="top"
      />
      <Text style={styles.status}>
        {entry ? `保存しました（${clock(entry.updatedAt)}）・${text.length}文字` : '書くと自動で保存されます'}
      </Text>

      <Text style={[styles.label, { marginTop: 22 }]}>写真</Text>
      <View style={styles.grid}>
        {photos.map((p) => (
          <Pressable key={p.id} onPress={() => setViewing(p)} style={{ width: tile, height: tile }}>
            <Image source={{ uri: p.uri }} style={styles.thumb} />
            <Pressable
              onPress={() => setDayPhotos(photos.filter((x) => x.id !== p.id))}
              hitSlop={8}
              style={styles.remove}
              accessibilityLabel="写真を外す"
            >
              <Text style={styles.removeText}>×</Text>
            </Pressable>
          </Pressable>
        ))}
        {photos.length < MAX_PHOTOS && (
          <Pressable onPress={addPhotos} style={[styles.add, { width: tile, height: tile }]}>
            <Text style={styles.addPlus}>＋</Text>
            <Text style={styles.addText}>写真を追加</Text>
          </Pressable>
        )}
      </View>
      {photoError ? <Text style={[styles.status, { color: colors.danger }]}>{photoError}</Text> : null}

      <Modal visible={viewing !== null} transparent animationType="fade" onRequestClose={() => setViewing(null)}>
        <Pressable style={styles.viewer} onPress={() => setViewing(null)}>
          {viewing && (
            <Image
              source={{ uri: viewing.uri }}
              style={{ width: '100%', aspectRatio: viewing.width / viewing.height, maxHeight: '85%' }}
              resizeMode="contain"
            />
          )}
          <Text style={styles.viewerHint}>タップで閉じる</Text>
        </Pressable>
      </Modal>

      {recent.length > 0 && (
        <>
          <Text style={[styles.label, { marginTop: 26 }]}>これまでの日記</Text>
          {recent.map((k) => {
            const e = diary[k];
            const first = e.text.trim().split('\n')[0];
            return (
              <Pressable key={k} onPress={() => onSelect(k)} style={styles.item}>
                {e.mood !== undefined ? (
                  <MoodFace level={e.mood} color={colors.textSub} size={26} />
                ) : (
                  <View style={styles.itemDot} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemDate}>
                    {shortDate(k)}
                    {e.photos ? `　写真 ${e.photos}枚` : ''}
                  </Text>
                  <Text style={styles.itemText} numberOfLines={1}>
                    {first || (e.photos ? '（写真だけ）' : '（気分だけ記録）')}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between' },
  navBtn: { paddingVertical: 6 },
  navText: { color: colors.textSub, fontSize: 13, fontWeight: '600' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { color: colors.textSub, fontSize: 12, letterSpacing: 2, marginTop: 18, marginBottom: 10, fontWeight: '700' },
  done: { color: colors.accent, fontSize: 15, fontWeight: '700' },
  moods: { flexDirection: 'row', gap: 6 },
  mood: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  moodLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4, fontWeight: '600' },
  input: {
    minHeight: 220,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    paddingTop: 16,
    color: colors.text,
    fontSize: 16,
    lineHeight: 26,
  },
  status: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumb: { width: '100%', height: '100%', borderRadius: 12, backgroundColor: colors.surfaceHigh },
  remove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: -1 },
  add: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlus: { color: colors.accent, fontSize: 26, fontWeight: '300' },
  addText: { color: colors.textSub, fontSize: 11, marginTop: 2, fontWeight: '600' },
  viewer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  viewerHint: { color: colors.textMuted, fontSize: 12, marginTop: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemDot: { width: 26, alignItems: 'center', height: 26, borderRadius: 13, borderWidth: 1.9, borderColor: colors.border },
  itemDate: { color: colors.textSub, fontSize: 12, fontWeight: '700' },
  itemText: { color: colors.text, fontSize: 15, marginTop: 2 },
});
