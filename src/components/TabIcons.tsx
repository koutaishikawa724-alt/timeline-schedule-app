import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export function CircleTabIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={2} fill="none" opacity={0.45} />
      <Path d="M12 3.5 A8.5 8.5 0 0 1 20.5 12" stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <Line x1={12} y1={12} x2={12} y2={7} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={12} y1={12} x2={15} y2={14} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function CalendarTabIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Rect x={3.5} y={5} width={17} height={15} rx={3} stroke={color} strokeWidth={2} fill="none" />
      <Line x1={3.5} y1={10} x2={20.5} y2={10} stroke={color} strokeWidth={2} />
      <Line x1={8} y1={3} x2={8} y2={7} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={16} y1={3} x2={16} y2={7} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function DiaryTabIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Rect x={5} y={3.5} width={14} height={17} rx={2.5} stroke={color} strokeWidth={2} fill="none" />
      <Line x1={8.5} y1={8.5} x2={15.5} y2={8.5} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={8.5} y1={12} x2={15.5} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={8.5} y1={15.5} x2={12.5} y2={15.5} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
