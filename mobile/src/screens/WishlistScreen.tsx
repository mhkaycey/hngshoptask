import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { wishlist, removeFromWishlist, type Product } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { RootStackParamList } from "../App";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function WishlistScreen() {
  const { user } = useAuth();
  const nav = useNavigation<Nav>();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await wishlist();
    if (result.success) setItems(result.data.items);
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!user)
    return <Text style={styles.muted}>Sign in from the Profile tab to use your wishlist.</Text>;
  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#b45309" />;

  return (
    <FlatList
      data={items}
      keyExtractor={(p) => p.id}
      contentContainerStyle={{ padding: 12, gap: 12 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      ListEmptyComponent={<Text style={styles.muted}>Your wishlist is empty.</Text>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Pressable style={{ flex: 1, flexDirection: "row", gap: 12 }} onPress={() => nav.navigate("ProductDetail", { id: item.id })}>
            {item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} />}
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>₦{item.price}</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={async () => {
              await removeFromWishlist(item.id);
              load();
            }}
          >
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, marginTop: 48 },
  muted: { color: "#78716c", textAlign: "center", marginTop: 48 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, backgroundColor: "#fafaf9" },
  image: { width: 56, height: 56, borderRadius: 10 },
  name: { fontWeight: "600" },
  price: { color: "#b45309", fontWeight: "700" },
  remove: { color: "#b91c1c" },
});
