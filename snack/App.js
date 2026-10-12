// Timeline（スケジュールアプリ）Expo Snack 用 1ファイル版
// snack.expo.dev の App.js をすべて消して、これを貼り付けてください。

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// wav:../assets/sounds/intro.wav
var require_intro = __commonJS({
  "wav:../assets/sounds/intro.wav"(exports, module) {
    module.exports = null;
  }
});

// wav:../assets/sounds/bgm.wav
var require_bgm = __commonJS({
  "wav:../assets/sounds/bgm.wav"(exports, module) {
    module.exports = null;
  }
});

// ../../../../../../home/claude/schedule-app/App.tsx
import { useCallback, useEffect as useEffect4, useMemo as useMemo2, useRef as useRef3, useState as useState4 } from "react";
import { Pressable as Pressable6, ScrollView as ScrollView3, StyleSheet as StyleSheet7, Text as Text7, useWindowDimensions, View as View7 } from "react-native";
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
function speakTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}時` : `${h}時${m}分`;
}
function speakDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  if (m === 30) return `${h}時間半`;
  return `${h}時間${m}分`;
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

// ../../../../../../home/claude/schedule-app/src/components/BriefingOverlay.tsx
import { useEffect as useEffect2, useRef as useRef2 } from "react";
import { Animated, Easing, Modal as Modal2, Pressable as Pressable4, StyleSheet as StyleSheet5, Text as Text5, View as View5 } from "react-native";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function BriefingOverlay({ visible, segments, index, events, title, onStop }) {
  const pulse = useRef2(new Animated.Value(0)).current;
  const fade = useRef2(new Animated.Value(0)).current;
  useEffect2(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, pulse]);
  useEffect2(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [index, fade]);
  const preparing = segments.length === 0;
  const seg = segments[index];
  const ev = events.find((e) => e.id === seg?.eventId);
  const accent = ev?.color ?? colors.accent;
  const halfRef = useRef2(defaultHalf(events));
  if (ev) halfRef.current = ev.start >= 720 ? 1 : 0;
  else if (index === 0) halfRef.current = defaultHalf(events);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const glow = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] });
  return /* @__PURE__ */ jsx5(Modal2, { visible, animationType: "fade", transparent: true, onRequestClose: onStop, children: /* @__PURE__ */ jsxs5(View5, { style: styles5.root, children: [
    /* @__PURE__ */ jsx5(Text5, { style: styles5.kicker, children: "BRIEFING" }),
    /* @__PURE__ */ jsx5(Text5, { style: styles5.title, children: title }),
    /* @__PURE__ */ jsxs5(View5, { style: styles5.stage, children: [
      /* @__PURE__ */ jsx5(Animated.View, { style: [styles5.glow, { backgroundColor: accent, opacity: glow, transform: [{ scale }] }] }),
      /* @__PURE__ */ jsx5(
        CircleSchedule,
        {
          events,
          size: 280,
          highlightId: seg?.eventId,
          half: halfRef.current,
          centerTitle: ev ? formatTime(ev.start) : preparing ? "…" : `${Math.min(index + 1, segments.length)}/${segments.length}`,
          centerSub: ev ? ev.title : preparing ? "原稿を準備中" : "読み上げ中"
        }
      )
    ] }),
    /* @__PURE__ */ jsx5(Animated.Text, { style: [styles5.line, { opacity: fade }, preparing && { color: colors.textSub }], children: preparing ? "AI がブリーフィング原稿を書いています…" : seg?.text ?? "" }),
    /* @__PURE__ */ jsx5(View5, { style: styles5.progress, children: segments.map((_, i) => /* @__PURE__ */ jsx5(View5, { style: [styles5.pip, i <= index && { backgroundColor: accent }] }, i)) }),
    /* @__PURE__ */ jsx5(Pressable4, { onPress: onStop, style: styles5.stop, children: /* @__PURE__ */ jsx5(Text5, { style: styles5.stopText, children: "停止" }) })
  ] }) });
}
var styles5 = StyleSheet5.create({
  root: { flex: 1, backgroundColor: "#05060C", alignItems: "center", justifyContent: "center", padding: 28 },
  kicker: { color: colors.accent, fontSize: 12, letterSpacing: 6, fontWeight: "700" },
  title: { color: colors.text, fontSize: 22, fontWeight: "700", marginTop: 6 },
  stage: { width: 300, height: 300, alignItems: "center", justifyContent: "center", marginVertical: 28 },
  glow: { position: "absolute", width: 240, height: 240, borderRadius: 120 },
  line: { color: colors.text, fontSize: 20, lineHeight: 32, textAlign: "center", minHeight: 96, maxWidth: 480 },
  progress: { flexDirection: "row", gap: 6, marginTop: 20, flexWrap: "wrap", justifyContent: "center" },
  pip: { width: 18, height: 3, borderRadius: 2, backgroundColor: colors.border },
  stop: { marginTop: 36, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 30, borderWidth: 1, borderColor: colors.border },
  stopText: { color: colors.textSub, fontSize: 15, fontWeight: "600", letterSpacing: 2 }
});

// ../../../../../../home/claude/schedule-app/src/components/TabIcons.tsx
import Svg2, { Circle as Circle2, Line as Line2, Path as Path2, Rect } from "react-native-svg";
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function CircleTabIcon({ color }) {
  return /* @__PURE__ */ jsxs6(Svg2, { width: 24, height: 24, viewBox: "0 0 24 24", children: [
    /* @__PURE__ */ jsx6(Circle2, { cx: 12, cy: 12, r: 8.5, stroke: color, strokeWidth: 2, fill: "none", opacity: 0.45 }),
    /* @__PURE__ */ jsx6(Path2, { d: "M12 3.5 A8.5 8.5 0 0 1 20.5 12", stroke: color, strokeWidth: 2.4, fill: "none", strokeLinecap: "round" }),
    /* @__PURE__ */ jsx6(Line2, { x1: 12, y1: 12, x2: 12, y2: 7, stroke: color, strokeWidth: 2, strokeLinecap: "round" }),
    /* @__PURE__ */ jsx6(Line2, { x1: 12, y1: 12, x2: 15, y2: 14, stroke: color, strokeWidth: 2, strokeLinecap: "round" })
  ] });
}
function CalendarTabIcon({ color }) {
  return /* @__PURE__ */ jsxs6(Svg2, { width: 24, height: 24, viewBox: "0 0 24 24", children: [
    /* @__PURE__ */ jsx6(Rect, { x: 3.5, y: 5, width: 17, height: 15, rx: 3, stroke: color, strokeWidth: 2, fill: "none" }),
    /* @__PURE__ */ jsx6(Line2, { x1: 3.5, y1: 10, x2: 20.5, y2: 10, stroke: color, strokeWidth: 2 }),
    /* @__PURE__ */ jsx6(Line2, { x1: 8, y1: 3, x2: 8, y2: 7, stroke: color, strokeWidth: 2, strokeLinecap: "round" }),
    /* @__PURE__ */ jsx6(Line2, { x1: 16, y1: 3, x2: 16, y2: 7, stroke: color, strokeWidth: 2, strokeLinecap: "round" })
  ] });
}
function VoiceIcon({ color }) {
  return /* @__PURE__ */ jsx6(Svg2, { width: 22, height: 22, viewBox: "0 0 24 24", children: [
    [4, 10, 14],
    [8, 6, 18],
    [12, 3, 21],
    [16, 7, 17],
    [20, 10, 14]
  ].map(([x, y1, y2]) => /* @__PURE__ */ jsx6(Line2, { x1: x, y1, x2: x, y2, stroke: color, strokeWidth: 2.2, strokeLinecap: "round" }, x)) });
}

// ../../../../../../home/claude/schedule-app/src/components/SettingsSheet.tsx
import { useEffect as useEffect3, useState as useState3 } from "react";
import { Keyboard as Keyboard2, KeyboardAvoidingView as KeyboardAvoidingView2, Modal as Modal3, Platform as Platform3, Pressable as Pressable5, ScrollView as ScrollView2, StyleSheet as StyleSheet6, Switch, Text as Text6, TextInput as TextInput2, View as View6 } from "react-native";

// ../../../../../../home/claude/schedule-app/src/settings.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

// ../../../../../../home/claude/schedule-app/src/eleven.ts
import { Platform as Platform2 } from "react-native";
import { File, Paths } from "expo-file-system";
import { createAudioPlayer } from "expo-audio";
var API = "https://api.elevenlabs.io/v1";
var MODEL = "eleven_multilingual_v2";
var ELEVEN_VOICES = [
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", desc: "深く力強い男性" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", desc: "低く落ち着いたナレーター" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", desc: "ニュースキャスター風" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", desc: "渋く温かい語り" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", desc: "落ち着いた女性" },
  { id: "EXAVITQu4vr4xnoxsVTL", name: "Sarah", desc: "やわらかい女性" }
];
var DEFAULT_ELEVEN_VOICE = ELEVEN_VOICES[1].id;
var ElevenError = class extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    /** ElevenLabs が返す理由（invalid_api_key, missing_permissions, quota_exceeded など） */
    __publicField(this, "code");
    let code = "";
    try {
      const detail = JSON.parse(message)?.detail;
      code = typeof detail?.status === "string" ? detail.status : "";
    } catch {
    }
    this.code = code;
  }
};
async function fetchWithTimeout(url, init, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (e) {
    if (ctrl.signal.aborted) throw new ElevenError("timeout", 0);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
async function getElevenQuota(apiKey) {
  const res = await fetchWithTimeout(`${API}/user/subscription`, { headers: { "xi-api-key": apiKey } }, 15e3);
  if (!res.ok) throw new ElevenError(await res.text(), res.status);
  const data = await res.json();
  return { used: data.character_count, limit: data.character_limit };
}
function hash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h << 5) + h + s.charCodeAt(i) | 0;
  return (h >>> 0).toString(36);
}
var memoryCache = /* @__PURE__ */ new Map();
async function synthesizeEleven(text, apiKey, voiceId) {
  const key = `${voiceId}:${text}`;
  const cached = memoryCache.get(key);
  if (cached) return cached;
  const file = Platform2.OS === "web" ? null : new File(Paths.cache, `eleven-${hash(key)}.mp3`);
  if (file?.exists) {
    memoryCache.set(key, file.uri);
    return file.uri;
  }
  const res = await fetchWithTimeout(`${API}/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      language_code: "ja",
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true }
    })
  }, 3e4);
  if (!res.ok) throw new ElevenError(await res.text(), res.status);
  let uri;
  if (file) {
    file.write(new Uint8Array(await res.arrayBuffer()));
    uri = file.uri;
  } else {
    uri = URL.createObjectURL(await res.blob());
  }
  memoryCache.set(key, uri);
  return uri;
}
function prefetchEleven(texts, apiKey, voiceId) {
  const resolvers = [];
  const promises = texts.map((_, i) => new Promise((r) => resolvers[i] = r));
  let next = 0;
  let fatal = false;
  const worker = async () => {
    while (next < texts.length) {
      const i = next++;
      if (fatal) {
        resolvers[i](void 0);
        continue;
      }
      try {
        resolvers[i](await synthesizeEleven(texts[i], apiKey, voiceId));
      } catch (err) {
        if (err instanceof ElevenError && (err.status === 401 || err.status === 402 || err.status === 403)) fatal = true;
        resolvers[i](void 0);
      }
    }
  };
  void worker();
  void worker();
  return promises;
}
var previewPlayer = null;
async function previewEleven(text, apiKey, voiceId) {
  const uri = await synthesizeEleven(text, apiKey, voiceId);
  previewPlayer?.remove();
  previewPlayer = createAudioPlayer({ uri });
  previewPlayer.play();
}

