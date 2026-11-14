import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Boxes,
  PackagePlus,
  Truck,
  ArrowLeftRight,
  Factory,
  Trash2,
  ClipboardList,
  UserCircle,
} from "lucide-react-native";

const operations = [
  {
    name: "Receiving",
    description: "Receive new stock",
    icon: PackagePlus,
    color: "#16A34A",
    background: "#DCFCE7",
  },
  {
    name: "Shipping",
    description: "Ship outgoing stock",
    icon: Truck,
    color: "#2563EB",
    background: "#DBEAFE",
  },
  {
    name: "Transfer",
    description: "Move inventory",
    icon: ArrowLeftRight,
    color: "#7C3AED",
    background: "#EDE9FE",
  },
  {
    name: "Production",
    description: "Process products",
    icon: Factory,
    color: "#EA580C",
    background: "#FFEDD5",
  },
  {
    name: "Waste",
    description: "Record damaged stock",
    icon: Trash2,
    color: "#DC2626",
    background: "#FEE2E2",
  },
  {
    name: "Inventory",
    description: "View available stock",
    icon: ClipboardList,
    color: "#0891B2",
    background: "#CFFAFE",
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Boxes size={28} color="#FFFFFF" />
          </View>

          <View>
            <Text style={styles.brandName}>Numventory</Text>
            <Text style={styles.brandSubtitle}>Warehouse Management</Text>
          </View>
        </View>

        <UserCircle size={32} color="#64748B" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Warehouse Operations</Text>

        <Text style={styles.subtitle}>Select an operation to get started.</Text>

        <View style={styles.grid}>
          {operations.map((operation) => {
            const Icon = operation.icon;

            return (
              <Pressable
                key={operation.name}
                accessibilityRole="button"
                onPress={() => Alert.alert(operation.name, "Coming soon")}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: operation.background },
                  ]}
                >
                  <Icon size={36} color={operation.color} />
                </View>

                <Text style={styles.cardTitle}>{operation.name}</Text>

                <Text style={styles.cardDescription}>
                  {operation.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Numventory v1.0.0</Text>

          <Text style={styles.footerText}>Warehouse Operations</Text>
        </View>
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
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
  },
  brandSubtitle: {
    fontSize: 14,
    color: "#64748B",
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
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 6,
    marginBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
  },
  card: {
    width: "32%",
    minHeight: 170,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 10,
  },
  cardPressed: {
    backgroundColor: "#F8FAFC",
    opacity: 0.75,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#0F172A",
  },
  cardDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: "#94A3B8",
  },
});
