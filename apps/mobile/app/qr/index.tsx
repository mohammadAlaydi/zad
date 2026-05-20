import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { parseWirePayload } from "@/features/userdata";
import { useSendFlow, walletService } from "@/features/wallet";
import { Colors } from "@/theme/colors";

const { width } = Dimensions.get("window");

export default function QrScan() {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState("");
  // De-dupe: the camera fires `onBarcodeScanned` continuously while the
  // code is in frame. One handled scan per mount.
  const handledRef = useRef(false);

  const setRecipient = useSendFlow((s) => s.setRecipient);
  const setAmountMinor = useSendFlow((s) => s.setAmountMinor);
  const setNote = useSendFlow((s) => s.setNote);
  const setPendingRequestId = useSendFlow((s) => s.setPendingRequestId);
  const resetIdempotencyKey = useSendFlow((s) => s.resetIdempotencyKey);

  async function handleScannedString(raw: string) {
    if (handledRef.current) return;
    setError(null);
    const parsed = parseWirePayload(raw);
    if (parsed === null) {
      setError("That code isn't a ZADPay payment QR. Try another.");
      // Allow re-scanning a different code.
      setTimeout(() => {
        handledRef.current = false;
      }, 800);
      return;
    }
    handledRef.current = true;
    setResolving(true);
    try {
      // Resolve the recipient so /send/confirm has a name + userId.
      const lookup = await walletService.lookupByPhone(parsed.phone);
      if (!lookup.ok) {
        setError(
          lookup.error.code === "IDENTITY.RECIPIENT_NOT_FOUND"
            ? "No ZADPay user found for that QR."
            : "Couldn't resolve the QR recipient. Try again.",
        );
        setResolving(false);
        handledRef.current = false;
        return;
      }
      const recipient = lookup.value;
      setRecipient({
        phone: recipient.phone,
        name: recipient.fullName,
        userId: recipient.userId,
        currency: recipient.currency,
      });
      setAmountMinor(parsed.amount);
      setNote(parsed.note ?? "");
      setPendingRequestId(parsed.requestId ?? null);
      resetIdempotencyKey();
      // If the QR encoded a non-zero amount, jump straight to /send/confirm.
      // If it's an open-ended "pay me" code (amount=0), drop into /send so
      // the payer chooses an amount.
      router.replace(parsed.amount > 0 ? "/send/confirm" : "/send");
    } catch {
      setError("Network error. Try again.");
      setResolving(false);
      handledRef.current = false;
    }
  }

  function onManualSubmit() {
    setManualOpen(false);
    if (manualValue.trim().length === 0) return;
    void handleScannedString(manualValue.trim());
    setManualValue("");
  }

  const camReady = permission?.granted === true;
  const camDenied = permission !== null && permission?.granted === false;

  return (
    <Screen bg={Colors.black}>
      <Header title={t("qr.title")} light showBack transparent onBack={() => router.back()} />
      <View style={styles.cameraFrameWrap}>
        <View style={styles.cameraFrame}>
          <View style={[styles.bracket, styles.bracketTL]} />
          <View style={[styles.bracket, styles.bracketTR]} />
          <View style={[styles.bracket, styles.bracketBL]} />
          <View style={[styles.bracket, styles.bracketBR]} />

          <View style={styles.cameraInner}>
            {camReady ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={(r) => {
                  if (handledRef.current) return;
                  void handleScannedString(r.data);
                }}
              />
            ) : (
              <View style={styles.permissionWrap}>
                <Ionicons name="qr-code-outline" size={42} color="rgba(255,255,255,0.4)" />
                <Text style={styles.permissionText}>
                  {camDenied ? "Camera permission denied" : "Camera permission needed to scan"}
                </Text>
                {!camDenied ? (
                  <Pressable onPress={() => void requestPermission()} style={styles.permissionBtn}>
                    <Text style={styles.permissionBtnText}>Grant permission</Text>
                  </Pressable>
                ) : null}
              </View>
            )}

            {!handledRef.current && camReady ? (
              <MotiView
                from={{ top: 0 }}
                animate={{ top: width * 0.65 - 28 }}
                transition={{ loop: true, duration: 2000, type: "timing" }}
                style={styles.scanLine}
              />
            ) : null}

            {resolving ? (
              <View style={styles.resolvingOverlay}>
                <ActivityIndicator color={Colors.white} />
                <Text style={styles.resolvingText}>Resolving recipient…</Text>
              </View>
            ) : null}
          </View>
        </View>
        {error !== null ? <Text style={styles.errorBanner}>{error}</Text> : null}
      </View>

      <View style={styles.controlsRow}>
        <Pressable
          onPress={() => setManualOpen(true)}
          style={styles.iconBtn}
          accessibilityLabel="Enter QR manually"
        >
          <Ionicons name="keypad-outline" size={22} color={Colors.white} />
        </Pressable>
        <Pressable
          onPress={() => {
            handledRef.current = false;
            setError(null);
          }}
          style={styles.captureBtn}
          accessibilityLabel="Reset scanner"
        >
          <View style={styles.captureInner} />
        </Pressable>
        <Pressable style={styles.iconBtn} accessibilityLabel="Flashlight (unavailable)">
          <Ionicons name="flashlight-outline" size={22} color={Colors.white} />
        </Pressable>
      </View>

      <Modal
        visible={manualOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setManualOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setManualOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Enter QR payload</Text>
            <Text style={styles.modalBody}>
              Paste the JSON contents of a ZADPay payment QR for testing.
            </Text>
            <TextInput
              value={manualValue}
              onChangeText={setManualValue}
              placeholder='{"v":1,"type":"zadpay.pay","phone":"+15551234567","amount":7000,"currency":"USD"}'
              placeholderTextColor={Colors.ink[300]}
              multiline
              style={styles.modalInput}
            />
            <View style={{ height: 12 }} />
            <Button title="Scan" onPress={onManualSubmit} />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cameraFrameWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  cameraFrame: { width: width * 0.65, height: width * 0.65, position: "relative" },
  bracket: { position: "absolute", width: 28, height: 28, borderColor: Colors.white },
  bracketTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  bracketTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bracketBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  bracketBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  cameraInner: {
    flex: 1,
    margin: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    overflow: "hidden",
  },
  permissionWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
  },
  permissionText: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
  },
  permissionBtn: {
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.brand.primary,
  },
  permissionBtnText: { color: Colors.white, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  scanLine: {
    position: "absolute",
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: Colors.accent.green,
  },
  resolvingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    gap: 8,
  },
  resolvingText: { color: Colors.white, fontFamily: "Inter_500Medium", fontSize: 13 },
  errorBanner: {
    marginTop: 14,
    color: Colors.accent.red,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    paddingHorizontal: 16,
    textAlign: "center",
  },
  controlsRow: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.white },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  modalTitle: {
    color: Colors.ink[900],
    fontFamily: "Sora_700Bold",
    fontSize: 18,
    marginBottom: 6,
  },
  modalBody: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginBottom: 12,
  },
  modalInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.ink[200],
    borderRadius: 12,
    padding: 12,
    color: Colors.ink[900],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlignVertical: "top",
  },
});
