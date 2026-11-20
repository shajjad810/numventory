import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "../context/auth-context";
import { getProductionData, processProduction } from "../lib/production";
import { getAvailableStock } from "../lib/shipping";
import type { Inventory } from "../lib/shipping";
import type { Product, Location } from "../lib/receiving";

export default function ProductionScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);

  const [rawProductId, setRawProductId] = useState("");
  const [finishedProductId, setFinishedProductId] = useState("");
  const [locationId, setLocationId] = useState("");

  const [rawQuantity, setRawQuantity] = useState("");
  const [finishedQuantity, setFinishedQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const rawProduct = products.find((product) => product.id === rawProductId);

  const finishedProduct = products.find(
    (product) => product.id === finishedProductId,
  );

  const availableStock = getAvailableStock(inventory, rawProductId, locationId);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        if (!token) return;

        const data = await getProductionData(token);

        if (!active) return;

        setProducts(data.products);
        setLocations(data.locations);
        setInventory(data.inventory);
      } catch (error) {
        if (active) {
          Alert.alert(
            "Loading failed",
            error instanceof Error
              ? error.message
              : "Unable to load production data.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [token]);

  async function handleProduction() {
    const rawAmount = Number(rawQuantity);
    const finishedAmount = Number(finishedQuantity);

    if (!rawProductId || !finishedProductId || !locationId) {
      Alert.alert(
        "Missing information",
        "Select raw product, finished product, and location.",
      );
      return;
    }

    if (rawProductId === finishedProductId) {
      Alert.alert(
        "Invalid production",
        "Raw and finished products must be different.",
      );
      return;
    }

    if (
      !rawQuantity.trim() ||
      !finishedQuantity.trim() ||
      !Number.isFinite(rawAmount) ||
      !Number.isFinite(finishedAmount) ||
      rawAmount <= 0 ||
      finishedAmount <= 0
    ) {
      Alert.alert(
        "Invalid quantity",
        "Both quantities must be greater than zero.",
      );
      return;
    }

    if (rawAmount > availableStock) {
      Alert.alert(
        "Insufficient stock",
        `Only ${availableStock} ${rawProduct?.unit ?? "units"} available.`,
      );
      return;
    }

    if (!token || submitting) return;

    setSubmitting(true);

    try {
      const transactions = await processProduction(
        {
          rawProductId,
          finishedProductId,
          locationId,
          rawQuantity: rawAmount,
          finishedQuantity: finishedAmount,
          reference: reference.trim(),
          notes: notes.trim(),
        },
        token,
      );

      // Refresh inventory after production.
      let refreshFailed = false;

      try {
        const updated = await getProductionData(token);
        setInventory(updated.inventory);
      } catch {
        refreshFailed = true;
      }

      setRawQuantity("");
      setFinishedQuantity("");
      setReference("");
      setNotes("");

      Alert.alert(
        "Production successful",
        `${transactions.length} inventory transactions recorded.${
          refreshFailed
            ? "\nStock refresh failed. Reopen the screen to update balances."
            : ""
        }`,
      );
    } catch (error) {
      Alert.alert(
        "Production failed",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text>Loading production data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.replace("/")}>
        <Text style={styles.back}>← Back to Dashboard</Text>
      </Pressable>

      <Text style={styles.title}>Process Production</Text>
      <Text style={styles.subtitle}>
        Convert raw inventory into finished products.
      </Text>

      <Text style={styles.label}>Raw Product</Text>
      <View style={styles.options}>
        {products.map((product) => (
          <Pressable
            key={product.id}
            style={[
              styles.option,
              rawProductId === product.id && styles.selected,
            ]}
            onPress={() => setRawProductId(product.id)}
          >
            <Text style={styles.optionText}>
              {product.name} ({product.sku})
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Finished Product</Text>
      <View style={styles.options}>
        {products.map((product) => (
          <Pressable
            key={product.id}
            style={[
              styles.option,
              finishedProductId === product.id && styles.selected,
            ]}
            onPress={() => setFinishedProductId(product.id)}
          >
            <Text style={styles.optionText}>
              {product.name} ({product.sku})
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Production Location</Text>
      <View style={styles.options}>
        {locations.map((location) => (
          <Pressable
            key={location.id}
            style={[
              styles.option,
              locationId === location.id && styles.selected,
            ]}
            onPress={() => setLocationId(location.id)}
          >
            <Text style={styles.optionText}>{location.name}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.stockBox}>
        <Text style={styles.stockLabel}>Available Raw Stock</Text>
        <Text style={styles.stockValue}>
          {availableStock} {rawProduct?.unit ?? ""}
        </Text>
      </View>

      <Text style={styles.label}>
        Raw Quantity ({rawProduct?.unit ?? "units"})
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Quantity to consume"
        keyboardType="decimal-pad"
        value={rawQuantity}
        onChangeText={setRawQuantity}
      />

      <Text style={styles.label}>
        Finished Quantity ({finishedProduct?.unit ?? "units"})
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Quantity to produce"
        keyboardType="decimal-pad"
        value={finishedQuantity}
        onChangeText={setFinishedQuantity}
      />

      <Text style={styles.label}>Reference (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Example: PROD-001"
        value={reference}
        onChangeText={setReference}
      />

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, styles.notes]}
        placeholder="Additional details"
        multiline
        value={notes}
        onChangeText={setNotes}
      />

      <Pressable
        style={[styles.submit, submitting && styles.disabled]}
        disabled={submitting}
        onPress={handleProduction}
      >
        <Text style={styles.submitText}>
          {submitting ? "Processing..." : "Process Production"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 28, paddingBottom: 60 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  back: { color: "#2563eb", fontSize: 16, marginBottom: 20 },
  title: { fontSize: 30, fontWeight: "700", color: "#0f172a" },
  subtitle: { fontSize: 16, color: "#64748b", marginBottom: 24 },
  label: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 10,
    color: "#334155",
  },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  option: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#ffffff",
  },
  selected: { borderColor: "#2563eb", backgroundColor: "#dbeafe" },
  optionText: { fontSize: 15, color: "#0f172a" },
  stockBox: {
    marginTop: 24,
    backgroundColor: "#eff6ff",
    padding: 20,
    borderRadius: 12,
  },
  stockLabel: { fontSize: 16, color: "#475569" },
  stockValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1d4ed8",
    marginTop: 6,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 14,
    fontSize: 17,
  },
  notes: { minHeight: 80, textAlignVertical: "top" },
  submit: {
    marginTop: 30,
    backgroundColor: "#2563eb",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  disabled: { opacity: 0.6 },
});
