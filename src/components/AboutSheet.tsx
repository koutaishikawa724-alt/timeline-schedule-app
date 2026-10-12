import React, { useEffect, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { APP_NAME, APP_VERSION, PRIVACY_URL, SUPPORT_URL } from '../appInfo';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** すべてのデータを消したあとに呼ぶ */
  onDeleteAll: () => Promise<void>;
};

/** アプリについて：プライバシーポリシー、お問い合わせ、データの削除 */
export default function AboutSheet({ visible, onClose, onDeleteAll }: Props) {
  // 消す前にもう一度押してもらう（間違えて押しても大丈夫なように）
  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    if (visible) {
      setConfirming(false);
      setDeleted(false);
    }
  }, [visible]);

  const open = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.headerRow}>
            <Text style={styles.heading}>アプリについて</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.done}>閉じる</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.app}>
              <Text style={styles.appName}>{APP_NAME}</Text>
              <Text style={styles.version}>バージョン {APP_VERSION}</Text>
            </View>

            <Text style={styles.label}>データについて</Text>
            <View style={styles.card}>
              <Text style={styles.body}>
                予定・日記・写真は、このiPhoneの中だけに保存されます。アカウント登録はなく、データが外部に送られることはありません。
              </Text>
            </View>

            <Text style={styles.label}>サポート</Text>
            <View style={styles.card}>
              <Row label="プライバシーポリシー" onPress={() => open(PRIVACY_URL)} />
              <View style={styles.divider} />
              <Row label="お問い合わせ・不具合の報告" onPress={() => open(SUPPORT_URL)} />
            </View>

            <Text style={styles.label}>データの削除</Text>
            <View style={styles.card}>
              {deleted ? (
                <Text style={styles.body}>すべてのデータを消しました。</Text>
              ) : (
                <>
                  <Text style={styles.body}>
                    {confirming
                      ? '本当に消しますか？ 予定・日記・写真がすべて消え、元に戻せません。'
                      : 'このiPhoneに保存した予定・日記・写真をすべて消します。'}
                  </Text>
                  <View style={styles.deleteRow}>
                    {confirming && (
                      <Pressable onPress={() => setConfirming(false)} style={[styles.button, styles.cancel]}>
                        <Text style={[styles.buttonText, { color: colors.textSub }]}>やめる</Text>
                      </Pressable>
                    )}
                    <Pressable
                      onPress={async () => {
                        if (!confirming) return setConfirming(true);
                        await onDeleteAll();
                        setDeleted(true);
                      }}
                      style={[styles.button, confirming ? styles.dangerSolid : styles.danger]}
                    >
                      <Text style={[styles.buttonText, { color: confirming ? '#fff' : colors.danger }]}>
                        {confirming ? 'すべて消す' : 'すべてのデータを消す'}
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Row({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={styles.rowText}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
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
    paddingBottom: 36,
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
  app: { alignItems: 'center', paddingVertical: 18 },
  appName: { color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  version: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  label: { color: colors.textSub, fontSize: 12, marginTop: 18, marginBottom: 8, letterSpacing: 1, fontWeight: '700' },
  card: { backgroundColor: colors.surfaceHigh, borderRadius: 14, padding: 14 },
  body: { color: colors.textSub, fontSize: 14, lineHeight: 21 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  rowText: { flex: 1, color: colors.text, fontSize: 15 },
  chevron: { color: colors.textMuted, fontSize: 20 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  deleteRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  cancel: { backgroundColor: colors.surface },
  danger: { backgroundColor: 'rgba(255,92,122,0.12)' },
  dangerSolid: { backgroundColor: colors.danger },
  buttonText: { fontSize: 15, fontWeight: '700' },
});