// ../../../../../../home/claude/schedule-app/src/settings.ts
var RATE_OPTIONS = [
  { value: 0.85, label: "ゆっくり" },
  { value: 0.95, label: "ふつう" },
  { value: 1.1, label: "はやい" }
];
var PITCH_OPTIONS = [
  { value: 0.78, label: "低め" },
  { value: 0.9, label: "ふつう" },
  { value: 1.05, label: "高め" }
];
var snap = (value, options) => options.reduce((best, o) => Math.abs(o.value - value) < Math.abs(best - value) ? o.value : best, options[0].value);
var defaultSettings = { name: "", style: "mission", rate: 0.95, pitch: 0.9, sound: true, bgm: true, elevenKey: "", elevenVoice: DEFAULT_ELEVEN_VOICE };
var STYLE_LABELS = {
  mission: { label: "ミッション", desc: "作戦会議風" },
  dj: { label: "ラジオDJ", desc: "明るく軽快" },
  cool: { label: "クール", desc: "静かで渋い" }
};
var KEY = "settings.v1";
async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultSettings;
    const s = { ...defaultSettings, ...JSON.parse(raw) };
    return { ...s, rate: snap(s.rate, RATE_OPTIONS), pitch: snap(s.pitch, PITCH_OPTIONS) };
  } catch {
    return defaultSettings;
  }
}
async function saveSettings(s) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  } catch {
  }
}

