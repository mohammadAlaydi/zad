import Svg, { Path, Circle, Rect, G, Line, Ellipse } from "react-native-svg";

// "Trusted by millions" — handshake with people behind, hand-drawn style
export function OnboardingTrust({ size = 240 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      <G stroke="#1B1F36" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* People silhouettes in background */}
        {/* Person left */}
        <Circle cx={68} cy={62} r={8} />
        <Path d="M68 70 V90" />
        <Path d="M68 76 L56 84" />
        <Path d="M68 76 L80 84" />
        <Path d="M68 90 L58 108" />
        <Path d="M68 90 L78 108" />

        {/* Person center-left */}
        <Circle cx={96} cy={52} r={9} />
        <Path d="M96 61 V84" />
        <Path d="M96 68 L83 78" />
        <Path d="M96 68 L109 78" />
        <Path d="M96 84 L85 106" />
        <Path d="M96 84 L107 106" />

        {/* Person center */}
        <Circle cx={120} cy={48} r={10} />
        <Path d="M120 58 V84" />
        <Path d="M120 66 L106 78" />
        <Path d="M120 66 L134 78" />
        <Path d="M120 84 L108 108" />
        <Path d="M120 84 L132 108" />

        {/* Person center-right */}
        <Circle cx={148} cy={52} r={9} />
        <Path d="M148 61 V84" />
        <Path d="M148 68 L135 78" />
        <Path d="M148 68 L161 78" />
        <Path d="M148 84 L137 106" />
        <Path d="M148 84 L159 106" />

        {/* Person right */}
        <Circle cx={176} cy={62} r={8} />
        <Path d="M176 70 V90" />
        <Path d="M176 76 L164 84" />
        <Path d="M176 76 L188 84" />
        <Path d="M176 90 L166 108" />
        <Path d="M176 90 L186 108" />

        {/* Handshake - larger, central */}
        {/* Left hand */}
        <Path d="M62 148 C62 136 80 126 92 130 L108 138" strokeWidth={2} />
        <Path d="M62 148 L54 152" strokeWidth={2} />
        <Path d="M92 130 L96 126" strokeWidth={2} />
        
        {/* Right hand */}
        <Path d="M178 148 C178 136 160 126 148 130 L132 138" strokeWidth={2} />
        <Path d="M178 148 L186 152" strokeWidth={2} />
        <Path d="M148 130 L144 126" strokeWidth={2} />

        {/* Clasped hands center */}
        <Path d="M108 138 C112 142 118 144 120 142 C122 144 128 142 132 138" strokeWidth={2} />
        <Path d="M108 138 C110 146 116 150 120 148 C124 150 130 146 132 138" strokeWidth={2} />

        {/* Decorative arc under handshake */}
        <Path d="M72 168 C90 180 150 180 168 168" stroke="#1FCFA5" strokeWidth={2.5} />
        <Path d="M80 174 C95 184 145 184 160 174" stroke="#1FCFA5" strokeWidth={1.5} opacity={0.5} />

        {/* Checkmark badge */}
        <Circle cx={180} cy={96} r={14} fill="#1FCFA5" stroke="#1FCFA5" strokeWidth={2} />
        <Path d="M173 96 L178 101 L188 90" stroke="#FFFFFF" strokeWidth={2.5} />

        {/* Small decorative elements */}
        <Circle cx={48} cy={130} r={2.5} fill="#5B2C9C" />
        <Circle cx={196} cy={122} r={2} fill="#5B2C9C" />
        <Path d="M42 108 L46 104 L50 108" stroke="#5B2C9C" strokeWidth={1.5} />
        
        {/* Dollar / trust symbols */}
        <Circle cx={54} cy={172} r={10} strokeWidth={1.5} />
        <Path d="M54 166 V178 M50 170 C50 168 58 168 58 170 C58 172 50 174 50 176 C50 178 58 178 58 176" strokeWidth={1.3} />
      </G>
    </Svg>
  );
}
