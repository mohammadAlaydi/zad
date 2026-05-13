import Svg, { Path, Circle, Rect, G, Ellipse } from "react-native-svg";

// "Receive money from anywhere in the world" — phone with money transfer, global elements
export function OnboardingReceive({ size = 240 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      <G
        stroke="#1B1F36"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Main smartphone */}
        <Rect x={78} y={36} width={84} height={150} rx={14} strokeWidth={2} />
        <Rect x={86} y={50} width={68} height={118} rx={4} strokeWidth={1.2} />

        {/* Screen content - notification / transfer */}
        <Rect x={92} y={60} width={56} height={28} rx={6} stroke="#5B2C9C" strokeWidth={1.5} />
        <Path d="M100 70 L106 76 L116 64" stroke="#1FCFA5" strokeWidth={2.5} />
        <Path d="M122 70 H142" strokeWidth={1} opacity={0.5} />
        <Path d="M122 76 H136" strokeWidth={1} opacity={0.5} />

        {/* Amount on screen */}
        <Path d="M104 100 H136" strokeWidth={1.5} />
        <Path d="M110 108 H130" strokeWidth={1} opacity={0.5} />

        {/* Transfer bars on screen */}
        <Rect
          x={96}
          y={118}
          width={48}
          height={8}
          rx={4}
          fill="#1FCFA5"
          stroke="none"
          opacity={0.3}
        />
        <Rect x={96} y={118} width={32} height={8} rx={4} fill="#1FCFA5" stroke="none" />
        <Rect
          x={96}
          y={132}
          width={48}
          height={8}
          rx={4}
          fill="#5B2C9C"
          stroke="none"
          opacity={0.15}
        />
        <Rect
          x={96}
          y={132}
          width={40}
          height={8}
          rx={4}
          fill="#5B2C9C"
          stroke="none"
          opacity={0.4}
        />

        {/* Phone home indicator */}
        <Path d="M110 178 H130" strokeWidth={2.5} />

        {/* Checkmark badge on phone */}
        <Circle cx={152} cy={56} r={12} fill="#1FCFA5" stroke="#1FCFA5" strokeWidth={2} />
        <Path d="M146 56 L150 60 L158 50" stroke="#FFFFFF" strokeWidth={2.5} />

        {/* Left side — incoming money arc */}
        <Path d="M26 110 C32 88 48 72 72 62" strokeWidth={1.8} />
        <Path d="M26 110 L30 102" strokeWidth={2} />
        <Path d="M26 110 L34 112" strokeWidth={2} />

        {/* Right side — incoming money arc */}
        <Path d="M214 140 C208 162 192 178 168 186" strokeWidth={1.8} />
        <Path d="M214 140 L210 148" strokeWidth={2} />
        <Path d="M214 140 L206 138" strokeWidth={2} />

        {/* Dollar bills / notes flying in */}
        {/* Top-left note */}
        <Rect x={20} y={118} width={28} height={18} rx={3} strokeWidth={1.5} />
        <Path
          d="M34 122 V132 M30 125 C30 123 38 123 38 125 C38 127 30 129 30 131 C30 133 38 133 38 131"
          strokeWidth={1}
        />

        {/* Top-right note */}
        <Rect x={192} y={104} width={28} height={18} rx={3} strokeWidth={1.5} />
        <Path
          d="M206 108 V118 M202 111 C202 109 210 109 210 111 C210 113 202 115 202 117 C202 119 210 119 210 117"
          strokeWidth={1}
        />

        {/* Coins */}
        <Circle cx={36} cy={82} r={6} fill="none" strokeWidth={1.5} />
        <Path d="M36 78 V86" strokeWidth={1} />
        <Circle cx={204} cy={172} r={6} fill="none" strokeWidth={1.5} />
        <Path d="M204 168 V176" strokeWidth={1} />

        {/* Small decorative elements */}
        <Circle cx={28} cy={148} r={3} fill="#5B2C9C" />
        <Circle cx={212} cy={126} r={2.5} fill="#5B2C9C" />
        <Circle cx={56} cy={148} r={2} fill="#1FCFA5" />

        {/* Sparkle / star elements */}
        <Path
          d="M192 88 L194 84 L196 88 L200 90 L196 92 L194 96 L192 92 L188 90 Z"
          strokeWidth={1}
          fill="#5B2C9C"
          opacity={0.4}
        />
        <Path
          d="M44 52 L46 48 L48 52 L52 54 L48 56 L46 60 L44 56 L40 54 Z"
          strokeWidth={1}
          fill="#1FCFA5"
          opacity={0.4}
        />

        {/* Globe outline bottom-left */}
        <Circle cx={36} cy={192} r={14} strokeWidth={1.2} stroke="#5B2C9C" opacity={0.6} />
        <Ellipse cx={36} cy={192} rx={7} ry={14} strokeWidth={0.8} stroke="#5B2C9C" opacity={0.4} />
        <Path d="M22 192 H50" strokeWidth={0.8} stroke="#5B2C9C" opacity={0.4} />
      </G>
    </Svg>
  );
}
