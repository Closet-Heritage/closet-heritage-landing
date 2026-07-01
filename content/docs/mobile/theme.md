---
title: Theme & styling
sub: NativeWind, dark mode, color palette
---

## Rule zero: no StyleSheet

Every visual style goes through **NativeWind** — `className="…"` on React Native components. `StyleSheet.create` is never used. Custom SVG icons are also banned in favor of PNG assets from Figma (see `assets/icons/`).

## Theme source of truth

- `components/ui/gluestack-ui-provider/config.ts` — Gluestack theme with CSS-var-shaped color tokens.
- `lib/colors.ts` — runtime color getter (`getColors(mode)`) for APIs that need a string (`Image` style, `ActivityIndicator`, etc.).

## Palette (production)

```
Light mode:
  surface           #F9F6F2
  surface-card       (no bg — cards use border-hairline only)
  foreground        #291A0C
  foreground-secondary #534538
  foreground-muted   #8B7C6E
  accent            #C4956A
  accent-text       #FFFFFF
  app-border        #E5DDD3
  divider           #E5DDD3
  btn-primary       #291A0C
  btn-primary-text  #FFFFFF
  warning           #D97706

Dark mode:
  surface           #1A1210
  foreground        #F5E9DD
  foreground-secondary #C4B3A0
  accent            #D4A78B
  ...
```

## Dark mode

Uses NativeWind's `useColorScheme()` + AsyncStorage — **NOT** Zustand. `hooks/useThemeMode.ts` reads the stored preference on mount, applies it via `Appearance.setColorScheme()`, and remembers the explicit user choice. Light mode is the default.

**Do not** import theme colors from Zustand — the whole point of the CSS-var pattern is that the same class works in both modes automatically.

## Runtime colors

For APIs that take a color string (not a className), use:

```typescript
import { useThemeMode } from '@/hooks/useThemeMode';
import { getColors } from '@/lib/colors';

const { mode } = useThemeMode();
const colors = getColors(mode);

<ActivityIndicator color={colors.accent} />
```

## Common patterns

**Card:**
```tsx
<View className="rounded-2xl border-hairline border-app-border px-4 py-4">
```
No background — the surface color is applied at the root. Cards are transparent frames.

**Primary button (boxy — no border radius):**
```tsx
<Pressable className="bg-btn-primary px-6 py-4 items-center">
    <Text className="text-btn-primary-text font-heading-medium text-base">Save</Text>
</Pressable>
```

**Secondary button:**
```tsx
<Pressable className="border border-app-border px-6 py-4 items-center">
    <Text className="text-foreground font-body-medium text-base">Cancel</Text>
</Pressable>
```

**Centered header pattern:**
```tsx
<Text className="flex-1 text-xl font-heading-semibold text-foreground text-center pr-12">
    Wardrobe
</Text>
```
The `pr-12` compensates for a leading back button so text stays visually centred.

**Profile row (softer text):**
```tsx
<Text className="text-base font-body-medium text-foreground-secondary">
    Notification settings
</Text>
```

## Fonts

Set in `app.json` under `expo-font`. Three families:

- `font-heading-*` — display-oriented (semibold, medium, bold)
- `font-body-*` — everyday text
- `font-system` — falls back to iOS/Android system font

## Never use

- `StyleSheet.create` (per user preference).
- Custom SVG icons — use PNGs from Figma at `assets/icons/`.
- Border radius on primary/CTA/submit buttons — "boxy" is the brand direction.
- `bg-surface-card` on cards — cards get border only.

## Dark-mode gotcha with bottom sheets

`@gorhom/bottom-sheet` renders in a Portal *outside* NativeWind's dark-mode context. Text colours declared via `className` don't respond to mode changes inside a sheet.

Fix: read runtime colors and pass inline:

```tsx
const colors = getColors(mode);

<Text style={{ color: colors.foreground }}>Inside a bottom sheet</Text>
```

## Modal screens

`presentation: 'modal'` on iOS breaks the root `Toast` and `BottomSheetModalProvider` because it renders outside the app's window. Every modal screen must wrap itself:

```tsx
<BottomSheetModalProvider>
    {children}
    <Toast />
</BottomSheetModalProvider>
```

Details in `gotcha_ios_modal_screens.md`.
