import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CircleSchedule, { describeCenter } from './src/components/CircleSchedule';
import CalendarView from './src/components/CalendarView';
import EventList from './src/components/EventList';
import EventEditor from './src/components/EventEditor';
import BriefingOverlay from './src/components/BriefingOverlay';
import { CalendarTabIcon, CircleTabIcon } from './src/components/TabIcons';
import {
  aiBriefingEnabled,
  BriefingHandle,
  BriefingSegment,
  buildBriefing,
  fetchAiBriefing,
  playBriefing,
} from './src/briefing';
import { addDays, dateKey, fromKey, nowMinutes, weekday } from './src/date';
import { loadSchedules, saveSchedules } from './src/storage';
import { ScheduleEvent, ScheduleMap } from './src/types';
import { colors } from './src/theme';

type Tab = 'circle' | 'calendar';

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function Main() {
  const { width } = useWindowDimensions();
  const now = useNow();
  const todayKey = dateKey(now);
  const tomorrowKey = dateKey(addDays(now, 1));

  const [schedules, setSchedules] = useState<ScheduleMap>({});
  const [loaded, setLoaded] = useState(false);
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [tab, setTab] = useState<Tab>('circle');
  const [editing, setEditing] = useState<ScheduleEvent | undefined>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [briefing, setBriefing] = useState<BriefingSegment[] | null>(null);
  const [briefIndex, setBriefIndex] = useState(0);
  const briefHandle = useRef<BriefingHandle | null>(null);
  const briefRun = useRef(0);

  useEffect(() => {
    loadSchedules().then((s) => {
      setSchedules(s);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveSchedules(schedules);
  }, [schedules, loaded]);

  const events = schedules[selectedKey] ?? [];
  const isToday = selectedKey === todayKey;
  const dayLabel = isToday ? '今日' : selectedKey === tomorrowKey ? '明日' : null;
  const sel = fromKey(selectedKey);
  const dateTitle = `${sel.getMonth() + 1}月${sel.getDate()}日（${weekday(sel)}）`;
  const nowMin = isToday ? nowMinutes(now) : undefined;
  const center = describeCenter(events, nowMin);
  const circleSize = Math.min(width - 40, 360);

  const openNew = () => {
    setEditing(undefined);
    setEditorOpen(true);
  };
  const openEdit = (ev: ScheduleEvent) => {
    setEditing(ev);
    setEditorOpen(true);
  };

  const showToast = () => {
    setToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 6000);
  };

  const handleSave = (draft: Omit<ScheduleEvent, 'id'> & { id?: string }) => {
    setSchedules((prev) => {
      const list = prev[selectedKey] ?? [];
      const next: ScheduleEvent = { ...draft, id: draft.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
      const updated = draft.id ? list.map((e) => (e.id === draft.id ? next : e)) : [...list, next];
      return { ...prev, [selectedKey]: updated.sort((a, b) => a.start - b.start) };
    });
    setEditorOpen(false);
    showToast();
  };

  const handleDelete = (id: string) => {
    setSchedules((prev) => ({ ...prev, [selectedKey]: (prev[selectedKey] ?? []).filter((e) => e.id !== id) }));
    setEditorOpen(false);
  };

  const startBriefing = useCallback(async () => {
    setToast(false);
    const run = ++briefRun.current;
    setBriefIndex(0);
    setBriefing([]); // 空 = 原稿を準備中
    const ai = await fetchAiBriefing(selectedKey, events, dayLabel);
    if (run !== briefRun.current) return; // 準備中に停止された
    const segs = ai ?? buildBriefing(selectedKey, events, dayLabel);
    setBriefing(segs);
    briefHandle.current = playBriefing(segs, setBriefIndex, () => {
      briefHandle.current = null;
      setBriefing(null);
    });
  }, [selectedKey, events, dayLabel]);

  const stopBriefing = () => {
    briefRun.current++;
    if (briefHandle.current) briefHandle.current.stop();
    else setBriefing(null);
  };

  const defaultStart = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.start - b.start);
    const last = sorted[sorted.length - 1];
    if (last) return Math.min(last.end, 23 * 60);
    return isToday ? Math.min(Math.ceil(nowMinutes(now) / 60) * 60, 23 * 60) : 9 * 60;
  }, [events, isToday, now]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>{dayLabel ? (dayLabel === '今日' ? 'TODAY' : 'TOMORROW') : 'SCHEDULE'}</Text>
        <Text style={styles.date}>{dateTitle}</Text>

        <View style={styles.segment}>
          {[
            { key: todayKey, label: '今日' },
            { key: tomorrowKey, label: '明日' },
          ].map((s) => (
            <Pressable
              key={s.key}
              onPress={() => setSelectedKey(s.key)}
              style={[styles.segItem, selectedKey === s.key && styles.segActive]}
            >
              <Text style={[styles.segText, selectedKey === s.key && styles.segTextActive]}>{s.label}</Text>
            </Pressable>
          ))}
          {!dayLabel && (
            <View style={[styles.segItem, styles.segActive]}>
              <Text style={[styles.segText, styles.segTextActive]}>{`${sel.getMonth() + 1}/${sel.getDate()}`}</Text>
            </View>
          )}
        </View>

        {tab === 'circle' ? (
          <View style={styles.circleWrap}>
            <CircleSchedule
              events={events}
              size={circleSize}
              nowMin={nowMin}
              centerTitle={center.title}
              centerSub={center.sub}
              onPressEvent={openEdit}
            />
          </View>
        ) : (
          <View style={{ marginTop: 18 }}>
            <CalendarView
              schedules={schedules}
              selectedKey={selectedKey}
              todayKey={todayKey}
              onSelect={setSelectedKey}
            />
          </View>
        )}

        <Pressable onPress={startBriefing} style={({ pressed }) => [styles.briefBtn, pressed && { opacity: 0.8 }]}>
          <View style={styles.playIcon}>
            <Text style={styles.playGlyph}>▶</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.briefTitle}>ブリーフィングを聞く</Text>
            <Text style={styles.briefSub}>
              {dayLabel ?? 'この日'}の予定 {events.length}件 を{aiBriefingEnabled ? ' AI ナレーションで' : 'ボイスで'}読み上げ
            </Text>
          </View>
        </Pressable>

        <Text style={styles.section}>タイムライン</Text>
        <EventList events={events} nowMin={nowMin} onPress={openEdit} />
      </ScrollView>

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>スケジュールを更新しました</Text>
          <Pressable onPress={startBriefing} hitSlop={8}>
            <Text style={styles.toastAction}>▶ 読み上げる</Text>
          </Pressable>
        </View>
      )}

      <Pressable onPress={openNew} style={styles.fab}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>

      <SafeAreaView edges={['bottom']} style={styles.tabBar}>
        {(
          [
            { key: 'circle', label: 'サークル', Icon: CircleTabIcon },
            { key: 'calendar', label: 'カレンダー', Icon: CalendarTabIcon },
          ] as const
        ).map((t) => (
          <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tabItem}>
            <t.Icon color={tab === t.key ? colors.accent : colors.textMuted} />
            <Text style={[styles.tabLabel, tab === t.key && { color: colors.text }]}>{t.label}</Text>
          </Pressable>
        ))}
      </SafeAreaView>

      <EventEditor
        visible={editorOpen}
        initial={editing}
        defaultStart={defaultStart}
        dayLabel={dayLabel ?? dateTitle}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setEditorOpen(false)}
      />

      <BriefingOverlay
        visible={briefing !== null}
        segments={briefing ?? []}
        index={briefIndex}
        events={events}
        title={`${dayLabel ?? ''} ${dateTitle}`.trim()}
        onStop={stopBriefing}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 140, width: '100%', maxWidth: 560, alignSelf: 'center' },
  kicker: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 5 },
  date: { color: colors.text, fontSize: 30, fontWeight: '800', marginTop: 4 },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segItem: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segActive: { backgroundColor: colors.surfaceHigh },
  segText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
  segTextActive: { color: colors.text },
  circleWrap: { alignItems: 'center', marginTop: 18 },
  briefBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 18,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(108,140,255,0.35)',
  },
  playIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: { color: '#fff', fontSize: 16, marginLeft: 3 },
  briefTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  briefSub: { color: colors.textSub, fontSize: 12, marginTop: 2 },
  section: { color: colors.textSub, fontSize: 12, letterSpacing: 2, marginTop: 26, marginBottom: 10, fontWeight: '700' },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 96,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
  toast: {
    position: 'absolute',
    left: 20,
    right: 92,
    bottom: 100,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  toastText: { color: colors.text, fontSize: 13 },
  toastAction: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingBottom: 8 },
  tabLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
