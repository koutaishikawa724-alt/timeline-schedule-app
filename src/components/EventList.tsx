import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScheduleEvent } from '../types';
import { colors } from '../theme';
import { formatTime } from '../date';

type Props = {
  events: ScheduleEvent[];
  nowMin?: number;
  highlightId?: string;
  onPress: (ev: ScheduleEvent) => void;
  /** 渡すと各行に削除ボタンが出る */
  onDelete?: (id: string) => void;
};

export default function EventList({ events, nowMin, highlightId, onPress, onDelete }: Props) {
  const sorted = [...events].sort((a, b) => a.start - b.start);
  if (sorted.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>まだ予定がありません</Text>
        <Text style={styles.emptySub}>右下の ＋ から追加しましょう</Text>
      </View>
    );
  }
  return (
    <View style={{ gap: 10 }}>
      {sorted.map((ev) => {
        const done = nowMin !== undefined && ev.end <= nowMin;
        const live = nowMin !== undefined && ev.start <= nowMin && nowMin < ev.end;
        const hl = highlightId === ev.id;
        return (
          <Pressable
            key={ev.id}
            onPress={() => onPress(ev)}
            style={[styles.item, hl && { borderColor: ev.color }, done && { opacity: 0.45 }]}
          >
            <View style={[styles.bar, { backgroundColor: ev.color }]} />
            <View style={styles.times}>
              <Text style={styles.start}>{formatTime(ev.start)}</Text>
              <Text style={styles.end}>{formatTime(ev.end)}</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {ev.title}
            </Text>
            {live && (
              <View style={[styles.live, { backgroundColor: ev.color }]}>
                <Text style={styles.liveText}>NOW</Text>
              </View>
            )}
            {onDelete && (
              <Pressable
                onPress={() => onDelete(ev.id)}
                hitSlop={10}
                style={styles.delete}
                accessibilityLabel={`${ev.title}を削除`}
              >
                <Text style={styles.deleteText}>×</Text>
              </Pressable>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingRight: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  bar: { width: 4, alignSelf: 'stretch', borderRadius: 2, marginLeft: 10, marginRight: 14 },
  times: { width: 52 },
  start: { color: colors.text, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  end: { color: colors.textMuted, fontSize: 12, fontVariant: ['tabular-nums'] },
  title: { flex: 1, color: colors.text, fontSize: 16, marginLeft: 8 },
  delete: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,92,122,0.12)',
  },
  deleteText: { color: colors.danger, fontSize: 18, lineHeight: 20, fontWeight: '600' },
  live: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  liveText: { color: colors.bg, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  empty: { alignItems: 'center', paddingVertical: 28 },
  emptyTitle: { color: colors.textSub, fontSize: 15 },
  emptySub: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
});
