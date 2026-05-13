// Unified KYC screen. Drives the real flow against PR-6's /v1/kyc/*.
// The existing phone-based capture wizard (id-capture / id-scan / selfie)
// stays as a UI demo for the design walkthrough; this screen is the
// production-shaped path.

import type { KycApplicationResponse } from "@zadpay/validation";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { refreshSession, useAuthSession } from "@/features/auth";
import { useKycApplication, useSubmitKyc, useUploadDocument } from "@/features/kyc";
import { Colors } from "@/theme/colors";

const REQUIRED_DOCS = ["passport", "selfie"] as const;
type RequiredDoc = (typeof REQUIRED_DOCS)[number];

const POLL_INTERVAL_MS = 3000;

function uploadedTypes(application: KycApplicationResponse | null): Set<string> {
  if (application === null) return new Set();
  return new Set(application.documents.filter((d) => d.status === "uploaded").map((d) => d.type));
}

export default function KycStatus() {
  const insets = useSafeAreaInsets();
  const { session } = useAuthSession();
  const { application, isLoading, error, refetch } = useKycApplication();
  const upload = useUploadDocument();
  const submit = useSubmitKyc();
  const [busyDoc, setBusyDoc] = useState<RequiredDoc | null>(null);

  // Poll while the application is in flight server-side.
  const isInFlight = application?.status === "submitted" || application?.status === "review";
  useEffect(() => {
    if (!isInFlight) return;
    const id = setInterval(() => {
      void refetch();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isInFlight, refetch]);

  // On approval: rotate the access token so its `kyc` claim is up-to-date,
  // then send the user into the app.
  useEffect(() => {
    if (application?.status !== "approved") return;
    void (async () => {
      await refreshSession();
      router.replace("/(tabs)/home");
    })();
  }, [application?.status]);

  const onUpload = useCallback(
    async (type: RequiredDoc) => {
      setBusyDoc(type);
      try {
        // No real camera here yet; a 1 KB placeholder lets the InMemory
        // provider (PR-6) flow through the same code paths.
        const placeholder = new Uint8Array(1024).buffer;
        await upload.upload({
          type,
          mimeType: "image/jpeg",
          body: placeholder,
          sizeBytes: 1024,
        });
        await refetch();
      } finally {
        setBusyDoc(null);
      }
    },
    [upload, refetch],
  );

  const onSubmit = useCallback(async () => {
    const result = await submit.submit();
    if (result.ok) await refetch();
  }, [submit, refetch]);

  return (
    <Screen scroll>
      <Header showBack={false} title="Verify identity" />
      <View style={{ paddingHorizontal: 24, flex: 1, paddingTop: 8 }}>
        <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 }}>
          Signed in as {session?.user.email ?? "—"}
        </Text>

        {isLoading ? (
          <View style={{ marginTop: 40, alignItems: "center" }}>
            <ActivityIndicator color={Colors.brand.primary} />
          </View>
        ) : error !== null ? (
          <View style={{ marginTop: 24 }}>
            <Text
              style={{ color: Colors.accent.red, fontFamily: "Inter_400Regular", fontSize: 13 }}
            >
              {error.message}
            </Text>
            <Pressable onPress={() => void refetch()} style={{ marginTop: 12 }}>
              <Text style={{ color: Colors.brand.primary, fontFamily: "Inter_500Medium" }}>
                Try again
              </Text>
            </Pressable>
          </View>
        ) : application === null ? null : (
          <Body
            application={application}
            uploaded={uploadedTypes(application)}
            busyDoc={busyDoc}
            onUpload={onUpload}
            onSubmit={onSubmit}
            isSubmitting={submit.isPending}
          />
        )}
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }} />
    </Screen>
  );
}

