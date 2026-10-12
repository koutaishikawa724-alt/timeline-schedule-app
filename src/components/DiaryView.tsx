import React, { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { DiaryEntry, DiaryMap } from '../types';
import { colors } from '../theme';
import { addDays, dateKey, fromKey, weekday } from '../date';

type Props = {
  diary: DiaryMap;
  selectedKey: string;
  onChange: (key: string, entry: DiaryEntry | null) => void;
  onSelect: (key: string) => void;
};

export const MOODS = [
  { emoji: '😄', label: '最高' },
  { emoji: '🙂', label: 'いい' },
  { emoji: '😐', label: 'ふつう' },
  { emoji: '😔', label: 'いまいち' },
  { emoji: '😫', label: 'つらい' },
];

const shortDate = (key: string) => {
  const d = fromKey(key);
  return `${d.getMonth() + 1}/${d.getDate()}（${weekday(d)}）`;
};

const clock = (ms: number) => {
  const d = new Date(ms);
  return `${d.getHours()}:${`${d.getMinutes()}`.padStart(2, '0')}`;
};

/** その日の日記を書く画面。書いたそばから自動で保存する */
export default function DiaryView({ diary, selectedKey, onChange, onSelect }: Props) {
  const [focused, setFocused] = useState(false);
  const entry = diary[selectedKey];
  const text = entry?.text ?? '';

  const update = (patch: Partial<DiaryEntry>) => {
    const next = { text, mood: entry?.mood, ...patch, updatedAt: Date.now() };
    // 何も書いていない日は残さない
    onChange(selectedKey, next.text.trim() || next.mood !== undefined ? next : null);
  };

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
        {MOODS.map((m, i) => {
          const active = entry?.mood === i;
          return (
            <Pressable
              key={m.label}
              onPress={() => update({ mood: active ? undefined : i })}
              style={[styles.mood, active && styles.moodActive]}
            >
              <Text style={[styles.moodEmoji, !active && entry?.mood !== undefined && { opacity: 0.4 }]}>{m.emoji}</Text>
              <Text style={[styles.moodLabel, active && { color: colors.text }]}>{m.label}</Text>
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

      {recent.length > 0 && (
        <>
          <Text style={[styles.label, { marginTop: 26 }]}>これまでの日記</Text>
          {recent.map((k) => {
            const e = diary[k];
            const first = e.text.trim().split('\n')[0];
            return (
              <Pressable key={k} onPress={() => onSelect(k)} style={styles.item}>
                <Text style={styles.itemMood}>{e.mood !== undefined ? MOODS[e.mood].emoji : '📝'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemDate}>{shortDate(k)}</Text>
                  <Text style={styles.itemText} numberOfLines={1}>
                    {first || '（気分だけ記録）'}
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
  moodEmoji: { fontSize: 24 },
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
  itemMood: { fontSize: 22 },
  itemDate: { color: colors.textSub, fontSize: 12, fontWeight: '700' },
  itemText: { color: colors.text, fontSize: 15, marginTop: 2 },
});
