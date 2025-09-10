/**
 * RevenueCat Configuration
 *
 * This file contains all RevenueCat-related configuration constants.
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a RevenueCat account at https://app.revenuecat.com/
 * 2. Create a new project in the RevenueCat dashboard
 * 3. Get your API keys from Project Settings > API keys
 * 4. Replace the placeholder values below with your actual API keys
 * 5. Configure your products and entitlements in the RevenueCat dashboard
 *
 * SECURITY NOTE:
 * These API keys are safe to include in client-side code as they are
 * public keys designed for client-side use.
 */

export const REVENUECAT_CONFIG = {
  /**
   * TODO: Replace with your RevenueCat API keys
   * Get these from: https://app.revenuecat.com/projects/[your-project]/api-keys
   *
   * You can also set these using Replit Secrets:
   * - REVENUECAT_IOS_API_KEY
   * - REVENUECAT_ANDROID_API_KEY
   * - REVENUECAT_WEB_API_KEY
   * - REVENUECAT_ENTITLEMENT_ID
   */
  IOS_API_KEY: process.env.REVENUECAT_IOS_API_KEY || "<your-ios-api-key>", // e.g., 'appl_abcdef1234567890'
  ANDROID_API_KEY:
    process.env.REVENUECAT_ANDROID_API_KEY || "<your-android-api-key>", // e.g., 'goog_abcdef1234567890'
  WEB_API_KEY:
    process.env.REVENUECAT_WEB_API_KEY || "<your-web-billing-api-key>", // e.g., 'rcb_abcdef1234567890'

  /**
   * TODO: Replace with your entitlement identifier
   * Configure entitlements in RevenueCat Dashboard > Entitlements
   * This should match the entitlement identifier you create in the dashboard
   */
  ENTITLEMENT_ID: process.env.REVENUECAT_ENTITLEMENT_ID || "premium", // Common examples: 'premium', 'pro', 'all_access'

  /**
   * Optional: Enable debug mode for development
   * This will show additional logging in development mode
   */
  DEBUG_MODE: __DEV__,

  /**
   * Optional: User identification
   * Set to true if you want to identify users with your own user IDs
   * Learn more: https://docs.revenuecat.com/docs/user-ids
   */
  USE_USER_IDENTIFICATION: false,
};

/**
 * Platform-specific configuration helper
 * Automatically selects the correct API key based on the current platform
 */
import { Platform } from "react-native";

export const getPlatformApiKey = (): string => {
  switch (Platform.OS) {
    case "ios":
      return REVENUECAT_CONFIG.IOS_API_KEY;
    case "android":
      return REVENUECAT_CONFIG.ANDROID_API_KEY;
    case "web":
      return REVENUECAT_CONFIG.WEB_API_KEY;
    default:
      console.warn(
        `Unsupported platform: ${Platform.OS}. Falling back to iOS API key.`
      );
      return REVENUECAT_CONFIG.IOS_API_KEY;
  }
};

/**
 * Validation helper to check if API keys are configured
 * This helps identify configuration issues during development
 */
export const validateRevenueCatConfig = (): boolean => {
  const apiKey = getPlatformApiKey();

  if (!apiKey || apiKey.includes("your_") || apiKey.includes("_here")) {
    console.error(
      "⚠️ RevenueCat API key not configured for platform:",
      Platform.OS
    );
    console.error(
      "Please update constants/RevenueCat.ts with your actual API keys"
    );
    console.error(
      "Get your API keys from: https://app.revenuecat.com/projects/[your-project]/api-keys"
    );
    return false;
  }

  if (
    !REVENUECAT_CONFIG.ENTITLEMENT_ID ||
    REVENUECAT_CONFIG.ENTITLEMENT_ID === "premium"
  ) {
    console.warn(
      "⚠️ Using default entitlement ID. Consider updating to match your RevenueCat configuration."
    );
  }

  return true;
};

/**
 * Common product identifiers
 * These should match the product IDs you configure in App Store Connect,
 * Google Play Console, and RevenueCat dashboard
 */
export const PRODUCT_IDS = {
  // TODO: Replace with your actual product IDs
  WEEKLY: "your_weekly_product_id", // e.g., 'premium_weekly'
  MONTHLY: "your_monthly_product_id", // e.g., 'premium_monthly'
  YEARLY: "your_yearly_product_id", // e.g., 'premium_yearly'
  LIFETIME: "your_lifetime_product_id", // e.g., 'premium_lifetime'
};

/**
 * Package types for easier identification
 * These correspond to RevenueCat's standard package types
 */
export const PACKAGE_TYPES = {
  WEEKLY: "$rc_weekly",
  MONTHLY: "$rc_monthly",
  TWO_MONTH: "$rc_two_month",
  THREE_MONTH: "$rc_three_month",
  SIX_MONTH: "$rc_six_month",
  ANNUAL: "$rc_annual",
  LIFETIME: "$rc_lifetime",
} as const;

export type PackageType = (typeof PACKAGE_TYPES)[keyof typeof PACKAGE_TYPES];
