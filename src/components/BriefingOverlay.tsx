import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { BriefingSegment } from '../briefing';
import { colors } from '../theme';
import { ScheduleEvent } from '../types';
import CircleSchedule from './CircleSchedule';
import { formatTime } from '../date';

type Props = {
  visible: boolean;
  segments: BriefingSegment[];
  index: number;
  events: ScheduleEvent[];
  title: string;
  onStop: () => void;
};

/** 読み上げ中の全画面演出 */
export default function BriefingOverlay({ visible, segments, index, events, title, onStop }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, pulse]);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [index, fade]);

  const seg = segments[index];
  const ev = events.find((e) => e.id === seg?.eventId);
  const accent = ev?.color ?? colors.accent;
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const glow = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] });

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onStop}>
      <View style={styles.root}>
        <Text style={styles.kicker}>BRIEFING</Text>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.stage}>
          <Animated.View style={[styles.glow, { backgroundColor: accent, opacity: glow, transform: [{ scale }] }]} />
          <CircleSchedule
            events={events}
            size={280}
            highlightId={seg?.eventId}
            centerTitle={ev ? formatTime(ev.start) : `${Math.min(index + 1, segments.length)}/${segments.length}`}
            centerSub={ev ? ev.title : '読み上げ中'}
          />
        </View>

        <Animated.Text style={[styles.line, { opacity: fade }]}>{seg?.text ?? ''}</Animated.Text>

        <View style={styles.progress}>
          {segments.map((_, i) => (
            <View key={i} style={[styles.pip, i <= index && { backgroundColor: accent }]} />
          ))}
        </View>

        <Pressable onPress={onStop} style={styles.stop}>
          <Text style={styles.stopText}>停止</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05060C', alignItems: 'center', justifyContent: 'center', padding: 28 },
  kicker: { color: colors.accent, fontSize: 12, letterSpacing: 6, fontWeight: '700' },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginTop: 6 },
  stage: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center', marginVertical: 28 },
  glow: { position: 'absolute', width: 240, height: 240, borderRadius: 120 },
  line: { color: colors.text, fontSize: 20, lineHeight: 32, textAlign: 'center', minHeight: 96, maxWidth: 480 },
  progress: { flexDirection: 'row', gap: 6, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' },
  pip: { width: 18, height: 3, borderRadius: 2, backgroundColor: colors.border },
  stop: { marginTop: 36, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 30, borderWidth: 1, borderColor: colors.border },
  stopText: { color: colors.textSub, fontSize: 15, fontWeight: '600', letterSpacing: 2 },
});
