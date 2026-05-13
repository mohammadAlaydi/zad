import Svg, { Path, Rect, Circle, G, Line } from "react-native-svg";

/**
 * Success illustration: money bill with coins and a big checkmark.
 * Matches the ZADPAY send-success design.
 */
export function SuccessIllustration({ size = 200 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      {/* Scattered decorative elements */}
      <Circle cx={40} cy={60} r={6} fill="#1FCFA5" opacity={0.5} />
      <Circle cx={200} cy={40} r={4} fill="#5B2C9C" opacity={0.4} />
      <Circle cx={210} cy={100} r={3} fill="#F2B441" opacity={0.6} />
      <Circle cx={30} cy={170} r={4} fill="#E25563" opacity={0.4} />
      <Line
        x1={195}
        y1={60}
        x2={205}
        y2={50}
        stroke="#5B2C9C"
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.5}
      />
      <Line
        x1={205}
        y1={60}
        x2={195}
        y2={50}
        stroke="#5B2C9C"
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.5}
      />
      <Line
        x1={45}
        y1={100}
        x2={55}
        y2={90}
        stroke="#1FCFA5"
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.5}
      />
      <Line
        x1={215}
        y1={140}
        x2={225}
        y2={150}
        stroke="#1FCFA5"
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.3}
      />

      {/* Main money bill */}
      <G>
        <Rect
          x={55}
          y={90}
          width={130}
          height={80}
          rx={12}
          fill="#F4EFFA"
          stroke="#5B2C9C"
          strokeWidth={2}
        />
        <Circle cx={120} cy={130} r={22} fill="none" stroke="#5B2C9C" strokeWidth={2} />
        <Path
          d="M115 125 v-2 a5 5 0 0 1 10 0v4a5 5 0 0 1-10 0v-2"
          stroke="#5B2C9C"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Line
          x1={118}
          y1={120}
          x2={122}
          y2={120}
          stroke="#5B2C9C"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Line
          x1={118}
          y1={140}
          x2={122}
          y2={140}
          stroke="#5B2C9C"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* Bill lines */}
        <Line
          x1={65}
          y1={115}
          x2={85}
          y2={115}
          stroke="#CFB8EB"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Line
          x1={65}
          y1={122}
          x2={80}
          y2={122}
          stroke="#CFB8EB"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Line
          x1={155}
          y1={140}
          x2={175}
          y2={140}
          stroke="#CFB8EB"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Line
          x1={160}
          y1={147}
          x2={175}
          y2={147}
          stroke="#CFB8EB"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </G>

      {/* Coin 1 - top right */}
      <G>
        <Circle cx={175} cy={72} r={20} fill="#F2B441" opacity={0.2} />
        <Circle cx={175} cy={72} r={16} fill="none" stroke="#F2B441" strokeWidth={2} />
        <Path
          d="M172 68 v-1 a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0v-1"
          stroke="#F2B441"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </G>

      {/* Coin 2 - top left */}
      <G>
        <Circle cx={70} cy={65} r={16} fill="#1FCFA5" opacity={0.15} />
        <Circle cx={70} cy={65} r={13} fill="none" stroke="#1FCFA5" strokeWidth={1.8} />
        <Path
          d="M67.5 62 v-1 a2.5 2.5 0 0 1 5 0v5a2.5 2.5 0 0 1-5 0v-1"
          stroke="#1FCFA5"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </G>

      {/* Big checkmark circle */}
      <Circle cx={160} cy={155} r={28} fill="#1FCFA5" />
      <Path
        d="M147 155 l8 9 17 -18"
        stroke="#FFFFFF"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
