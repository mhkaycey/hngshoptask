import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "../App";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { listProducts, type Product } from "../lib/api";
import { useCart } from "../lib/cart";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ProductsScreen() {
  const nav = useNavigation<Nav>();
  const cart = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(term = "") {
    setLoading(true);
    setError(null);
    const result = await listProducts(term ? { search: term } : {});
    if (result.success) setProducts(result.data.products);
    else setError(result.message);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.root}>
      <Pressable style={styles.cartPill} onPress={() => nav.navigate("Cart")}>
        <Text style={styles.cartPillText}>🛒 {cart.itemCount}</Text>
      </Pressable>
      <TextInput
        style={styles.search}
        placeholder="Search products…"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => load(search)}
        returnKeyType="search"
      />
      {loading ? (
        <ActivityIndicator style={styles.center} size="large" color="#b45309" />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={() => load(search)} />
          }
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => nav.navigate("ProductDetail", { id: item.id })}>
              {item.image_url && (
                <Image source={{ uri: item.image_url }} style={styles.image} recyclingKey={item.id} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>₦{item.price}</Text>
                <Text style={item.stock > 0 ? styles.stock : styles.stockOut}>
                  {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.center}>No products found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  cartPill: { alignSelf: "flex-end", marginRight: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#fef3c7" },
  cartPillText: { color: "#b45309", fontWeight: "700" },
  search: {
    margin: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafaf9",
  },
  image: { width: 88, height: 88, borderRadius: 12 },
  category: { fontSize: 11, color: "#b45309", textTransform: "uppercase", letterSpacing: 1 },
  name: { fontSize: 16, fontWeight: "600", marginTop: 2 },
  price: { fontSize: 15, fontWeight: "700", color: "#b45309", marginTop: 4 },
  stock: { fontSize: 12, color: "#4d7c0f", marginTop: 2 },
  stockOut: { fontSize: 12, color: "#b91c1c", marginTop: 2 },
  center: { flex: 1, textAlign: "center", marginTop: 32, color: "#78716c" },
  error: { color: "#b91c1c", textAlign: "center", marginTop: 32 },
});
