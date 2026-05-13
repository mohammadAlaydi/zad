import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

type Props = {
  amount: number;
  currency: string;
  iban: string;
  onGetQr?: () => void;
};

function CardPattern() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 320 180"
      preserveAspectRatio="none"
      style={styles.svgPattern as any}
    >
      <Circle cx="290" cy="-10" r="100" fill="rgba(255,255,255,0.08)" />
      <Circle cx="-20" cy="190" r="110" fill="rgba(255,255,255,0.05)" />
      <Path d="M0 90 Q160 60 320 90" stroke="rgba(255,255,255,0.07)" strokeWidth="1" fill="none" />
      <Path
        d="M0 110 Q160 80 320 110"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
        fill="none"
      />
      <Path
        d="M0 130 Q160 100 320 130"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="1"
        fill="none"
      />
    </Svg>
  );
}

export function BalanceCard({ amount, currency, iban, onGetQr }: Props) {
  const { hideBalance, toggleHideBalance } = useApp();
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const symbol = currency === "AED" ? "AED " : "$ ";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 500 }}
      style={styles.cardShadow}
    >
      <LinearGradient
        colors={["#6B36B0", "#4B1F8A", "#2A0F55"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <CardPattern />
        <View style={styles.topRow}>
          <Text style={styles.walletLabel}>Wallet Balance</Text>
          <Text style={styles.brandLabel}>ZADPAY</Text>
        </View>

        <Pressable onPress={toggleHideBalance} hitSlop={6} style={styles.balanceRow}>
          <Text style={styles.balanceText}>
            {hideBalance ? `${symbol}****` : `${symbol}${formatted}`}
          </Text>
          <Ionicons
            name={hideBalance ? "eye-off-outline" : "eye-outline"}
            size={18}
            color="rgba(255,255,255,0.55)"
          />
        </Pressable>

        <View style={styles.bottomArea}>
          <View style={styles.bottomRow}>
            <View style={styles.ibanWrap}>
              <Text style={styles.ipnLabel}>IPN</Text>
              <View style={styles.ibanRow}>
                <Text style={styles.ibanText}>{iban}</Text>
                <Ionicons name="copy-outline" size={13} color="rgba(255,255,255,0.6)" />
              </View>
            </View>

            <Pressable onPress={onGetQr} style={styles.qrBtn}>
              <View style={styles.qrIcon}>
                <MaterialCommunityIcons name="qrcode" size={14} color={Colors.brand.primary} />
              </View>
              <Text style={styles.qrText}>Get Qr code</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  svgPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardShadow: {
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#4B1F8A",
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  gradient: {
    padding: 20,
    paddingTop: 18,
    minHeight: 168,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  walletLabel: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  brandLabel: {
    color: "#FFFFFF",
    fontFamily: "Sora_700Bold",
    fontSize: 13,
    letterSpacing: 1.6,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  balanceText: {
    color: "#FFFFFF",
    fontFamily: "Sora_700Bold",
    fontSize: 34,
    letterSpacing: -0.4,
  },
  bottomArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 18,
  },
  ibanWrap: {
    flex: 1,
  },
  ipnLabel: {
    color: "rgba(255,255,255,0.55)",
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  ibanRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  ibanText: {
    color: "#FFFFFF",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  qrBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  qrIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  qrText: {
    color: "#FFFFFF",
    fontFamily: "Inter_500Medium",
    fontSize: 12.5,
  },
});
