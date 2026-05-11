import Svg, { Path, Circle, Rect, G } from "react-native-svg";

// "Spend abroad and track"
export function OnboardingSpend({ size = 240 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      <G stroke="#1B1F36" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Rect x={48} y={70} width={120} height={84} rx={10} />
        <Path d="M48 96 H168" />
        <Rect x={68} y={120} width={36} height={14} rx={3} />
        <Circle cx={184} cy={150} r={26} stroke="#5B2C9C" />
        <Path d="M174 150 l8 8 16 -18" stroke="#1FCFA5" strokeWidth={3} />
        <Path d="M82 188 c10 -14 22 -14 30 0" />
        <Path d="M120 184 l10 -22 12 18" />
      </G>
    </Svg>
  );
}
