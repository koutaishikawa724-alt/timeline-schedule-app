import * as Speech from 'expo-speech';
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { ScheduleEvent } from './types';
import { fromKey, speakDuration, speakTime, weekday } from './date';
import { NarrationStyle } from './settings';

export type BriefingSegment = {
  text: string;
  /** この文で読み上げている予定（円グラフのハイライト用） */
  eventId?: string;
  /** サーバーで作った高品質音声。無ければ端末の音声合成で読む */
  audioUrl?: string;
};

const API_URL = process.env.EXPO_PUBLIC_BRIEFING_API_URL?.replace(/\/$/, '');
const APP_TOKEN = process.env.EXPO_PUBLIC_BRIEFING_APP_TOKEN;

export const aiBriefingEnabled = !!API_URL;

/**
 * 読み上げサーバーに原稿（と音声）を作ってもらう。
 * サーバー未設定・失敗・タイムアウト時は null を返し、呼び出し側でテンプレート原稿に切り替える。
 */
export async function fetchAiBriefing(
  key: string,
  events: ScheduleEvent[],
  dayLabel: '今日' | '明日' | null,
): Promise<BriefingSegment[] | null> {
  if (!API_URL) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(`${API_URL}/briefing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(APP_TOKEN ? { 'X-App-Token': APP_TOKEN } : {}) },
      body: JSON.stringify({
        date: key,
        dayLabel,
        events: events.map(({ id, title, start, end }) => ({ id, title, start, end })),
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { segments?: { text: string; eventId: string | null; audioUrl?: string }[] };
    if (!data.segments?.length) return null;
    return data.segments.map((s) => ({ text: s.text, eventId: s.eventId ?? undefined, audioUrl: s.audioUrl }));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
/** 同じ言い回しが続かないよう順番に使う */
const rotate = <T,>(n: number, list: T[]): T => list[n % list.length];

function greeting(hour: number, name: string): string {
  const who = name ? `${name}さん、` : '';
  if (hour < 5) return `${who}夜分にお疲れさまです。`;
  if (hour < 11) return `おはようございます、${who || ''}`.replace(/、$/, '。');
  if (hour < 18) return `こんにちは、${who || ''}`.replace(/、$/, '。');
  return `こんばんは、${who || ''}`.replace(/、$/, '。');
}

type Phrases = {
  open: (subject: string) => string[];
  count: (dateText: string, n: number) => string;
  only: (t: string, title: string, dur: string) => string;
  first: (t: string, title: string) => string[];
  /** 今日の途中で、すでに終わった予定があるときの「次は」 */
  resume: (t: string, title: string) => string;
  middle: (t: string, title: string, dur: string) => string[];
  last: (t: string, title: string) => string[];
  free: (dur: string) => string[];
  overlap: string;
  busy: string;
  empty: string[];
  close: (n: number, subject: string, name: string) => string[];
};

const PHRASES: Record<NarrationStyle, Phrases> = {
  mission: {
    open: (s) => [`${s}のブリーフィングを開始します。`, `${s}のミッションを確認しましょう。`, `これより、${s}の作戦概要をお伝えします。`],
    count: (d, n) => `${d}。ミッションは全部で、${n}件。`,
    only: (t, ti, dur) => `唯一のミッションは、${t}から。「${ti}」。${dur}の予定です。`,
    first: (t, ti) => [`最初のミッションは、${t}。「${ti}」。`, `作戦開始は${t}。「${ti}」。`],
    resume: (t, ti) => `次のミッションは、${t}。「${ti}」。`,
    middle: (t, ti, dur) => [`続いて${t}、「${ti}」。${dur}です。`, `${t}、次の目標は「${ti}」。`, `次は${t}。「${ti}」。`],
    last: (t, ti) => [`そして最終ミッションは、${t}。「${ti}」。`, `締めくくりは${t}、「${ti}」。`],
    free: (d) => [`その後、${d}の待機時間。しっかりチャージを。`, `ここで${d}のブレイク。`, `${d}の空白。自由に使ってください。`],
    overlap: '警告。次の予定と時間が重なっています。',
    busy: 'かなりタイトなスケジュールです。ペース配分に注意してください。',
    empty: ['ミッションはありません。完全なフリー。思い切り楽しんでください。', '白紙のキャンバスです。自由に描いてください。'],
    close: (n, s, name) => [
      `以上、全${n}件。準備は整いました。最高の一日を。`,
      `ブリーフィングは以上。${name ? `${name}さん、` : ''}健闘を祈ります。`,
      `以上です。すべては、あなたの手の中に。いってらっしゃい。`,
    ],
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
    overlap: 'おっと、次の予定と時間がかぶってますよ！',
    busy: '今日はぎっしり詰まってますね。水分補給も忘れずに！',
    empty: ['今日は予定なし！好きな曲をかけて、自由に過ごしちゃいましょう。'],
    close: (n, s, name) => [
      `以上、${n}件のラインナップでお送りしました！${name ? `${name}さん、` : ''}いってらっしゃい！`,
      `${s}も最高の一日になりますように。それではまた！`,
    ],
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
    overlap: '次の予定と、時間が重なっています。',
    busy: '詰まった一日です。焦らず、ひとつずつ。',
    empty: ['予定はありません。ゆっくり過ごしてください。'],
    close: (n, s, name) => [`以上、${n}件。${name ? `${name}さん、` : ''}良い一日を。`, '準備は、できています。'],
  },
};

export type BriefingOptions = { name?: string; style?: NarrationStyle };

/**
 * 予定リストから読み上げ原稿を組み立てる（APIなし・端末内）。
 * 今日の場合は、終わった予定を数えて、これからの予定を中心に読む。
 */
export function buildBriefing(
  key: string,
  events: ScheduleEvent[],
  dayLabel: '今日' | '明日' | null,
  opts: BriefingOptions = {},
  now = new Date(),
): BriefingSegment[] {
  const name = opts.name?.trim() ?? '';
  const P = PHRASES[opts.style ?? 'mission'];
  const d = fromKey(key);
  const dateText = `${d.getMonth() + 1}月${d.getDate()}日、${weekday(d)}曜日`;
  const all = [...events].sort((a, b) => a.start - b.start);
  const subject = dayLabel === '明日' ? '明日' : dayLabel === '今日' ? '本日' : 'この日';
  const segs: BriefingSegment[] = [];
  let freeCount = Math.floor(Math.random() * 3);

  segs.push({ text: `${greeting(now.getHours(), name)}${pick(P.open(subject))}` });

  if (all.length === 0) {
    segs.push({ text: `${dateText}。` });
    segs.push({ text: pick(P.empty) });
    return segs;
  }

  // 今日なら、もう終わった予定は数だけ伝える
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const done = dayLabel === '今日' ? all.filter((e) => e.end <= nowMin) : [];
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
    let line: string;
    if (sorted.length === 1) line = P.only(time, ev.title, dur);
    else if (i === 0) line = done.length > 0 ? P.resume(time, ev.title) : pick(P.first(time, ev.title));
    else if (i === sorted.length - 1) line = pick(P.last(time, ev.title));
    else line = rotate(i - 1, P.middle(time, ev.title, dur));
    segs.push({ text: line, eventId: ev.id });

    // 今日の最初の予定には「あと何分」を添える
    if (i === 0 && dayLabel === '今日') {
      if (ev.start <= nowMin) segs.push({ text: 'これは、まさに今、進行中です。', eventId: ev.id });
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

const INTRO_SOUND = require('../assets/sounds/intro.wav');

export type VoiceOption = { id: string; name: string; enhanced: boolean };

/** 端末に入っている日本語の声の一覧（高品質なものを先頭に） */
export async function listJapaneseVoices(): Promise<VoiceOption[]> {
  try {
    // 音声一覧が返ってこない端末・ブラウザでも止まらないよう、1.5秒で諦める
    const voices = await Promise.race([
      Speech.getAvailableVoicesAsync(),
      new Promise<Speech.Voice[]>((resolve) => setTimeout(() => resolve([]), 1500)),
    ]);
    return voices
      .filter((v) => v.language?.toLowerCase().replace('_', '-').startsWith('ja'))
      .map((v) => ({ id: v.identifier, name: v.name, enhanced: v.quality === Speech.VoiceQuality.Enhanced }))
      .sort((a, b) => Number(b.enhanced) - Number(a.enhanced) || a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

let autoVoice: string | undefined;
let autoVoiceLooked = false;

async function resolveVoice(voiceId?: string): Promise<string | undefined> {
  if (voiceId) return voiceId;
  if (!autoVoiceLooked) {
    autoVoiceLooked = true;
    autoVoice = (await listJapaneseVoices())[0]?.id;
  }
  return autoVoice;
}

export type VoiceSettings = { voiceId?: string; rate: number; pitch: number; sound: boolean };

/** 音源を1回鳴らし、終わったら onDone。止めるための player を返す */
function playSource(source: Parameters<typeof createAudioPlayer>[0], onDone: () => void): AudioPlayer {
  const p = createAudioPlayer(source);
  let done = false;
  p.addListener('playbackStatusUpdate', (status) => {
    if (status.didJustFinish && !done) {
      done = true;
      onDone();
    }
  });
  p.play();
  return p;
}

/** 設定画面の「試し聞き」用 */
export async function previewVoice(text: string, voice: VoiceSettings): Promise<void> {
  await Speech.stop();
  Speech.speak(text, { language: 'ja-JP', voice: await resolveVoice(voice.voiceId), rate: voice.rate, pitch: voice.pitch });
}

export type BriefingHandle = { stop: () => void };

/** 効果音のあと、原稿を1文ずつ順に読み上げる。onSegment で今読んでいる文を通知 */
export function playBriefing(
  segments: BriefingSegment[],
  voice: VoiceSettings,
  onSegment: (index: number) => void,
  onFinish: () => void,
): BriefingHandle {
  let cancelled = false;
  let player: AudioPlayer | null = null;

  const releasePlayer = () => {
    player?.remove();
    player = null;
  };

  const speakAt = async (i: number) => {
    releasePlayer();
    if (cancelled) return;
    if (i >= segments.length) {
      onFinish();
      return;
    }
    onSegment(i);
    const seg = segments[i];

    if (seg.audioUrl) {
      try {
        player = playSource({ uri: seg.audioUrl }, () => void speakAt(i + 1));
        return;
      } catch {
        // 再生できなければ端末の音声で読む
      }
    }

    const voiceId = await resolveVoice(voice.voiceId);
    if (cancelled) return;
    Speech.speak(seg.text, {
      language: 'ja-JP',
      voice: voiceId,
      rate: voice.rate,
      pitch: voice.pitch,
      onDone: () => void speakAt(i + 1),
      onError: () => void speakAt(i + 1),
    });
  };

  const start = () => {
    if (cancelled) return;
    if (!voice.sound) return void speakAt(0);
    try {
      // 効果音が終わらない環境でも先に進めるよう、保険のタイマーも置く
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

  // iPhone のマナーモード中でも音を出す
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  Speech.stop().finally(start);

  return {
    stop: () => {
      cancelled = true;
      releasePlayer();
      Speech.stop();
      onFinish();
    },
  };
}
