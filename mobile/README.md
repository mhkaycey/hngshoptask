# hngshop mobile app

React Native (Expo) client for the hngshop storefront. It talks to the same
backend as the web app through the versioned HTTP API at `/api/v1`
(see `docs/MOBILE_APP_STRATEGY.md`).

## Features

- Product list with search and pull-to-refresh
- Product detail with reviews and wishlist toggle
- Cart (persisted locally) and checkout with guest support
- Google sign-in (token exchange against `/api/v1/auth/google`, token kept in
  the device keychain via `expo-secure-store`)
- Order history and wishlist for signed-in users

## Setup

```bash
cd mobile
cp .env.example .env.local   # fill in values
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i` / `a` for the iOS / Android
simulators.

## Google sign-in

Implemented with `expo-auth-session`'s generic `useAuthRequest` (the dedicated
Google provider is deprecated in SDK 57). The app opens the Google consent
screen, receives an OIDC ID token, and exchanges it at
`/api/v1/auth/google`; the server verifies it and returns a session JWT kept
in `expo-secure-store`.

1. In the same Google Cloud project as the web app, create an OAuth client ID
   of type **iOS** or **Android**.
2. Add the app's redirect URI to the client's authorized redirect URIs. The
   URI is printed by `useAuth()` (`redirectUri`): typically `hngshop://` for
   a development build, or `exp://<your-ip>:8081` when using Expo Go.
3. Paste the client ID into `mobile/.env.local` as `EXPO_PUBLIC_GOOGLE_CLIENT_ID`.

## API contract

All endpoints return `{ success: boolean, data? , message? }`. See
`app/api/v1/**` in the repository root. Unauthorized requests get a 401; the
client clears the stored token automatically.
