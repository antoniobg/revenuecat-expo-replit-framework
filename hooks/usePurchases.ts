/**
 * usePurchases Hook
 *
 * A comprehensive hook that provides easy access to RevenueCat functionality
 * This is a convenience wrapper around the RevenueCat context.
 *
 * USAGE:
 * const {
 *   isPremium,
 *   offerings,
 *   purchasePackage,
 *   isLoading
 * } = usePurchases();
 *
 * FEATURES:
 * - Subscription status checking
 * - Purchase handling with error management
 * - Offering and package management
 * - Loading states for better UX
 * - Cross-platform compatibility
 */

import { useState } from "react";
import { Platform, Alert } from "react-native";
import { PurchasesPackage } from "react-native-purchases";
import { useRevenueCat } from "@/components/RevenueCatProvider";

/**
 * Enhanced purchases hook with additional functionality and error handling
 */
export function usePurchases() {
  const revenueCatContext = useRevenueCat();
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  /**
   * Enhanced purchase function with loading states and user feedback
   */
  const purchasePackage = async (packageToPurchase: PurchasesPackage) => {
    try {
      setPurchaseLoading(true);
      await revenueCatContext.purchasePackage(packageToPurchase);

      // Show success message
      Alert.alert(
        "🎉 Purchase Successful!",
        "Thank you for your purchase. You now have access to premium features!",
        [{ text: "OK", style: "default" }]
      );
    } catch (error: any) {
      // Only show error if user didn't cancel
      if (!error.userCancelled) {
        console.error("Purchase error in hook:", error);

        // Provide user-friendly error messages
        let errorMessage = "Please try again later.";

        if (error.message?.includes("network")) {
          errorMessage = "Please check your internet connection and try again.";
        } else if (error.message?.includes("payment")) {
          errorMessage =
            "There was an issue processing your payment. Please try again.";
        } else if (
          Platform.OS === "web" &&
          error.message?.includes("billing")
        ) {
          errorMessage =
            "Web billing is not configured. Please contact support.";
        }

        Alert.alert("Purchase Failed", errorMessage, [
          { text: "OK", style: "default" },
        ]);

        throw error; // Re-throw for component-level handling if needed
      }
    } finally {
      setPurchaseLoading(false);
    }
  };

  /**
   * Enhanced restore purchases function
   */
  const restorePurchases = async () => {
    try {
      setRestoreLoading(true);
      await revenueCatContext.restorePurchases();

      // Show success message
      if (Platform.OS !== "web") {
        Alert.alert(
          "✅ Restore Successful",
          "Your purchases have been restored successfully.",
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (error: any) {
      console.error("Restore error in hook:", error);

      Alert.alert(
        "Restore Failed",
        "Unable to restore purchases. Please try again or contact support if the issue persists.",
        [{ text: "OK", style: "default" }]
      );

      throw error;
    } finally {
      setRestoreLoading(false);
    }
  };

  /**
   * Check if user has access to a specific entitlement
   */
  const hasEntitlement = (entitlementId: string): boolean => {
    return (
      revenueCatContext.customerInfo?.entitlements?.active?.[entitlementId] !=
      null
    );
  };

  /**
   * Get all active entitlements
   */
  const getActiveEntitlements = (): string[] => {
    const activeEntitlements =
      revenueCatContext.customerInfo?.entitlements?.active;
    return activeEntitlements ? Object.keys(activeEntitlements) : [];
  };

  /**
   * Get packages sorted by price (lowest to highest)
   */
  const getPackagesSortedByPrice = () => {
    const packages = revenueCatContext.currentOffering?.availablePackages || [];

    return [...packages].sort((a, b) => {
      const priceA = a.storeProduct?.price || a.product?.price || 0;
      const priceB = b.storeProduct?.price || b.product?.price || 0;
      return priceA - priceB;
    });
  };

  /**
   * Get a specific package by type
   */
  const getPackageByType = (packageType: string) => {
    const packages = revenueCatContext.currentOffering?.availablePackages || [];
    return packages.find((pkg) => pkg.packageType === packageType);
  };

  /**
   * Format price string for display with trial and intro pricing
   */
  const formatPackagePrice = (packageItem: PurchasesPackage): string => {
    const storeProduct = packageItem.storeProduct || packageItem.product;
    if (!storeProduct) return "Price unavailable";

    // Get the main price
    const mainPrice =
      storeProduct.priceString ||
      storeProduct.price?.toString() ||
      "Price unavailable";

    debugger;
    // Check for intro price (free trial or discounted intro period)
    const introPrice = storeProduct.introPrice;

    if (introPrice) {
      const introPriceString =
        introPrice.priceString || introPrice.price?.toString();
      const introPeriod = introPrice.subscriptionPeriod;
      const introCycles = introPrice.cycles;

      // If intro price is 0, it's a free trial
      if (
        introPrice.price === 0 ||
        introPriceString === "$0.00" ||
        introPriceString === "0"
      ) {
        debugger;

        if (introPeriod && introCycles) {
          return `Free ${
            introCycles > 1 ? `${introCycles} periods` : "trial"
          }, then ${mainPrice}`;
        }
        return `Free trial, then ${mainPrice}`;
      }

      // If there's a discounted intro price
      if (introPriceString && introPriceString !== mainPrice) {
        if (introPeriod && introCycles) {
          return `${introPriceString} for ${
            introCycles > 1 ? `${introCycles} periods` : "first period"
          }, then ${mainPrice}`;
        }
        return `${introPriceString} intro, then ${mainPrice}`;
      }
    }

    return mainPrice;
  };

  /**
   * Parse ISO 8601 duration format (P1W, P7D, P1M, etc.)
   */
  const parseSubscriptionPeriod = (
    period: string
  ): { value: number; unit: string } | null => {
    if (!period) return null;

    // Match ISO 8601 duration format: P[n]Y[n]M[n]D or P[n]W
    const match = period.match(
      /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/
    );
    if (!match) return null;

    const [, years, months, weeks, days] = match;

    if (weeks) return { value: parseInt(weeks), unit: "week" };
    if (days) return { value: parseInt(days), unit: "day" };
    if (months) return { value: parseInt(months), unit: "month" };
    if (years) return { value: parseInt(years), unit: "year" };

    return null;
  };

  /**
   * Get trial information for display
   */
  const getTrialInfo = (packageItem: PurchasesPackage): string | null => {
    const storeProduct = packageItem.storeProduct || packageItem.product;
    if (!storeProduct?.introPrice) return null;

    const introPrice = storeProduct.introPrice;

    if (
      introPrice.price === 0 ||
      introPrice.priceString === "$0.00" ||
      introPrice.priceString === "0"
    ) {
      // Use the actual periodNumberOfUnits and periodUnit from the introPrice
      const periodUnits = introPrice.periodNumberOfUnits;
      const periodUnit = introPrice.periodUnit;
      
      if (periodUnits && periodUnit) {
        // Convert period unit to readable format
        let displayUnit = periodUnit.toLowerCase();
        
        // Handle pluralization
        if (periodUnits !== 1) {
          // Add 's' for plurals, but handle special cases
          if (displayUnit === 'day') displayUnit = 'days';
          else if (displayUnit === 'week') displayUnit = 'weeks';
          else if (displayUnit === 'month') displayUnit = 'months';
          else if (displayUnit === 'year') displayUnit = 'years';
          else displayUnit = `${displayUnit}s`; // fallback
        }
        
        return `${periodUnits} ${displayUnit} free`;
      }

      // Fallback to parsing subscription period if periodNumberOfUnits/periodUnit not available
      const cycles = introPrice.cycles || 1;
      const period = introPrice.subscriptionPeriod;

      if (period) {
        const parsedPeriod = parseSubscriptionPeriod(period);
        if (parsedPeriod) {
          const totalValue = parsedPeriod.value * cycles;
          const unit = parsedPeriod.unit;
          const pluralUnit = totalValue === 1 ? unit : `${unit}s`;
          return `${totalValue} ${pluralUnit} free`;
        }
      }

      // Final fallback
      return cycles > 1 ? `${cycles} periods free` : "Free trial";
    }

    return null;
  };

  /**
   * Get appropriate purchase button text based on package type and trial status
   */
  const getPurchaseButtonText = (packageItem: PurchasesPackage): string => {
    const storeProduct = packageItem.storeProduct || packageItem.product;

    // Check if it has a free trial
    const hasFreeTrial =
      storeProduct?.introPrice &&
      (storeProduct.introPrice.price === 0 ||
        storeProduct.introPrice.priceString === "$0.00" ||
        storeProduct.introPrice.priceString === "0");

    if (hasFreeTrial) {
      return "Start for free";
    }

    // Check if it's a subscription (has subscription period)
    const isSubscription = storeProduct?.subscriptionPeriod != null;

    if (isSubscription) {
      return "Subscribe now";
    }

    // Non-subscription product
    return "Purchase";
  };

  /**
   * Get package title for display
   */
  const formatPackageTitle = (packageItem: PurchasesPackage): string => {
    // Try different title sources
    const title =
      packageItem.storeProduct?.title ||
      packageItem.product?.title ||
      packageItem.storeProduct?.localizedTitle ||
      packageItem.product?.localizedTitle;

    if (title) return title;

    // Fallback to package type formatting
    const packageType = packageItem.packageType || "Unknown";
    return (
      packageType.charAt(0).toUpperCase() + packageType.slice(1) + " Package"
    );
  };

  /**
   * Check if RevenueCat is properly configured
   */
  const isConfigured = (): boolean => {
    return revenueCatContext.isInitialized && !revenueCatContext.error;
  };

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = (): string | null => {
    if (!revenueCatContext.error) return null;

    // Provide more helpful error messages
    if (revenueCatContext.error.includes("configuration")) {
      return "RevenueCat is not properly configured. Please check your API keys in constants/RevenueCat.ts";
    }

    if (revenueCatContext.error.includes("network")) {
      return "Network error. Please check your internet connection.";
    }

    return revenueCatContext.error;
  };

  // Return all the functionality
  return {
    // State from context
    ...revenueCatContext,

    // Enhanced loading states
    isPurchasing: purchaseLoading,
    isRestoring: restoreLoading,

    // Enhanced actions
    purchasePackage,
    restorePurchases,

    // Utility functions
    hasEntitlement,
    getActiveEntitlements,
    getPackagesSortedByPrice,
    getPackageByType,
    formatPackagePrice,
    formatPackageTitle,
    getTrialInfo,
    getPurchaseButtonText,
    isConfigured,
    getErrorMessage,
  };
}

/**
 * Simplified hook for basic premium status checking
 * Use this when you only need to check if the user is premium
 */
export function usePremiumStatus() {
  const { isPremium, isLoading, error } = usePurchases();

  return {
    isPremium,
    isLoading,
    hasError: !!error,
  };
}

/**
 * Hook specifically for paywall components
 * Provides everything needed to build a paywall screen
 */
export function usePaywall() {
  const {
    currentOffering,
    purchasePackage,
    isPurchasing,
    isLoading,
    error,
    isConfigured,
    getPackagesSortedByPrice,
    formatPackagePrice,
    formatPackageTitle,
    getTrialInfo,
    getPurchaseButtonText,
  } = usePurchases();

  const packages = currentOffering?.availablePackages || [];
  const sortedPackages = getPackagesSortedByPrice();

  return {
    // Offerings
    offering: currentOffering,
    packages,
    sortedPackages,
    hasPackages: packages.length > 0,

    // Actions
    purchasePackage,

    // State
    isPurchasing,
    isLoading,
    hasError: !!error,
    errorMessage: error,
    isConfigured,

    // Utilities
    formatPackagePrice,
    formatPackageTitle,
    getTrialInfo,
    getPurchaseButtonText,
  };
}
