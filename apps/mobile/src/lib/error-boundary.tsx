// React error boundary that reports to Sentry. Used both at the root
// (in _layout.tsx) and per-feature so a crash in one screen doesn't
// black out the entire app.

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Sentry } from "./sentry/instrument";

interface Props {
  children: ReactNode;
  /// Shown in the fallback UI; helps users understand what failed.
  label?: string;
  /// onReset clears the error and re-renders children. The caller can
  /// also use it to trigger a navigation or data refresh.
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    Sentry.captureException(error, {
      tags: { boundary: this.props.label ?? "root" },
      contexts: { react: { componentStack: info.componentStack ?? "" } },
    });
  }

  private readonly handleReset = (): void => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  override render(): ReactNode {
    if (this.state.error === null) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>
          {this.props.label !== undefined
            ? `${this.props.label} failed to load. The error has been reported.`
            : "The app hit an unexpected error. The error has been reported."}
        </Text>
        <Pressable style={styles.button} onPress={this.handleReset}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontFamily: "Sora_700Bold",
    fontSize: 20,
    color: "#181818",
    marginBottom: 8,
    textAlign: "center",
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    maxWidth: 320,
    lineHeight: 19,
  },
  button: {
    backgroundColor: "#4B1F8A",
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
});
