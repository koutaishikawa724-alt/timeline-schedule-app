import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CircleSchedule, { defaultHalf, describeCenter } from './src/components/CircleSchedule';
import CalendarView from './src/components/CalendarView';
import EventList from './src/components/EventList';
import EventEditor from './src/components/EventEditor';
import DiaryView from './src/components/DiaryView';
import AboutSheet from './src/components/AboutSheet';
import { CalendarTabIcon, CircleTabIcon, DiaryTabIcon, InfoIcon } from './src/components/TabIcons';
import { addDays, dateKey, fromKey, nowMinutes, weekday } from './src/date';
import { clearAllData, loadDiary, loadSchedules, saveDiary, saveSchedules } from './src/storage';
import { DiaryEntry, DiaryMap, ScheduleEvent, ScheduleMap } from './src/types';
import { colors } from './src/theme';

type Tab = 'circle' | 'calendar' | 'diary';

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
  // 下に出るお知らせ。'saved' = 保存した、'deleted' = 削除の取り消し
  const [toast, setToast] = useState<null | 'saved' | 'deleted'>(null);
  const [undo, setUndo] = useState<{ key: string; events: ScheduleEvent[]; label: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [diary, setDiary] = useState<DiaryMap>({});
  const [diaryLoaded, setDiaryLoaded] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  // 日記の写真は日ごとに読み込むので、全部消したときに読み直させるための番号
  const [dataVersion, setDataVersion] = useState(0);

  const deleteAll = async () => {
    await clearAllData();
    setSchedules({});
    setDiary({});
    setUndo(null);
    setToast(null);
    setDataVersion((v) => v + 1);
  };

  useEffect(() => {
    loadSchedules().then((s) => {
      setSchedules(s);
      setLoaded(true);
    });
    loadDiary().then((d) => {
      setDiary(d);
      setDiaryLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveSchedules(schedules);
  }, [schedules, loaded]);

  // 日記は1文字ごとに変わるので、打ち終わって少ししてから保存する
  useEffect(() => {
    if (!diaryLoaded) return;
    const t = setTimeout(() => saveDiary(diary), 400);
    return () => clearTimeout(t);
  }, [diary, diaryLoaded]);

  const changeDiary = (key: string, entry: DiaryEntry | null) =>
    setDiary((prev) => {
      const next = { ...prev };
      if (entry) next[key] = entry;
      else delete next[key];
      return next;
    });

  const events = schedules[selectedKey] ?? [];
  const isToday = selectedKey === todayKey;
  const dayLabel = isToday ? '今日' : selectedKey === tomorrowKey ? '明日' : null;
  const sel = fromKey(selectedKey);
  const dateTitle = `${sel.getMonth() + 1}月${sel.getDate()}日（${weekday(sel)}）`;
  const nowMin = isToday ? nowMinutes(now) : undefined;
  const center = describeCenter(events, nowMin);

  // 時計の文字盤は12時間ぶん。日付を切り替えたら、見るべき方（午前/午後）に合わせ直す
  const [half, setHalf] = useState<0 | 1>(0);
  const autoHalf = defaultHalf(events, nowMin);
  useEffect(() => {
    setHalf(autoHalf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);
  const halfCounts = [0, 1].map((h) => events.filter((e) => e.end > h * 720 && e.start < (h + 1) * 720).length);
  const circleSize = Math.min(width - 40, 360);

  const openNew = () => {
    setEditing(undefined);
    setEditorOpen(true);
  };
  const openEdit = (ev: ScheduleEvent) => {
    setEditing(ev);
    setEditorOpen(true);
  };

  const showToast = (kind: 'saved' | 'deleted') => {
    setToast(kind);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  };

  const handleSave = (draft: Omit<ScheduleEvent, 'id'> & { id?: string }) => {
    setSchedules((prev) => {
      const list = prev[selectedKey] ?? [];
      const next: ScheduleEvent = { ...draft, id: draft.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
      const updated = draft.id ? list.map((e) => (e.id === draft.id ? next : e)) : [...list, next];
      return { ...prev, [selectedKey]: updated.sort((a, b) => a.start - b.start) };
    });
    setEditorOpen(false);
    showToast('saved');
  };

  /** 予定を消す（ids を省くとその日の全部）。直前の状態を覚えておき「元に戻す」で戻せる */
  const deleteEvents = (ids?: string[]) => {
    const before = schedules[selectedKey] ?? [];
    const removed = ids ? before.filter((e) => ids.includes(e.id)) : before;
    if (removed.length === 0) return;
    setUndo({
      key: selectedKey,
      events: before,
      label: removed.length === 1 ? `「${removed[0].title}」を消しました` : `${removed.length}件の予定を消しました`,
    });
    setSchedules((prev) => ({ ...prev, [selectedKey]: ids ? before.filter((e) => !ids.includes(e.id)) : [] }));
    setEditorOpen(false);
    showToast('deleted');
  };

  const handleDelete = (id: string) => deleteEvents([id]);

  const undoDelete = () => {
    if (!undo) return;
    setSchedules((prev) => ({ ...prev, [undo.key]: undo.events }));
    setUndo(null);
    setToast(null);
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>{dayLabel ? (dayLabel === '今日' ? 'TODAY' : 'TOMORROW') : 'SCHEDULE'}</Text>
              <Text style={styles.date}>{dateTitle}</Text>
            </View>
            <Pressable onPress={() => setAboutOpen(true)} style={styles.info} hitSlop={8} accessibilityLabel="アプリについて">
              <InfoIcon color={colors.textSub} />
            </Pressable>
          </View>

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

          {tab === 'diary' ? (
            <DiaryView key={dataVersion} diary={diary} selectedKey={selectedKey} onChange={changeDiary} onSelect={setSelectedKey} />
          ) : tab === 'circle' ? (
            <View style={styles.circleWrap}>
              <CircleSchedule
                events={events}
                size={circleSize}
                nowMin={nowMin}
                centerTitle={center.title}
                centerSub={center.sub}
                onPressEvent={openEdit}
                half={half}
              />
              <View style={styles.halfSwitch}>
                {(['午前', '午後'] as const).map((label, h) => (
                  <Pressable
                    key={label}
                    onPress={() => setHalf(h as 0 | 1)}
                    style={[styles.halfItem, half === h && styles.halfActive]}
                  >
                    <Text style={[styles.halfText, half === h && styles.halfTextActive]}>
                      {label}
                      {halfCounts[h] ? `  ${halfCounts[h]}件` : ''}
                    </Text>
                  </Pressable>
                ))}
              </View>
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

          {tab !== 'diary' && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.section}>タイムライン</Text>
                {events.length > 1 && (
                  <Pressable onPress={() => deleteEvents()} hitSlop={8}>
                    <Text style={styles.clearAll}>すべて消す</Text>
                  </Pressable>
                )}
              </View>
              <EventList events={events} nowMin={nowMin} onPress={openEdit} onDelete={handleDelete} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {toast === 'saved' && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>スケジュールを更新しました</Text>
        </View>
      )}
      {toast === 'deleted' && undo && (
        <View style={styles.toast}>
          <Text style={[styles.toastText, { flex: 1 }]} numberOfLines={1}>
            {undo.label}
          </Text>
          <Pressable onPress={undoDelete} hitSlop={8}>
            <Text style={styles.toastAction}>元に戻す</Text>
          </Pressable>
        </View>
      )}

      {tab !== 'diary' && (
        <Pressable onPress={openNew} style={styles.fab}>
          <Text style={styles.fabText}>＋</Text>
        </Pressable>
      )}

      <SafeAreaView edges={['bottom']} style={styles.tabBar}>
        {(
          [
            { key: 'circle', label: 'サークル', Icon: CircleTabIcon },
            { key: 'calendar', label: 'カレンダー', Icon: CalendarTabIcon },
            { key: 'diary', label: '日記', Icon: DiaryTabIcon },
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

      <AboutSheet visible={aboutOpen} onClose={() => setAboutOpen(false)} onDeleteAll={deleteAll} />

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
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  info: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  halfSwitch: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  halfItem: { paddingVertical: 7, paddingHorizontal: 18, borderRadius: 9 },
  halfActive: { backgroundColor: colors.accent },
  halfText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  halfTextActive: { color: '#fff' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  clearAll: { color: colors.danger, fontSize: 12, fontWeight: '700' },
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
