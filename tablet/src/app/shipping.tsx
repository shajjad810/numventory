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
import {
  getShippingData,
  getAvailableStock,
  shipInventory,
  type Inventory,
} from "../lib/shipping";
import type { Product, Location } from "../lib/receiving";

export default function ShippingScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);

  const [productId, setProductId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const availableStock = getAvailableStock(inventory, productId, locationId);

  const selectedProduct = products.find((product) => product.id === productId);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        if (!token) return;

        const data = await getShippingData(token);

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
              : "Unable to load shipping data.",
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

  async function handleShip() {
    const amount = Number(quantity);

    if (!productId || !locationId) {
      Alert.alert("Missing information", "Select a product and location.");
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
      const transaction = await shipInventory(
        {
          productId,
          locationId,
          quantity: amount,
          reference: reference.trim(),
          notes: notes.trim(),
        },
        token,
      );

      Alert.alert(
        "Shipping successful",
        `Transaction #${transaction.id} was recorded.`,
      );

      // Reload inventory to show the updated stock.
      const updated = await getShippingData(token);
      setInventory(updated.inventory);

      setQuantity("");
      setReference("");
      setNotes("");
    } catch (error) {
      Alert.alert(
        "Shipping failed",
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
        <Text>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.replace("/")}>
        <Text style={styles.back}>← Back to Dashboard</Text>
      </Pressable>

      <Text style={styles.title}>Ship Inventory</Text>
      <Text style={styles.subtitle}>
        Record outgoing stock from your warehouse.
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

      <Text style={styles.label}>Select Location</Text>
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
        <Text style={styles.stockLabel}>Available Stock</Text>
        <Text style={styles.stockValue}>
          {availableStock} {selectedProduct?.unit ?? ""}
        </Text>
      </View>

      <Text style={styles.label}>Quantity to Ship</Text>
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
        placeholder="Example: SHIP-001"
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
        onPress={handleShip}
      >
        <Text style={styles.submitText}>
          {submitting ? "Shipping..." : "Ship Inventory"}
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
  disabled: { opacity: 0.6 },
  submitText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
});
