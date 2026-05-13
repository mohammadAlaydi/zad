import Svg, { Path, Rect, G, Circle } from "react-native-svg";

export function ScanIdIllustration({ size = 220 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      <G
        stroke="#1B1F36"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <Rect x={58} y={42} width={96} height={154} rx={16} />
        <Rect x={86} y={68} width={88} height={56} rx={6} stroke="#5B2C9C" />
        <Circle cx={104} cy={86} r={8} />
        <Path d="M120 80 H162 M120 90 H150 M86 134 H172 M86 148 H140" />
        <Path d="M170 196 l40 32" stroke="#5B2C9C" strokeWidth={3} />
      </G>
    </Svg>
  );
}
