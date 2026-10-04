import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../lib/auth";

export default function ProfileScreen() {
  const { user, loading, signIn, signOut, ready } = useAuth();

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#b45309" />;

  return (
    <View style={styles.root}>
      {user ? (
        <>
          <Text style={styles.name}>{user.name ?? user.email}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Pressable style={styles.signOut} onPress={signOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.name}>You are browsing as a guest</Text>
          <Text style={styles.email}>
            Sign in with Google to save a wishlist, review purchases, and track
            orders.
          </Text>
          <Pressable
            style={[styles.signIn, !ready && styles.disabled]}
            disabled={!ready}
            onPress={() => signIn()}
          >
            <Text style={styles.signInText}>Continue with Google</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, gap: 8, backgroundColor: "#fff" },
  center: { flex: 1, marginTop: 48 },
  name: { fontSize: 20, fontWeight: "700" },
  email: { color: "#78716c" },
  signIn: { backgroundColor: "#b45309", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 16 },
  signOut: { borderWidth: 1, borderColor: "#b45309", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 16 },
  signInText: { color: "#fff", fontWeight: "700" },
  signOutText: { color: "#b45309", fontWeight: "700" },
  disabled: { opacity: 0.4 },
});
