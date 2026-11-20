import { useCallback, useEffect, useMemo, useState } from "react";
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
import { buildInventoryRows, getInventoryData } from "../lib/inventory";

import type { InventoryData, InventoryRow } from "../lib/inventory";

export default function InventoryScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const loadInventory = useCallback(
    async (isRefresh = false) => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const result = await getInventoryData(token);
        setData(result);
      } catch (error) {
        Alert.alert(
          "Unable to load inventory",
          error instanceof Error ? error.message : "Something went wrong.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const rows = useMemo(() => (data ? buildInventoryRows(data) : []), [data]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesLocation =
        selectedLocation === "all" || row.locationId === selectedLocation;

      const matchesSearch =
        !query ||
        row.productName.toLowerCase().includes(query) ||
        row.sku.toLowerCase().includes(query) ||
        row.locationName.toLowerCase().includes(query);

      return matchesLocation && matchesSearch;
    });
  }, [rows, search, selectedLocation]);

  const lowStockCount = filteredRows.filter((row) => row.isLowStock).length;

  if (loading && !data) {
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

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Inventory</Text>
          <Text style={styles.subtitle}>
            View stock across warehouse locations.
          </Text>
        </View>

        <Pressable
          style={styles.refreshButton}
          disabled={refreshing}
          onPress={() => loadInventory(true)}
        >
          <Text style={styles.refreshText}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryLabel}>Stock Records</Text>
          <Text style={styles.summaryValue}>{filteredRows.length}</Text>
        </View>

        <View>
          <Text style={styles.summaryLabel}>Low Stock</Text>
          <Text style={styles.summaryValue}>{lowStockCount}</Text>
        </View>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search product, SKU, or location..."
        value={search}
        onChangeText={setSearch}
      />

      <Text style={styles.label}>Filter by Location</Text>

      <View style={styles.filters}>
        <Pressable
          style={[
            styles.filterButton,
            selectedLocation === "all" && styles.filterSelected,
          ]}
          onPress={() => setSelectedLocation("all")}
        >
          <Text style={styles.filterText}>All Locations</Text>
        </Pressable>

        {data?.locations.map((location) => (
          <Pressable
            key={location.id}
            style={[
              styles.filterButton,
              selectedLocation === location.id && styles.filterSelected,
            ]}
            onPress={() => setSelectedLocation(location.id)}
          >
            <Text style={styles.filterText}>{location.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Current Stock</Text>

      {filteredRows.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No inventory records found.</Text>
        </View>
      ) : (
        filteredRows.map((row: InventoryRow) => (
          <View key={row.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{row.productName}</Text>
                <Text style={styles.sku}>{row.sku}</Text>
              </View>

              {row.isLowStock && (
                <View style={styles.lowStockBadge}>
                  <Text style={styles.lowStockText}>Low Stock</Text>
                </View>
              )}
            </View>

            <Text style={styles.location}>Location: {row.locationName}</Text>

            <Text style={styles.quantity}>
              {row.quantity} {row.unit}
            </Text>

            <Text style={styles.threshold}>
              Low-stock threshold: {row.lowStockThreshold} {row.unit}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 28,
    paddingBottom: 60,
  },
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 6,
  },
  refreshButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  refreshText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  summary: {
    flexDirection: "row",
    gap: 40,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryLabel: {
    color: "#64748b",
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 6,
  },
  search: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  filterButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#dbeafe",
  },
  filterText: {
    fontSize: 15,
    color: "#0f172a",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  sku: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  location: {
    fontSize: 15,
    color: "#475569",
    marginTop: 14,
  },
  quantity: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1d4ed8",
    marginTop: 10,
  },
  threshold: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 8,
  },
  lowStockBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  lowStockText: {
    color: "#92400e",
    fontSize: 13,
    fontWeight: "700",
  },
  empty: {
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 16,
  },
});
