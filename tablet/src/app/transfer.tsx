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
import { getTransferData, transferInventory } from "../lib/transfer";
import { getAvailableStock } from "../lib/shipping";
import type { Inventory } from "../lib/shipping";
import type { Product, Location } from "../lib/receiving";

export default function TransferScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);

  const [productId, setProductId] = useState("");
  const [fromLocationId, setFromLocationId] = useState("");
  const [toLocationId, setToLocationId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedProduct = products.find((product) => product.id === productId);

  const availableStock = getAvailableStock(
    inventory,
    productId,
    fromLocationId,
  );

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        if (!token) return;

        const data = await getTransferData(token);

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
              : "Unable to load transfer data.",
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

  async function handleTransfer() {
    const amount = Number(quantity);

    if (!productId || !fromLocationId || !toLocationId) {
      Alert.alert(
        "Missing information",
        "Select a product, source location, and destination.",
      );
      return;
    }

    if (fromLocationId === toLocationId) {
      Alert.alert(
        "Invalid transfer",
        "Source and destination must be different.",
      );
      return;
    }

    if (!quantity.trim() || !Number.isFinite(amount) || amount <= 0) {
      Alert.alert("Invalid quantity", "Enter a quantity greater than zero.");
      return;
    }

    if (amount > availableStock) {
      Alert.alert(
        "Insufficient stock",
        `Only ${availableStock} ${selectedProduct?.unit ?? "units"} available.`,
      );
      return;
    }

    if (!token || submitting) return;

    setSubmitting(true);

    try {
      const transaction = await transferInventory(
        {
          productId,
          fromLocationId,
          toLocationId,
          quantity: amount,
          reference: reference.trim(),
          notes: notes.trim(),
        },
        token,
      );

      // Refresh stock after the successful transfer.
      try {
        const updated = await getTransferData(token);
        setInventory(updated.inventory);
      } catch {
        // Transfer succeeded, even if the refresh failed.
      }

      setQuantity("");
      setReference("");
      setNotes("");

      Alert.alert(
        "Transfer successful",
        `Transaction #${transaction.id} was recorded.`,
      );
    } catch (error) {
      Alert.alert(
        "Transfer failed",
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
        <Text>Loading transfer data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.replace("/")}>
        <Text style={styles.back}>← Back to Dashboard</Text>
      </Pressable>

      <Text style={styles.title}>Transfer Inventory</Text>
      <Text style={styles.subtitle}>
        Move stock between warehouse locations.
      </Text>

      <Text style={styles.label}>Select Product</Text>
      <View style={styles.options}>
        {products.map((product) => (
          <Pressable
            key={product.id}
            style={[styles.option, productId === product.id && styles.selected]}
            onPress={() => setProductId(product.id)}
          >
            <Text style={styles.optionText}>
              {product.name} ({product.sku})
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>From Location</Text>
      <View style={styles.options}>
        {locations.map((location) => (
          <Pressable
            key={location.id}
            style={[
              styles.option,
              fromLocationId === location.id && styles.selected,
            ]}
            onPress={() => setFromLocationId(location.id)}
          >
            <Text style={styles.optionText}>{location.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>To Location</Text>
      <View style={styles.options}>
        {locations.map((location) => (
          <Pressable
            key={location.id}
            style={[
              styles.option,
              toLocationId === location.id && styles.selected,
            ]}
            onPress={() => setToLocationId(location.id)}
          >
            <Text style={styles.optionText}>{location.name}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.stockBox}>
        <Text style={styles.stockLabel}>Available Stock at Source</Text>
        <Text style={styles.stockValue}>
          {availableStock} {selectedProduct?.unit ?? ""}
        </Text>
      </View>

      <Text style={styles.label}>Quantity to Transfer</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter quantity"
        keyboardType="decimal-pad"
        value={quantity}
        onChangeText={setQuantity}
      />

      <Text style={styles.label}>Reference (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Example: TRANSFER-001"
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
        onPress={handleTransfer}
      >
        <Text style={styles.submitText}>
          {submitting ? "Transferring..." : "Transfer Inventory"}
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
  back: {
    color: "#2563eb",
    fontSize: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 10,
    color: "#334155",
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  option: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#ffffff",
  },
  selected: {
    borderColor: "#2563eb",
    backgroundColor: "#dbeafe",
  },
  optionText: {
    fontSize: 15,
    color: "#0f172a",
  },
  stockBox: {
    marginTop: 24,
    backgroundColor: "#eff6ff",
    padding: 20,
    borderRadius: 12,
  },
  stockLabel: {
    fontSize: 16,
    color: "#475569",
  },
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
  notes: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  submit: {
    marginTop: 30,
    backgroundColor: "#2563eb",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  submitText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
});
