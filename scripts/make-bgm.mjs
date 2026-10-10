// 読み上げ中に流すBGM（assets/sounds/bgm.wav）を合成する。12秒でつなぎ目なくループする。
// 実行: node scripts/make-bgm.mjs
import { writeFileSync } from 'node:fs';

const rate = 22050;
const seconds = 12; // 80BPM × 16拍
const len = rate * seconds;
const out = new Float32Array(len);
const beat = 0.75;
const TAU = 2 * Math.PI;

for (let i = 0; i < len; i++) {
  const t = i / rate;
  // ゆっくり揺れる低いドローン（Aと5度上）。周波数は12秒で整数周期になる値だけを使う
  const swell = 0.6 + 0.4 * Math.sin((TAU * t) / seconds);
  let v = 0.32 * Math.sin(TAU * 55 * t) + 0.18 * Math.sin(TAU * 82.5 * t) * swell;
  v += 0.06 * Math.sin(TAU * 110 * t) * (1 - swell * 0.5);
  // 高めのきらっとしたパッド（ゆっくり出入り）
  const shimmer = 0.5 + 0.5 * Math.sin((TAU * t) / 6 - Math.PI / 2);
  v += 0.035 * shimmer * (Math.sin(TAU * 440 * t) + 0.6 * Math.sin(TAU * 659.25 * t));
  // 心拍のようなキック（1拍ごと、裏拍は弱く）
  const bt = t % beat;
  const n = Math.floor(t / beat);
  const kickF = 60 * Math.exp(-bt * 18) + 42;
  const kickAmp = (n % 2 === 0 ? 0.55 : 0.3) * Math.exp(-bt * 9);
  v += kickAmp * Math.sin(TAU * kickF * bt);
  // 2拍目と4拍目に小さなチック
  if (n % 2 === 1 && bt < 0.03) v += 0.04 * Math.sin(TAU * 3000 * bt) * (1 - bt / 0.03);
  out[i] = v;
}

let peak = 0;
for (const x of out) peak = Math.max(peak, Math.abs(x));
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
for (let i = 0; i < len; i++) buf.writeInt16LE(Math.round((out[i] / peak) * 0.85 * 32767), 44 + i * 2);
writeFileSync(new URL('../assets/sounds/bgm.wav', import.meta.url), buf);
console.log('wrote assets/sounds/bgm.wav', buf.length, 'bytes');
