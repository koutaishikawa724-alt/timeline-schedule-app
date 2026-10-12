// Timeline（スケジュールアプリ）Expo Snack 用 1ファイル版
// snack.expo.dev の App.js をすべて消して、これを貼り付けてください。


// ../../../../../../home/claude/schedule-app/App.tsx
import { useEffect as useEffect3, useMemo as useMemo2, useRef as useRef2, useState as useState4 } from "react";
import { KeyboardAvoidingView as KeyboardAvoidingView2, Platform as Platform2, Pressable as Pressable5, ScrollView as ScrollView2, StyleSheet as StyleSheet6, Text as Text6, useWindowDimensions as useWindowDimensions2, View as View6 } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// ../../../../../../home/claude/schedule-app/src/components/CircleSchedule.tsx
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Path, Text as SvgText } from "react-native-svg";

// ../../../../../../home/claude/schedule-app/src/theme.ts
var colors = {
  bg: "#090B14",
  surface: "#131626",
  surfaceHigh: "#1C2036",
  border: "#262B45",
  text: "#F2F4FF",
  textSub: "#9AA1C4",
  textMuted: "#5F6688",
  accent: "#6C8CFF",
  accentSoft: "rgba(108,140,255,0.16)",
  danger: "#FF5C7A"
};
var eventPalette = ["#4FD1FF", "#8B7CFF", "#FF6B9D", "#FFB547", "#3DDC97", "#FF7A59"];

