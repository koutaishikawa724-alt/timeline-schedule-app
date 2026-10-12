import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

/**
 * 気分の顔（線だけのシンプルな顔）。level: 0 = 最高 〜 4 = つらい
 * 輪郭を少しだけゆがませて、手で描いたような柔らかさを出す。
 */
export default function MoodFace({ level, color, size = 30 }: { level: number; color: string; size?: number }) {
  const s = { stroke: color, strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const eyes = (() => {
    switch (level) {
      case 0: // にっこり目
        return (
          <>
            <Path d="M10.2 13.6 Q12 11.4 13.8 13.6" {...s} />
            <Path d="M18.2 13.6 Q20 11.4 21.8 13.6" {...s} />
          </>
        );
      case 4: // ぎゅっと閉じた目
        return (
          <>
            <Path d="M10.4 11.6 L13.4 13.1 L10.4 14.6" {...s} />
            <Path d="M21.6 11.6 L18.6 13.1 L21.6 14.6" {...s} />
          </>
        );
      default:
        return (
          <>
            <Circle cx={12} cy={13} r={1.25} fill={color} />
            <Circle cx={20} cy={13} r={1.25} fill={color} />
          </>
        );
    }
  })();
  const mouth = [
    'M10.5 18.6 Q16 24.6 21.5 18.6', // 大きな笑顔
    'M11.8 19.4 Q16 22.6 20.2 19.4', // ほほえみ
    'M12.2 20.4 L19.8 20.2', // まっすぐ
    'M12 21.4 Q16 18.6 20 21.2', // への字
    'M11 21.2 Q12.8 19.4 14.6 21.2 Q16.4 23 18.2 21.2 Q19.6 19.8 21 21', // 波線
  ][level];
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path d="M16 3.2 C23.4 3.1 28.9 8.6 28.8 16.1 C28.7 23.5 23.3 28.9 15.8 28.8 C8.5 28.7 3.1 23.2 3.2 15.9 C3.3 8.6 8.7 3.3 16 3.2 Z" {...s} />
      {eyes}
      <Path d={mouth} {...s} />
    </Svg>
  );
}
