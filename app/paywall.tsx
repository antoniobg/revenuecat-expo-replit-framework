/**
 * Cross-Platform Paywall Screen
 *
 * This paywall implementation works across iOS, Android, and Web platforms.
 * It automatically adapts to different screen sizes and handles platform-specific
 * purchase flows including RevenueCat's web billing.
 *
 * FEATURES:
 * - Cross-platform compatibility (iOS, Android, Web)
 * - Responsive design for different screen sizes
 * - Package comparison with pricing
 * - Platform-specific purchase handling
 * - Loading states and error handling
 * - Graceful fallbacks for missing offerings
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { usePaywall } from "@/hooks/usePurchases";
import { useThemeColor } from "@/hooks/useThemeColor";
import { PACKAGE_TYPES } from "@/constants/RevenueCat";

export default function PaywallScreen() {
  const {
    packages,
    sortedPackages,
    hasPackages,
    purchasePackage,
    isPurchasing,
    isLoading,
    hasError,
    errorMessage,
    isConfigured,
    formatPackagePrice,
    formatPackageTitle,
    getTrialInfo,
    getPurchaseButtonText,
  } = usePaywall();

  const [selectedPackageIndex, setSelectedPackageIndex] = useState(1); // Default to middle option

  // Handle purchase with loading state
  const handlePurchase = async () => {
    if (!hasPackages || isPurchasing) return;

    const selectedPackage = sortedPackages[selectedPackageIndex];
    if (!selectedPackage) return;

    try {
      await purchasePackage(selectedPackage);
      // Success is handled in the hook with user feedback
      router.replace("/");
    } catch (error) {
      // Error is handled in the hook with user feedback
      console.log("Purchase failed in paywall (handled in hook)");
    }
  };

  // Get package type badge
  const getPackageTypeBadge = (packageType: string) => {
    switch (packageType) {
      case PACKAGE_TYPES.WEEKLY:
        return "⚡ Try It";
      case PACKAGE_TYPES.MONTHLY:
        return "📱 Popular";
      case PACKAGE_TYPES.ANNUAL:
        return "🎯 Best Value";
      case PACKAGE_TYPES.LIFETIME:
        return "💎 Premium";
      default:
        return null;
    }
  };

  // Calculate savings for annual plans
  const calculateSavings = (packageItem: any, index: number) => {
    if (
      packageItem.packageType === PACKAGE_TYPES.ANNUAL &&
      packages.length > 1
    ) {
      const monthlyPackage = packages.find(
        (p) => p.packageType === PACKAGE_TYPES.MONTHLY
      );
      if (monthlyPackage) {
        const annualPrice =
          packageItem.storeProduct?.price || packageItem.product?.price || 0;
        const monthlyPrice =
          monthlyPackage.storeProduct?.price ||
          monthlyPackage.product?.price ||
          0;
        if (annualPrice > 0 && monthlyPrice > 0) {
          const monthlyCost = monthlyPrice * 12;
          const savings = Math.round(
            ((monthlyCost - annualPrice) / monthlyCost) * 100
          );
          if (savings > 0) {
            return `Save ${savings}%`;
          }
        }
      }
    }
    return null;
  };

  // Get theme colors
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");

  return (
    <>
      <StatusBar style="auto" />
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={
          <View style={styles.headerImageContainer}>
            <ThemedText style={styles.headerTitle}>✨ Premium</ThemedText>
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: "rgba(255,255,255,0.9)" },
              ]}
              onPress={() => router.back()}
            >
              <ThemedText
                style={[styles.closeButtonText, { color: textColor }]}
              >
                ✕
              </ThemedText>
            </TouchableOpacity>
          </View>
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Upgrade to Premium</ThemedText>
        </ThemedView>
        {/* Loading State */}
        {isLoading && (
          <ThemedView style={styles.stepContainer}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={styles.loadingText}>
              Loading premium options...
            </ThemedText>
          </ThemedView>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <ThemedView style={[styles.statusCard, styles.errorCard]}>
            <ThemedText type="defaultSemiBold" style={styles.errorTitle}>
              ❌{" "}
              {!isConfigured
                ? "Configuration Required"
                : "Something went wrong"}
            </ThemedText>
            <ThemedText style={styles.errorText}>
              {!isConfigured
                ? "Please configure your RevenueCat API keys in constants/RevenueCat.ts"
                : errorMessage ||
                  "There was an issue processing your request. Please try again later."}
            </ThemedText>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: tintColor }]}
              onPress={() => router.back()}
            >
              <ThemedText style={[styles.retryButtonText, { color: "white" }]}>
                Go Back
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* No Packages Available */}
        {!hasPackages && !isLoading && !hasError && (
          <ThemedView style={[styles.statusCard, styles.warningCard]}>
            <ThemedText type="defaultSemiBold" style={styles.warningTitle}>
              ⚠️ No premium options available
            </ThemedText>
            <ThemedText style={styles.warningText}>
              Please configure your products and offerings in the RevenueCat
              dashboard.
            </ThemedText>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: tintColor }]}
              onPress={() => router.back()}
            >
              <ThemedText style={[styles.retryButtonText, { color: "white" }]}>
                Go Back
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Premium Features */}
        {hasPackages && !isLoading && (
          <>
            <ThemedView style={styles.stepContainer}>
              <ThemedText type="subtitle">Premium Features</ThemedText>

              <View style={styles.featuresList}>
                <View style={styles.feature}>
                  <ThemedText style={styles.featureIcon}>🚀</ThemedText>
                  <ThemedText>Advanced functionality and tools</ThemedText>
                </View>

                <View style={styles.feature}>
                  <ThemedText style={styles.featureIcon}>⭐</ThemedText>
                  <ThemedText>Priority support and updates</ThemedText>
                </View>

                <View style={styles.feature}>
                  <ThemedText style={styles.featureIcon}>🌍</ThemedText>
                  <ThemedText>Works across all platforms</ThemedText>
                </View>

                <View style={styles.feature}>
                  <ThemedText style={styles.featureIcon}>🔄</ThemedText>
                  <ThemedText>Sync across all your devices</ThemedText>
                </View>
              </View>
            </ThemedView>

            {/* Package Selection */}
            <ThemedView style={styles.stepContainer}>
              <ThemedText type="subtitle">Choose Your Plan</ThemedText>

              {sortedPackages.map((packageItem, index) => {
                const isSelected = index === selectedPackageIndex;
                const badge = getPackageTypeBadge(
                  packageItem.packageType || ""
                );
                const savings = calculateSavings(packageItem, index);
                const trialInfo = getTrialInfo(packageItem);

                return (
                  <TouchableOpacity
                    key={packageItem.identifier || `package-${index}`}
                    style={[
                      styles.packageOption,
                      isSelected && [
                        styles.selectedPackage,
                        { borderColor: tintColor },
                      ],
                    ]}
                    onPress={() => setSelectedPackageIndex(index)}
                    disabled={isPurchasing}
                  >
                    {/* Badge */}
                    {(badge || savings || trialInfo) && (
                      <View style={styles.badgeContainer}>
                        {trialInfo && (
                          <View style={[styles.badge, styles.trialBadge]}>
                            <ThemedText style={styles.badgeText}>
                              🆓 {trialInfo}
                            </ThemedText>
                          </View>
                        )}
                        {badge && (
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: tintColor },
                            ]}
                          >
                            <ThemedText style={styles.badgeText}>
                              {badge}
                            </ThemedText>
                          </View>
                        )}
                        {savings && (
                          <View style={[styles.badge, styles.savingsBadge]}>
                            <ThemedText style={styles.badgeText}>
                              {savings}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    )}

                    <View style={styles.packageContent}>
                      <View style={styles.packageHeader}>
                        <ThemedText type="defaultSemiBold">
                          {formatPackageTitle(packageItem)}
                        </ThemedText>
                        <ThemedText
                          style={[styles.packagePrice, { color: tintColor }]}
                        >
                          {formatPackagePrice(packageItem)}
                        </ThemedText>
                      </View>

                      <ThemedText style={styles.packageDescription}>
                        {packageItem.packageType === PACKAGE_TYPES.WEEKLY &&
                          "Perfect for trying premium features"}
                        {packageItem.packageType === PACKAGE_TYPES.MONTHLY &&
                          "Great for regular users"}
                        {packageItem.packageType === PACKAGE_TYPES.ANNUAL &&
                          "Best value for committed users"}
                        {packageItem.packageType === PACKAGE_TYPES.LIFETIME &&
                          "One-time purchase, lifetime access"}
                        {!Object.values(PACKAGE_TYPES).includes(
                          packageItem.packageType as any
                        ) && "Premium subscription access"}
                      </ThemedText>
                    </View>

                    {/* Selection Indicator */}
                    <View
                      style={[
                        styles.selectionIndicator,
                        isSelected && [
                          styles.selectedIndicator,
                          {
                            borderColor: tintColor,
                            backgroundColor: tintColor,
                          },
                        ],
                      ]}
                    >
                      {isSelected && (
                        <ThemedText style={styles.checkmark}>✓</ThemedText>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ThemedView>

            {/* Platform Info */}
            {Platform.OS === "web" && (
              <ThemedView style={styles.stepContainer}>
                <ThemedText type="defaultSemiBold">💳 Web Billing</ThemedText>
                <ThemedText style={styles.webInfoText}>
                  Secure payments powered by RevenueCat.
                </ThemedText>
              </ThemedView>
            )}

            {/* Purchase Button */}
            <TouchableOpacity
              style={[
                styles.purchaseButton,
                { backgroundColor: "#007AFF" }, // Use a consistent blue that works in both themes
                isPurchasing && styles.purchasingButton,
              ]}
              onPress={handlePurchase}
              disabled={isPurchasing || !hasPackages}
            >
              {isPurchasing ? (
                <View style={styles.purchasingContent}>
                  <ActivityIndicator size="small" color="white" />
                  <ThemedText
                    style={[styles.purchaseButtonText, { color: "white" }]}
                  >
                    Processing...
                  </ThemedText>
                </View>
              ) : (
                <ThemedText
                  style={[styles.purchaseButtonText, { color: "white" }]}
                >
                  {getPurchaseButtonText(sortedPackages[selectedPackageIndex])}
                </ThemedText>
              )}
            </TouchableOpacity>

            {/* Terms */}
            <ThemedView style={styles.stepContainer}>
              <ThemedText style={styles.termsText}>
                Subscriptions automatically renew unless cancelled. You can
                manage your subscription in your account settings.
                {Platform.OS === "ios" &&
                  " Subscriptions are managed through your Apple ID."}
                {Platform.OS === "android" &&
                  " Subscriptions are managed through Google Play."}
                {Platform.OS === "web" &&
                  " Subscriptions are managed through our web billing system."}
              </ThemedText>
            </ThemedView>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.laterButton}
              onPress={() => router.back()}
            >
              <ThemedText style={styles.laterButtonText}>
                Maybe Later
              </ThemedText>
            </TouchableOpacity>
          </>
        )}
      </ParallaxScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  headerImageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  titleContainer: {
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 12,
    textAlign: "center",
  },
  statusCard: {
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.2)",
  },
  errorCard: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderColor: "rgba(255, 59, 48, 0.3)",
  },
  warningCard: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderColor: "rgba(255, 193, 7, 0.3)",
  },
  errorTitle: {
    marginBottom: 8,
  },
  errorText: {
    marginBottom: 16,
    lineHeight: 20,
  },
  warningTitle: {
    marginBottom: 8,
  },
  warningText: {
    marginBottom: 16,
    lineHeight: 20,
  },
  retryButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  featuresList: {
    gap: 12,
    marginTop: 8,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  packageOption: {
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: "rgba(128, 128, 128, 0.2)",
    position: "relative",
    overflow: "hidden",
  },
  selectedPackage: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  badgeContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 6,
    zIndex: 1,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  savingsBadge: {
    backgroundColor: "#34C759",
  },
  trialBadge: {
    backgroundColor: "#34C759",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  packageContent: {
    padding: 16,
    paddingRight: 60,
  },
  packageHeader: {
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  packageDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  selectionIndicator: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(128, 128, 128, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  selectedIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  checkmark: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  webInfoText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  purchaseButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  purchasingButton: {
    opacity: 0.7,
  },
  purchasingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  purchaseButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 16,
  },
  laterButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  laterButtonText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
