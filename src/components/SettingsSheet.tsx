import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';
import { NarrationStyle, PITCH_OPTIONS, RATE_OPTIONS, Settings, STYLE_LABELS } from '../settings';
import { listJapaneseVoices, previewVoice, VoiceOption } from '../briefing';

type Props = {
  visible: boolean;
  settings: Settings;
  onChange: (s: Settings) => void;
  onClose: () => void;
};

const RATES = RATE_OPTIONS;
const PITCHES = PITCH_OPTIONS;

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
  const [voices, setVoices] = useState<VoiceOption[] | null>(null);

  useEffect(() => {
    if (visible && voices === null) listJapaneseVoices().then(setVoices);
  }, [visible, voices]);

  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });
  const sample = (s: Settings) =>
    previewVoice(`${s.name ? `${s.name}さん、` : ''}${STYLE_SAMPLE[s.style]}`, s);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.headerRow}>
            <Text style={styles.heading}>ナレーション設定</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.done}>完了</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
            <Text style={styles.label}>呼びかける名前</Text>
            <TextInput
              value={settings.name}
              onChangeText={(name) => set({ name })}
              placeholder="例：こうた（「こうたさん」と呼びます）"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              maxLength={12}
            />

            <Text style={styles.label}>語り口</Text>
            <View style={styles.row}>
              {(Object.keys(STYLE_LABELS) as NarrationStyle[]).map((k) => (
                <Chip
                  key={k}
                  label={STYLE_LABELS[k].label}
                  sub={STYLE_LABELS[k].desc}
                  active={settings.style === k}
                  onPress={() => {
                    const next = { ...settings, style: k };
                    onChange(next);
                    sample(next);
                  }}
                />
              ))}
            </View>

            <Text style={styles.label}>声</Text>
            <View style={styles.voiceList}>
              <VoiceRow
                name="おまかせ"
                sub="一番良い日本語の声を自動で選びます"
                active={!settings.voiceId}
                onPress={() => {
                  const next = { ...settings, voiceId: undefined };
                  onChange(next);
                  sample(next);
                }}
              />
              {(voices ?? []).map((v) => (
                <VoiceRow
                  key={v.id}
                  name={v.name}
                  sub={v.enhanced ? '高品質' : undefined}
                  active={settings.voiceId === v.id}
                  onPress={() => {
                    const next = { ...settings, voiceId: v.id };
                    onChange(next);
                    sample(next);
                  }}
                />
              ))}
              {voices !== null && voices.length === 0 && (
                <Text style={styles.note}>この端末では日本語の声の一覧を取得できませんでした。</Text>
              )}
            </View>
            <Text style={styles.note}>
              {Platform.OS === 'android'
                ? 'ヒント：設定 → システム → 言語と入力 → テキスト読み上げ で、Google の日本語音声データを入れると声が自然になります（無料）。'
                : 'ヒント：iPhone の 設定 → アクセシビリティ → 読み上げコンテンツ → 声 → 日本語 で「拡張」や「プレミアム」の声を無料でダウンロードすると、ぐっと自然な声になります。'}
            </Text>

            <Text style={styles.label}>速さ</Text>
            <View style={styles.row}>
              {RATES.map((r) => (
                <Chip key={r.value} label={r.label} active={settings.rate === r.value} onPress={() => set({ rate: r.value })} />
              ))}
            </View>

            <Text style={styles.label}>声の高さ</Text>
            <View style={styles.row}>
              {PITCHES.map((p) => (
                <Chip key={p.value} label={p.label} active={settings.pitch === p.value} onPress={() => set({ pitch: p.value })} />
              ))}
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>開始の効果音</Text>
                <Text style={styles.note}>読み上げの前に短いサウンドを鳴らします</Text>
              </View>
              <Switch
                value={settings.sound}
                onValueChange={(sound) => set({ sound })}
                trackColor={{ true: colors.accent, false: colors.surfaceHigh }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>BGM</Text>
                <Text style={styles.note}>読み上げ中に低いビートを小さく流します</Text>
              </View>
              <Switch
                value={settings.bgm}
                onValueChange={(bgm) => set({ bgm })}
                trackColor={{ true: colors.accent, false: colors.surfaceHigh }}
                thumbColor="#fff"
              />
            </View>

            <Pressable onPress={() => sample(settings)} style={styles.testButton}>
              <Text style={styles.testText}>▶ 試し聞き</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function VoiceRow({ name, sub, active, onPress }: { name: string; sub?: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.voiceRow, active && styles.voiceRowActive]}>
      <View style={[styles.radio, active && styles.radioActive]} />
      <Text style={styles.voiceName} numberOfLines={1}>
        {name}
      </Text>
      {sub ? <Text style={styles.voiceSub}>{sub}</Text> : null}
    </Pressable>
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
  voiceList: { backgroundColor: colors.surfaceHigh, borderRadius: 14, overflow: 'hidden' },
  voiceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, gap: 10 },
  voiceRowActive: { backgroundColor: colors.accentSoft },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.textMuted },
  radioActive: { borderColor: colors.accent, backgroundColor: colors.accent },
  voiceName: { flex: 1, color: colors.text, fontSize: 15 },
  voiceSub: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  note: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, gap: 12 },
  switchLabel: { color: colors.text, fontSize: 15 },
  testButton: {
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(108,140,255,0.35)',
  },
  testText: { color: colors.text, fontSize: 15, fontWeight: '700' },
});
