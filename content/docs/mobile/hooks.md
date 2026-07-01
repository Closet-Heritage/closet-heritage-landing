---
title: Hooks
sub: React Query wrappers + auxiliary custom hooks
---

Verified against `closet-heritage-app/hooks/*.ts` as of 2026-07. This is the authoritative list; anything not here does not exist yet.

## Naming convention

- `use<Noun>()` — query hook returning `{ data, isLoading, error, refetch }`.
- `use<Verb><Noun>()` — mutation hook returning `useMutation` result (`mutate`, `mutateAsync`, `isPending`, etc.).

## Server-data hooks

### Auth + profile

| Hook | File |
|---|---|
| `useAuth()` | `useAuth.ts` |
| `useProfile()` | `useProfile.ts` |
| `useUpdateProfile()` | `useProfile.ts` |
| `useDeleteAccount()` | `useProfile.ts` |
| `useOnboarding()` | `useOnboarding.ts` — includes `saveProfile` callback that fires the final `PATCH /account` from wash-frequency |

### Wardrobe — `useWardrobe.ts`

| Hook | Notes |
|---|---|
| `useWardrobeItems(filters, opts?)` | Paginated. Filters: `topCategory`, `category`, `archived`, `source`, `limit`, `offset`. |
| `useHasWardrobeItems()` | Convenience empty-state detector |
| `useClothingItem(itemId)` | Single item |
| `useUpdateClothingItem()` / `useDeleteClothingItem()` | Rejects starter items with 403 `STARTER_READ_ONLY` |
| `useArchiveClothingItem()` / `useUnarchiveClothingItem()` |
| `useBulkArchiveClothingItems()` / `useBulkUnarchiveClothingItems()` / `useBulkDeleteClothingItems()` | For select-mode |
| `useReExtractItem()` | Requires AI consent |
| `useCreateMatchingSet()` / `useDissolveMatchingSet()` / `useUnlinkItemFromSet()` |

### Add + batch processing

| Hook | File |
|---|---|
| `useBatchProcessing()` | `useBatchProcessing.ts` — full upload → poll → results flow |
| `useDeleteBatchItems()` | `useAddItem.ts` |
| `useItemActions()` | `useItemActions.ts` — shared item action handlers |

### Outfits — `useOutfits.ts`

| Hook | Notes |
|---|---|
| `useOutfitsList(filters?)` | List saved outfits. Filter keys: `status`, `occasion`, `startDate`, `endDate`, `sortBy`, `sortOrder`, `limit`, `offset`. |
| `useOutfitsWithItems()` | List + hydrated item joins |
| `useOutfitDetail(id)` | Single outfit |
| `useGenerateOutfits()` | The heavy suggestion mutation |
| `useSaveOutfit()` / `useSaveMultipleOutfits()` | Save one / batch |
| `useUpdateOutfit()` |
| `useDeleteOutfit()` / `useBulkDeleteOutfits()` |
| `useDuplicateOutfit()` |
| `useMarkOutfitWorn()` / `useBulkMarkOutfitsWorn()` | Increments wear counter |
| `useDismissOutfit()` |
| `useDismissedCount()` / `useDismissedCombinations()` |
| `useClearDismissed()` / `useRestoreDismissed()` |
| `useTryOn()` | 90s timeout; 5-coin gated. Returns `{ tryonImageUrl, coinBalance, _startMs }` |
| `useTryOnUsage()` | `{ coinBalance, tryonCost, outfitGenCost }` |

### Sharing + comments — `useSharing.ts`

