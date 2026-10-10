// 読み上げ開始の効果音（assets/sounds/intro.wav）を合成する。
// 実行: node scripts/make-intro-sound.mjs
import { writeFileSync } from 'node:fs';

const rate = 22050;
const len = Math.round(rate * 1.7);
const out = new Float32Array(len);

const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));

for (let i = 0; i < len; i++) {
  const t = i / rate;
  let v = 0;
  // 低いブーン（下降するサブベース）
  const f0 = 90 - 40 * Math.min(t / 0.8, 1);
  v += 0.55 * Math.sin(2 * Math.PI * f0 * t) * env(t, 0.02, 0.35);
  // 上昇するスイープ
  if (t < 0.55) {
    const f = 300 + 1800 * (t / 0.55) ** 2;
    v += 0.12 * Math.sin(2 * Math.PI * f * t) * (t / 0.55) * (1 - t / 0.55);
  }
  // 2音のチャイム（HUD風）
  for (const [start, freq] of [[0.5, 880], [0.68, 1318.5]]) {
    if (t >= start) {
      const u = t - start;
      const e = env(u, 0.005, 0.45);
      v += 0.22 * e * (Math.sin(2 * Math.PI * freq * u) + 0.35 * Math.sin(2 * Math.PI * freq * 2 * u));
    }
  }
  out[i] = v;
}

// 全体をフェードアウトして正規化
let peak = 0;
for (let i = 0; i < len; i++) {
  out[i] *= Math.min(1, (len - i) / (rate * 0.25));
  peak = Math.max(peak, Math.abs(out[i]));
}
const buf = Buffer.alloc(44 + len * 2);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + len * 2, 4);
buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(rate, 24);
buf.writeUInt32LE(rate * 2, 28);
buf.writeUInt16LE(2, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(len * 2, 40);
for (let i = 0; i < len; i++) buf.writeInt16LE(Math.round((out[i] / peak) * 0.8 * 32767), 44 + i * 2);
writeFileSync(new URL('../assets/sounds/intro.wav', import.meta.url), buf);
console.log('wrote assets/sounds/intro.wav', buf.length, 'bytes');
