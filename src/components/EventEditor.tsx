import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScheduleEvent } from '../types';
import { colors, eventPalette } from '../theme';
import { formatTime } from '../date';

type Props = {
  visible: boolean;
  initial?: ScheduleEvent;
  defaultStart: number;
  dayLabel: string;
  onSave: (ev: Omit<ScheduleEvent, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];
const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240];

function durationLabel(m: number) {
  if (m < 60) return `${m}分`;
  return m % 60 === 0 ? `${m / 60}時間` : `${Math.floor(m / 60)}.5時間`;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function EventEditor({ visible, initial, defaultStart, dayLabel, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [duration, setDuration] = useState(60);
  const [color, setColor] = useState(eventPalette[0]);

  useEffect(() => {
    if (!visible) return;
    if (initial) {
      setTitle(initial.title);
      setHour(Math.floor(initial.start / 60));
      setMinute(initial.start % 60);
      setDuration(initial.end - initial.start);
      setColor(initial.color);
    } else {
      setTitle('');
      setHour(Math.floor(defaultStart / 60));
      setMinute(defaultStart % 60 - ((defaultStart % 60) % 15));
      setDuration(60);
      setColor(eventPalette[Math.floor(Math.random() * eventPalette.length)]);
    }
  }, [visible, initial, defaultStart]);

  const start = hour * 60 + minute;
  const end = Math.min(start + duration, 1440);
  const canSave = title.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.headerRow}>
            <Text style={styles.heading}>{initial ? '予定を編集' : `${dayLabel}の予定を追加`}</Text>
            <Text style={[styles.range, { color }]}>
              {formatTime(start)} – {formatTime(end)}
            </Text>
          </View>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="例：朝ラン、打ち合わせ、ジム"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoFocus={!initial}
            returnKeyType="done"
          />

          <Text style={styles.label}>開始（時）</Text>
          <View style={styles.hourGrid}>
            {HOURS.map((h) => (
              <View key={h} style={styles.hourCell}>
                <Chip label={`${h}`} active={h === hour} onPress={() => setHour(h)} />
              </View>
            ))}
          </View>

          <Text style={styles.label}>開始（分）</Text>
          <View style={styles.row}>
            {MINUTES.map((m) => (
              <Chip key={m} label={`:${`${m}`.padStart(2, '0')}`} active={m === minute} onPress={() => setMinute(m)} />
            ))}
          </View>

          <Text style={styles.label}>長さ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {DURATIONS.map((d) => (
              <Chip key={d} label={durationLabel(d)} active={d === duration} onPress={() => setDuration(d)} />
            ))}
          </ScrollView>

          <Text style={styles.label}>カラー</Text>
          <View style={styles.row}>
            {eventPalette.map((p) => (
              <Pressable
                key={p}
                onPress={() => setColor(p)}
                style={[styles.swatch, { backgroundColor: p }, p === color && styles.swatchActive]}
              />
            ))}
          </View>

          <View style={styles.actions}>
            {initial && onDelete && (
              <Pressable onPress={() => onDelete(initial.id)} style={[styles.button, styles.deleteButton]}>
                <Text style={[styles.buttonText, { color: colors.danger }]}>削除</Text>
              </Pressable>
            )}
            <Pressable
              disabled={!canSave}
              onPress={() => onSave({ id: initial?.id, title: title.trim(), start, end, color })}
              style={[styles.button, styles.saveButton, { backgroundColor: color }, !canSave && { opacity: 0.35 }]}
            >
              <Text style={[styles.buttonText, { color: colors.bg }]}>保存</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
  heading: { color: colors.text, fontSize: 18, fontWeight: '700' },
  range: { fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
  input: {
    backgroundColor: colors.surfaceHigh,
    color: colors.text,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  label: { color: colors.textSub, fontSize: 12, marginTop: 14, marginBottom: 8, letterSpacing: 1 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  hourGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 },
  hourCell: { width: `${100 / 8}%`, padding: 3 },
  chip: {
    minWidth: 40,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.textSub, fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  chipTextActive: { color: '#fff' },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 3, borderColor: 'transparent' },
  swatchActive: { borderColor: colors.text },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  button: { flex: 1, paddingVertical: 15, borderRadius: 16, alignItems: 'center' },
  deleteButton: { flex: 0.5, backgroundColor: 'rgba(255,92,122,0.12)' },
  saveButton: {},
  buttonText: { fontSize: 16, fontWeight: '700' },
});