interface BodyProps {
  application: KycApplicationResponse;
  uploaded: Set<string>;
  busyDoc: RequiredDoc | null;
  onUpload: (type: RequiredDoc) => Promise<void>;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

function Body(props: BodyProps) {
  const { application, uploaded, busyDoc, onUpload, onSubmit, isSubmitting } = props;

  if (application.status === "submitted" || application.status === "review") {
    return (
      <View style={{ marginTop: 32, alignItems: "center" }}>
        <ActivityIndicator color={Colors.brand.primary} />
        <Text
          style={{
            marginTop: 16,
            color: Colors.ink[700],
            fontFamily: "Inter_500Medium",
            fontSize: 15,
            textAlign: "center",
          }}
        >
          Submitted. Waiting for a decision…
        </Text>
        <Text
          style={{
            marginTop: 6,
            color: Colors.ink[500],
            fontFamily: "Inter_400Regular",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          The dev provider auto-approves after a few seconds.
        </Text>
      </View>
    );
  }

  if (application.status === "approved") {
    return (
      <View style={{ marginTop: 32, alignItems: "center" }}>
        <Text
          style={{
            color: Colors.accent.green,
            fontFamily: "Sora_700Bold",
            fontSize: 22,
            textAlign: "center",
          }}
        >
          Approved
        </Text>
        <Text
          style={{
            marginTop: 8,
            color: Colors.ink[600],
            fontFamily: "Inter_400Regular",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          Taking you in…
        </Text>
      </View>
    );
  }

  if (application.status === "rejected") {
    return (
      <View style={{ marginTop: 32 }}>
        <Text
          style={{
            color: Colors.accent.red,
            fontFamily: "Sora_700Bold",
            fontSize: 18,
          }}
        >
          Rejected
        </Text>
        {application.rejectionReason !== null && (
          <Text
            style={{
              marginTop: 8,
              color: Colors.ink[700],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
            }}
          >
            {application.rejectionReason}
          </Text>
        )}
        <Text
          style={{
            marginTop: 12,
            color: Colors.ink[500],
            fontFamily: "Inter_400Regular",
            fontSize: 12,
          }}
        >
          Resubmission lands in a follow-up PR.
        </Text>
      </View>
    );
  }

  // pending
  const allUploaded = REQUIRED_DOCS.every((d) => uploaded.has(d));
  return (
    <View style={{ marginTop: 24 }}>
      <Text style={{ color: Colors.ink[700], fontFamily: "Inter_500Medium", fontSize: 14 }}>
        Documents required
      </Text>
      <View style={{ marginTop: 12, gap: 10 }}>
        {REQUIRED_DOCS.map((d) => (
          <DocRow
            key={d}
            label={d === "passport" ? "Passport" : "Selfie"}
            uploaded={uploaded.has(d)}
            busy={busyDoc === d}
            onPress={() => void onUpload(d)}
          />
        ))}
      </View>
      <View style={{ marginTop: 24 }}>
        <Button
          title={isSubmitting ? "Submitting…" : "Submit for review"}
          onPress={() => void onSubmit()}
          disabled={!allUploaded || isSubmitting}
        />
      </View>
    </View>
  );
}

function DocRow(props: { label: string; uploaded: boolean; busy: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.uploaded || props.busy}
      style={({ pressed }) => ({
        borderWidth: 1,
        borderColor: props.uploaded ? Colors.accent.green : Colors.ink[200],
        borderRadius: 12,
        padding: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        opacity: pressed && !props.uploaded ? 0.7 : 1,
      })}
    >
      <Text style={{ color: Colors.ink[800], fontFamily: "Inter_500Medium", fontSize: 14 }}>
        {props.label}
      </Text>
      {props.busy ? (
        <ActivityIndicator size="small" color={Colors.brand.primary} />
      ) : (
        <Text
          style={{
            color: props.uploaded ? Colors.accent.green : Colors.brand.primary,
            fontFamily: "Inter_500Medium",
            fontSize: 13,
          }}
        >
          {props.uploaded ? "Uploaded" : "Upload"}
        </Text>
      )}
    </Pressable>
  );
}