// ../../../../../../home/claude/schedule-app/src/briefing.ts
import * as Speech from "expo-speech";
import { createAudioPlayer as createAudioPlayer2, setAudioModeAsync } from "expo-audio";
var API_URL = void 0;
var APP_TOKEN = void 0;
var aiBriefingEnabled = !!API_URL;
async function fetchAiBriefing(key, events, dayLabel) {
  if (!API_URL) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3e4);
  try {
    const res = await fetch(`${API_URL}/briefing`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...APP_TOKEN ? { "X-App-Token": APP_TOKEN } : {} },
      body: JSON.stringify({
        date: key,
        dayLabel,
        events: events.map(({ id, title, start, end }) => ({ id, title, start, end }))
      }),
      signal: controller.signal
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.segments?.length) return null;
    return data.segments.map((s) => ({ text: s.text, eventId: s.eventId ?? void 0, audioUrl: s.audioUrl }));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
var pick = (list) => list[Math.floor(Math.random() * list.length)];
var rotate = (n, list) => list[n % list.length];
function greeting(hour, name) {
  const who = name ? `${name}さん、` : "";
  if (hour < 5) return `${who}夜分にお疲れさまです。`;
  if (hour < 11) return `おはようございます、${who || ""}`.replace(/、$/, "。");
  if (hour < 18) return `こんにちは、${who || ""}`.replace(/、$/, "。");
  return `こんばんは、${who || ""}`.replace(/、$/, "。");
}
var PHRASES = {
  mission: {
    open: (s) => [`${s}のブリーフィングを開始します。`, `${s}のミッションを確認しましょう。`, `これより、${s}の作戦概要をお伝えします。`],
    count: (d, n) => `${d}。ミッションは全部で、${n}件。`,
    only: (t, ti, dur) => `唯一のミッションは、${t}から。「${ti}」。${dur}の予定です。`,
    first: (t, ti) => [`最初のミッションは、${t}。「${ti}」。`, `作戦開始は${t}。「${ti}」。`],
    resume: (t, ti) => `次のミッションは、${t}。「${ti}」。`,
    middle: (t, ti, dur) => [`続いて${t}、「${ti}」。${dur}です。`, `${t}、次の目標は「${ti}」。`, `次は${t}。「${ti}」。`],
    last: (t, ti) => [`そして最終ミッションは、${t}。「${ti}」。`, `締めくくりは${t}、「${ti}」。`],
    free: (d) => [`その後、${d}の待機時間。しっかりチャージを。`, `ここで${d}のブレイク。`, `${d}の空白。自由に使ってください。`],
    overlap: "警告。次の予定と時間が重なっています。",
    busy: "かなりタイトなスケジュールです。ペース配分に注意してください。",
    empty: ["ミッションはありません。完全なフリー。思い切り楽しんでください。", "白紙のキャンバスです。自由に描いてください。"],
    close: (n, s, name) => [
      `以上、全${n}件。準備は整いました。最高の一日を。`,
      `ブリーフィングは以上。${name ? `${name}さん、` : ""}健闘を祈ります。`,
      `以上です。すべては、あなたの手の中に。いってらっしゃい。`
    ]
  },
  dj: {
    open: (s) => [`さあ始まりました、${s}のスケジュール・カウントダウン！`, `${s}のプレイリスト、いってみましょう！`],
    count: (d, n) => `${d}。本日のラインナップは${n}件！`,
    only: (t, ti, dur) => `本日の一曲はこちら。${t}から、「${ti}」。${dur}です！`,
    first: (t, ti) => [`トップバッターは${t}、「${ti}」！`, `一発目は${t}から、「${ti}」！`],
    resume: (t, ti) => `お次は${t}、「${ti}」！`,
    middle: (t, ti, dur) => [`続いては${t}、「${ti}」。${dur}お付き合いください。`, `お次は${t}、「${ti}」！`, `${t}からは「${ti}」でいきましょう。`],
    last: (t, ti) => [`そしてラストナンバーは${t}、「${ti}」！`, `トリを飾るのは${t}、「${ti}」！`],
    free: (d) => [`ここで${d}のコーヒーブレイク。`, `${d}のフリータイム、ひと息ついてください。`, `${d}の休憩タイムです。`],
    overlap: "おっと、次の予定と時間がかぶってますよ！",
    busy: "今日はぎっしり詰まってますね。水分補給も忘れずに！",
    empty: ["今日は予定なし！好きな曲をかけて、自由に過ごしちゃいましょう。"],
    close: (n, s, name) => [
      `以上、${n}件のラインナップでお送りしました！${name ? `${name}さん、` : ""}いってらっしゃい！`,
      `${s}も最高の一日になりますように。それではまた！`
    ]
  },
  cool: {
    open: (s) => [`${s}の予定を、静かに確認しておきましょう。`, `${s}のタイムラインです。`],
    count: (d, n) => `${d}。予定は${n}件。`,
    only: (t, ti, dur) => `${t}から、「${ti}」。${dur}。それだけです。`,
    first: (t, ti) => [`まず、${t}。「${ti}」。`, `始まりは${t}。「${ti}」。`],
    resume: (t, ti) => `次は、${t}。「${ti}」。`,
    middle: (t, ti, dur) => [`${t}。「${ti}」。${dur}。`, `次に、${t}。「${ti}」。`, `${t}、「${ti}」。`],
    last: (t, ti) => [`最後に、${t}。「${ti}」。`, `終わりは${t}。「${ti}」。`],
    free: (d) => [`そのあと、${d}の余白。`, `${d}、何もない時間。`, `${d}の静けさ。`],
    overlap: "次の予定と、時間が重なっています。",
    busy: "詰まった一日です。焦らず、ひとつずつ。",
    empty: ["予定はありません。ゆっくり過ごしてください。"],
    close: (n, s, name) => [`以上、${n}件。${name ? `${name}さん、` : ""}良い一日を。`, "準備は、できています。"]
  }
};
function buildBriefing(key, events, dayLabel, opts = {}, now = /* @__PURE__ */ new Date()) {
  const name = opts.name?.trim() ?? "";
  const P = PHRASES[opts.style ?? "mission"];
  const d = fromKey(key);
  const dateText = `${d.getMonth() + 1}月${d.getDate()}日、${weekday(d)}曜日`;
  const all = [...events].sort((a, b) => a.start - b.start);
  const subject = dayLabel === "明日" ? "明日" : dayLabel === "今日" ? "本日" : "この日";
  const segs = [];
  let freeCount = Math.floor(Math.random() * 3);
  segs.push({ text: `${greeting(now.getHours(), name)}${pick(P.open(subject))}` });
  if (all.length === 0) {
    segs.push({ text: `${dateText}。` });
    segs.push({ text: pick(P.empty) });
    return segs;
  }
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const done = dayLabel === "今日" ? all.filter((e) => e.end <= nowMin) : [];
  const sorted = all.filter((e) => !done.includes(e));
  segs.push({ text: P.count(dateText, all.length) });
  if (done.length > 0 && sorted.length > 0) {
    segs.push({ text: `すでに${done.length}件が完了。残りは${sorted.length}件です。` });
  }
  if (sorted.length === 0) {
    segs.push({ text: `${subject}の予定は、すべて完了しました。お疲れさまでした。` });
    return segs;
  }
  const busyMin = all.reduce((sum, e) => sum + (e.end - e.start), 0);
  if (all.length >= 6 || busyMin >= 9 * 60) segs.push({ text: P.busy });
  sorted.forEach((ev, i) => {
    const time = speakTime(ev.start);
    const dur = speakDuration(ev.end - ev.start);
    let line;
    if (sorted.length === 1) line = P.only(time, ev.title, dur);
    else if (i === 0) line = done.length > 0 ? P.resume(time, ev.title) : pick(P.first(time, ev.title));
    else if (i === sorted.length - 1) line = pick(P.last(time, ev.title));
    else line = rotate(i - 1, P.middle(time, ev.title, dur));
    segs.push({ text: line, eventId: ev.id });
    if (i === 0 && dayLabel === "今日") {
      if (ev.start <= nowMin) segs.push({ text: "これは、まさに今、進行中です。", eventId: ev.id });
      else if (ev.start - nowMin <= 180) segs.push({ text: `開始まで、あと${speakDuration(ev.start - nowMin)}。`, eventId: ev.id });
    }
    const next = sorted[i + 1];
    if (next && next.start - ev.end >= 120) {
      segs.push({ text: rotate(freeCount++, P.free(speakDuration(next.start - ev.end))) });
    } else if (next && next.start < ev.end) {
      segs.push({ text: P.overlap });
    }
  });
  segs.push({ text: pick(P.close(all.length, subject, name)) });
  return segs;
}
var INTRO_SOUND = require_intro();
var BGM = require_bgm();
var GAP_MS = 380;
var BGM_VOLUME = 0.22;
function voiceScore(v) {
  const label = `${v.name} ${v.identifier}`;
  let score = 0;
  if (/premium|プレミアム/i.test(label)) score += 6;
  if (v.quality === Speech.VoiceQuality.Enhanced || /enhanced|拡張|高品質/i.test(label)) score += 4;
  if (/otoya|hattori|男性|male/i.test(label) && !/female/i.test(label)) score += 2;
  if (/google/i.test(label)) score += 1;
  if (/compact|eloquence|novelty/i.test(label)) score -= 3;
  return score;
}
async function listJapaneseVoices() {
  try {
    const voices = await Promise.race([
      Speech.getAvailableVoicesAsync(),
      new Promise((resolve) => setTimeout(() => resolve([]), 1500))
    ]);
    return voices.filter((v) => v.language?.toLowerCase().replace("_", "-").startsWith("ja")).map((v) => ({
      id: v.identifier,
      name: v.name,
      enhanced: v.quality === Speech.VoiceQuality.Enhanced || /premium|enhanced|プレミアム|拡張|高品質/i.test(`${v.name} ${v.identifier}`),
      score: voiceScore(v)
    })).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).map(({ score: _score, ...v }) => v);
  } catch {
    return [];
  }
}
var autoVoice;
var autoVoiceLooked = false;
async function resolveVoice(voiceId) {
  if (voiceId) return voiceId;
  if (!autoVoiceLooked) {
    autoVoiceLooked = true;
    autoVoice = (await listJapaneseVoices())[0]?.id;
  }
  return autoVoice;
}
function playSource(source, onDone) {
  const p = createAudioPlayer2(source);
  let done = false;
  p.addListener("playbackStatusUpdate", (status) => {
    if (status.didJustFinish && !done) {
      done = true;
      onDone();
    }
  });
  p.play();
  return p;
}
async function previewVoice(text, voice) {
  await Speech.stop();
  Speech.speak(text, { language: "ja-JP", voice: await resolveVoice(voice.voiceId), rate: voice.rate, pitch: voice.pitch });
}
function playBriefing(segments, voice, onSegment, onFinish) {
  let cancelled = false;
  let player = null;
  let bgm = null;
  let gapTimer = null;
  const releasePlayer = () => {
    player?.remove();
    player = null;
  };
  const startBgm = () => {
    if (!voice.bgm || !BGM || bgm) return;
    try {
      bgm = createAudioPlayer2(BGM);
      bgm.loop = true;
      bgm.volume = BGM_VOLUME;
      bgm.play();
    } catch {
      bgm = null;
    }
  };
  const stopBgm = (fade) => {
    const p = bgm;
    bgm = null;
    if (!p) return;
    if (!fade) return p.remove();
    let v = BGM_VOLUME;
    const t = setInterval(() => {
      v -= BGM_VOLUME / 12;
      if (v <= 0) {
        clearInterval(t);
        p.remove();
      } else {
        p.volume = v;
      }
    }, 100);
  };
  const nextAfterGap = (i) => {
    gapTimer = setTimeout(() => void speakAt(i), GAP_MS);
  };
  const speakAt = async (i) => {
    releasePlayer();
    if (cancelled) return;
    if (i >= segments.length) {
      stopBgm(true);
      onFinish();
      return;
    }
    if (i === 0) startBgm();
    onSegment(i);
    const seg = segments[i];
    let uri = seg.audioUrl;
    if (!uri && seg.audio) {
      uri = await Promise.race([seg.audio, new Promise((r) => setTimeout(() => r(void 0), 2e4))]);
      if (cancelled) return;
    }
    if (uri) {
      try {
        player = playSource({ uri }, () => nextAfterGap(i + 1));
        return;
      } catch {
      }
    }
    const voiceId = await resolveVoice(voice.voiceId);
    if (cancelled) return;
    Speech.speak(seg.text, {
      language: "ja-JP",
      voice: voiceId,
      rate: voice.rate,
      pitch: voice.pitch,
      onDone: () => nextAfterGap(i + 1),
      onError: () => nextAfterGap(i + 1)
    });
  };
  const start = () => {
    if (cancelled) return;
    if (!voice.sound || !INTRO_SOUND) return void speakAt(0);
    try {
      let started = false;
      const go = () => {
        if (started) return;
        started = true;
        void speakAt(0);
      };
      player = playSource(INTRO_SOUND, go);
      setTimeout(go, 2500);
    } catch {
      void speakAt(0);
    }
  };
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => {
  });
  Speech.stop().finally(start);
  return {
    stop: () => {
      cancelled = true;
      if (gapTimer) clearTimeout(gapTimer);
      releasePlayer();
      stopBgm(false);
      Speech.stop();
      onFinish();
    }
  };
}

