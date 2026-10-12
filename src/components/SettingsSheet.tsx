import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';
import { NarrationStyle, Settings, STYLE_LABELS } from '../settings';

type Props = {
  visible: boolean;
  settings: Settings;
  onChange: (s: Settings) => void;
  onClose: () => void;
};

const STYLE_SAMPLE: Record<NarrationStyle, string> = {
  mission: 'これより、本日の作戦概要をお伝えします。',
  dj: 'さあ始まりました、本日のスケジュール・カウントダウン！',
  cool: '本日の予定を、静かに確認しておきましょう。',
};

function Chip({ label, sub, active, onPress }: { label: string; sub?: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      {sub ? <Text style={[styles.chipSub, active && { color: 'rgba(255,255,255,0.8)' }]}>{sub}</Text> : null}
    </Pressable>
  );
}

export default function SettingsSheet({ visible, settings, onChange, onClose }: Props) {
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });
  const sampleText = `${settings.name ? `${settings.name}さん、` : ''}${STYLE_SAMPLE[settings.style]}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.headerRow}>
            <Text style={styles.heading}>ブリーフィング設定</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.done}>完了</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 12 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>呼びかける名前</Text>
            <TextInput
              value={settings.name}
              onChangeText={(name) => set({ name })}
              placeholder="例：こうた（「こうたさん」と呼びます）"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              maxLength={12}
            />

            <Text style={styles.label}>演出のテイスト</Text>
            <View style={styles.row}>
              {(Object.keys(STYLE_LABELS) as NarrationStyle[]).map((k) => (
                <Chip
                  key={k}
                  label={STYLE_LABELS[k].label}
                  sub={STYLE_LABELS[k].desc}
                  active={settings.style === k}
                  onPress={() => set({ style: k })}
                />
              ))}
            </View>

            <Text style={styles.label}>こんな感じで始まります</Text>
            <View style={styles.sample}>
              <Text style={styles.sampleKicker}>BRIEFING</Text>
              <Text style={styles.sampleText}>{sampleText}</Text>
            </View>
          </ScrollView>
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
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    maxWidth: 560,
    maxHeight: '88%',
    alignSelf: 'center',
  },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  heading: { color: colors.text, fontSize: 18, fontWeight: '700' },
  done: { color: colors.accent, fontSize: 16, fontWeight: '700' },
  label: { color: colors.textSub, fontSize: 12, marginTop: 18, marginBottom: 8, letterSpacing: 1 },
  input: {
    backgroundColor: colors.surfaceHigh,
    color: colors.text,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
  },
  row: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 12, backgroundColor: colors.surfaceHigh, alignItems: 'center' },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.textSub, fontSize: 14, fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  chipSub: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  sample: {
    backgroundColor: '#05060C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  sampleKicker: { color: colors.accent, fontSize: 11, letterSpacing: 6, fontWeight: '700', marginBottom: 10 },
  sampleText: { color: colors.text, fontSize: 17, lineHeight: 27, textAlign: 'center', fontWeight: '600' },
  note: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 },
});
