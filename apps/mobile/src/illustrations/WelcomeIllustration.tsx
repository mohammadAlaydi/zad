import Svg, { Path, Circle, Rect, G } from "react-native-svg";

// Welcome / Create account illustration — phone + money + send icon collage
export function WelcomeIllustration({ size = 220 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      <G
        stroke="#1B1F36"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <Rect x={56} y={36} width={92} height={160} rx={16} />
        <Path d="M56 60 H148" />
        <Circle cx={102} cy={90} r={16} fill="#F4EFFA" />
        <Path d="M102 84 v12 M96 90 h12" stroke="#5B2C9C" />
        <Rect x={72} y={120} width={60} height={10} rx={3} />
        <Rect x={72} y={140} width={40} height={10} rx={3} />
        <Circle cx={172} cy={78} r={20} fill="#1FCFA5" />
        <Path d="M163 78 l5 6 13 -14" stroke="#FFFFFF" strokeWidth={3} />
        <Path d="M168 132 c14 -6 28 0 30 18" />
        <Circle cx={184} cy={156} r={12} fill="#FFD972" />
        <Path d="M180 156 h8 M184 152 v8" stroke="#5B2C9C" />
      </G>
    </Svg>
  );
}
