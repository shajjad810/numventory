import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Boxes,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react-native";

import { useAuth } from "../context/auth-context";

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (loading) return;

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.leftPanel}>
        <View style={styles.logo}>
          <Boxes size={40} color="#FFFFFF" />
        </View>

        <Text style={styles.brandName}>Numventory</Text>

        <Text style={styles.brandDescription}>
          Inventory management made simple.
        </Text>

        <View style={styles.features}>
          {[
            "Real-time inventory tracking",
            "Warehouse operations",
            "Secure access",
          ].map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <CheckCircle2 size={22} color="#60A5FA" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.version}>Numventory v1.0.0</Text>
      </View>

      <KeyboardAvoidingView style={styles.rightPanel} behavior="height">
        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Welcome back</Text>

          <Text style={styles.subtitle}>
            Sign in to access warehouse operations.
          </Text>

          <Text style={styles.label}>Email address</Text>

          <View style={styles.inputContainer}>
            <Mail size={22} color="#94A3B8" />

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#94A3B8"
              accessibilityLabel="Email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
            />
          </View>

          <Text style={styles.label}>Password</Text>

          <View style={styles.inputContainer}>
            <Lock size={22} color="#94A3B8" />

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              accessibilityLabel="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="current-password"
              editable={!loading}
              onSubmitEditing={handleLogin}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={10}
            >
              {showPassword ? (
                <EyeOff size={22} color="#64748B" />
              ) : (
                <Eye size={22} color="#64748B" />
              )}
            </Pressable>
          </View>

          {!!error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.loginButton,
              (pressed || loading) && styles.disabledButton,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Sign in</Text>
            )}
          </Pressable>

          <View style={styles.secureAccess}>
            <ShieldCheck size={18} color="#94A3B8" />
            <Text style={styles.secureText}>Secure employee access</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  leftPanel: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 40,
    justifyContent: "center",
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  brandName: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  brandDescription: {
    fontSize: 17,
    color: "#CBD5E1",
    marginTop: 10,
    lineHeight: 26,
  },
  features: {
    marginTop: 32,
    gap: 18,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: "#CBD5E1",
  },
  version: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 36,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  formContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 8,
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 16,
    minHeight: 56,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    paddingVertical: 12,
  },
  loginButton: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 14,
  },
  secureAccess: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 24,
  },
  secureText: {
    fontSize: 13,
    color: "#94A3B8",
  },
});
