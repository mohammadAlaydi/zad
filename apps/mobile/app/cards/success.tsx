import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { View, Text, StyleSheet } from "react-native";
import { Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

export default function CardSuccess() {
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type: string }>();
  const { cards, user } = useApp();
  const isPhysical = type === "physical";

  // Get the most recently added card
  const latestCard = cards[cards.length - 1];
  const maskedNumber = latestCard ? `•••• •••• •••• ${latestCard.last4}` : "•••• •••• •••• ••••";
  const cardName = latestCard?.name ?? user.fullName ?? "CARD HOLDER";

  return (
    <Screen bg={Colors.surface.background}>
      <View
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, 24) + 24, paddingBottom: insets.bottom + 24 },
        ]}
      >
        {/* Animated checkmark */}
        <MotiView
          from={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 180 }}
          style={styles.iconWrap}
        >
          <Ionicons name="checkmark-circle" size={72} color={Colors.accent.green} />
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            delay: 200,
            type: "timing",
            duration: 400,
            easing: Easing.out(Easing.cubic),
          }}
          style={styles.titleWrap}
        >
          <Text style={styles.title}>Card Requested!</Text>
          <Text style={styles.subtitle}>
            {isPhysical
              ? "Your physical card will arrive in 3–5 business days"
              : "Your virtual card is ready to use instantly"}
          </Text>
        </MotiView>

        {/* Card Preview */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            delay: 350,
            type: "timing",
            duration: 480,
            easing: Easing.out(Easing.cubic),
          }}
          style={styles.cardWrap}
        >
          <LinearGradient
            colors={[Colors.brand.gradientStart, Colors.brand.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Card header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardAppName}>ZADPay</Text>
              <View style={styles.typeBadge}>
                <Ionicons
                  name={isPhysical ? "card-outline" : "phone-portrait-outline"}
                  size={12}
                  color={Colors.white}
                />
                <Text style={styles.typeBadgeText}>{isPhysical ? "Physical" : "Virtual"}</Text>
              </View>
            </View>

            {/* Chip icon */}
            <View style={styles.chip}>
              <Ionicons name="hardware-chip-outline" size={28} color="rgba(255,255,255,0.7)" />
            </View>

            {/* Card number */}
            <Text style={styles.cardNumber}>{maskedNumber}</Text>

            {/* Card footer */}
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardFooterLabel}>CARD HOLDER</Text>
                <Text style={styles.cardFooterValue}>{cardName.toUpperCase()}</Text>
              </View>
              <View style={styles.cardExpiry}>
                <Text style={styles.cardFooterLabel}>EXPIRES</Text>
                <Text style={styles.cardFooterValue}>{latestCard?.exp ?? "12/29"}</Text>
              </View>
              <View style={styles.visaLogo}>
                <Text style={styles.visaText}>VISA</Text>
              </View>
            </View>
          </LinearGradient>
        </MotiView>

        {/* Physical delivery banner */}
        {isPhysical && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 520, type: "timing", duration: 380 }}
            style={styles.deliveryBanner}
          >
            <Ionicons name="time-outline" size={18} color={Colors.accent.amber} />
            <Text style={styles.deliveryText}>Estimated delivery: 3–5 business days</Text>
          </MotiView>
        )}

        <View style={styles.spacer} />

        {/* Action buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 600, type: "timing", duration: 350 }}
          style={styles.buttonsWrap}
        >
          <Button title="Go to Home" onPress={() => router.replace("/(tabs)/home")} />
          <View style={{ height: 12 }} />
          <Button
            title="View My Cards"
            variant="secondary"
            onPress={() => router.replace("/settings/cards")}
          />
        </MotiView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconWrap: {
    marginBottom: 12,
  },
  titleWrap: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontFamily: "Sora_700Bold",
    fontSize: 24,
    color: Colors.ink[900],
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.ink[500],
    textAlign: "center",
    lineHeight: 20,
  },
  cardWrap: {
    width: "100%",
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 22,
    minHeight: 180,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardAppName: {
    fontFamily: "Sora_700Bold",
    fontSize: 16,
    color: Colors.white,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: Colors.white,
  },
  chip: {
    marginBottom: 14,
  },
  cardNumber: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.white,
    letterSpacing: 2,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  cardExpiry: {
    marginLeft: 24,
  },
  cardFooterLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardFooterValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.white,
  },
  visaLogo: {
    marginLeft: "auto" as any,
  },
  visaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    color: Colors.white,
    letterSpacing: 1,
    fontStyle: "italic",
  },
  deliveryBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FDF6DD",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
    width: "100%",
  },
  deliveryText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.accent.amber,
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  buttonsWrap: {
    width: "100%",
  },
});
