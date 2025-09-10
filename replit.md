# Replit Template Overview

Ready-to-run Expo + RevenueCat starter. Click Run to start a web dev server on port 5000 with demo mode enabled (no API keys required). Add keys later to enable real purchases.

## Run on Replit
- Press Run. The dev server starts automatically on port `5000` and opens a web preview URL.
- Hot reload is enabled. Edit files and the browser refreshes.

## Demo Mode (No Setup Needed)
- Works out of the box without RevenueCat keys.
- Shows UI, navigation, paywall, and basic state; no real purchases occur.
- Configure keys to switch to production behavior.

## Configure RevenueCat Keys
Use Replit Secrets (recommended) or edit `constants/RevenueCat.ts`.
- `REVENUECAT_WEB_API_KEY` (start here)
- `REVENUECAT_IOS_API_KEY`
- `REVENUECAT_ANDROID_API_KEY`
- `REVENUECAT_ENTITLEMENT_ID` (default: `premium`)

After setting secrets, press Run again to reload with keys.

## What’s Included
- Expo SDK 53, Expo Router (tabs: Home, Profile)
- RevenueCat SDK with web billing support and provider-based state
- Themed components, paywall screen, debug/status in Profile
- Ready scripts: web on port 5000, reset script for starting fresh

## Key Files
- `app/_layout.tsx` – wraps app with `RevenueCatProvider` and Router
- `app/(tabs)/index.tsx` – Home (subscription status and content)
- `app/(tabs)/profile.tsx` – Profile + debug & configuration status
- `app/paywall.tsx` – Cross‑platform paywall UI
- `components/RevenueCatProvider.tsx` – SDK init, state, actions
- `hooks/usePurchases.ts` – purchasing helpers and paywall utilities
- `constants/RevenueCat.ts` – API keys and entitlement configuration

## Useful Commands
- Start (web): `npm run dev`
- Start (all platforms prompt): `npx expo start`
- Reset to a clean app shell: `npm run reset-project`

## Notes for Native Testing
- Web works in Replit. For iOS/Android native flows, use local simulators/emulators (`npx expo start` then `i`/`a`) or EAS builds.
- Real purchases require store sandbox accounts and configured products in RevenueCat.

## Troubleshooting (Replit)
- Server didn’t start? Press Run again or reload the workspace.
- No preview? Ensure port is `5000` and the process is running.
- Keys not picked up? Add secrets, then fully restart the Repl.

## For AI/Agents
See `AGENTS.md` for code conventions, structure, and automation tips.
