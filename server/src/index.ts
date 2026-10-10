import http from 'node:http';
import { randomUUID } from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Timeline 読み上げサーバー
 * - POST /briefing : 予定から Claude が読み上げ原稿を書き、（設定があれば）音声を生成
 * - GET  /audio/:id.mp3 : 生成した音声を返す（10分で破棄）
 * APIキーはこのサーバーだけが持ち、アプリには入れない。
 */

const PORT = Number(process.env.PORT ?? 8787);
const APP_TOKEN = process.env.APP_TOKEN; // 設定するとアプリからのリクエストにこの合言葉を要求
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TTS_MODEL = process.env.TTS_MODEL ?? 'gpt-4o-mini-tts';
const TTS_VOICE = process.env.TTS_VOICE ?? 'onyx';
const MOCK = process.env.BRIEFING_MOCK === '1'; // APIを呼ばずに動作確認するモード

type EventIn = { id: string; title: string; start: number; end: number };
type BriefingRequest = { date: string; dayLabel: '今日' | '明日' | null; events: EventIn[] };
type Segment = { text: string; eventId: string | null; audioUrl?: string };

const client = MOCK ? null : new Anthropic();

const SYSTEM = `あなたはスマホのスケジュールアプリに内蔵された「ブリーフィング・ナレーター」です。
ユーザーが設定した1日の予定を、映画の作戦ブリーフィングや一流のラジオDJのように、かっこよく、テンポよく日本語で読み上げる原稿を書きます。

ルール:
- 予定は時刻順にすべて紹介する。予定の追加・省略・時刻の変更は絶対にしない。
- 時刻は耳で聞いて自然な形で書く（例:「9時」「9時半」「14時15分」）。数字は算用数字のままでよい。
- 1つの文（セグメント）は40文字前後までの短い一文。読み上げ中の画面に1文ずつ表示される。
- 予定を紹介するセグメントには、その予定の id を eventId に入れる。それ以外は null。
- 冒頭は日付と件数を含むオープニング、最後は気分が上がる短い締めの一言。
- 空き時間が長いところや、予定が重なっているところには一言触れてよい。
- 絵文字、記号の多用、英語の乱用はしない。全体で12セグメント程度まで。`;

const SCHEMA = {
  type: 'object',
  properties: {
    segments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          eventId: { type: ['string', 'null'] },
        },
        required: ['text', 'eventId'],
        additionalProperties: false,
      },
    },
  },
  required: ['segments'],
  additionalProperties: false,
};

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const hm = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

function describeDay(req: BriefingRequest): string {
  const [y, mo, d] = req.date.split('-').map(Number);
  const wd = WEEKDAYS[new Date(y, mo - 1, d).getDay()];
  const lines = [...req.events]
    .sort((a, b) => a.start - b.start)
    .map((e) => `- ${hm(e.start)}〜${hm(e.end)}「${e.title}」 (id: ${e.id})`);
  return [
    `対象日: ${mo}月${d}日（${wd}）${req.dayLabel ? `= ${req.dayLabel}` : ''}`,
    `現在時刻: ${new Date().toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' })}`,
    `予定 ${req.events.length}件:`,
    ...(lines.length ? lines : ['（予定なし）']),
  ].join('\n');
}

async function writeScript(req: BriefingRequest): Promise<Segment[]> {
  if (!client) {
    return [
      { text: `【テスト】${req.dayLabel ?? 'この日'}のブリーフィングを開始します。`, eventId: null },
      ...req.events.map((e) => ({ text: `${hm(e.start)}、「${e.title}」。`, eventId: e.id })),
      { text: '以上。いってらっしゃい。', eventId: null },
    ];
  }
  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    system: SYSTEM,
    messages: [{ role: 'user', content: describeDay(req) }],
  });
  if (response.stop_reason === 'refusal') throw new Error('script refused');
  const text = response.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('no script returned');
  const parsed = JSON.parse(text.text) as { segments: Segment[] };
  const ids = new Set(req.events.map((e) => e.id));
  return parsed.segments
    .filter((s) => s.text.trim().length > 0)
    .map((s) => ({ text: s.text.trim(), eventId: s.eventId && ids.has(s.eventId) ? s.eventId : null }));
}

