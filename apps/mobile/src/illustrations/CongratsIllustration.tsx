import Svg, { Path, Rect, Circle, G } from "react-native-svg";

export function CongratsIllustration({ size = 220 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      <G
        stroke="#1B1F36"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <Rect x={64} y={36} width={104} height={168} rx={18} />
        <Path d="M64 60 H168" />
        <Circle cx={116} cy={110} r={32} fill="#1FCFA5" stroke="#1FCFA5" />
        <Path d="M100 110 l10 12 22 -22" stroke="#FFFFFF" strokeWidth={4} />
        <Rect x={84} y={160} width={64} height={10} rx={3} />
        <Path d="M40 70 l8 -10 M200 60 l10 8 M30 160 l-8 -8 M210 170 l8 8" stroke="#5B2C9C" />
        <Circle cx={36} cy={108} r={3} fill="#F2B441" />
        <Circle cx={206} cy={120} r={3} fill="#E25563" />
        <Circle cx={50} cy={200} r={3} fill="#5B2C9C" />
        <Circle cx={196} cy={36} r={3} fill="#1FCFA5" />
      </G>
    </Svg>
  );
}
