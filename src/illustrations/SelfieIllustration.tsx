import Svg, { Path, Circle, G } from "react-native-svg";

export function SelfieIllustration({ size = 220 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      <G stroke="#1B1F36" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Path d="M40 70 V46 c0 -6 6 -10 12 -10 H80" stroke="#5B2C9C" />
        <Path d="M200 70 V46 c0 -6 -6 -10 -12 -10 H160" stroke="#5B2C9C" />
        <Path d="M40 170 V194 c0 6 6 10 12 10 H80" stroke="#5B2C9C" />
        <Path d="M200 170 V194 c0 6 -6 10 -12 10 H160" stroke="#5B2C9C" />
        <Circle cx={120} cy={120} r={48} />
        <Circle cx={120} cy={104} r={18} />
        <Path d="M86 154 c6 -22 22 -30 34 -30 s28 8 34 30" />
        <Circle cx={172} cy={86} r={12} fill="#1FCFA5" />
        <Path d="M166 86 l4 5 8 -10" stroke="#FFFFFF" strokeWidth={3} />
      </G>
    </Svg>
  );
}
