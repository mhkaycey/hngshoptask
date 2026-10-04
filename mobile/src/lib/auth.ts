import * as SecureStore from "expo-secure-store";
import { useEffect, useState, useCallback } from "react";
import { useAuthRequest, makeRedirectUri } from "expo-auth-session";
import { exchangeGoogleToken } from "./api";

const TOKEN_KEY = "hngshop.session-token";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

export function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setAuthToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearAuthToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Google sign-in for the mobile app, implemented with the generic
 * `useAuthRequest` OIDC flow (the dedicated `providers/Google` helper is
 * deprecated in SDK 57). The returned Google ID token is exchanged at
 * POST /api/v1/auth/google for a session JWT stored in the keychain.
 *
 * Env vars (in mobile/.env.local), all from the same Google Cloud project
 * as the web app:
 *   EXPO_PUBLIC_GOOGLE_CLIENT_ID  — iOS/Android OAuth client ID whose
 *                                   authorized redirect includes the
 *                                   `hngshop://` scheme URI below.
 */
const googleDiscovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const redirectUri = makeRedirectUri({ scheme: "hngshop" });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      redirectUri,
      scopes: ["openid", "email", "profile"],
      // Implicit OIDC flow: Google returns the ID token directly
      // (native clients need no client secret).
      responseType: "id_token",
      usePKCE: false,
    },
    googleDiscovery
  );

  // Restore an existing session on launch.
  useEffect(() => {
    (async () => {
      const token = await getAuthToken();
      if (token) {
        const { getSession } = await import("./api");
        const result = await getSession();
        if (result.success) {
          setUser({
            id: result.data.user.id,
            email: result.data.user.email,
            name: result.data.user.name,
            avatarUrl: null,
          });
        } else {
          await clearAuthToken();
        }
      }
      setLoading(false);
    })();
  }, []);

  // Complete the OAuth exchange when the browser flow returns.
  useEffect(() => {
    (async () => {
      if (response?.type === "success" && response.params?.id_token) {
        const result = await exchangeGoogleToken(response.params.id_token);
        if (result.success) {
          await setAuthToken(result.data.token);
          setUser(result.data.user);
        }
      }
    })();
  }, [response]);

  const signOut = useCallback(async () => {
    await clearAuthToken();
    setUser(null);
  }, []);

  return { user, loading, signIn: promptAsync, signOut, ready: !!request, redirectUri };
}