// ../../../../../../home/claude/schedule-app/src/date.ts
var WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
function dateKey(d) {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function fromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function weekday(d) {
  return WEEKDAYS[d.getDay()];
}
var WEEKDAY_LABELS = WEEKDAYS;
function formatTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${`${m}`.padStart(2, "0")}`;
}
function nowMinutes(d = /* @__PURE__ */ new Date()) {
  return d.getHours() * 60 + d.getMinutes();
}

// ../../../../../../home/claude/schedule-app/src/components/CircleSchedule.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var DIAL = 720;
function polar(cx, cy, r, min) {
  const a = min / DIAL * Math.PI * 2 - Math.PI / 2;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function arcPath(cx, cy, rOuter, rInner, start, end) {
  const span = Math.min(end - start, DIAL - 0.01);
  const e = start + span;
  const large = span > DIAL / 2 ? 1 : 0;
  const o1 = polar(cx, cy, rOuter, start);
  const o2 = polar(cx, cy, rOuter, e);
  const i1 = polar(cx, cy, rInner, e);
  const i2 = polar(cx, cy, rInner, start);
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${i2.x} ${i2.y}`,
    "Z"
  ].join(" ");
}
function assignLanes(events) {
  const sorted = [...events].sort((a, b) => a.start - b.start);
  const laneEnds = [];
  return sorted.map((ev) => {
    let lane = laneEnds.findIndex((end) => end <= ev.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(ev.end);
    } else {
      laneEnds[lane] = ev.end;
    }
    return { ev, lane };
  });
}
function CircleSchedule({
  events,
  size,
  nowMin,
  highlightId,
  centerTitle,
  centerSub,
  onPressEvent,
  half
}) {
  const c = size / 2;
  const from = half * DIAL;
  const to = from + DIAL;
  const visible = useMemo(
    () => events.filter((e) => e.end > from && e.start < to).map((e) => ({ ...e, start: Math.max(e.start, from), end: Math.min(e.end, to) })),
    [events, from, to]
  );
  const nowOnDial = nowMin !== void 0 && nowMin >= from && nowMin < to ? nowMin : void 0;
  const ringOuter = c - 26;
  const ringWidth = size * 0.11;
  const laned = useMemo(() => assignLanes(visible), [visible]);
  const laneCount = Math.max(1, ...laned.map((l) => l.lane + 1));
  const laneWidth = ringWidth / Math.min(laneCount, 3);
  const ticks = Array.from({ length: 60 }, (_, i) => i * 12);
  return /* @__PURE__ */ jsxs(View, { style: { width: size, height: size }, children: [
    /* @__PURE__ */ jsxs(Svg, { width: size, height: size, children: [
      /* @__PURE__ */ jsx(Circle, { cx: c, cy: c, r: ringOuter - ringWidth / 2, stroke: colors.surfaceHigh, strokeWidth: ringWidth, fill: "none" }),
      /* @__PURE__ */ jsx(Circle, { cx: c, cy: c, r: ringOuter - ringWidth - 10, fill: colors.surface }),
      ticks.map((m) => {
        const major = m % 180 === 0;
        const hour = m % 60 === 0;
        const r1 = ringOuter + 4;
        const r2 = ringOuter + (major ? 12 : hour ? 8 : 5);
        const p1 = polar(c, c, r1, m);
        const p2 = polar(c, c, r2, m);
        return /* @__PURE__ */ jsx(
          Line,
          {
            x1: p1.x,
            y1: p1.y,
            x2: p2.x,
            y2: p2.y,
            stroke: major ? colors.textSub : colors.border,
            strokeWidth: major ? 2 : 1
          },
          m
        );
      }),
      [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h, i) => {
        const main = h % 3 === 0;
        const p = polar(c, c, ringOuter - ringWidth - 24, i * 60);
        return /* @__PURE__ */ jsx(
          SvgText,
          {
            x: p.x,
            y: p.y + 4,
            fontSize: main ? 14 : 10,
            fontWeight: main ? "700" : "400",
            fill: main ? colors.textSub : colors.textMuted,
            textAnchor: "middle",
            children: h
          },
          h
        );
      }),
      /* @__PURE__ */ jsx(
        SvgText,
        {
          x: c,
          y: c - (ringOuter - ringWidth - 24) + 20,
          fontSize: 9,
          fontWeight: "700",
          fill: colors.accent,
          textAnchor: "middle",
          letterSpacing: 2,
          children: half === 0 ? "AM" : "PM"
        }
      ),
      nowMin !== void 0 && nowMin > from && /* @__PURE__ */ jsx(Path, { d: arcPath(c, c, ringOuter, ringOuter - ringWidth, from, Math.min(nowMin, to)), fill: "rgba(0,0,0,0.35)" }),
      laned.map(({ ev, lane }) => {
        const l = Math.min(lane, 2);
        const rO = ringOuter - l * laneWidth;
        const rI = rO - laneWidth + 2;
        const dim = highlightId && highlightId !== ev.id;
        const active = highlightId === ev.id;
        return /* @__PURE__ */ jsxs(G, { opacity: dim ? 0.3 : 1, children: [
          active && /* @__PURE__ */ jsx(Path, { d: arcPath(c, c, rO + 6, rI - 6, ev.start, ev.end), fill: ev.color, opacity: 0.3 }),
          /* @__PURE__ */ jsx(
            Path,
            {
              d: arcPath(c, c, rO, rI, ev.start, ev.end),
              fill: ev.color,
              onPress: onPressEvent ? () => onPressEvent(events.find((e) => e.id === ev.id) ?? ev) : void 0
            }
          )
        ] }, ev.id);
      }),
      nowOnDial !== void 0 && /* @__PURE__ */ jsxs(G, { children: [
        /* @__PURE__ */ jsx(
          Line,
          {
            x1: polar(c, c, ringOuter - ringWidth - 8, nowOnDial).x,
            y1: polar(c, c, ringOuter - ringWidth - 8, nowOnDial).y,
            x2: polar(c, c, ringOuter + 10, nowOnDial).x,
            y2: polar(c, c, ringOuter + 10, nowOnDial).y,
            stroke: colors.text,
            strokeWidth: 2.5,
            strokeLinecap: "round"
          }
        ),
        /* @__PURE__ */ jsx(
          Circle,
          {
            cx: polar(c, c, ringOuter + 12, nowOnDial).x,
            cy: polar(c, c, ringOuter + 12, nowOnDial).y,
            r: 4,
            fill: colors.text
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs(View, { style: [StyleSheet.absoluteFill, styles.center], pointerEvents: "none", children: [
      /* @__PURE__ */ jsx(Text, { style: styles.centerTitle, numberOfLines: 1, children: centerTitle }),
      /* @__PURE__ */ jsx(Text, { style: styles.centerSub, numberOfLines: 2, children: centerSub })
    ] })
  ] });
}
function describeCenter(events, nowMin) {
  const sorted = [...events].sort((a, b) => a.start - b.start);
  if (nowMin === void 0) {
    return { title: `${sorted.length}件`, sub: sorted[0] ? `最初は ${formatTime(sorted[0].start)}` : "予定なし" };
  }
  const current = sorted.find((e) => e.start <= nowMin && nowMin < e.end);
  const next = sorted.find((e) => e.start > nowMin);
  return {
    title: formatTime(nowMin),
    sub: current ? `いま：${current.title}` : next ? `次：${formatTime(next.start)} ${next.title}` : sorted.length > 0 ? "今日の予定は完了" : "予定なし"
  };
}
var styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", paddingHorizontal: "30%" },
  centerTitle: { color: colors.text, fontSize: 34, fontWeight: "200", letterSpacing: 1 },
  centerSub: { color: colors.textSub, fontSize: 12, marginTop: 4, textAlign: "center" }
});
function defaultHalf(events, nowMin) {
  if (nowMin !== void 0) return nowMin < 720 ? 0 : 1;
  const first = [...events].sort((a, b) => a.start - b.start)[0];
  return first && first.start >= 720 ? 1 : 0;
}

// ../../../../../../home/claude/schedule-app/src/components/CalendarView.tsx
import { useState } from "react";
import { Pressable, StyleSheet as StyleSheet2, Text as Text2, View as View2 } from "react-native";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function CalendarView({ schedules, selectedKey, todayKey, onSelect }) {
  const [cursor, setCursor] = useState(() => {
    const [y, m] = selectedKey.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return /* @__PURE__ */ jsxs2(View2, { style: styles2.card, children: [
    /* @__PURE__ */ jsxs2(View2, { style: styles2.header, children: [
      /* @__PURE__ */ jsx2(Pressable, { onPress: () => setCursor(new Date(year, month - 1, 1)), style: styles2.nav, hitSlop: 10, children: /* @__PURE__ */ jsx2(Text2, { style: styles2.navText, children: "‹" }) }),
      /* @__PURE__ */ jsxs2(Text2, { style: styles2.month, children: [
        year,
        "年 ",
        month + 1,
        "月"
      ] }),
      /* @__PURE__ */ jsx2(Pressable, { onPress: () => setCursor(new Date(year, month + 1, 1)), style: styles2.nav, hitSlop: 10, children: /* @__PURE__ */ jsx2(Text2, { style: styles2.navText, children: "›" }) })
    ] }),
    /* @__PURE__ */ jsx2(View2, { style: styles2.week, children: WEEKDAY_LABELS.map((w, i) => /* @__PURE__ */ jsx2(Text2, { style: [styles2.weekday, i === 0 && { color: "#FF7A8F" }, i === 6 && { color: "#7FA6FF" }], children: w }, w)) }),
    /* @__PURE__ */ jsx2(View2, { style: styles2.grid, children: cells.map((d, i) => {
      if (!d) return /* @__PURE__ */ jsx2(View2, { style: styles2.cell }, `e${i}`);
      const key = dateKey(d);
      const events = schedules[key] ?? [];
      const selected = key === selectedKey;
      const today = key === todayKey;
      return /* @__PURE__ */ jsxs2(Pressable, { style: styles2.cell, onPress: () => onSelect(key), children: [
        /* @__PURE__ */ jsx2(View2, { style: [styles2.day, today && styles2.today, selected && styles2.selected], children: /* @__PURE__ */ jsx2(Text2, { style: [styles2.dayText, selected && { color: "#fff", fontWeight: "700" }], children: d.getDate() }) }),
        /* @__PURE__ */ jsx2(View2, { style: styles2.dots, children: events.slice(0, 3).map((e) => /* @__PURE__ */ jsx2(View2, { style: [styles2.dot, { backgroundColor: e.color }] }, e.id)) })
      ] }, key);
    }) })
  ] });
}
var styles2 = StyleSheet2.create({
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: colors.border },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  nav: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceHigh, alignItems: "center", justifyContent: "center" },
  navText: { color: colors.text, fontSize: 22, lineHeight: 24 },
  month: { color: colors.text, fontSize: 18, fontWeight: "700", letterSpacing: 1 },
  week: { flexDirection: "row" },
  weekday: { flex: 1, textAlign: "center", color: colors.textMuted, fontSize: 12, marginBottom: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, alignItems: "center", paddingVertical: 4 },
  day: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  today: { borderWidth: 1.5, borderColor: colors.accent },
  selected: { backgroundColor: colors.accent },
  dayText: { color: colors.text, fontSize: 15, fontVariant: ["tabular-nums"] },
  dots: { flexDirection: "row", gap: 3, height: 6, marginTop: 3 },
  dot: { width: 5, height: 5, borderRadius: 3 }
});

// ../../../../../../home/claude/schedule-app/src/components/EventList.tsx
import { Pressable as Pressable2, StyleSheet as StyleSheet3, Text as Text3, View as View3 } from "react-native";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function EventList({ events, nowMin, highlightId, onPress, onDelete }) {
  const sorted = [...events].sort((a, b) => a.start - b.start);
  if (sorted.length === 0) {
    return /* @__PURE__ */ jsxs3(View3, { style: styles3.empty, children: [
      /* @__PURE__ */ jsx3(Text3, { style: styles3.emptyTitle, children: "まだ予定がありません" }),
      /* @__PURE__ */ jsx3(Text3, { style: styles3.emptySub, children: "右下の ＋ から追加しましょう" })
    ] });
  }
  return /* @__PURE__ */ jsx3(View3, { style: { gap: 10 }, children: sorted.map((ev) => {
    const done = nowMin !== void 0 && ev.end <= nowMin;
    const live = nowMin !== void 0 && ev.start <= nowMin && nowMin < ev.end;
    const hl = highlightId === ev.id;
    return /* @__PURE__ */ jsxs3(
      Pressable2,
      {
        onPress: () => onPress(ev),
        style: [styles3.item, hl && { borderColor: ev.color }, done && { opacity: 0.45 }],
        children: [
          /* @__PURE__ */ jsx3(View3, { style: [styles3.bar, { backgroundColor: ev.color }] }),
          /* @__PURE__ */ jsxs3(View3, { style: styles3.times, children: [
            /* @__PURE__ */ jsx3(Text3, { style: styles3.start, children: formatTime(ev.start) }),
            /* @__PURE__ */ jsx3(Text3, { style: styles3.end, children: formatTime(ev.end) })
          ] }),
          /* @__PURE__ */ jsx3(Text3, { style: styles3.title, numberOfLines: 1, children: ev.title }),
          live && /* @__PURE__ */ jsx3(View3, { style: [styles3.live, { backgroundColor: ev.color }], children: /* @__PURE__ */ jsx3(Text3, { style: styles3.liveText, children: "NOW" }) }),
          onDelete && /* @__PURE__ */ jsx3(
            Pressable2,
            {
              onPress: () => onDelete(ev.id),
              hitSlop: 10,
              style: styles3.delete,
              accessibilityLabel: `${ev.title}を削除`,
              children: /* @__PURE__ */ jsx3(Text3, { style: styles3.deleteText, children: "×" })
            }
          )
        ]
      },
      ev.id
    );
  }) });
}
var styles3 = StyleSheet3.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingRight: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  bar: { width: 4, alignSelf: "stretch", borderRadius: 2, marginLeft: 10, marginRight: 14 },
  times: { width: 52 },
  start: { color: colors.text, fontSize: 15, fontWeight: "700", fontVariant: ["tabular-nums"] },
  end: { color: colors.textMuted, fontSize: 12, fontVariant: ["tabular-nums"] },
  title: { flex: 1, color: colors.text, fontSize: 16, marginLeft: 8 },
  delete: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,92,122,0.12)"
  },
  deleteText: { color: colors.danger, fontSize: 18, lineHeight: 20, fontWeight: "600" },
  live: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  liveText: { color: colors.bg, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyTitle: { color: colors.textSub, fontSize: 15 },
  emptySub: { color: colors.textMuted, fontSize: 12, marginTop: 4 }
});

// ../../../../../../home/claude/schedule-app/src/components/EventEditor.tsx
import { useEffect, useRef, useState as useState2 } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable as Pressable3,
  ScrollView,
  StyleSheet as StyleSheet4,
  Text as Text4,
  TextInput,
  View as View4
} from "react-native";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var HOURS = Array.from({ length: 24 }, (_, i) => i);
var MINUTES = [0, 15, 30, 45];
var DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240];
function durationLabel(m) {
  if (m < 60) return `${m}分`;
  return m % 60 === 0 ? `${m / 60}時間` : `${Math.floor(m / 60)}.5時間`;
}
function Chip({ label, active, onPress }) {
  return /* @__PURE__ */ jsx4(Pressable3, { onPress, style: [styles4.chip, active && styles4.chipActive], children: /* @__PURE__ */ jsx4(Text4, { style: [styles4.chipText, active && styles4.chipTextActive], children: label }) });
}
function EventEditor({ visible, initial, defaultStart, dayLabel, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState2("");
  const [hour, setHour] = useState2(9);
  const [minute, setMinute] = useState2(0);
  const [duration, setDuration] = useState2(60);
  const [color, setColor] = useState2(eventPalette[0]);
  const [missingTitle, setMissingTitle] = useState2(false);
  const inputRef = useRef(null);
  useEffect(() => {
    if (!visible) return;
    setMissingTitle(false);
    if (initial) {
      setTitle(initial.title);
      setHour(Math.floor(initial.start / 60));
      setMinute(initial.start % 60);
      setDuration(initial.end - initial.start);
      setColor(initial.color);
    } else {
      setTitle("");
      setHour(Math.floor(defaultStart / 60));
      setMinute(defaultStart % 60 - defaultStart % 60 % 15);
      setDuration(60);
      setColor(eventPalette[Math.floor(Math.random() * eventPalette.length)]);
    }
  }, [visible, initial, defaultStart]);
  const start = hour * 60 + minute;
  const end = Math.min(start + duration, 1440);
  const canSave = title.trim().length > 0;
  const trySave = () => {
    if (!canSave) {
      setMissingTitle(true);
      inputRef.current?.focus();
      return;
    }
    Keyboard.dismiss();
    onSave({ id: initial?.id, title: title.trim(), start, end, color });
  };
  return /* @__PURE__ */ jsx4(Modal, { visible, transparent: true, animationType: "slide", onRequestClose: onClose, children: /* @__PURE__ */ jsxs4(KeyboardAvoidingView, { behavior: Platform.OS === "ios" ? "padding" : void 0, style: styles4.backdrop, children: [
    /* @__PURE__ */ jsx4(Pressable3, { style: StyleSheet4.absoluteFill, onPress: onClose }),
    /* @__PURE__ */ jsxs4(View4, { style: styles4.sheet, children: [
      /* @__PURE__ */ jsx4(View4, { style: styles4.grabber }),
      /* @__PURE__ */ jsxs4(View4, { style: styles4.headerRow, children: [
        /* @__PURE__ */ jsxs4(View4, { style: { flex: 1 }, children: [
          /* @__PURE__ */ jsx4(Text4, { style: styles4.heading, children: initial ? "予定を編集" : `${dayLabel}の予定を追加` }),
          /* @__PURE__ */ jsxs4(Text4, { style: [styles4.range, { color }], children: [
            formatTime(start),
            " – ",
            formatTime(end)
          ] })
        ] }),
        /* @__PURE__ */ jsx4(Pressable3, { onPress: trySave, hitSlop: 8, style: [styles4.headerSave, { backgroundColor: color }], children: /* @__PURE__ */ jsx4(Text4, { style: [styles4.headerSaveText, { color: colors.bg }], children: "保存" }) })
      ] }),
      /* @__PURE__ */ jsx4(
        TextInput,
        {
          ref: inputRef,
          value: title,
          onChangeText: (t) => {
            setTitle(t);
            if (t.trim()) setMissingTitle(false);
          },
          placeholder: "例：朝ラン、打ち合わせ、ジム",
          placeholderTextColor: colors.textMuted,
          style: [styles4.input, missingTitle && styles4.inputError],
          autoFocus: !initial,
          returnKeyType: "done"
        }
      ),
      missingTitle && /* @__PURE__ */ jsx4(Text4, { style: styles4.error, children: "予定の名前を入れてください" }),
      /* @__PURE__ */ jsxs4(
        ScrollView,
        {
          style: styles4.body,
          keyboardShouldPersistTaps: "handled",
          keyboardDismissMode: "on-drag",
          showsVerticalScrollIndicator: false,
          children: [
            /* @__PURE__ */ jsx4(Text4, { style: styles4.label, children: "開始（時）" }),
            /* @__PURE__ */ jsx4(View4, { style: styles4.hourGrid, children: HOURS.map((h) => /* @__PURE__ */ jsx4(View4, { style: styles4.hourCell, children: /* @__PURE__ */ jsx4(Chip, { label: `${h}`, active: h === hour, onPress: () => setHour(h) }) }, h)) }),
            /* @__PURE__ */ jsx4(Text4, { style: styles4.label, children: "開始（分）" }),
            /* @__PURE__ */ jsx4(View4, { style: styles4.row, children: MINUTES.map((m) => /* @__PURE__ */ jsx4(Chip, { label: `:${`${m}`.padStart(2, "0")}`, active: m === minute, onPress: () => setMinute(m) }, m)) }),
            /* @__PURE__ */ jsx4(Text4, { style: styles4.label, children: "長さ" }),
            /* @__PURE__ */ jsx4(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: styles4.row, children: DURATIONS.map((d) => /* @__PURE__ */ jsx4(Chip, { label: durationLabel(d), active: d === duration, onPress: () => setDuration(d) }, d)) }),
            /* @__PURE__ */ jsx4(Text4, { style: styles4.label, children: "カラー" }),
            /* @__PURE__ */ jsx4(View4, { style: styles4.row, children: eventPalette.map((p) => /* @__PURE__ */ jsx4(
              Pressable3,
              {
                onPress: () => setColor(p),
                style: [styles4.swatch, { backgroundColor: p }, p === color && styles4.swatchActive]
              },
              p
            )) }),
            /* @__PURE__ */ jsxs4(View4, { style: styles4.actions, children: [
              initial && onDelete && /* @__PURE__ */ jsx4(Pressable3, { onPress: () => onDelete(initial.id), style: [styles4.button, styles4.deleteButton], children: /* @__PURE__ */ jsx4(Text4, { style: [styles4.buttonText, { color: colors.danger }], children: "削除" }) }),
              /* @__PURE__ */ jsx4(
                Pressable3,
                {
                  onPress: trySave,
                  style: [styles4.button, styles4.saveButton, { backgroundColor: color }],
                  children: /* @__PURE__ */ jsx4(Text4, { style: [styles4.buttonText, { color: colors.bg }], children: "保存" })
                }
              )
            ] })
          ]
        }
      )
    ] })
  ] }) });
}
var styles4 = StyleSheet4.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
    maxWidth: 560,
    maxHeight: "94%",
    alignSelf: "center"
  },
  body: { flexShrink: 1 },
  headerSave: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14, marginLeft: 12 },
  headerSaveText: { fontSize: 15, fontWeight: "700" },
  inputError: { borderWidth: 1, borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 13, marginBottom: 4 },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  heading: { color: colors.text, fontSize: 18, fontWeight: "700" },
  range: { marginTop: 2, fontSize: 16, fontWeight: "600", fontVariant: ["tabular-nums"] },
  input: {
    backgroundColor: colors.surfaceHigh,
    color: colors.text,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 8
  },
  label: { color: colors.textSub, fontSize: 12, marginTop: 14, marginBottom: 8, letterSpacing: 1 },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  hourGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -3 },
  hourCell: { width: `${100 / 8}%`, padding: 3 },
  chip: {
    minWidth: 40,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: colors.surfaceHigh,
    alignItems: "center"
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.textSub, fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
  chipTextActive: { color: "#fff" },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 3, borderColor: "transparent" },
  swatchActive: { borderColor: colors.text },
  actions: { flexDirection: "row", gap: 10, marginTop: 24 },
  button: { flex: 1, paddingVertical: 15, borderRadius: 16, alignItems: "center" },
  deleteButton: { flex: 0.5, backgroundColor: "rgba(255,92,122,0.12)" },
  saveButton: {},
  buttonText: { fontSize: 16, fontWeight: "700" }
});

