import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BriefingSegment, segmentDuration } from '../briefing';
import { colors } from '../theme';
import { ScheduleEvent } from '../types';
import CircleSchedule, { defaultHalf } from './CircleSchedule';
import { formatTime } from '../date';

type Props = {
  visible: boolean;
  segments: BriefingSegment[];
  /** -1 はオープニングのタイトル */
  index: number;
  events: ScheduleEvent[];
  title: string;
  onStop: () => void;
  onSkip: () => void;
};

const TYPE_MS = 42;
const BAR = 54;

/** 文字を1文字ずつ打ち出す */
function useTypewriter(text: string, key: number): string {
  const [shown, setShown] = useState('');
  useEffect(() => {
    setShown('');
    if (!text) return;
    let n = 0;
    const t = setInterval(() => {
      n++;
      setShown(text.slice(0, n));
      if (n >= text.length) clearInterval(t);
    }, TYPE_MS);
    return () => clearInterval(t);
  }, [text, key]);
  return shown;
}

/** ブリーフィングの全画面演出（映画のオープニング風） */
export default function BriefingOverlay({ visible, segments, index, events, title, onStop, onSkip }: Props) {
  const { width } = useWindowDimensions();
  const bars = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  // 上下の黒帯（シネマスコープ）と、光の脈打ち
  useEffect(() => {
    if (!visible) return;
    bars.setValue(0);
    Animated.timing(bars, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, bars, pulse]);

  const preparing = segments.length === 0;
  const opening = index < 0 || preparing;
  const seg = opening ? undefined : segments[index];

  // 場面が切り替わるたびに、ふわっと入ってきて、下の進行バーが伸びる
  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    progress.setValue(0);
    if (seg) {
      Animated.timing(progress, { toValue: 1, duration: segmentDuration(seg.text), easing: Easing.linear, useNativeDriver: false }).start();
    }
  }, [index, preparing, enter, progress, seg]);

  const typed = useTypewriter(seg?.text ?? '', index);
  const ev = events.find((e) => e.id === seg?.eventId);
  const accent = ev?.color ?? colors.accent;

  // 今の予定の時間帯（午前/午後）の文字盤を出す。予定以外の文の間は直前のまま
  const halfRef = useRef<0 | 1>(defaultHalf(events));
  if (ev) halfRef.current = ev.start >= 720 ? 1 : 0;
  else if (opening) halfRef.current = defaultHalf(events);

  const barHeight = bars.interpolate({ inputRange: [0, 1], outputRange: [0, BAR] });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const glow = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.35] });
  const rise = enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const zoom = enter.interpolate({ inputRange: [0, 1], outputRange: [1.15, 1] });
  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.min(width, 560) - 56] });
  const dial = Math.min(260, width - 110);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onStop}>
      <Pressable style={styles.root} onPress={opening ? undefined : onSkip}>
        <Animated.View style={[styles.bar, { top: 0, height: barHeight }]} />
        <Animated.View style={[styles.bar, { bottom: 0, height: barHeight }]} />

        {opening ? (
          <Animated.View style={[styles.opening, { opacity: enter, transform: [{ scale: zoom }] }]}>
            <Text style={styles.kicker}>{'TODAY’S BRIEFING'}</Text>
            <View style={styles.rule} />
            <Text style={styles.openTitle}>{title}</Text>
            <Text style={styles.openSub}>{preparing ? '原稿を準備中…' : `予定 ${events.length}件`}</Text>
          </Animated.View>
        ) : (
          <>
            <Text style={styles.sceneLabel}>
              {`SCENE ${String(index + 1).padStart(2, '0')} / ${String(segments.length).padStart(2, '0')}`}
            </Text>

            <Animated.View style={[styles.stage, { width: dial + 30, height: dial + 30, opacity: enter }]}>
              <Animated.View
                style={[
                  styles.glow,
                  { width: dial - 30, height: dial - 30, borderRadius: dial, backgroundColor: accent, opacity: glow, transform: [{ scale }] },
                ]}
              />
              <CircleSchedule
                events={events}
                size={dial}
                highlightId={seg?.eventId}
                half={halfRef.current}
                centerTitle={ev ? formatTime(ev.start) : `${index + 1}/${segments.length}`}
                centerSub={ev ? ev.title : 'BRIEFING'}
              />
            </Animated.View>

            <Animated.View style={{ opacity: enter, transform: [{ translateY: rise }] }}>
              {ev ? <Text style={[styles.eventTag, { color: accent }]}>{`${formatTime(ev.start)} – ${formatTime(ev.end)}`}</Text> : null}
              <Text style={styles.line}>
                {typed}
                <Text style={{ color: accent }}>▍</Text>
              </Text>
            </Animated.View>

            <View style={styles.track}>
              <Animated.View style={[styles.fill, { width: barWidth, backgroundColor: accent }]} />
            </View>
            <Text style={styles.hint}>タップで次へ</Text>
          </>
        )}

        <Pressable onPress={onStop} style={styles.close} hitSlop={10}>
          <Text style={styles.closeText}>閉じる</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05060C', alignItems: 'center', justifyContent: 'center', padding: 28 },
  bar: { position: 'absolute', left: 0, right: 0, backgroundColor: '#000', zIndex: 2 },
  opening: { alignItems: 'center' },
  kicker: { color: colors.accent, fontSize: 12, letterSpacing: 8, fontWeight: '700' },
  rule: { width: 48, height: 2, backgroundColor: colors.accent, marginVertical: 18, borderRadius: 1 },
  openTitle: { color: colors.text, fontSize: 30, fontWeight: '800', letterSpacing: 2, textAlign: 'center' },
  openSub: { color: colors.textSub, fontSize: 14, marginTop: 12, letterSpacing: 3 },
  sceneLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 5, fontWeight: '700' },
  stage: { alignItems: 'center', justifyContent: 'center', marginVertical: 18 },
  glow: { position: 'absolute' },
  eventTag: { fontSize: 13, fontWeight: '700', letterSpacing: 3, textAlign: 'center', marginBottom: 8 },
  line: { color: colors.text, fontSize: 21, lineHeight: 33, fontWeight: '600', textAlign: 'center', minHeight: 100, maxWidth: 480 },
  track: { height: 2, alignSelf: 'stretch', maxWidth: 504, backgroundColor: colors.border, marginTop: 18, borderRadius: 1, overflow: 'hidden' },
  fill: { height: 2 },
  hint: { color: colors.textMuted, fontSize: 11, letterSpacing: 2, marginTop: 10 },
  close: {
    position: 'absolute',
    bottom: BAR + 18,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 3,
  },
  closeText: { color: colors.textSub, fontSize: 13, fontWeight: '600', letterSpacing: 3 },
});