// ../../../../../../home/claude/schedule-app/src/components/SettingsSheet.tsx
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
var RATES = RATE_OPTIONS;
var PITCHES = PITCH_OPTIONS;
var STYLE_SAMPLE = {
  mission: "これより、本日の作戦概要をお伝えします。",
  dj: "さあ始まりました、本日のスケジュール・カウントダウン！",
  cool: "本日の予定を、静かに確認しておきましょう。"
};
function Chip2({ label, sub, active, onPress }) {
  return /* @__PURE__ */ jsxs7(Pressable5, { onPress, style: [styles6.chip, active && styles6.chipActive], children: [
    /* @__PURE__ */ jsx7(Text6, { style: [styles6.chipText, active && styles6.chipTextActive], children: label }),
    sub ? /* @__PURE__ */ jsx7(Text6, { style: [styles6.chipSub, active && { color: "rgba(255,255,255,0.8)" }], children: sub }) : null
  ] });
}
function SettingsSheet({ visible, settings, onChange, onClose }) {
  const [voices, setVoices] = useState3(null);
  useEffect3(() => {
    if (visible && voices === null) listJapaneseVoices().then(setVoices);
  }, [visible, voices]);
  const [elevenStatus, setElevenStatus] = useState3("");
  const set = (patch) => onChange({ ...settings, ...patch });
  const sampleText = (s) => `${s.name ? `${s.name}さん、` : ""}${STYLE_SAMPLE[s.style]}`;
  const sample = (s) => {
    if (s.elevenKey.trim()) {
      setElevenStatus("AIボイスを準備中…");
      previewEleven(sampleText(s), s.elevenKey.trim(), s.elevenVoice).then(() => setElevenStatus("")).catch((e) => setElevenStatus(describeElevenError(e)));
    } else {
      previewVoice(sampleText(s), s);
    }
  };
  const checkEleven = async () => {
    const key = settings.elevenKey.trim();
    if (!key) return setElevenStatus("APIキーを入力してください");
    Keyboard2.dismiss();
    setElevenStatus("確認中…");
    try {
      const q = await getElevenQuota(key);
      setElevenStatus(`接続OK。今月の残り：${Math.max(0, q.limit - q.used).toLocaleString()}文字（1回の読み上げで約300文字）`);
    } catch (e) {
      if (e instanceof ElevenError && e.code === "missing_permissions") {
        try {
          await previewEleven("接続できました。", key, settings.elevenVoice);
          setElevenStatus("接続OK。下から好きな声を選んでください。");
        } catch (e2) {
          setElevenStatus(describeElevenError(e2));
        }
      } else {
        setElevenStatus(describeElevenError(e));
      }
    }
  };
  return /* @__PURE__ */ jsx7(Modal3, { visible, transparent: true, animationType: "slide", onRequestClose: onClose, children: /* @__PURE__ */ jsxs7(KeyboardAvoidingView2, { behavior: Platform3.OS === "ios" ? "padding" : void 0, style: styles6.backdrop, children: [
    /* @__PURE__ */ jsx7(Pressable5, { style: StyleSheet6.absoluteFill, onPress: onClose }),
    /* @__PURE__ */ jsxs7(View6, { style: styles6.sheet, children: [
      /* @__PURE__ */ jsx7(View6, { style: styles6.grabber }),
      /* @__PURE__ */ jsxs7(View6, { style: styles6.headerRow, children: [
        /* @__PURE__ */ jsx7(Text6, { style: styles6.heading, children: "ナレーション設定" }),
        /* @__PURE__ */ jsx7(Pressable5, { onPress: onClose, hitSlop: 10, children: /* @__PURE__ */ jsx7(Text6, { style: styles6.done, children: "完了" }) })
      ] }),
      /* @__PURE__ */ jsxs7(
        ScrollView2,
        {
          showsVerticalScrollIndicator: false,
          contentContainerStyle: { paddingBottom: 12 },
          keyboardShouldPersistTaps: "handled",
          children: [
            /* @__PURE__ */ jsx7(Text6, { style: styles6.label, children: "呼びかける名前" }),
            /* @__PURE__ */ jsx7(
              TextInput2,
              {
                value: settings.name,
                onChangeText: (name) => set({ name }),
                placeholder: "例：こうた（「こうたさん」と呼びます）",
                placeholderTextColor: colors.textMuted,
                style: styles6.input,
                maxLength: 12
              }
            ),
            /* @__PURE__ */ jsx7(Text6, { style: styles6.label, children: "語り口" }),
            /* @__PURE__ */ jsx7(View6, { style: styles6.row, children: Object.keys(STYLE_LABELS).map((k) => /* @__PURE__ */ jsx7(
              Chip2,
              {
                label: STYLE_LABELS[k].label,
                sub: STYLE_LABELS[k].desc,
                active: settings.style === k,
                onPress: () => {
                  const next = { ...settings, style: k };
                  onChange(next);
                  sample(next);
                }
              },
              k
            )) }),
            /* @__PURE__ */ jsx7(Text6, { style: styles6.label, children: "AIボイス（ElevenLabs）" }),
            /* @__PURE__ */ jsx7(
              TextInput2,
              {
                value: settings.elevenKey,
                onChangeText: (elevenKey) => set({ elevenKey }),
                placeholder: "APIキーを貼り付け（空なら端末の声）",
                placeholderTextColor: colors.textMuted,
                style: styles6.input,
                autoCapitalize: "none",
                autoCorrect: false,
                secureTextEntry: true
              }
            ),
            /* @__PURE__ */ jsx7(View6, { style: [styles6.row, { marginTop: 8 }], children: /* @__PURE__ */ jsx7(Pressable5, { onPress: checkEleven, style: [styles6.chip, { flexGrow: 0, flexBasis: "auto", paddingHorizontal: 16 }], children: /* @__PURE__ */ jsx7(Text6, { style: styles6.chipText, children: "接続を確認" }) }) }),
            elevenStatus ? /* @__PURE__ */ jsx7(Text6, { style: [styles6.note, { color: colors.text }], children: elevenStatus }) : null,
            settings.elevenKey.trim() ? /* @__PURE__ */ jsx7(View6, { style: [styles6.voiceList, { marginTop: 10 }], children: ELEVEN_VOICES.map((v) => /* @__PURE__ */ jsx7(
              VoiceRow,
              {
                name: v.name,
                sub: v.desc,
                active: settings.elevenVoice === v.id,
                onPress: () => {
                  const next = { ...settings, elevenVoice: v.id };
                  onChange(next);
                  sample(next);
                }
              },
              v.id
            )) }) : null,
            /* @__PURE__ */ jsx7(Text6, { style: styles6.note, children: "elevenlabs.io で無料登録 → 左下のメニュー →「Developers」→「API Keys」でキーを作成して貼り付けます。キーはこのスマホの中だけに保存されます。" }),
            /* @__PURE__ */ jsx7(Text6, { style: styles6.label, children: "端末の声（AIボイス未設定のとき）" }),
            /* @__PURE__ */ jsxs7(View6, { style: styles6.voiceList, children: [
              /* @__PURE__ */ jsx7(
                VoiceRow,
                {
                  name: "おまかせ",
                  sub: "一番良い日本語の声を自動で選びます",
                  active: !settings.voiceId,
                  onPress: () => {
                    const next = { ...settings, voiceId: void 0 };
                    onChange(next);
                    sample(next);
                  }
                }
              ),
              (voices ?? []).map((v) => /* @__PURE__ */ jsx7(
                VoiceRow,
                {
                  name: v.name,
                  sub: v.enhanced ? "高品質" : void 0,
                  active: settings.voiceId === v.id,
                  onPress: () => {
                    const next = { ...settings, voiceId: v.id };
                    onChange(next);
                    sample(next);
                  }
                },
                v.id
              )),
              voices !== null && voices.length === 0 && /* @__PURE__ */ jsx7(Text6, { style: styles6.note, children: "この端末では日本語の声の一覧を取得できませんでした。" })
            ] }),
            /* @__PURE__ */ jsx7(Text6, { style: styles6.note, children: Platform3.OS === "android" ? "ヒント：設定 → システム → 言語と入力 → テキスト読み上げ で、Google の日本語音声データを入れると声が自然になります（無料）。" : "ヒント：iPhone の 設定 → アクセシビリティ → 読み上げコンテンツ → 声 → 日本語 で「拡張」や「プレミアム」の声を無料でダウンロードすると、ぐっと自然な声になります。" }),
            /* @__PURE__ */ jsx7(Text6, { style: styles6.label, children: "速さ" }),
            /* @__PURE__ */ jsx7(View6, { style: styles6.row, children: RATES.map((r) => /* @__PURE__ */ jsx7(Chip2, { label: r.label, active: settings.rate === r.value, onPress: () => set({ rate: r.value }) }, r.value)) }),
            /* @__PURE__ */ jsx7(Text6, { style: styles6.label, children: "声の高さ" }),
            /* @__PURE__ */ jsx7(View6, { style: styles6.row, children: PITCHES.map((p) => /* @__PURE__ */ jsx7(Chip2, { label: p.label, active: settings.pitch === p.value, onPress: () => set({ pitch: p.value }) }, p.value)) }),
            /* @__PURE__ */ jsxs7(View6, { style: styles6.switchRow, children: [
              /* @__PURE__ */ jsxs7(View6, { style: { flex: 1 }, children: [
                /* @__PURE__ */ jsx7(Text6, { style: styles6.switchLabel, children: "開始の効果音" }),
                /* @__PURE__ */ jsx7(Text6, { style: styles6.note, children: "読み上げの前に短いサウンドを鳴らします" })
              ] }),
              /* @__PURE__ */ jsx7(
                Switch,
                {
                  value: settings.sound,
                  onValueChange: (sound) => set({ sound }),
                  trackColor: { true: colors.accent, false: colors.surfaceHigh },
                  thumbColor: "#fff"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs7(View6, { style: styles6.switchRow, children: [
              /* @__PURE__ */ jsxs7(View6, { style: { flex: 1 }, children: [
                /* @__PURE__ */ jsx7(Text6, { style: styles6.switchLabel, children: "BGM" }),
                /* @__PURE__ */ jsx7(Text6, { style: styles6.note, children: "読み上げ中に低いビートを小さく流します" })
              ] }),
              /* @__PURE__ */ jsx7(
                Switch,
                {
                  value: settings.bgm,
                  onValueChange: (bgm) => set({ bgm }),
                  trackColor: { true: colors.accent, false: colors.surfaceHigh },
                  thumbColor: "#fff"
                }
              )
            ] }),
            /* @__PURE__ */ jsx7(Pressable5, { onPress: () => sample(settings), style: styles6.testButton, children: /* @__PURE__ */ jsx7(Text6, { style: styles6.testText, children: "▶ 試し聞き" }) })
          ]
        }
      )
    ] })
  ] }) });
}
function describeElevenError(e) {
  if (e instanceof ElevenError) {
    if (e.status === 0) return "ElevenLabs から返事がありません。電波の良い所でもう一度押してください。";
    if (e.code === "missing_permissions")
      return "このキーには声を作る権限がありません。ElevenLabs でキーを作り直し、「Text to Speech」をオンにしてください。";
    if (e.code === "detected_unusual_activity")
      return "ElevenLabs が無料プランの利用を止めています（VPNや複数アカウントが原因のことがあります）。";
    if (e.status === 402 || e.code === "quota_exceeded" || /quota/i.test(e.message))
      return "今月の無料枠を使い切りました。端末の声で読み上げます。";
    if (e.status === 401) return "APIキーが正しくないようです。コピーし直して、前後に空白が入っていないか確かめてください。";
    return `ElevenLabs でエラーが起きました（${e.status}${e.code ? `：${e.code}` : ""}）。`;
  }
  return "ElevenLabs に接続できませんでした。通信を確認してください。";
}
function VoiceRow({ name, sub, active, onPress }) {
  return /* @__PURE__ */ jsxs7(Pressable5, { onPress, style: [styles6.voiceRow, active && styles6.voiceRowActive], children: [
    /* @__PURE__ */ jsx7(View6, { style: [styles6.radio, active && styles6.radioActive] }),
    /* @__PURE__ */ jsx7(Text6, { style: styles6.voiceName, numberOfLines: 1, children: name }),
    sub ? /* @__PURE__ */ jsx7(Text6, { style: styles6.voiceSub, children: sub }) : null
  ] });
}
var styles6 = StyleSheet6.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
    maxWidth: 560,
    maxHeight: "88%",
    alignSelf: "center"
  },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: 14 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  heading: { color: colors.text, fontSize: 18, fontWeight: "700" },
  done: { color: colors.accent, fontSize: 16, fontWeight: "700" },
  label: { color: colors.textSub, fontSize: 12, marginTop: 18, marginBottom: 8, letterSpacing: 1 },
  input: {
    backgroundColor: colors.surfaceHigh,
    color: colors.text,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16
  },
  row: { flexDirection: "row", gap: 8 },
  chip: { flex: 1, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 12, backgroundColor: colors.surfaceHigh, alignItems: "center" },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.textSub, fontSize: 14, fontWeight: "700" },
  chipTextActive: { color: "#fff" },
  chipSub: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  voiceList: { backgroundColor: colors.surfaceHigh, borderRadius: 14, overflow: "hidden" },
  voiceRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 14, gap: 10 },
  voiceRowActive: { backgroundColor: colors.accentSoft },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.textMuted },
  radioActive: { borderColor: colors.accent, backgroundColor: colors.accent },
  voiceName: { flex: 1, color: colors.text, fontSize: 15 },
  voiceSub: { color: colors.accent, fontSize: 11, fontWeight: "700" },
  note: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  switchRow: { flexDirection: "row", alignItems: "center", marginTop: 18, gap: 12 },
  switchLabel: { color: colors.text, fontSize: 15 },
  testButton: {
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: "rgba(108,140,255,0.35)"
  },
  testText: { color: colors.text, fontSize: 15, fontWeight: "700" }
});

