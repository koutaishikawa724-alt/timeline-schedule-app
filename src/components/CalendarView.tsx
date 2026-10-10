import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScheduleMap } from '../types';
import { colors } from '../theme';
import { dateKey, WEEKDAY_LABELS } from '../date';

type Props = {
  schedules: ScheduleMap;
  selectedKey: string;
  todayKey: string;
  onSelect: (key: string) => void;
};

export default function CalendarView({ schedules, selectedKey, todayKey, onSelect }: Props) {
  const [cursor, setCursor] = useState(() => {
    const [y, m] = selectedKey.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable onPress={() => setCursor(new Date(year, month - 1, 1))} style={styles.nav} hitSlop={10}>
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Text style={styles.month}>
          {year}年 {month + 1}月
        </Text>
        <Pressable onPress={() => setCursor(new Date(year, month + 1, 1))} style={styles.nav} hitSlop={10}>
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.week}>
        {WEEKDAY_LABELS.map((w, i) => (
          <Text key={w} style={[styles.weekday, i === 0 && { color: '#FF7A8F' }, i === 6 && { color: '#7FA6FF' }]}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((d, i) => {
          if (!d) return <View key={`e${i}`} style={styles.cell} />;
          const key = dateKey(d);
          const events = schedules[key] ?? [];
          const selected = key === selectedKey;
          const today = key === todayKey;
          return (
            <Pressable key={key} style={styles.cell} onPress={() => onSelect(key)}>
              <View style={[styles.day, today && styles.today, selected && styles.selected]}>
                <Text style={[styles.dayText, selected && { color: '#fff', fontWeight: '700' }]}>{d.getDate()}</Text>
              </View>
              <View style={styles.dots}>
                {events.slice(0, 3).map((e) => (
                  <View key={e.id} style={[styles.dot, { backgroundColor: e.color }]} />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: colors.border },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  nav: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  navText: { color: colors.text, fontSize: 22, lineHeight: 24 },
  month: { color: colors.text, fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  week: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', color: colors.textMuted, fontSize: 12, marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4 },
  day: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1.5, borderColor: colors.accent },
  selected: { backgroundColor: colors.accent },
  dayText: { color: colors.text, fontSize: 15, fontVariant: ['tabular-nums'] },
  dots: { flexDirection: 'row', gap: 3, height: 6, marginTop: 3 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
