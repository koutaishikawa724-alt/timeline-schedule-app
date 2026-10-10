import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import { AudioPlayer, createAudioPlayer } from 'expo-audio';

/**
 * ElevenLabs の音声合成をアプリから直接呼ぶ。
 * APIキーはこの端末の中（設定）だけに保存し、どこにも送らない（ElevenLabs 以外）。
 * 無料プランはクレジットカード不要で、毎月一定の文字数まで使える。
 */

const API = 'https://api.elevenlabs.io/v1';
const MODEL = 'eleven_multilingual_v2';

export type ElevenVoice = { id: string; name: string; desc: string };

/** どのプランでも使える標準の声（日本語も話せる） */
export const ELEVEN_VOICES: ElevenVoice[] = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', desc: '深く力強い男性' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', desc: '低く落ち着いたナレーター' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', desc: 'ニュースキャスター風' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', desc: '渋く温かい語り' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', desc: '落ち着いた女性' },
  { id: 'EXAVITQu4vr4xnoxsVTL', name: 'Sarah', desc: 'やわらかい女性' },
];

export const DEFAULT_ELEVEN_VOICE = ELEVEN_VOICES[1].id;

export class ElevenError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** 残り文字数の確認（キーが正しいかのテストにも使う） */
export async function getElevenQuota(apiKey: string): Promise<{ used: number; limit: number }> {
  const res = await fetch(`${API}/user/subscription`, { headers: { 'xi-api-key': apiKey } });
  if (!res.ok) throw new ElevenError(await res.text(), res.status);
  const data = (await res.json()) as { character_count: number; character_limit: number };
  return { used: data.character_count, limit: data.character_limit };
}

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const memoryCache = new Map<string, string>();

/** 1文を音声にして、再生できる URI を返す。同じ文と声は端末に保存して使い回す（無料枠の節約） */
export async function synthesizeEleven(text: string, apiKey: string, voiceId: string): Promise<string> {
  const key = `${voiceId}:${text}`;
  const cached = memoryCache.get(key);
  if (cached) return cached;

  const file = Platform.OS === 'web' ? null : new File(Paths.cache, `eleven-${hash(key)}.mp3`);
  if (file?.exists) {
    memoryCache.set(key, file.uri);
    return file.uri;
  }

  const res = await fetch(`${API}/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      language_code: 'ja',
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new ElevenError(await res.text(), res.status);

  let uri: string;
  if (file) {
    file.write(new Uint8Array(await res.arrayBuffer()));
    uri = file.uri;
  } else {
    uri = URL.createObjectURL(await res.blob());
  }
  memoryCache.set(key, uri);
  return uri;
}

/**
 * 全部の文の音声を、同時に2本ずつ順番に作り始める（無料プランの同時実行数に合わせる）。
 * i 番目の文の音声ができたら解決する Promise の配列を返す。失敗した文は undefined（端末の声で読む）。
 */
export function prefetchEleven(texts: string[], apiKey: string, voiceId: string): Promise<string | undefined>[] {
  const resolvers: ((uri: string | undefined) => void)[] = [];
  const promises = texts.map((_, i) => new Promise<string | undefined>((r) => (resolvers[i] = r)));
  let next = 0;
  let fatal = false;

  const worker = async () => {
    while (next < texts.length) {
      const i = next++;
      if (fatal) {
        resolvers[i](undefined);
        continue;
      }
      try {
        resolvers[i](await synthesizeEleven(texts[i], apiKey, voiceId));
      } catch (err) {
        // キーが違う・無料枠切れなら、残りは試さずに端末の声へ
        if (err instanceof ElevenError && (err.status === 401 || err.status === 402 || err.status === 403)) fatal = true;
        resolvers[i](undefined);
      }
    }
  };
  void worker();
  void worker();
  return promises;
}

let previewPlayer: AudioPlayer | null = null;

/** 設定画面の試し聞き */
export async function previewEleven(text: string, apiKey: string, voiceId: string): Promise<void> {
  const uri = await synthesizeEleven(text, apiKey, voiceId);
  previewPlayer?.remove();
  previewPlayer = createAudioPlayer({ uri });
  previewPlayer.play();
}