// ../../../../../../home/claude/schedule-app/src/storage.ts
import AsyncStorage2 from "@react-native-async-storage/async-storage";
var KEY2 = "schedule.v1";
async function loadSchedules() {
  try {
    const raw = await AsyncStorage2.getItem(KEY2);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
async function saveSchedules(map) {
  try {
    await AsyncStorage2.setItem(KEY2, JSON.stringify(map));
  } catch {
  }
}

// ../../../../../../home/claude/schedule-app/App.tsx
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function useNow() {
  const [now, setNow] = useState4(() => /* @__PURE__ */ new Date());
  useEffect4(() => {
    const t = setInterval(() => setNow(/* @__PURE__ */ new Date()), 3e4);
    return () => clearInterval(t);
  }, []);
  return now;
}
function Main() {
  const { width } = useWindowDimensions();
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
  const [settings, setSettings] = useState4(defaultSettings);
  const [settingsOpen, setSettingsOpen] = useState4(false);
  const toastTimer = useRef3(null);
  const [briefing, setBriefing] = useState4(null);
  const [briefIndex, setBriefIndex] = useState4(0);
  const briefHandle = useRef3(null);
  const briefRun = useRef3(0);
  useEffect4(() => {
    loadSettings().then(setSettings);
    loadSchedules().then((s) => {
      setSchedules(s);
      setLoaded(true);
    });
  }, []);
  useEffect4(() => {
    if (loaded) saveSchedules(schedules);
  }, [schedules, loaded]);
  const events = schedules[selectedKey] ?? [];
  const isToday = selectedKey === todayKey;
  const dayLabel = isToday ? "今日" : selectedKey === tomorrowKey ? "明日" : null;
  const sel = fromKey(selectedKey);
  const dateTitle = `${sel.getMonth() + 1}月${sel.getDate()}日（${weekday(sel)}）`;
  const nowMin = isToday ? nowMinutes(now) : void 0;
  const center = describeCenter(events, nowMin);
  const [half, setHalf] = useState4(0);
  const autoHalf = defaultHalf(events, nowMin);
  useEffect4(() => {
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
  const startBriefing = useCallback(async () => {
    setToast(null);
    const run = ++briefRun.current;
    setBriefIndex(0);
    setBriefing([]);
    const ai = await fetchAiBriefing(selectedKey, events, dayLabel);
    if (run !== briefRun.current) return;
    const segs = ai ?? buildBriefing(selectedKey, events, dayLabel, { name: settings.name, style: settings.style });
    if (settings.elevenKey.trim() && !segs.some((sg) => sg.audioUrl)) {
      const audio = prefetchEleven(
        segs.map((sg) => sg.text),
        settings.elevenKey.trim(),
        settings.elevenVoice
      );
      segs.forEach((sg, i) => sg.audio = audio[i]);
    }
    setBriefing(segs);
    briefHandle.current = playBriefing(segs, settings, setBriefIndex, () => {
      briefHandle.current = null;
      setBriefing(null);
    });
  }, [selectedKey, events, dayLabel, settings]);
  const stopBriefing = () => {
    briefRun.current++;
    if (briefHandle.current) briefHandle.current.stop();
    else setBriefing(null);
  };
  const defaultStart = useMemo2(() => {
    const sorted = [...events].sort((a, b) => a.start - b.start);
    const last = sorted[sorted.length - 1];
    if (last) return Math.min(last.end, 23 * 60);
    return isToday ? Math.min(Math.ceil(nowMinutes(now) / 60) * 60, 23 * 60) : 9 * 60;
  }, [events, isToday, now]);
  return /* @__PURE__ */ jsxs8(SafeAreaView, { style: styles7.root, edges: ["top", "left", "right"], children: [
    /* @__PURE__ */ jsx8(StatusBar, { style: "light" }),
    /* @__PURE__ */ jsxs8(ScrollView3, { contentContainerStyle: styles7.scroll, showsVerticalScrollIndicator: false, children: [
      /* @__PURE__ */ jsxs8(View7, { style: styles7.headerRow, children: [
        /* @__PURE__ */ jsxs8(View7, { style: { flex: 1 }, children: [
          /* @__PURE__ */ jsx8(Text7, { style: styles7.kicker, children: dayLabel ? dayLabel === "今日" ? "TODAY" : "TOMORROW" : "SCHEDULE" }),
          /* @__PURE__ */ jsx8(Text7, { style: styles7.date, children: dateTitle })
        ] }),
        /* @__PURE__ */ jsx8(Pressable6, { onPress: () => setSettingsOpen(true), style: styles7.gear, hitSlop: 8, accessibilityLabel: "ナレーション設定", children: /* @__PURE__ */ jsx8(VoiceIcon, { color: colors.textSub }) })
      ] }),
      /* @__PURE__ */ jsxs8(View7, { style: styles7.segment, children: [
        [
          { key: todayKey, label: "今日" },
          { key: tomorrowKey, label: "明日" }
        ].map((s) => /* @__PURE__ */ jsx8(
          Pressable6,
          {
            onPress: () => setSelectedKey(s.key),
            style: [styles7.segItem, selectedKey === s.key && styles7.segActive],
            children: /* @__PURE__ */ jsx8(Text7, { style: [styles7.segText, selectedKey === s.key && styles7.segTextActive], children: s.label })
          },
          s.key
        )),
        !dayLabel && /* @__PURE__ */ jsx8(View7, { style: [styles7.segItem, styles7.segActive], children: /* @__PURE__ */ jsx8(Text7, { style: [styles7.segText, styles7.segTextActive], children: `${sel.getMonth() + 1}/${sel.getDate()}` }) })
      ] }),
      tab === "circle" ? /* @__PURE__ */ jsxs8(View7, { style: styles7.circleWrap, children: [
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
        /* @__PURE__ */ jsx8(View7, { style: styles7.halfSwitch, children: ["午前", "午後"].map((label, h) => /* @__PURE__ */ jsx8(
          Pressable6,
          {
            onPress: () => setHalf(h),
            style: [styles7.halfItem, half === h && styles7.halfActive],
            children: /* @__PURE__ */ jsxs8(Text7, { style: [styles7.halfText, half === h && styles7.halfTextActive], children: [
              label,
              halfCounts[h] ? `  ${halfCounts[h]}件` : ""
            ] })
          },
          label
        )) })
      ] }) : /* @__PURE__ */ jsx8(View7, { style: { marginTop: 18 }, children: /* @__PURE__ */ jsx8(
        CalendarView,
        {
          schedules,
          selectedKey,
          todayKey,
          onSelect: setSelectedKey
        }
      ) }),
      /* @__PURE__ */ jsxs8(Pressable6, { onPress: startBriefing, style: ({ pressed }) => [styles7.briefBtn, pressed && { opacity: 0.8 }], children: [
        /* @__PURE__ */ jsx8(View7, { style: styles7.playIcon, children: /* @__PURE__ */ jsx8(Text7, { style: styles7.playGlyph, children: "▶" }) }),
        /* @__PURE__ */ jsxs8(View7, { style: { flex: 1 }, children: [
          /* @__PURE__ */ jsx8(Text7, { style: styles7.briefTitle, children: "ブリーフィングを聞く" }),
          /* @__PURE__ */ jsxs8(Text7, { style: styles7.briefSub, children: [
            dayLabel ?? "この日",
            "の予定 ",
            events.length,
            "件 を",
            aiBriefingEnabled ? " AI ナレーションで" : "ボイスで",
            "読み上げ"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs8(View7, { style: styles7.sectionRow, children: [
        /* @__PURE__ */ jsx8(Text7, { style: styles7.section, children: "タイムライン" }),
        events.length > 1 && /* @__PURE__ */ jsx8(Pressable6, { onPress: () => deleteEvents(), hitSlop: 8, children: /* @__PURE__ */ jsx8(Text7, { style: styles7.clearAll, children: "すべて消す" }) })
      ] }),
      /* @__PURE__ */ jsx8(EventList, { events, nowMin, onPress: openEdit, onDelete: handleDelete })
    ] }),
    toast === "saved" && /* @__PURE__ */ jsxs8(View7, { style: styles7.toast, children: [
      /* @__PURE__ */ jsx8(Text7, { style: styles7.toastText, children: "スケジュールを更新しました" }),
      /* @__PURE__ */ jsx8(Pressable6, { onPress: startBriefing, hitSlop: 8, children: /* @__PURE__ */ jsx8(Text7, { style: styles7.toastAction, children: "▶ 読み上げる" }) })
    ] }),
    toast === "deleted" && undo && /* @__PURE__ */ jsxs8(View7, { style: styles7.toast, children: [
      /* @__PURE__ */ jsx8(Text7, { style: [styles7.toastText, { flex: 1 }], numberOfLines: 1, children: undo.label }),
      /* @__PURE__ */ jsx8(Pressable6, { onPress: undoDelete, hitSlop: 8, children: /* @__PURE__ */ jsx8(Text7, { style: styles7.toastAction, children: "元に戻す" }) })
    ] }),
    /* @__PURE__ */ jsx8(Pressable6, { onPress: openNew, style: styles7.fab, children: /* @__PURE__ */ jsx8(Text7, { style: styles7.fabText, children: "＋" }) }),
    /* @__PURE__ */ jsx8(SafeAreaView, { edges: ["bottom"], style: styles7.tabBar, children: [
      { key: "circle", label: "サークル", Icon: CircleTabIcon },
      { key: "calendar", label: "カレンダー", Icon: CalendarTabIcon }
    ].map((t) => /* @__PURE__ */ jsxs8(Pressable6, { onPress: () => setTab(t.key), style: styles7.tabItem, children: [
      /* @__PURE__ */ jsx8(t.Icon, { color: tab === t.key ? colors.accent : colors.textMuted }),
      /* @__PURE__ */ jsx8(Text7, { style: [styles7.tabLabel, tab === t.key && { color: colors.text }], children: t.label })
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
    ),
    /* @__PURE__ */ jsx8(
      SettingsSheet,
      {
        visible: settingsOpen,
        settings,
        onChange: (next) => {
          setSettings(next);
          saveSettings(next);
        },
        onClose: () => setSettingsOpen(false)
      }
    ),
    /* @__PURE__ */ jsx8(
      BriefingOverlay,
      {
        visible: briefing !== null,
        segments: briefing ?? [],
        index: briefIndex,
        events,
        title: `${dayLabel ?? ""} ${dateTitle}`.trim(),
        onStop: stopBriefing
      }
    )
  ] });
}
function App() {
  return /* @__PURE__ */ jsx8(SafeAreaProvider, { children: /* @__PURE__ */ jsx8(Main, {}) });
}
var styles7 = StyleSheet7.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 140, width: "100%", maxWidth: 560, alignSelf: "center" },
  headerRow: { flexDirection: "row", alignItems: "center" },
  gear: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
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
  briefBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 18,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: "rgba(108,140,255,0.35)"
  },
  playIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center"
  },
  playGlyph: { color: "#fff", fontSize: 16, marginLeft: 3 },
  briefTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  briefSub: { color: colors.textSub, fontSize: 12, marginTop: 2 },
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
