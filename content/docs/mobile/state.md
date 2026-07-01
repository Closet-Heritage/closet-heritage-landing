---
title: State management
sub: Zustand stores + React Query + AsyncStorage
---

## Three layers

1. **React Query** — server state (`useWardrobeItems`, `useOutfits`, `useProfile`, etc.). This is the default for anything that came from the backend.
2. **Zustand** — cross-screen UI state that persists across route changes (auth session, in-progress onboarding data, planning session).
3. **`useState` / `useReducer`** — screen-local UI (form drafts, sheet open state).

## Zustand stores

### `stores/auth.store.ts`

Holds the Supabase session + user info. The single source of truth for "who am I".

```typescript
{
  session: Session | null,
  user: User | null,
  isLoading: boolean,
  setSession: (session) => ...,
  setLoading: (isLoading) => ...,
  reset: () => ...,
}
```

Populated by the auth listener in `app/_layout.tsx`. Read by hooks that need `user.id` (mostly through `useAuthStore((s) => s.user?.id)`). The store method to clear on sign-out is **`reset()`**, not `clear()`.

### `stores/onboarding.store.ts`

Draft state for the 7-step onboarding. Every screen writes its answer here; `wash-frequency` reads the whole store and POSTs a single `updateProfile` at the end.

```typescript
{
  currentStep: number,
  fullName: string | null,
  gender: 'male' | 'female' | null,
  photoUri: string | null,   // local file URI before upload
  avatarUrl: string | null,  // Supabase URL after upload
  washFrequency: string | null,
  locationData: { latitude, longitude, city, country } | null,
  locationEnabled: boolean,
  setFullName, setGender, setAvatarUrl, ...
  reset: () => ...,
}
```

Reset when: user signs out, user completes onboarding, account switch.

### `stores/outfit-planning.store.ts`

The user's current planning session — persists across the `/plan-outfit → /plan-outfit/results` navigation. Holds the array of days, selected suggestions per day, edited items, dismissed IDs.

Reset when: user leaves the planning flow (`handleDone` or explicit back).

### `stores/outfit-navigation.store.ts`

A single "outfit navigation intent" — used to pre-populate the outfit detail screen from a push notification or share code.

## AsyncStorage — what's there

- **Supabase session** (auto-managed by Supabase JS via `AsyncStorage` adapter).
- **Theme mode** — `hooks/useThemeMode.ts` reads/writes `@theme-mode` key.
- **`pendingCode`** — set when the user opens the app from an ambassador deep link before signing in; the onboarding flow reads + clears it after they land on the referral-code screen. Auto-cleared on dismiss to prevent infinite redirect.
- **`pendingDailyRecsOpen`** — flag set when a daily-rec push notification tap happens; the tabs screen reads it on next render and opens the sheet.

## React Query — key patterns

**Query keys** are always factories, never magic strings:

```typescript
// hooks/useWardrobe.ts
export const wardrobeKeys = {
    all: ['wardrobe'] as const,
    lists: () => [...wardrobeKeys.all, 'list'] as const,
    list: (filters: WardrobeFilters) => [...wardrobeKeys.lists(), filters] as const,
    details: () => [...wardrobeKeys.all, 'detail'] as const,
    detail: (id: string) => [...wardrobeKeys.details(), id] as const,
};
```

**Invalidation**: every mutation lists what it invalidates in `onSuccess`. Example from `useSeedStarterWardrobe`:

```typescript
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['wardrobe'] });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    queryClient.invalidateQueries({ queryKey: starterWardrobeKeys.all });
},
```

**Optimistic updates** are done via `setQueriesData` before the mutation fires. Rollback via `onError` with the snapshot returned from `onMutate`. Pattern is documented in `useDismissStarterBanner`.

**Per-user keys**: hooks that render data specific to the current user include `user?.id` in the query key. This means account-switch invalidates automatically — no manual clear needed for those.

## Focus refetch

`refetchOnWindowFocus` does nothing in React Native. Instead:

- `hooks/useRefreshOnFocus.ts` is a small wrapper: on `useFocusEffect`, calls the provided refetch. Used on tab screens where React Query's `refetchOnMount` doesn't fire because the screen stays mounted.
- `app/_layout.tsx` wires `AppState` → React Query's `focusManager.setFocused(active)` so app-foreground triggers a refetch of stale queries.

## When to add a Zustand store vs prop-drilling

- **Prop-drilling is fine** for anything shared across ≤3 sibling components.
- **Zustand** when data crosses route boundaries and isn't server data.
- **React Query** if the data has a canonical server representation.

We do not use Context for state — it's too easy to accidentally couple unrelated re-renders.
