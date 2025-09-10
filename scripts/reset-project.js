#!/usr/bin/env node

/**
 * RevenueCat + Expo Framework Reset Script
 * 
 * This script resets the RevenueCat framework to a clean starting state while
 * preserving the RevenueCat integration for your custom app development.
 * 
 * It moves the example app to /app-example and creates a minimal app structure
 * with RevenueCat already configured and ready to use.
 * 
 * You can remove the `reset-project` script from package.json and safely delete 
 * this file after running it.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const root = process.cwd();
const oldDirs = ["app", "components", "hooks", "constants", "scripts"];
const exampleDir = "revenuecat-framework-example";
const newAppDir = "app";
const exampleDirPath = path.join(root, exampleDir);

// Clean app/index.tsx with RevenueCat integration
const indexContent = `/**
 * Main App Screen
 * 
 * This is your app's main screen with RevenueCat integration already set up.
 * The RevenueCat provider is configured in app/_layout.tsx and ready to use.
 */

import { StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { usePurchases } from "@/hooks/usePurchases";

export default function Index() {
  const { isPremium, isConfigured, currentOffering } = usePurchases();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Your App
      </ThemedText>
      
      <ThemedText style={styles.subtitle}>
        RevenueCat is ready! Start building your subscription features.
      </ThemedText>
      
      {/* Subscription Status */}
      <ThemedView style={styles.statusCard}>
        <ThemedText type="subtitle">Subscription Status</ThemedText>
        <ThemedText style={styles.status}>
          {isPremium ? '✨ Premium User' : '🆓 Free User'}
        </ThemedText>
        
        {!isConfigured && (
          <ThemedText style={styles.warning}>
            ⚠️ Configure your API keys in constants/RevenueCat.ts
          </ThemedText>
        )}
      </ThemedView>
      
      {/* Quick Actions */}
      {currentOffering && !isPremium && (
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => router.push('/paywall')}
        >
          <ThemedText style={styles.upgradeButtonText}>
            🚀 View Premium Options
          </ThemedText>
        </TouchableOpacity>
      )}
      
      <ThemedText style={styles.instructions}>
        Edit app/index.tsx to customize this screen.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  statusCard: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    minWidth: 250,
  },
  status: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  warning: {
    marginTop: 8,
    fontSize: 12,
    color: '#ff6b35',
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  instructions: {
    textAlign: "center",
    fontSize: 12,
    opacity: 0.5,
  },
});
`;

// Root layout with RevenueCat provider already configured
const layoutContent = `/**
 * Root Layout - RevenueCat Configured
 * 
 * RevenueCat provider is already set up and ready to use.
 * Your app has access to subscription functionality throughout.
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
    return null;
  }

  return (
    <RevenueCatProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen 
            name="paywall" 
            options={{ 
              headerShown: false,
              presentation: 'modal' 
            }} 
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </RevenueCatProvider>
  );
}
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const moveDirectories = async (userInput) => {
  try {
    if (userInput === "y") {
      // Create the app-example directory
      await fs.promises.mkdir(exampleDirPath, { recursive: true });
      console.log(`📁 /${exampleDir} directory created.`);
    }

    // Move old directories to new app-example directory or delete them
    for (const dir of oldDirs) {
      const oldDirPath = path.join(root, dir);
      if (fs.existsSync(oldDirPath)) {
        if (userInput === "y") {
          const newDirPath = path.join(root, exampleDir, dir);
          await fs.promises.rename(oldDirPath, newDirPath);
          console.log(`➡️ /${dir} moved to /${exampleDir}/${dir}.`);
        } else {
          await fs.promises.rm(oldDirPath, { recursive: true, force: true });
          console.log(`❌ /${dir} deleted.`);
        }
      } else {
        console.log(`➡️ /${dir} does not exist, skipping.`);
      }
    }

    // Create new /app directory
    const newAppDirPath = path.join(root, newAppDir);
    await fs.promises.mkdir(newAppDirPath, { recursive: true });
    console.log("\n📁 New /app directory created.");

    // Create index.tsx
    const indexPath = path.join(newAppDirPath, "index.tsx");
    await fs.promises.writeFile(indexPath, indexContent);
    console.log("📄 app/index.tsx created.");

    // Create _layout.tsx
    const layoutPath = path.join(newAppDirPath, "_layout.tsx");
    await fs.promises.writeFile(layoutPath, layoutContent);
    console.log("📄 app/_layout.tsx created.");

    console.log("\n✅ RevenueCat framework reset complete!");
    console.log("\n🎉 Your clean app is ready with RevenueCat integration:");
    console.log("   • RevenueCat provider configured in app/_layout.tsx");
    console.log("   • Subscription hooks ready to use");
    console.log("   • Paywall screen available at /paywall");
    console.log("   • All configuration in constants/RevenueCat.ts");
    console.log("\n📋 Next steps:");
    console.log("1. Configure your API keys in constants/RevenueCat.ts");
    console.log("2. Run `npx expo start` to start development");
    console.log(`3. Edit app/index.tsx to build your app${
      userInput === "y"
        ? `\n4. Reference /${exampleDir}/ for examples and delete when done`
        : ""
    }`);
  } catch (error) {
    console.error(`❌ Error during script execution: ${error.message}`);
  }
};

console.log("🔧 RevenueCat + Expo Framework Reset");
console.log("This will create a clean app structure while preserving RevenueCat integration.\n");

rl.question(
  "Do you want to move the current example to /revenuecat-framework-example instead of deleting it? (Y/n): ",
  (answer) => {
    const userInput = answer.trim().toLowerCase() || "y";
    if (userInput === "y" || userInput === "n") {
      moveDirectories(userInput).finally(() => rl.close());
    } else {
      console.log("❌ Invalid input. Please enter 'Y' or 'N'.");
      rl.close();
    }
  }
);
