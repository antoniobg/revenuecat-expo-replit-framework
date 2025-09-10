# AGENTS.md

This file gives AI coding tools and agents concise, actionable guidance for working in this repository. Its scope is the entire repo.

## Goals
- Ship a Replit Developer Framework template that runs immediately (demo mode) and scales to production with RevenueCat on iOS, Android, and Web.
- Optimize for web billing first (Stripe via RevenueCat Web Billing), with optional native store setup later.

## Architecture Quick Facts
- UI: React Native (Expo SDK 53), Expo Router (tabs: Home, Profile), TypeScript.
- Monetization: RevenueCat (`react-native-purchases`), web billing enabled by default.
- Provider: `components/RevenueCatProvider.tsx` wraps the app in `app/_layout.tsx`.
- Hooks: `hooks/usePurchases.ts` (primary), `usePaywall`, `usePremiumStatus` helpers.
- Styling: React Native StyleSheet + theme-aware components (`ThemedText`, `ThemedView`).
- Runtime: Node.js 22 LTS (web dev server runs on port `5000`).

## Run and Validate
- Dev server: `npm run dev` or `npx expo start --web --port 5000`.
- Replit: Click Run (preconfigured script serves web on port 5000). The URL shows in the Replit UI.
- Mobile: `npx expo start` then press `i` (iOS) or `a` (Android). Requires local simulators/emulators.

## Configuration
- Primary config: `constants/RevenueCat.ts`
  - Env vars (preferred): `REVENUECAT_IOS_API_KEY`, `REVENUECAT_ANDROID_API_KEY`, `REVENUECAT_WEB_API_KEY`, `REVENUECAT_ENTITLEMENT_ID`.
  - Demo mode: If keys are missing, the provider initializes in demo mode (no purchases, UI flows only).
- Do not hardcode secrets. Use Replit Secrets for production values.

## File Map (key paths)
- `app/_layout.tsx`: App root, wraps with `RevenueCatProvider` and Router stack.
- `app/(tabs)/index.tsx`: Home tab (features, subscription state).
- `app/(tabs)/profile.tsx`: Profile + debug and status.
- `app/paywall.tsx`: Cross‑platform paywall.
- `components/RevenueCatProvider.tsx`: SDK init, state, actions.
- `hooks/usePurchases.ts`: Purchases utility layer and paywall helpers.
- `constants/RevenueCat.ts`: API keys, entitlement, helpers.
- `replit.md`: Replit-specific usage notes for template users.

## Coding Conventions
- Prefer TypeScript across app code.
- Keep screens in `app/` and follow Expo Router naming conventions.
- Use theme-aware components (`ThemedView`, `ThemedText`), avoid inline hex colors unless temporary.
- Keep logic in hooks/context; keep screens thin.
- Error handling: surface user-friendly messages; log technical details to console.
- Avoid introducing new state managers; context + hooks are sufficient here.

## Adding Features
- New screen: create `app/feature-name.tsx` (or nested route dir), use `Themed*` components.
- New tab: update `app/(tabs)/_layout.tsx` and add screen under `app/(tabs)/`.
- Purchases: consume `usePurchases()` or `usePaywall()`; don’t access the SDK directly from screens.
- Config: extend `constants/RevenueCat.ts` for any new monetization flags.

## Testing
- Web-first: Validate UI flows and demo mode in web.
- Native: Use Expo Go or EAS builds for store flows. Real purchases require store‑configured sandbox accounts.
- Keep tests local and minimal; don’t add new infra for tests unless asked.

## Do / Don’t
- Do: Respect demo mode (no network/store calls when unconfigured).
- Do: Read and update `replit.md` when changing run/ports/secrets.
- Don’t: Commit secrets or tie code to a single vendor beyond RevenueCat/Expo.
- Don’t: Replace Router or styling approach without discussion.

## Common Tasks (commands)
- Start web dev server: `npm run dev`
- Start all-platform dev: `npx expo start`
- Reset example to a clean slate: `npm run reset-project`
- Lint: `npm run lint`

## Known Constraints
- Replit is web‑first; iOS/Android native flows require local simulators or EAS build.
- Some Replit environments do not follow filesystem symlinks for special files.

## Agent Notes
- If you change port, update the start script and mention it in `replit.md`.
- Keep README focused on template users; deeper agent/executor details belong in this AGENTS.md.

