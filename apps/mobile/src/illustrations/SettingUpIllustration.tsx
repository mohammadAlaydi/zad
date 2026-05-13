import Svg, { Path, Rect, Circle, G } from "react-native-svg";

export function SettingUpIllustration({ size = 200 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      <G stroke="#1B1F36" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Rect x={64} y={36} width={104} height={168} rx={18} />
        <Path d="M64 60 H168" />
        <Circle cx={116} cy={104} r={26} stroke="#5B2C9C" />
        <Path d="M104 104 l8 8 16 -16" stroke="#1FCFA5" strokeWidth={3} />
        <Rect x={82} y={150} width={68} height={10} rx={3} />
        <Rect x={82} y={170} width={48} height={10} rx={3} />
        <Path d="M188 86 l10 -10 M188 86 l-10 -10 M188 86 l10 10 M188 86 l-10 10" stroke="#5B2C9C" />
      </G>
    </Svg>
  );
}
