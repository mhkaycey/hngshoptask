import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { checkout } from "../lib/api";
import { useCart } from "../lib/cart";

export default function CheckoutScreen() {
  const cart = useCart();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    const result = await checkout({
      fullName,
      email,
      shippingAddress: address,
      cartItems: cart.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    });
    setSubmitting(false);
    if (result.success) {
      cart.clear();
      Alert.alert("Order placed", `Your order ${result.data.orderId} was placed.`);
    } else {
      Alert.alert("Checkout failed", result.message);
    }
  }

  const valid =
    fullName.trim().length > 0 &&
    /.+@.+\..+/.test(email) &&
    address.trim().length >= 10 &&
    cart.items.length > 0;

  return (
    <View style={styles.root}>
      <Text style={styles.label}>Full name</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.label}>Shipping address</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={address}
        onChangeText={setAddress}
        multiline
      />
      <Text style={styles.total}>Total: ₦{cart.total.toFixed(2)}</Text>
      <Pressable
        style={[styles.button, (!valid || submitting) && styles.disabled]}
        disabled={!valid || submitting}
        onPress={submit}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Place order</Text>
        )}
      </Pressable>
      <Text style={styles.note}>
        Guest checkout is allowed. Prices are confirmed by the server when the
        order is placed.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 6, backgroundColor: "#fff" },
  label: { fontWeight: "600", marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 12, padding: 12 },
  multiline: { minHeight: 90, textAlignVertical: "top" },
  total: { fontSize: 18, fontWeight: "700", marginTop: 16 },
  button: { backgroundColor: "#b45309", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 12 },
  disabled: { opacity: 0.4 },
  buttonText: { color: "#fff", fontWeight: "700" },
  note: { color: "#78716c", fontSize: 12, marginTop: 12 },
});
