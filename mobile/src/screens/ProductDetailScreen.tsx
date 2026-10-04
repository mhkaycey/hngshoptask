import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRoute } from "@react-navigation/native";
import type { RootStackParamList } from "../App";
import type { RouteProp } from "@react-navigation/native";
import {
  getProduct,
  addToWishlist,
  removeFromWishlist,
  type Product,
  type Review,
} from "../lib/api";
import { useCart } from "../lib/cart";

export default function ProductDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "ProductDetail">>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const result = await getProduct(route.params.id);
      if (result.success) {
        setProduct(result.data.product);
        setReviews(result.data.reviews);
        setAvg(result.data.stats.average);
      } else {
        setError(result.message);
      }
      setLoading(false);
    })();
  }, [route.params.id]);

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#b45309" />;
  if (error || !product)
    return <Text style={[styles.center, styles.error]}>{error ?? "Product not found."}</Text>;

  const outOfStock = product.stock <= 0;

  return (
    <ScrollView contentContainerStyle={styles.root}>
      {product.image_url && (
        <Image source={{ uri: product.image_url }} style={styles.image} recyclingKey={product.id} />
      )}
      <Text style={styles.category}>{product.category}</Text>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>₦{product.price}</Text>
      <Text style={outOfStock ? styles.stockOut : styles.stock}>
        {outOfStock ? "Out of stock" : `${product.stock} in stock`}
      </Text>
      {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

      <View style={styles.row}>
        <Pressable
          style={[styles.button, styles.primary, outOfStock && styles.disabled]}
          disabled={outOfStock}
          onPress={() => addItem(product)}
        >
          <Text style={styles.buttonText}>Add to cart</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={async () => {
            const result = saved
              ? await removeFromWishlist(product.id)
              : await addToWishlist(product.id);
            if (result.success) setSaved(result.data.inWishlist);
          }}
        >
          <Text style={styles.secondaryText}>{saved ? "♥ Saved" : "♡ Save"}</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>
        Reviews {avg > 0 ? `· ${avg.toFixed(1)}★` : ""}
      </Text>
      {reviews.length === 0 && <Text style={styles.muted}>No reviews yet.</Text>}
      {reviews.map((review) => (
        <View key={review.user_id} style={styles.review}>
          <Text style={styles.reviewMeta}>
            {"★".repeat(review.rating)} {review.reviewer_name ?? "Customer"}
          </Text>
          {review.comment ? <Text style={styles.muted}>{review.comment}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 8, backgroundColor: "#fff" },
  center: { flex: 1, marginTop: 48 },
  error: { color: "#b91c1c", textAlign: "center", marginTop: 48 },
  image: { width: "100%", aspectRatio: 1, borderRadius: 16 },
  category: { fontSize: 11, color: "#b45309", textTransform: "uppercase", letterSpacing: 2 },
  name: { fontSize: 24, fontWeight: "700" },
  price: { fontSize: 20, fontWeight: "700", color: "#b45309" },
  stock: { color: "#4d7c0f", fontSize: 12 },
  stockOut: { color: "#b91c1c", fontSize: 12 },
  description: { color: "#57534e", lineHeight: 22 },
  row: { flexDirection: "row", gap: 12, marginTop: 12 },
  button: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#b45309" },
  primary: { backgroundColor: "#b45309" },
  disabled: { opacity: 0.4 },
  buttonText: { color: "#fff", fontWeight: "700" },
  secondaryText: { color: "#b45309", fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 24 },
  review: { padding: 12, borderRadius: 12, backgroundColor: "#fafaf9", marginTop: 8 },
  reviewMeta: { fontWeight: "600", color: "#b45309" },
  muted: { color: "#78716c" },
});
