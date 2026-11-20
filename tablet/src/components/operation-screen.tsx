import type { ReactNode } from "react";
import { StyleSheet, View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Boxes } from "lucide-react-native";

type OperationScreenProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function OperationScreen({
  title,
  description,
  children,
}: OperationScreenProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to dashboard"
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
        >
          <ArrowLeft size={24} color="#0F172A" />
          <Text style={styles.backText}>Dashboard</Text>
        </Pressable>

        <View style={styles.brand}>
          <Boxes size={26} color="#2563EB" />
          <Text style={styles.brandName}>Numventory</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  pressed: {
    opacity: 0.6,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
  },
  content: {
    flexGrow: 1,
    padding: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0F172A",
  },
  description: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 6,
  },
  body: {
    marginTop: 24,
  },
});
