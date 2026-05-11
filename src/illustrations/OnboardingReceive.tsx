import Svg, { Path, Circle, Rect, G } from "react-native-svg";

// "Receive money from anywhere"
export function OnboardingReceive({ size = 240 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      <G stroke="#1B1F36" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Rect x={68} y={36} width={88} height={156} rx={18} />
        <Rect x={84} y={56} width={56} height={102} rx={4} stroke="#5B2C9C" />
        <Circle cx={112} cy={107} r={18} fill="#1FCFA5" stroke="#1FCFA5" />
        <Path d="M104 107 l6 7 12 -14" stroke="#FFFFFF" strokeWidth={3} />
        <Path d="M28 110 c10 -22 28 -38 52 -42" />
        <Path d="M178 132 c14 8 28 22 32 42" />
        <Circle cx={32} cy={80} r={3} fill="#5B2C9C" />
        <Circle cx={208} cy={170} r={3} fill="#5B2C9C" />
        <Path d="M120 178 v6" />
      </G>
    </Svg>
  );
}
