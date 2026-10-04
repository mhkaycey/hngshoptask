import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { listOrders, type OrderSummary } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function OrdersScreen() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await listOrders();
    if (result.success) {
      setOrders(result.data.orders);
      setError(null);
    } else {
      setError(result.message);
    }
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (authLoading) return <ActivityIndicator style={styles.center} size="large" color="#b45309" />;
  if (!user)
    return <Text style={[styles.center, styles.muted]}>Sign in from the Profile tab to see your orders.</Text>;

  return (
    <View style={styles.root}>
      {loading ? (
        <ActivityIndicator style={styles.center} size="large" color="#b45309" />
      ) : error ? (
        <Text style={[styles.center, styles.error]}>{error}</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          ListEmptyComponent={<Text style={styles.muted}>No orders yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.id}>{item.id.slice(0, 8).toUpperCase()}</Text>
              <Text style={styles.meta}>
                {new Date(item.created_at).toLocaleDateString()} · {item.item_count} item(s)
              </Text>
              <Text style={styles.total}>₦{item.total}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, marginTop: 48, textAlign: "center" },
  muted: { color: "#78716c", textAlign: "center", marginTop: 48 },
  error: { color: "#b91c1c", textAlign: "center", marginTop: 48 },
  card: { padding: 14, borderRadius: 14, backgroundColor: "#fafaf9", gap: 2 },
  id: { fontWeight: "700", color: "#b45309" },
  meta: { color: "#78716c", fontSize: 12 },
  total: { fontWeight: "700", fontSize: 16 },
  status: { fontSize: 12, color: "#4d7c0f", textTransform: "capitalize" },
});
