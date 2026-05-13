import Svg, { Path, Circle, Rect, G, Line, Ellipse } from "react-native-svg";

// "Spend abroad and track expense" — travel/spending with suitcase, receipt, magnifying glass
export function OnboardingSpend({ size = 240 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      <G
        stroke="#1B1F36"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Suitcase / briefcase - main element */}
        <Rect x={60} y={68} width={80} height={64} rx={6} strokeWidth={2} />
        <Path d="M88 68 V58 C88 52 92 48 98 48 H102 C108 48 112 52 112 58 V68" strokeWidth={2} />
        <Path d="M60 86 H140" strokeWidth={1.5} />
        <Rect x={94} y={80} width={12} height={12} rx={3} fill="#5B2C9C" stroke="#5B2C9C" />

        {/* Suitcase straps */}
        <Path d="M60 98 H140" strokeWidth={1} opacity={0.4} />

        {/* Travel tickets / boarding pass behind suitcase */}
        <Rect x={142} y={54} width={52} height={36} rx={4} strokeWidth={1.5} />
        <Path d="M142 66 H194" strokeWidth={1} />
        <Path d="M150 60 H180" strokeWidth={1} opacity={0.5} />
        <Path d="M150 72 H172" strokeWidth={1} opacity={0.5} />
        <Path d="M150 78 H166" strokeWidth={1} opacity={0.5} />
        <Circle cx={186} cy={60} r={4} stroke="#5B2C9C" strokeWidth={1.5} />

        {/* Receipt / bill */}
        <Path
          d="M152 98 H190 V164 L186 160 L182 164 L178 160 L174 164 L170 160 L166 164 L162 160 L158 164 L154 160 L152 164 V98 Z"
          strokeWidth={1.5}
        />
        <Path d="M160 110 H182" strokeWidth={1} opacity={0.5} />
        <Path d="M160 118 H178" strokeWidth={1} opacity={0.5} />
        <Path d="M160 126 H176" strokeWidth={1} opacity={0.5} />
        <Path d="M160 134 H182" strokeWidth={1} opacity={0.5} />
        <Path d="M160 142 H170" strokeWidth={1.5} />
        <Path d="M174 142 H182" strokeWidth={1.5} />

        {/* Magnifying glass */}
        <Circle cx={52} cy={160} r={22} strokeWidth={2} />
        <Line x1={68} y1={176} x2={82} y2={192} strokeWidth={3} />
        <Circle cx={52} cy={160} r={16} strokeWidth={1} opacity={0.3} />

        {/* Globe / world element */}
        <Circle cx={160} cy={180} r={16} strokeWidth={1.5} stroke="#5B2C9C" />
        <Ellipse cx={160} cy={180} rx={8} ry={16} strokeWidth={1} stroke="#5B2C9C" />
        <Path d="M144 180 H176" strokeWidth={1} stroke="#5B2C9C" />
        <Path d="M146 172 H174" strokeWidth={0.8} stroke="#5B2C9C" opacity={0.5} />
        <Path d="M146 188 H174" strokeWidth={0.8} stroke="#5B2C9C" opacity={0.5} />

        {/* Small decorative elements */}
        <Circle cx={44} cy={80} r={2.5} fill="#1FCFA5" />
        <Circle cx={196} cy={176} r={2} fill="#5B2C9C" />
        <Path d="M36 120 L40 116" strokeWidth={1.5} />
        <Path d="M36 116 L40 120" strokeWidth={1.5} />

        {/* Coins */}
        <Circle cx={76} cy={148} r={8} strokeWidth={1.5} />
        <Circle cx={84} cy={154} r={8} strokeWidth={1.5} />
        <Path d="M82 150 L84 148 L86 150" strokeWidth={1} />
      </G>
    </Svg>
  );
}
