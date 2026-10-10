import * as Speech from 'expo-speech';
import { ScheduleEvent } from './types';
import { fromKey, speakDuration, speakTime, weekday } from './date';

export type BriefingSegment = {
  text: string;
  /** この文で読み上げている予定（円グラフのハイライト用） */
  eventId?: string;
};

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
/** 同じ言い回しが続かないよう順番に使う */
const rotate = <T,>(n: number, list: T[]): T => list[n % list.length];

function greeting(hour: number): string {
  if (hour < 5) return '夜分にお疲れさまです。';
  if (hour < 11) return 'おはようございます。';
  if (hour < 18) return 'こんにちは。';
  return 'こんばんは。';
}

/**
 * 予定リストから、かっこいい読み上げ原稿を組み立てる。
 * 今は端末内のテンプレートで生成。将来ここを AI 生成に差し替える。
 */
export function buildBriefing(
  key: string,
  events: ScheduleEvent[],
  dayLabel: '今日' | '明日' | null,
  now = new Date(),
): BriefingSegment[] {
  const d = fromKey(key);
  const dateText = `${d.getMonth() + 1}月${d.getDate()}日、${weekday(d)}曜日`;
  const sorted = [...events].sort((a, b) => a.start - b.start);
  const subject = dayLabel === '明日' ? '明日' : dayLabel === '今日' ? '本日' : 'この日';
  const segs: BriefingSegment[] = [];
  let freeCount = Math.floor(Math.random() * 3);

  segs.push({
    text: `${greeting(now.getHours())}${pick([
      `${subject}のブリーフィングを開始します。`,
      `${subject}のタイムラインをお伝えします。`,
      `${subject}のミッションを確認しましょう。`,
    ])}`,
  });

  if (sorted.length === 0) {
    segs.push({ text: `${dateText}。予定は、まだ入っていません。` });
    segs.push({
      text: pick(['白紙のキャンバスです。自由に描いてください。', '完全なフリー。思い切り楽しんでください。']),
    });
    return segs;
  }

  segs.push({ text: `${dateText}。予定は全部で、${sorted.length}件です。` });

  sorted.forEach((ev, i) => {
    const time = speakTime(ev.start);
    const dur = speakDuration(ev.end - ev.start);
    let line: string;
    if (sorted.length === 1) {
      line = `唯一のミッションは、${time}から。「${ev.title}」。${dur}の予定です。`;
    } else if (i === 0) {
      line = pick([
        `最初のミッションは、${time}。「${ev.title}」。`,
        `まずは${time}、「${ev.title}」からスタート。`,
      ]);
    } else if (i === sorted.length - 1) {
      line = pick([`そしてラストは、${time}。「${ev.title}」。`, `締めくくりは${time}、「${ev.title}」。`]);
    } else {
      line = rotate(i - 1, [
        `続いて${time}、「${ev.title}」。${dur}です。`,
        `${time}からは、「${ev.title}」。`,
        `次は${time}。「${ev.title}」。`,
      ]);
    }
    segs.push({ text: line, eventId: ev.id });

    const next = sorted[i + 1];
    if (next && next.start - ev.end >= 120) {
      const free = speakDuration(next.start - ev.end);
      segs.push({
        text: rotate(freeCount++, [
          `その後、${free}のフリータイム。しっかりチャージを。`,
          `ここで${free}のブレイク。`,
          `${free}の空白。自由に使ってください。`,
        ]),
      });
    } else if (next && next.start < ev.end) {
      segs.push({ text: '次の予定と時間が重なっています。ご注意を。' });
    }
  });

  segs.push({
    text: pick([
      `以上、全${sorted.length}件。準備は整いました。最高の一日を。`,
      `ブリーフィングは以上です。${subject}も、あなたらしく駆け抜けてください。`,
      `以上です。すべては、あなたの手の中に。いってらっしゃい。`,
    ]),
  });
  return segs;
}

let preferredVoice: string | undefined;
let voiceLookedUp = false;

async function findJapaneseVoice(): Promise<string | undefined> {
  if (voiceLookedUp) return preferredVoice;
  voiceLookedUp = true;
  try {
    // 音声一覧が返ってこない端末・ブラウザでも止まらないよう、1.5秒で諦める
    const voices = await Promise.race([
      Speech.getAvailableVoicesAsync(),
      new Promise<Speech.Voice[]>((resolve) => setTimeout(() => resolve([]), 1500)),
    ]);
    const ja = voices.filter((v) => v.language?.toLowerCase().startsWith('ja'));
    const best = ja.find((v) => v.quality === Speech.VoiceQuality.Enhanced) ?? ja[0];
    preferredVoice = best?.identifier;
  } catch {
    preferredVoice = undefined;
  }
  return preferredVoice;
}

export type BriefingHandle = { stop: () => void };

/** 原稿を1文ずつ順に読み上げる。onSegment で今読んでいる文を通知 */
export function playBriefing(
  segments: BriefingSegment[],
  onSegment: (index: number) => void,
  onFinish: () => void,
): BriefingHandle {
  let cancelled = false;

  const speakAt = async (i: number) => {
    if (cancelled) return;
    if (i >= segments.length) {
      onFinish();
      return;
    }
    onSegment(i);
    const voice = await findJapaneseVoice();
    if (cancelled) return;
    Speech.speak(segments[i].text, {
      language: 'ja-JP',
      voice,
      rate: 1.0,
      pitch: 0.92,
      onDone: () => void speakAt(i + 1),
      onError: () => void speakAt(i + 1),
    });
  };

  Speech.stop().finally(() => speakAt(0));

  return {
    stop: () => {
      cancelled = true;
      Speech.stop();
      onFinish();
    },
  };
}
