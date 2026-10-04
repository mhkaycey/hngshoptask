import { StyleSheet, Text, Pressable, FlatList, View } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "../App";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCart, type CartItem } from "../lib/cart";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CartScreen() {
  // Rendered as the tab "Cart"? This screen is reachable from anywhere the
  // cart icon is shown; it also serves as the "Cart" content area.
  const cart = useCart();

  return (
    <View style={styles.root}>
      <FlatList
        data={cart.items}
        keyExtractor={(i) => i.productId}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        ListEmptyComponent={<Text style={styles.muted}>Your cart is empty.</Text>}
        renderItem={({ item }) => <CartRow item={item} />}
      />
      {cart.items.length > 0 && <CartFooter />}
    </View>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const cart = useCart();
  return (
    <View style={styles.row}>
      {item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₦{item.price}</Text>
        <View style={styles.qtyRow}>
          <Pressable style={styles.qtyButton} onPress={() => cart.setQuantity(item.productId, item.quantity - 1)}>
            <Text>−</Text>
          </Pressable>
          <Text style={styles.qty}>{item.quantity}</Text>
          <Pressable style={styles.qtyButton} onPress={() => cart.setQuantity(item.productId, item.quantity + 1)}>
            <Text>+</Text>
          </Pressable>
          <Pressable onPress={() => cart.removeItem(item.productId)}>
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function CartFooter() {
  const cart = useCart();
  const nav = useNavigation<Nav>();
  return (
    <View style={styles.footer}>
      <Text style={styles.total}>Total: ₦{cart.total.toFixed(2)}</Text>
      <Pressable
        style={styles.checkoutButton}
        onPress={() => nav.navigate("Checkout")}
      >
        <Text style={styles.checkoutText}>Checkout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  muted: { color: "#78716c", textAlign: "center", marginTop: 32 },
  row: { flexDirection: "row", gap: 12, padding: 12, borderRadius: 16, backgroundColor: "#fafaf9" },
  image: { width: 64, height: 64, borderRadius: 10 },
  name: { fontWeight: "600" },
  price: { color: "#b45309", fontWeight: "700", marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  qtyButton: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: "#ddd", alignItems: "center", justifyContent: "center" },
  qty: { fontWeight: "700", minWidth: 20, textAlign: "center" },
  remove: { color: "#b91c1c", marginLeft: "auto" },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: "#eee", gap: 12 },
  total: { fontSize: 18, fontWeight: "700" },
  checkoutButton: { backgroundColor: "#b45309", padding: 16, borderRadius: 12, alignItems: "center" },
  checkoutText: { color: "#fff", fontWeight: "700" },
});
