---
title: Mobile overview
sub: Expo, React Query, Zustand
---

## Stack

- **Expo SDK 54** (React Native 0.81, React 19.1)
- **Expo Router v6** (file-system routing over React Navigation)
- **NativeWind v4** (Tailwind for RN — every screen uses `className`, never `StyleSheet.create`)
- **Gluestack UI v3** — used for basic controls (Button, Input); overlays are `@gorhom/bottom-sheet`
- **Zustand v5** — auth only (mostly); everything else via React Query
- **@tanstack/react-query v5** — the primary state layer for server data
- **expo-image** for image rendering (better perf than `<Image>`)
- **posthog-react-native** + `posthog-react-native-session-replay`

## Why not Redux / MobX / etc.

React Query owns server state. Zustand owns UI state that persists across screens (auth session, in-progress onboarding, planning session). Local state uses `useState`. That covers everything without a state-management library.

## App shell

`app/_layout.tsx` (~250 LOC) is the root. It:

1. Wraps every child in providers: React Query, PostHog, GestureHandler, BottomSheetModalProvider, GluestackUIProvider (theme), SafeAreaProvider, Toast.
2. Subscribes to Supabase auth changes → syncs `stores/auth.store.ts`, identifies PostHog, clears React Query on sign-out.
3. Detects account switch (SIGNED_IN with different user id) → clears everything.
4. Registers the app for push notifications after sign-in (`hooks/usePushNotifications.ts`).

## Routing

`expo-router` reads the `app/` folder. Every folder is a route segment. Route groups in parentheses (`(auth)`, `(tabs)`) don't affect URLs.

Layout files (`_layout.tsx`) wrap child screens. The two main ones:

- `app/(auth)/_layout.tsx` — sign-in stack
- `app/(tabs)/_layout.tsx` — main tab bar (home, wardrobe, add, outfits, profile)

Modal + fullscreen screens are declared with `presentation: 'modal'` in the Stack.Screen options.

See **[Screen map](/control/docs/mobile/screens)** for the full route inventory.

## Data flow: reading server data

```
Screen
   ├─ imports a hook (e.g. useWardrobe)
   │     ├─ useQuery({ queryKey: ['wardrobe', filters], queryFn })
   │     ├─ queryFn: api.get('/wardrobe?...')
   │     │
   │     └─ api.ts fetch wrapper attaches JWT from stores/auth.store
   ↓
Screen renders { data, isLoading, error }
```

## Data flow: mutating server data

```
User taps Save
   ↓
Component calls useMutation.mutate(input)
   ↓
Hook fires POST /wardrobe
   ↓
onSuccess: invalidateQueries(['wardrobe']) → any subscribed screen refetches
```

Rule: every mutation defines invalidations for related caches (wardrobe touches outfits, profile touches banner, etc.). See **[Hooks](/control/docs/mobile/hooks)**.

## Env

Env vars are prefixed `EXPO_PUBLIC_` to be bundled into the JS. There are also runtime configs in `app.json` under `extra`. Full list in **[Reference / Env vars](/control/docs/reference/env-vars)**.

## Building the app

- Development: `eas build --profile development` for a dev client that connects to Metro.
- Preview: `eas build --profile preview` for internal shareable builds.
- Production: `eas build --profile production` → submit to App Store / Play Store.

Preview + production builds bundle their own env values (production uses production Supabase, preview can use staging).

## Notification service extension (iOS)

Rich push (with images) requires a Notification Service Extension. Ours lives at `assets/NotificationService.m` and is compiled via a custom Expo plugin (`plugins/withNotificationService.js`). No App Groups needed. Logs are only visible in macOS Console.app, not Xcode.

## Gotchas worth knowing

- `expo-image`, `expo-linear-gradient` need `style` for sizing (className works for most other props but sizing is unreliable).
- `expo-file-system` v18+: import from `'expo-file-system/legacy'` for `readAsStringAsync`.
- React 19 `useRef<T>()` produces a type error — use `useRef<T | undefined>(undefined)`.
- `@gorhom/bottom-sheet` renders in a Portal outside NativeWind's dark-mode context. Text color inside sheets needs inline `style={{ color: colors.foreground }}`.
- `router.back()` on a stackless screen throws GO_BACK — use `safeBack(router)` from `lib/safe-navigation.ts`.
- `refetchOnWindowFocus` does nothing in RN. Use the manual `focusManager` listener wired in `_layout.tsx` (fires on `AppState` change).