// ../../../../../../home/claude/schedule-app/src/components/DiaryView.tsx
import { useEffect as useEffect2, useState as useState3 } from "react";
import { Image, Keyboard as Keyboard2, Modal as Modal2, Pressable as Pressable4, StyleSheet as StyleSheet5, Text as Text5, TextInput as TextInput2, useWindowDimensions, View as View5 } from "react-native";
import * as ImagePicker from "expo-image-picker";

// ../../../../../../home/claude/schedule-app/src/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
var KEY = "schedule.v1";
async function loadSchedules() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
async function saveSchedules(map) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(map));
  } catch {
  }
}
var DIARY_KEY = "diary.v1";
async function loadDiary() {
  try {
    const raw = await AsyncStorage.getItem(DIARY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
async function saveDiary(map) {
  try {
    await AsyncStorage.setItem(DIARY_KEY, JSON.stringify(map));
  } catch {
  }
}
var photoKey = (dayKey) => `diaryPhotos.v1:${dayKey}`;
async function loadDiaryPhotos(dayKey) {
  try {
    const raw = await AsyncStorage.getItem(photoKey(dayKey));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
async function saveDiaryPhotos(dayKey, photos) {
  try {
    if (photos.length) await AsyncStorage.setItem(photoKey(dayKey), JSON.stringify(photos));
    else await AsyncStorage.removeItem(photoKey(dayKey));
  } catch {
  }
}

// ../../../../../../home/claude/schedule-app/src/components/MoodFace.tsx
import Svg2, { Circle as Circle2, Path as Path2 } from "react-native-svg";
import { Fragment, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function MoodFace({ level, color, size = 30 }) {
  const s = { stroke: color, strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
  const eyes = (() => {
    switch (level) {
      case 0:
        return /* @__PURE__ */ jsxs5(Fragment, { children: [
          /* @__PURE__ */ jsx5(Path2, { d: "M10.2 13.6 Q12 11.4 13.8 13.6", ...s }),
          /* @__PURE__ */ jsx5(Path2, { d: "M18.2 13.6 Q20 11.4 21.8 13.6", ...s })
        ] });
      case 4:
        return /* @__PURE__ */ jsxs5(Fragment, { children: [
          /* @__PURE__ */ jsx5(Path2, { d: "M10.4 11.6 L13.4 13.1 L10.4 14.6", ...s }),
          /* @__PURE__ */ jsx5(Path2, { d: "M21.6 11.6 L18.6 13.1 L21.6 14.6", ...s })
        ] });
      default:
        return /* @__PURE__ */ jsxs5(Fragment, { children: [
          /* @__PURE__ */ jsx5(Circle2, { cx: 12, cy: 13, r: 1.25, fill: color }),
          /* @__PURE__ */ jsx5(Circle2, { cx: 20, cy: 13, r: 1.25, fill: color })
        ] });
    }
  })();
  const mouth = [
    "M10.5 18.6 Q16 24.6 21.5 18.6",
    // 大きな笑顔
    "M11.8 19.4 Q16 22.6 20.2 19.4",
    // ほほえみ
    "M12.2 20.4 L19.8 20.2",
    // まっすぐ
    "M12 21.4 Q16 18.6 20 21.2",
    // への字
    "M11 21.2 Q12.8 19.4 14.6 21.2 Q16.4 23 18.2 21.2 Q19.6 19.8 21 21"
    // 波線
  ][level];
  return /* @__PURE__ */ jsxs5(Svg2, { width: size, height: size, viewBox: "0 0 32 32", children: [
    /* @__PURE__ */ jsx5(Path2, { d: "M16 3.2 C23.4 3.1 28.9 8.6 28.8 16.1 C28.7 23.5 23.3 28.9 15.8 28.8 C8.5 28.7 3.1 23.2 3.2 15.9 C3.3 8.6 8.7 3.3 16 3.2 Z", ...s }),
    eyes,
    /* @__PURE__ */ jsx5(Path2, { d: mouth, ...s })
  ] });
}

// ../../../../../../home/claude/schedule-app/src/components/DiaryView.tsx
import { Fragment as Fragment2, jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var MOODS = ["最高", "いい", "ふつう", "いまいち", "つらい"];
var shortDate = (key) => {
  const d = fromKey(key);
  return `${d.getMonth() + 1}/${d.getDate()}（${weekday(d)}）`;
};
var MAX_PHOTOS = 6;
var clock = (ms) => {
  const d = new Date(ms);
  return `${d.getHours()}:${`${d.getMinutes()}`.padStart(2, "0")}`;
};
function DiaryView({ diary, selectedKey, onChange, onSelect }) {
  const { width } = useWindowDimensions();
  const [focused, setFocused] = useState3(false);
  const [photos, setPhotos] = useState3([]);
  const [viewing, setViewing] = useState3(null);
  const [photoError, setPhotoError] = useState3("");
  const entry = diary[selectedKey];
  const text = entry?.text ?? "";
  useEffect2(() => {
    let alive = true;
    setPhotos([]);
    setPhotoError("");
    loadDiaryPhotos(selectedKey).then((p) => alive && setPhotos(p));
    return () => {
      alive = false;
    };
  }, [selectedKey]);
  const update = (patch) => {
    const next = { text, mood: entry?.mood, photos: entry?.photos, ...patch, updatedAt: Date.now() };
    onChange(selectedKey, next.text.trim() || next.mood !== void 0 || next.photos ? next : null);
  };
  const setDayPhotos = (next) => {
    setPhotos(next);
    saveDiaryPhotos(selectedKey, next);
    update({ photos: next.length || void 0 });
  };
  const addPhotos = async () => {
    setPhotoError("");
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: MAX_PHOTOS - photos.length,
        // 端末の中に保存するので、小さめに圧縮して文字データとして持つ
        quality: 0.35,
        base64: true
      });
      if (res.canceled) return;
      const added = res.assets.filter((a) => a.base64 || a.uri.startsWith("data:")).map((a, i) => ({
        id: `${Date.now()}-${i}`,
        uri: a.base64 ? `data:${a.mimeType ?? "image/jpeg"};base64,${a.base64}` : a.uri,
        width: a.width || 1,
        height: a.height || 1
      }));
      setDayPhotos([...photos, ...added].slice(0, MAX_PHOTOS));
    } catch {
      setPhotoError("写真を開けませんでした。設定アプリで写真へのアクセスを許可してください。");
    }
  };
  const tile = Math.floor((Math.min(width, 560) - 40 - 16) / 3);
  const sel = fromKey(selectedKey);
  const prevKey = dateKey(addDays(sel, -1));
  const nextKey = dateKey(addDays(sel, 1));
  const recent = Object.keys(diary).filter((k) => k !== selectedKey).sort((a, b) => a < b ? 1 : -1).slice(0, 10);
  return /* @__PURE__ */ jsxs6(View5, { style: { marginTop: 18 }, children: [
    /* @__PURE__ */ jsxs6(View5, { style: styles5.nav, children: [
      /* @__PURE__ */ jsx6(Pressable4, { onPress: () => onSelect(prevKey), hitSlop: 8, style: styles5.navBtn, children: /* @__PURE__ */ jsxs6(Text5, { style: styles5.navText, children: [
        "‹ ",
        shortDate(prevKey)
      ] }) }),
      /* @__PURE__ */ jsx6(Pressable4, { onPress: () => onSelect(nextKey), hitSlop: 8, style: styles5.navBtn, children: /* @__PURE__ */ jsxs6(Text5, { style: styles5.navText, children: [
        shortDate(nextKey),
        " ›"
      ] }) })
    ] }),
    /* @__PURE__ */ jsx6(Text5, { style: styles5.label, children: "気分" }),
    /* @__PURE__ */ jsx6(View5, { style: styles5.moods, children: MOODS.map((label, i) => {
      const active = entry?.mood === i;
      return /* @__PURE__ */ jsxs6(
        Pressable4,
        {
          onPress: () => update({ mood: active ? void 0 : i }),
          style: [styles5.mood, active && styles5.moodActive],
          children: [
            /* @__PURE__ */ jsx6(MoodFace, { level: i, color: active ? colors.accent : colors.textSub }),
            /* @__PURE__ */ jsx6(Text5, { style: [styles5.moodLabel, active && { color: colors.text }], children: label })
          ]
        },
        label
      );
    }) }),
    /* @__PURE__ */ jsxs6(View5, { style: styles5.labelRow, children: [
      /* @__PURE__ */ jsx6(Text5, { style: styles5.label, children: "日記" }),
      focused && /* @__PURE__ */ jsx6(Pressable4, { onPress: () => Keyboard2.dismiss(), hitSlop: 8, children: /* @__PURE__ */ jsx6(Text5, { style: styles5.done, children: "完了" }) })
    ] }),
    /* @__PURE__ */ jsx6(
      TextInput2,
      {
        value: text,
        onChangeText: (t) => update({ text: t }),
        onFocus: () => setFocused(true),
        onBlur: () => setFocused(false),
        placeholder: "どんな一日でしたか？ 思ったことを自由に書きましょう",
        placeholderTextColor: colors.textMuted,
        style: styles5.input,
        multiline: true,
        textAlignVertical: "top"
      }
    ),
    /* @__PURE__ */ jsx6(Text5, { style: styles5.status, children: entry ? `保存しました（${clock(entry.updatedAt)}）・${text.length}文字` : "書くと自動で保存されます" }),
    /* @__PURE__ */ jsx6(Text5, { style: [styles5.label, { marginTop: 22 }], children: "写真" }),
    /* @__PURE__ */ jsxs6(View5, { style: styles5.grid, children: [
      photos.map((p) => /* @__PURE__ */ jsxs6(Pressable4, { onPress: () => setViewing(p), style: { width: tile, height: tile }, children: [
        /* @__PURE__ */ jsx6(Image, { source: { uri: p.uri }, style: styles5.thumb }),
        /* @__PURE__ */ jsx6(
          Pressable4,
          {
            onPress: () => setDayPhotos(photos.filter((x) => x.id !== p.id)),
            hitSlop: 8,
            style: styles5.remove,
            accessibilityLabel: "写真を外す",
            children: /* @__PURE__ */ jsx6(Text5, { style: styles5.removeText, children: "×" })
          }
        )
      ] }, p.id)),
      photos.length < MAX_PHOTOS && /* @__PURE__ */ jsxs6(Pressable4, { onPress: addPhotos, style: [styles5.add, { width: tile, height: tile }], children: [
        /* @__PURE__ */ jsx6(Text5, { style: styles5.addPlus, children: "＋" }),
        /* @__PURE__ */ jsx6(Text5, { style: styles5.addText, children: "写真を追加" })
      ] })
    ] }),
    photoError ? /* @__PURE__ */ jsx6(Text5, { style: [styles5.status, { color: colors.danger }], children: photoError }) : null,
    /* @__PURE__ */ jsx6(Modal2, { visible: viewing !== null, transparent: true, animationType: "fade", onRequestClose: () => setViewing(null), children: /* @__PURE__ */ jsxs6(Pressable4, { style: styles5.viewer, onPress: () => setViewing(null), children: [
      viewing && /* @__PURE__ */ jsx6(
        Image,
        {
          source: { uri: viewing.uri },
          style: { width: "100%", aspectRatio: viewing.width / viewing.height, maxHeight: "85%" },
          resizeMode: "contain"
        }
      ),
      /* @__PURE__ */ jsx6(Text5, { style: styles5.viewerHint, children: "タップで閉じる" })
    ] }) }),
    recent.length > 0 && /* @__PURE__ */ jsxs6(Fragment2, { children: [
      /* @__PURE__ */ jsx6(Text5, { style: [styles5.label, { marginTop: 26 }], children: "これまでの日記" }),
      recent.map((k) => {
        const e = diary[k];
        const first = e.text.trim().split("\n")[0];
        return /* @__PURE__ */ jsxs6(Pressable4, { onPress: () => onSelect(k), style: styles5.item, children: [
          e.mood !== void 0 ? /* @__PURE__ */ jsx6(MoodFace, { level: e.mood, color: colors.textSub, size: 26 }) : /* @__PURE__ */ jsx6(View5, { style: styles5.itemDot }),
          /* @__PURE__ */ jsxs6(View5, { style: { flex: 1 }, children: [
            /* @__PURE__ */ jsxs6(Text5, { style: styles5.itemDate, children: [
              shortDate(k),
              e.photos ? `　写真 ${e.photos}枚` : ""
            ] }),
            /* @__PURE__ */ jsx6(Text5, { style: styles5.itemText, numberOfLines: 1, children: first || (e.photos ? "（写真だけ）" : "（気分だけ記録）") })
          ] })
        ] }, k);
      })
    ] })
  ] });
}
var styles5 = StyleSheet5.create({
  nav: { flexDirection: "row", justifyContent: "space-between" },
  navBtn: { paddingVertical: 6 },
  navText: { color: colors.textSub, fontSize: 13, fontWeight: "600" },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  label: { color: colors.textSub, fontSize: 12, letterSpacing: 2, marginTop: 18, marginBottom: 10, fontWeight: "700" },
  done: { color: colors.accent, fontSize: 15, fontWeight: "700" },
  moods: { flexDirection: "row", gap: 6 },
  mood: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  moodActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  moodLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4, fontWeight: "600" },
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
    lineHeight: 26
  },
  status: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  thumb: { width: "100%", height: "100%", borderRadius: 12, backgroundColor: colors.surfaceHigh },
  remove: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center"
  },
  removeText: { color: "#fff", fontSize: 15, fontWeight: "700", marginTop: -1 },
  add: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  addPlus: { color: colors.accent, fontSize: 26, fontWeight: "300" },
  addText: { color: colors.textSub, fontSize: 11, marginTop: 2, fontWeight: "600" },
  viewer: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)", alignItems: "center", justifyContent: "center", padding: 16 },
  viewerHint: { color: colors.textMuted, fontSize: 12, marginTop: 16 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  itemDot: { width: 26, alignItems: "center", height: 26, borderRadius: 13, borderWidth: 1.9, borderColor: colors.border },
  itemDate: { color: colors.textSub, fontSize: 12, fontWeight: "700" },
  itemText: { color: colors.text, fontSize: 15, marginTop: 2 }
});

// ../../../../../../home/claude/schedule-app/src/components/TabIcons.tsx
import Svg3, { Circle as Circle3, Line as Line2, Path as Path3, Rect } from "react-native-svg";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function CircleTabIcon({ color }) {
  return /* @__PURE__ */ jsxs7(Svg3, { width: 24, height: 24, viewBox: "0 0 24 24", children: [
    /* @__PURE__ */ jsx7(Circle3, { cx: 12, cy: 12, r: 8.5, stroke: color, strokeWidth: 2, fill: "none", opacity: 0.45 }),
    /* @__PURE__ */ jsx7(Path3, { d: "M12 3.5 A8.5 8.5 0 0 1 20.5 12", stroke: color, strokeWidth: 2.4, fill: "none", strokeLinecap: "round" }),
    /* @__PURE__ */ jsx7(Line2, { x1: 12, y1: 12, x2: 12, y2: 7, stroke: color, strokeWidth: 2, strokeLinecap: "round" }),
    /* @__PURE__ */ jsx7(Line2, { x1: 12, y1: 12, x2: 15, y2: 14, stroke: color, strokeWidth: 2, strokeLinecap: "round" })
  ] });
}
function CalendarTabIcon({ color }) {
  return /* @__PURE__ */ jsxs7(Svg3, { width: 24, height: 24, viewBox: "0 0 24 24", children: [
    /* @__PURE__ */ jsx7(Rect, { x: 3.5, y: 5, width: 17, height: 15, rx: 3, stroke: color, strokeWidth: 2, fill: "none" }),
    /* @__PURE__ */ jsx7(Line2, { x1: 3.5, y1: 10, x2: 20.5, y2: 10, stroke: color, strokeWidth: 2 }),
    /* @__PURE__ */ jsx7(Line2, { x1: 8, y1: 3, x2: 8, y2: 7, stroke: color, strokeWidth: 2, strokeLinecap: "round" }),
    /* @__PURE__ */ jsx7(Line2, { x1: 16, y1: 3, x2: 16, y2: 7, stroke: color, strokeWidth: 2, strokeLinecap: "round" })
  ] });
}
function DiaryTabIcon({ color }) {
  return /* @__PURE__ */ jsxs7(Svg3, { width: 24, height: 24, viewBox: "0 0 24 24", children: [
    /* @__PURE__ */ jsx7(Rect, { x: 5, y: 3.5, width: 14, height: 17, rx: 2.5, stroke: color, strokeWidth: 2, fill: "none" }),
    /* @__PURE__ */ jsx7(Line2, { x1: 8.5, y1: 8.5, x2: 15.5, y2: 8.5, stroke: color, strokeWidth: 2, strokeLinecap: "round" }),
    /* @__PURE__ */ jsx7(Line2, { x1: 8.5, y1: 12, x2: 15.5, y2: 12, stroke: color, strokeWidth: 2, strokeLinecap: "round" }),
    /* @__PURE__ */ jsx7(Line2, { x1: 8.5, y1: 15.5, x2: 12.5, y2: 15.5, stroke: color, strokeWidth: 2, strokeLinecap: "round" })
  ] });
}

// ../../../../../../home/claude/schedule-app/App.tsx
import { Fragment as Fragment3, jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function useNow() {
  const [now, setNow] = useState4(() => /* @__PURE__ */ new Date());
  useEffect3(() => {
    const t = setInterval(() => setNow(/* @__PURE__ */ new Date()), 3e4);
    return () => clearInterval(t);
  }, []);
  return now;
}
function Main() {
  const { width } = useWindowDimensions2();
  const now = useNow();
  const todayKey = dateKey(now);
  const tomorrowKey = dateKey(addDays(now, 1));
  const [schedules, setSchedules] = useState4({});
  const [loaded, setLoaded] = useState4(false);
  const [selectedKey, setSelectedKey] = useState4(todayKey);
  const [tab, setTab] = useState4("circle");
  const [editing, setEditing] = useState4();
  const [editorOpen, setEditorOpen] = useState4(false);
  const [toast, setToast] = useState4(null);
  const [undo, setUndo] = useState4(null);
  const toastTimer = useRef2(null);
  const [diary, setDiary] = useState4({});
  const [diaryLoaded, setDiaryLoaded] = useState4(false);
  useEffect3(() => {
    loadSchedules().then((s) => {
      setSchedules(s);
      setLoaded(true);
    });
    loadDiary().then((d) => {
      setDiary(d);
      setDiaryLoaded(true);
    });
  }, []);
  useEffect3(() => {
    if (loaded) saveSchedules(schedules);
  }, [schedules, loaded]);
  useEffect3(() => {
    if (!diaryLoaded) return;
    const t = setTimeout(() => saveDiary(diary), 400);
    return () => clearTimeout(t);
  }, [diary, diaryLoaded]);
  const changeDiary = (key, entry) => setDiary((prev) => {
    const next = { ...prev };
    if (entry) next[key] = entry;
    else delete next[key];
    return next;
  });
  const events = schedules[selectedKey] ?? [];
  const isToday = selectedKey === todayKey;
  const dayLabel = isToday ? "今日" : selectedKey === tomorrowKey ? "明日" : null;
  const sel = fromKey(selectedKey);
  const dateTitle = `${sel.getMonth() + 1}月${sel.getDate()}日（${weekday(sel)}）`;
  const nowMin = isToday ? nowMinutes(now) : void 0;
  const center = describeCenter(events, nowMin);
  const [half, setHalf] = useState4(0);
  const autoHalf = defaultHalf(events, nowMin);
  useEffect3(() => {
    setHalf(autoHalf);
  }, [selectedKey]);
  const halfCounts = [0, 1].map((h) => events.filter((e) => e.end > h * 720 && e.start < (h + 1) * 720).length);
  const circleSize = Math.min(width - 40, 360);
  const openNew = () => {
    setEditing(void 0);
    setEditorOpen(true);
  };
  const openEdit = (ev) => {
    setEditing(ev);
    setEditorOpen(true);
  };
  const showToast = (kind) => {
    setToast(kind);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 6e3);
  };
  const handleSave = (draft) => {
    setSchedules((prev) => {
      const list = prev[selectedKey] ?? [];
      const next = { ...draft, id: draft.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
      const updated = draft.id ? list.map((e) => e.id === draft.id ? next : e) : [...list, next];
      return { ...prev, [selectedKey]: updated.sort((a, b) => a.start - b.start) };
    });
    setEditorOpen(false);
    showToast("saved");
  };
  const deleteEvents = (ids) => {
    const before = schedules[selectedKey] ?? [];
    const removed = ids ? before.filter((e) => ids.includes(e.id)) : before;
    if (removed.length === 0) return;
    setUndo({
      key: selectedKey,
      events: before,
      label: removed.length === 1 ? `「${removed[0].title}」を消しました` : `${removed.length}件の予定を消しました`
    });
    setSchedules((prev) => ({ ...prev, [selectedKey]: ids ? before.filter((e) => !ids.includes(e.id)) : [] }));
    setEditorOpen(false);
    showToast("deleted");
  };
  const handleDelete = (id) => deleteEvents([id]);
  const undoDelete = () => {
    if (!undo) return;
    setSchedules((prev) => ({ ...prev, [undo.key]: undo.events }));
    setUndo(null);
    setToast(null);
  };
  const defaultStart = useMemo2(() => {
    const sorted = [...events].sort((a, b) => a.start - b.start);
    const last = sorted[sorted.length - 1];
    if (last) return Math.min(last.end, 23 * 60);
    return isToday ? Math.min(Math.ceil(nowMinutes(now) / 60) * 60, 23 * 60) : 9 * 60;
  }, [events, isToday, now]);
  return /* @__PURE__ */ jsxs8(SafeAreaView, { style: styles6.root, edges: ["top", "left", "right"], children: [
    /* @__PURE__ */ jsx8(StatusBar, { style: "light" }),
    /* @__PURE__ */ jsx8(KeyboardAvoidingView2, { style: { flex: 1 }, behavior: Platform2.OS === "ios" ? "padding" : void 0, children: /* @__PURE__ */ jsxs8(
      ScrollView2,
      {
        contentContainerStyle: styles6.scroll,
        showsVerticalScrollIndicator: false,
        keyboardShouldPersistTaps: "handled",
        keyboardDismissMode: "interactive",
        children: [
          /* @__PURE__ */ jsx8(View6, { style: styles6.headerRow, children: /* @__PURE__ */ jsxs8(View6, { style: { flex: 1 }, children: [
            /* @__PURE__ */ jsx8(Text6, { style: styles6.kicker, children: dayLabel ? dayLabel === "今日" ? "TODAY" : "TOMORROW" : "SCHEDULE" }),
            /* @__PURE__ */ jsx8(Text6, { style: styles6.date, children: dateTitle })
          ] }) }),
          /* @__PURE__ */ jsxs8(View6, { style: styles6.segment, children: [
            [
              { key: todayKey, label: "今日" },
              { key: tomorrowKey, label: "明日" }
            ].map((s) => /* @__PURE__ */ jsx8(
              Pressable5,
              {
                onPress: () => setSelectedKey(s.key),
                style: [styles6.segItem, selectedKey === s.key && styles6.segActive],
                children: /* @__PURE__ */ jsx8(Text6, { style: [styles6.segText, selectedKey === s.key && styles6.segTextActive], children: s.label })
              },
              s.key
            )),
            !dayLabel && /* @__PURE__ */ jsx8(View6, { style: [styles6.segItem, styles6.segActive], children: /* @__PURE__ */ jsx8(Text6, { style: [styles6.segText, styles6.segTextActive], children: `${sel.getMonth() + 1}/${sel.getDate()}` }) })
          ] }),
          tab === "diary" ? /* @__PURE__ */ jsx8(DiaryView, { diary, selectedKey, onChange: changeDiary, onSelect: setSelectedKey }) : tab === "circle" ? /* @__PURE__ */ jsxs8(View6, { style: styles6.circleWrap, children: [
            /* @__PURE__ */ jsx8(
              CircleSchedule,
              {
                events,
                size: circleSize,
                nowMin,
                centerTitle: center.title,
                centerSub: center.sub,
                onPressEvent: openEdit,
                half
              }
            ),
            /* @__PURE__ */ jsx8(View6, { style: styles6.halfSwitch, children: ["午前", "午後"].map((label, h) => /* @__PURE__ */ jsx8(
              Pressable5,
              {
                onPress: () => setHalf(h),
                style: [styles6.halfItem, half === h && styles6.halfActive],
                children: /* @__PURE__ */ jsxs8(Text6, { style: [styles6.halfText, half === h && styles6.halfTextActive], children: [
                  label,
                  halfCounts[h] ? `  ${halfCounts[h]}件` : ""
                ] })
              },
              label
            )) })
          ] }) : /* @__PURE__ */ jsx8(View6, { style: { marginTop: 18 }, children: /* @__PURE__ */ jsx8(
            CalendarView,
            {
              schedules,
              selectedKey,
              todayKey,
              onSelect: setSelectedKey
            }
          ) }),
          tab !== "diary" && /* @__PURE__ */ jsxs8(Fragment3, { children: [
            /* @__PURE__ */ jsxs8(View6, { style: styles6.sectionRow, children: [
              /* @__PURE__ */ jsx8(Text6, { style: styles6.section, children: "タイムライン" }),
              events.length > 1 && /* @__PURE__ */ jsx8(Pressable5, { onPress: () => deleteEvents(), hitSlop: 8, children: /* @__PURE__ */ jsx8(Text6, { style: styles6.clearAll, children: "すべて消す" }) })
            ] }),
            /* @__PURE__ */ jsx8(EventList, { events, nowMin, onPress: openEdit, onDelete: handleDelete })
          ] })
        ]
      }
    ) }),
    toast === "saved" && /* @__PURE__ */ jsx8(View6, { style: styles6.toast, children: /* @__PURE__ */ jsx8(Text6, { style: styles6.toastText, children: "スケジュールを更新しました" }) }),
    toast === "deleted" && undo && /* @__PURE__ */ jsxs8(View6, { style: styles6.toast, children: [
      /* @__PURE__ */ jsx8(Text6, { style: [styles6.toastText, { flex: 1 }], numberOfLines: 1, children: undo.label }),
      /* @__PURE__ */ jsx8(Pressable5, { onPress: undoDelete, hitSlop: 8, children: /* @__PURE__ */ jsx8(Text6, { style: styles6.toastAction, children: "元に戻す" }) })
    ] }),
    tab !== "diary" && /* @__PURE__ */ jsx8(Pressable5, { onPress: openNew, style: styles6.fab, children: /* @__PURE__ */ jsx8(Text6, { style: styles6.fabText, children: "＋" }) }),
    /* @__PURE__ */ jsx8(SafeAreaView, { edges: ["bottom"], style: styles6.tabBar, children: [
      { key: "circle", label: "サークル", Icon: CircleTabIcon },
      { key: "calendar", label: "カレンダー", Icon: CalendarTabIcon },
      { key: "diary", label: "日記", Icon: DiaryTabIcon }
    ].map((t) => /* @__PURE__ */ jsxs8(Pressable5, { onPress: () => setTab(t.key), style: styles6.tabItem, children: [
      /* @__PURE__ */ jsx8(t.Icon, { color: tab === t.key ? colors.accent : colors.textMuted }),
      /* @__PURE__ */ jsx8(Text6, { style: [styles6.tabLabel, tab === t.key && { color: colors.text }], children: t.label })
    ] }, t.key)) }),
    /* @__PURE__ */ jsx8(
      EventEditor,
      {
        visible: editorOpen,
        initial: editing,
        defaultStart,
        dayLabel: dayLabel ?? dateTitle,
        onSave: handleSave,
        onDelete: handleDelete,
        onClose: () => setEditorOpen(false)
      }
    )
  ] });
}
function App() {
  return /* @__PURE__ */ jsx8(SafeAreaProvider, { children: /* @__PURE__ */ jsx8(Main, {}) });
}
var styles6 = StyleSheet6.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 140, width: "100%", maxWidth: 560, alignSelf: "center" },
  headerRow: { flexDirection: "row", alignItems: "center" },
  kicker: { color: colors.accent, fontSize: 12, fontWeight: "700", letterSpacing: 5 },
  date: { color: colors.text, fontSize: 30, fontWeight: "800", marginTop: 4 },
  segment: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  segItem: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  segActive: { backgroundColor: colors.surfaceHigh },
  segText: { color: colors.textMuted, fontSize: 15, fontWeight: "600" },
  segTextActive: { color: colors.text },
  circleWrap: { alignItems: "center", marginTop: 18 },
  halfSwitch: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  halfItem: { paddingVertical: 7, paddingHorizontal: 18, borderRadius: 9 },
  halfActive: { backgroundColor: colors.accent },
  halfText: { color: colors.textMuted, fontSize: 13, fontWeight: "700" },
  halfTextActive: { color: "#fff" },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  clearAll: { color: colors.danger, fontSize: 12, fontWeight: "700" },
  section: { color: colors.textSub, fontSize: 12, letterSpacing: 2, marginTop: 26, marginBottom: 10, fontWeight: "700" },
  fab: {
    position: "absolute",
    right: 22,
    bottom: 96,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8
  },
  fabText: { color: "#fff", fontSize: 28, fontWeight: "300", marginTop: -2 },
  toast: {
    position: "absolute",
    left: 20,
    right: 92,
    bottom: 100,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border
  },
  toastText: { color: colors.text, fontSize: 13 },
  toastAction: { color: colors.accent, fontSize: 13, fontWeight: "700" },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8
  },
  tabItem: { flex: 1, alignItems: "center", paddingBottom: 8 },
  tabLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 }
});
export {
  App as default
};
