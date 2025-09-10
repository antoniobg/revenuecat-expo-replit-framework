/**
 * Root Layout Component
 * 
 * This is the main layout component that wraps your entire app.
 * It handles:
 * - Theme configuration (light/dark mode)
 * - Font loading
 * - RevenueCat initialization and context provision
 * - Navigation structure
 * 
 * IMPORTANT: RevenueCatProvider must wrap the entire app to make
 * RevenueCat functionality available throughout your app.
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { RevenueCatProvider } from '@/components/RevenueCatProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    /**
     * RevenueCat Provider Setup
     * 
     * This provider initializes RevenueCat and makes subscription functionality
     * available throughout your app. It must wrap your entire app structure.
     * 
     * The provider will:
     * 1. Initialize RevenueCat SDK with your API keys
     * 2. Load customer info and offerings
     * 3. Set up real-time subscription status updates
     * 4. Handle cross-platform API key selection
     * 
     * Configuration is managed in constants/RevenueCat.ts
     */
    <RevenueCatProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Paywall screen - modal presentation */}
          <Stack.Screen 
            name="paywall" 
            options={{ 
              headerShown: false,
              presentation: 'modal' 
            }} 
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </RevenueCatProvider>
  );
}