// ---- 音声（OpenAI TTS）----
const audioStore = new Map<string, { data: Buffer; expires: number; type?: string }>();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of audioStore) if (v.expires < now) audioStore.delete(k);
}, 60_000).unref();

const VOICE_STYLE =
  '低めで落ち着いた、自信のある男性ナレーター。映画の予告編やミッションブリーフィングのように、かっこよく、歯切れよく。日本語で。';

async function synthesize(text: string): Promise<Buffer> {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: TTS_MODEL, voice: TTS_VOICE, input: text, instructions: VOICE_STYLE, response_format: 'mp3' }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

/** テストモード用：文字数に応じた長さの短いビープ音（WAV） */
function mockTone(text: string): Buffer {
  const rate = 8000;
  const n = Math.round(rate * Math.min(0.6 + text.length * 0.03, 2));
  const buf = Buffer.alloc(44 + n);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate, 28);
  buf.writeUInt16LE(1, 32);
  buf.writeUInt16LE(8, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n, 40);
  for (let i = 0; i < n; i++) buf[44 + i] = 128 + Math.round(20 * Math.sin((2 * Math.PI * 440 * i) / rate));
  return buf;
}

async function attachAudio(segments: Segment[], baseUrl: string): Promise<void> {
  if (MOCK && process.env.MOCK_AUDIO === '1') {
    for (const s of segments) {
      const id = randomUUID();
      audioStore.set(id, { data: mockTone(s.text), expires: Date.now() + 10 * 60_000, type: 'audio/wav' });
      s.audioUrl = `${baseUrl}/audio/${id}.mp3`;
    }
    return;
  }
  if (!OPENAI_API_KEY || MOCK) return;
  await Promise.all(
    segments.map(async (s) => {
      const id = randomUUID();
      audioStore.set(id, { data: await synthesize(s.text), expires: Date.now() + 10 * 60_000 });
      s.audioUrl = `${baseUrl}/audio/${id}.mp3`;
    }),
  );
}

// ---- HTTP ----
function send(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function isValid(b: unknown): b is BriefingRequest {
  const r = b as BriefingRequest;
  return (
    !!r &&
    typeof r.date === 'string' &&
    Array.isArray(r.events) &&
    r.events.length <= 50 &&
    r.events.every((e) => typeof e.id === 'string' && typeof e.title === 'string' && typeof e.start === 'number' && typeof e.end === 'number')
  );
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-App-Token');
  if (req.method === 'OPTIONS') return res.writeHead(204).end();

  const url = new URL(req.url ?? '/', 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/health') {
    return send(res, 200, { ok: true, ai: !MOCK, voice: !!OPENAI_API_KEY && !MOCK });
  }

  const audio = url.pathname.match(/^\/audio\/([\w-]+)\.mp3$/);
  if (req.method === 'GET' && audio) {
    const item = audioStore.get(audio[1]);
    if (!item) return send(res, 404, { error: 'expired' });
    res.writeHead(200, { 'Content-Type': item.type ?? 'audio/mpeg', 'Content-Length': item.data.length });
    return res.end(item.data);
  }

  if (req.method === 'POST' && url.pathname === '/briefing') {
    if (APP_TOKEN && req.headers['x-app-token'] !== APP_TOKEN) return send(res, 401, { error: 'unauthorized' });
    let raw = '';
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 50_000) return send(res, 413, { error: 'too large' });
    }
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return send(res, 400, { error: 'invalid json' });
    }
    if (!isValid(body)) return send(res, 400, { error: 'invalid request' });
    try {
      const segments = await writeScript(body);
      const base = process.env.PUBLIC_URL ?? `http://${req.headers.host}`;
      await attachAudio(segments, base.replace(/\/$/, ''));
      return send(res, 200, { segments });
    } catch (err) {
      console.error(err);
      return send(res, 502, { error: 'briefing failed' });
    }
  }

  send(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`Timeline briefing server on :${PORT} (ai=${!MOCK}, voice=${!!OPENAI_API_KEY && !MOCK})`);
});
