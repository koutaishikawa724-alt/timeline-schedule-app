import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { ScheduleEvent } from '../types';
import { colors } from '../theme';
import { formatTime } from '../date';

type Props = {
  events: ScheduleEvent[];
  size: number;
  /** 今日なら現在時刻の針を出す */
  nowMin?: number;
  highlightId?: string;
  centerTitle: string;
  centerSub: string;
  onPressEvent?: (ev: ScheduleEvent) => void;
  /** 時計の文字盤に出す半日（0 = 午前 0〜12時、1 = 午後 12〜24時） */
  half: 0 | 1;
};

/** 普通の時計と同じく、文字盤1周＝12時間 */
const DIAL = 720;

/** 0:00 からの分数を、文字盤上の角度にして座標を返す（12時が真上、3時が右） */
function polar(cx: number, cy: number, r: number, min: number) {
  const a = (min / DIAL) * Math.PI * 2 - Math.PI / 2;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number) {
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
    'Z',
  ].join(' ');
}

/** 重なる予定を別のレーン（内側の輪）に振り分ける */
function assignLanes(events: ScheduleEvent[]) {
  const sorted = [...events].sort((a, b) => a.start - b.start);
  const laneEnds: number[] = [];
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

export default function CircleSchedule({
  events,
  size,
  nowMin,
  highlightId,
  centerTitle,
  centerSub,
  onPressEvent,
  half,
}: Props) {
  const c = size / 2;
  const from = half * DIAL;
  const to = from + DIAL;
  // この半日にかかる予定だけを、半日の範囲に切り取って描く
  const visible = useMemo(
    () =>
      events
        .filter((e) => e.end > from && e.start < to)
        .map((e) => ({ ...e, start: Math.max(e.start, from), end: Math.min(e.end, to) })),
    [events, from, to],
  );
  const nowOnDial = nowMin !== undefined && nowMin >= from && nowMin < to ? nowMin : undefined;
  const ringOuter = c - 26;
  const ringWidth = size * 0.11;
  const laned = useMemo(() => assignLanes(visible), [visible]);
  const laneCount = Math.max(1, ...laned.map((l) => l.lane + 1));
  const laneWidth = ringWidth / Math.min(laneCount, 3);

  const ticks = Array.from({ length: 60 }, (_, i) => i * 12);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* 背景の輪 */}
        <Circle cx={c} cy={c} r={ringOuter - ringWidth / 2} stroke={colors.surfaceHigh} strokeWidth={ringWidth} fill="none" />
        <Circle cx={c} cy={c} r={ringOuter - ringWidth - 10} fill={colors.surface} />

        {/* 目盛り */}
        {ticks.map((m) => {
          const major = m % 180 === 0;
          const hour = m % 60 === 0;
          const r1 = ringOuter + 4;
          const r2 = ringOuter + (major ? 12 : hour ? 8 : 5);
          const p1 = polar(c, c, r1, m);
          const p2 = polar(c, c, r2, m);
          return (
            <Line
              key={m}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={major ? colors.textSub : colors.border}
              strokeWidth={major ? 2 : 1}
            />
          );
        })}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h, i) => {
          const main = h % 3 === 0;
          const p = polar(c, c, ringOuter - ringWidth - 24, i * 60);
          return (
            <SvgText
              key={h}
              x={p.x}
              y={p.y + 4}
              fontSize={main ? 14 : 10}
              fontWeight={main ? '700' : '400'}
              fill={main ? colors.textSub : colors.textMuted}
              textAnchor="middle"
            >
              {h}
            </SvgText>
          );
        })}
        <SvgText
          x={c}
          y={c - (ringOuter - ringWidth - 24) + 20}
          fontSize={9}
          fontWeight="700"
          fill={colors.accent}
          textAnchor="middle"
          letterSpacing={2}
        >
          {half === 0 ? 'AM' : 'PM'}
        </SvgText>

        {/* 経過した時間をうっすら暗く */}
        {nowMin !== undefined && nowMin > from && (
          <Path d={arcPath(c, c, ringOuter, ringOuter - ringWidth, from, Math.min(nowMin, to))} fill="rgba(0,0,0,0.35)" />
        )}

        {/* 予定の弧 */}
        {laned.map(({ ev, lane }) => {
          const l = Math.min(lane, 2);
          const rO = ringOuter - l * laneWidth;
          const rI = rO - laneWidth + 2;
          const dim = highlightId && highlightId !== ev.id;
          const active = highlightId === ev.id;
          return (
            <G key={ev.id} opacity={dim ? 0.3 : 1}>
              {active && (
                <Path d={arcPath(c, c, rO + 6, rI - 6, ev.start, ev.end)} fill={ev.color} opacity={0.3} />
              )}
              <Path
                d={arcPath(c, c, rO, rI, ev.start, ev.end)}
                fill={ev.color}
                onPress={onPressEvent ? () => onPressEvent(events.find((e) => e.id === ev.id) ?? ev) : undefined}
              />
            </G>
          );
        })}

        {/* 現在時刻の針 */}
        {nowOnDial !== undefined && (
          <G>
            <Line
              x1={polar(c, c, ringOuter - ringWidth - 8, nowOnDial).x}
              y1={polar(c, c, ringOuter - ringWidth - 8, nowOnDial).y}
              x2={polar(c, c, ringOuter + 10, nowOnDial).x}
              y2={polar(c, c, ringOuter + 10, nowOnDial).y}
              stroke={colors.text}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <Circle
              cx={polar(c, c, ringOuter + 12, nowOnDial).x}
              cy={polar(c, c, ringOuter + 12, nowOnDial).y}
              r={4}
              fill={colors.text}
            />
          </G>
        )}
      </Svg>

      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <Text style={styles.centerTitle} numberOfLines={1}>
          {centerTitle}
        </Text>
        <Text style={styles.centerSub} numberOfLines={2}>
          {centerSub}
        </Text>
      </View>
    </View>
  );
}

export function describeCenter(events: ScheduleEvent[], nowMin?: number) {
  const sorted = [...events].sort((a, b) => a.start - b.start);
  if (nowMin === undefined) {
    return { title: `${sorted.length}件`, sub: sorted[0] ? `最初は ${formatTime(sorted[0].start)}` : '予定なし' };
  }
  const current = sorted.find((e) => e.start <= nowMin && nowMin < e.end);
  const next = sorted.find((e) => e.start > nowMin);
  return {
    title: formatTime(nowMin),
    sub: current
      ? `いま：${current.title}`
      : next
        ? `次：${formatTime(next.start)} ${next.title}`
        : sorted.length > 0
          ? '今日の予定は完了'
          : '予定なし',
  };
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: '30%' },
  centerTitle: { color: colors.text, fontSize: 34, fontWeight: '200', letterSpacing: 1 },
  centerSub: { color: colors.textSub, fontSize: 12, marginTop: 4, textAlign: 'center' },
});

/** 最初に見せる半日：今日なら今の時間帯、それ以外は最初の予定がある方 */
export function defaultHalf(events: ScheduleEvent[], nowMin?: number): 0 | 1 {
  if (nowMin !== undefined) return nowMin < 720 ? 0 : 1;
  const first = [...events].sort((a, b) => a.start - b.start)[0];
  return first && first.start >= 720 ? 1 : 0;
}