| Hook | Notes |
|---|---|
| `useSharedOutfit(shareCode)` | Public read |
| `useSharedComments(shareCode)` | Plain query — comments for a shared outfit. Realtime is opt-in via a separate hook. |
| `useSharedReactions(shareCode)` |
| `useCreateShare()` / `useDeleteShare()` | Note: `useDeleteShare` takes `shareId`, not `outfitId` |
| `useUserShares()` / `useShareStats()` | The user's own shares |
| `useAddComment(shareCode)` / `useDeleteComment(shareCode)` / `useDeleteCommentAsOwner(shareCode)` |
| `useToggleReaction(shareCode)` | Mutate arg: `'up' \| 'down'`. Wire body: `{ reactionType }`. |
| `useReportComment()` |
| `useBlockCommenter(shareCode)` |
| `useRealtimeComments(shareCode, sharedOutfitId)` | Optional Postgres Changes subscription for a share's comment thread. Takes two args because the subscription filter targets the FK column. |

### Subscription + coins — `useSubscription.ts`

| Hook | Notes |
|---|---|
| `useSubscription()` | Composed hook: `{ plan, isPremium, isLoading, subscription, coinBalance, coinsPerMonth, refreshSubscription }`. Backend is source of truth; RC CustomerInfo listener is a mirror. |
| `useSubscriptionInfo()` | Backend-only slice — plan + status + cancel_at_period_end |
| `useCoins()` | Coin balance + costs. Refetched after any charge. |
| `usePaywall()` | `usePaywall.ts` — paywall open/close + purchase orchestration |

There is **no** `usePurchase`, `useRestorePurchases`, `useCoinBalance`, `useRedeemGiftCode`, or `useRedeemPromoCode` hook. Purchases happen via the RC SDK inside `usePaywall`. Redemptions are inline in `/redeem-code` via `api.post('/codes/redeem')`.

### Starter wardrobe — `useStarterWardrobe.ts`

| Hook | Notes |
|---|---|
| `useStarterPersonas()` | Gender + geo-filtered list |
| `useSeedStarterWardrobe()` | Rate-limited 5/hour |
| `useRemoveStarterWardrobe()` | Optimistic + evicts detail caches |
| `useDismissStarterBanner()` | Optimistic + rollback + toast |
| `useStarterImpact(enabled)` | Pre-delete preview |

### Daily recommendations — `useDailyRecommendations.ts`

| Hook | Notes |
|---|---|
| `useDailyRecommendations()` | Today's rec |
| `useMarkDailyRecsSeen()` |
| `useRegenerateDailyRecs()` |
| `useSetPickState()` | User's yes/no on the day's pick |

### Push notifications

| Hook | File |
|---|---|
| `usePushNotifications()` | `usePushNotifications.ts` — registers device + wires taps. Gracefully skips if no EAS project ID. |

## Auxiliary hooks

| Hook | Purpose |
|---|---|
| `useRefreshOnFocus(refetch)` | Fires `refetch` when the tab regains focus. |
| `useAppStateFocusManager()` | Wires `AppState` → React Query's `focusManager`. |
| `useNetworkStatus()` | `{ isConnected }` only. React Query integration is a module-level `onlineManager.setEventListener`, not a hook return. |
| `useThemeMode()` | `{ mode, isDark, toggleMode }`. AsyncStorage-backed. |
| `useScreenTracking()` | Fires `$pageview` on route change. |
| `useTimezoneSync()` | Detects device timezone changes → PATCHes profile. |
| `usePendingCode()` | AsyncStorage-backed queue of a pending promo code from a deep link. |
| `useActivityTracker()` | Updates `last_active_at` at intervals. |
| `useRenewalBanner()` | Manages the "renew" banner on paywall / membership. |
| `useUpdateChecker()` | expo-updates check-in. |
| `useMultiSelect()` | Generic select-mode primitive. |

## How to add a new hook

1. Put it in `hooks/`.
2. Query keys go in a `<Feature>Keys` object exported from the same file.
3. Every mutation `onSuccess` lists explicit invalidations.
4. Include `user?.id` in query keys if the data is user-scoped.
5. Prefer `useMutation` over `useQuery` when the operation writes. Don't fire mutations from a screen's `useEffect` — always from an event handler.
