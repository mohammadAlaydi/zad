import Svg, { Path, Circle, Rect, G } from "react-native-svg";

// "Trusted by millions" — handshake inside shield
export function OnboardingTrust({ size = 240 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      <G stroke="#1B1F36" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Path d="M120 28 L188 52 V112 c0 38 -28 70 -68 92 -40 -22 -68 -54 -68 -92 V52 Z" />
        <Path d="M72 132 l16 -22 24 6 18 14 18 -14 18 6 18 18" stroke="#5B2C9C" />
        <Path d="M88 110 l24 6 14 14 14 -14 22 4" />
        <Circle cx={170} cy={64} r={10} fill="#1FCFA5" stroke="#1FCFA5" />
        <Path d="M165 64 l4 4 7 -8" stroke="#FFFFFF" />
      </G>
    </Svg>
  );
}
