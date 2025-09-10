/**
 * Profile Screen - Account & Subscription Management
 * 
 * This screen provides comprehensive account management and debugging tools
 * for RevenueCat integration. It's especially useful during development and
 * for providing customer support.
 * 
 * FEATURES:
 * - Customer information display
 * - Active subscriptions and entitlements
 * - Purchase restoration functionality
 * - Debug information for development
 * - User identification management (optional)
 */

import { Platform, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Collapsible } from '@/components/Collapsible';
import { usePurchases } from '@/hooks/usePurchases';
import { REVENUECAT_CONFIG } from '@/constants/RevenueCat';

export default function ProfileScreen() {
  const {
    isPremium,
    isLoading,
    customerInfo,
    offerings,
    currentOffering,
    restorePurchases,
    isRestoring,
    refreshCustomerInfo,
    getActiveEntitlements,
    isConfigured,
  } = usePurchases();
  
  const [showRawData, setShowRawData] = useState(false);
  
  // Get active entitlements
  const activeEntitlements = getActiveEntitlements();
  
  // Handle restore purchases
  const handleRestorePurchases = async () => {
    try {
      await restorePurchases();
      Alert.alert(
        'Success',
        'Purchases restored successfully!',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      // Error is already handled in the hook with user-friendly messages
      console.log('Restore purchases failed (handled in hook)');
    }
  };
  
  // Handle refresh customer info
  const handleRefresh = async () => {
    try {
      await refreshCustomerInfo();
      Alert.alert(
        'Refreshed',
        'Customer information updated!',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to refresh customer information',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="person.circle"
          style={styles.headerImage}
        />
      }>
      
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Profile & Debug</ThemedText>
      </ThemedView>
      
      {/* Configuration Status */}
      <Collapsible title="🔧 Configuration Status" defaultOpen={!isConfigured}>
        <ThemedView style={styles.statusContainer}>
          <ThemedText>
            <ThemedText type="defaultSemiBold">API Keys: </ThemedText>
            {isConfigured ? '✅ Configured' : '❌ Not configured'}
          </ThemedText>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Offerings: </ThemedText>
            {currentOffering ? '✅ Available' : isLoading ? '⏳ Loading...' : '❌ No offerings found'}
          </ThemedText>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Subscription Status: </ThemedText>
            {isPremium ? '✨ Premium' : '🆓 Free'}
          </ThemedText>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Platform: </ThemedText>
            {Platform.OS} {Platform.OS === 'web' && '(Web Billing supported)'}
          </ThemedText>
        </ThemedView>
        {!isConfigured && (
          <ThemedText style={styles.warningText}>
            ⚠️ Please configure your API keys in <ThemedText type="defaultSemiBold">constants/RevenueCat.ts</ThemedText>
          </ThemedText>
        )}
      </Collapsible>
      
      {!isConfigured && (
        <ThemedView style={[styles.card, styles.warningCard]}>
          <ThemedText type="defaultSemiBold">⚠️ Configuration Required</ThemedText>
          <ThemedText style={styles.warningText}>
            RevenueCat is not properly configured. Please check your API keys in{' '}
            <ThemedText type="defaultSemiBold">constants/RevenueCat.ts</ThemedText>
          </ThemedText>
        </ThemedView>
      )}
      
      {/* Subscription Status */}
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Subscription Status</ThemedText>
        
        <ThemedView style={styles.statusRow}>
          <ThemedText style={styles.label}>Status:</ThemedText>
          <ThemedText style={[styles.value, isPremium && styles.premiumValue]}>
            {isPremium ? '✨ Premium' : '🆓 Free'}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.statusRow}>
          <ThemedText style={styles.label}>Platform:</ThemedText>
          <ThemedText style={styles.value}>
            {Platform.OS}
            {Platform.OS === 'web' && ' (Web Billing)'}
          </ThemedText>
        </ThemedView>
        
        {customerInfo?.originalAppUserId && (
          <ThemedView style={styles.statusRow}>
            <ThemedText style={styles.label}>User ID:</ThemedText>
            <ThemedText style={styles.value}>
              {customerInfo.originalAppUserId}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
      
      {/* Active Entitlements */}
      {activeEntitlements.length > 0 && (
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Active Entitlements</ThemedText>
          {activeEntitlements.map((entitlement, index) => (
            <ThemedView key={index} style={styles.entitlementItem}>
              <ThemedText style={styles.entitlementName}>• {entitlement}</ThemedText>
              {customerInfo?.entitlements?.active?.[entitlement] && (
                <ThemedText style={styles.entitlementDetails}>
                  Expires: {
                    customerInfo.entitlements.active[entitlement].expirationDate 
                      ? new Date(customerInfo.entitlements.active[entitlement].expirationDate!).toLocaleDateString()
                      : 'Never'
                  }
                </ThemedText>
              )}
            </ThemedView>
          ))}
        </ThemedView>
      )}
      
      {/* Actions */}
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Actions</ThemedText>
        
        {/* Restore Purchases - Mobile only */}
        {Platform.OS !== 'web' && (
          <TouchableOpacity
            style={[styles.actionButton, isRestoring && styles.disabledButton]}
            onPress={handleRestorePurchases}
            disabled={isRestoring}
          >
            <ThemedText style={styles.actionButtonText}>
              {isRestoring ? '⏳ Restoring...' : '🔄 Restore Purchases'}
            </ThemedText>
          </TouchableOpacity>
        )}
        
        {/* Refresh Customer Info */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleRefresh}
        >
          <ThemedText style={styles.actionButtonText}>
            🔃 Refresh Account Info
          </ThemedText>
        </TouchableOpacity>
        
        {/* View Paywall */}
        {currentOffering && !isPremium && (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => router.push('/paywall')}
          >
            <ThemedText style={[styles.actionButtonText, styles.primaryButtonText]}>
              🚀 Upgrade to Premium
            </ThemedText>
          </TouchableOpacity>
        )}
        
        {/* View Paywall for Testing/Demo */}
        {currentOffering && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/paywall')}
          >
            <ThemedText style={styles.actionButtonText}>
              🎯 View Example Paywall
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
      
      {/* Debug Information */}
      <ThemedView style={styles.card}>
        <ThemedView style={styles.debugHeader}>
          <ThemedText type="subtitle">Debug Information</ThemedText>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowRawData(!showRawData)}
          >
            <ThemedText style={styles.toggleButtonText}>
              {showRawData ? 'Hide' : 'Show'} Raw Data
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedView style={styles.debugRow}>
          <ThemedText style={styles.label}>Loading:</ThemedText>
          <ThemedText style={styles.value}>
            {isLoading ? '⏳ Yes' : '✅ No'}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.debugRow}>
          <ThemedText style={styles.label}>Configured:</ThemedText>
          <ThemedText style={styles.value}>
            {isConfigured ? '✅ Yes' : '❌ No'}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.debugRow}>
          <ThemedText style={styles.label}>Current Offering:</ThemedText>
          <ThemedText style={styles.value}>
            {currentOffering ? '✅ Available' : '❌ None'}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.debugRow}>
          <ThemedText style={styles.label}>Total Offerings:</ThemedText>
          <ThemedText style={styles.value}>
            {offerings ? Object.keys(offerings.all).length : '0'}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.debugRow}>
          <ThemedText style={styles.label}>Available Packages:</ThemedText>
          <ThemedText style={styles.value}>
            {currentOffering?.availablePackages?.length || '0'}
          </ThemedText>
        </ThemedView>
        
        {/* Configuration Details */}
        <ThemedView style={styles.configSection}>
          <ThemedText type="defaultSemiBold" style={styles.configTitle}>
            Configuration
          </ThemedText>
          <ThemedText style={styles.configText}>
            Entitlement ID: <ThemedText type="defaultSemiBold">{REVENUECAT_CONFIG.ENTITLEMENT_ID}</ThemedText>
          </ThemedText>
          <ThemedText style={styles.configText}>
            Debug Mode: <ThemedText type="defaultSemiBold">{REVENUECAT_CONFIG.DEBUG_MODE ? 'Enabled' : 'Disabled'}</ThemedText>
          </ThemedText>
          <ThemedText style={styles.configText}>
            User ID Auth: <ThemedText type="defaultSemiBold">{REVENUECAT_CONFIG.USE_USER_IDENTIFICATION ? 'Enabled' : 'Disabled'}</ThemedText>
          </ThemedText>
        </ThemedView>
      </ThemedView>
      
      {/* Raw Data Display */}
      {showRawData && customerInfo && (
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Raw Customer Data</ThemedText>
          <ScrollView style={styles.rawDataContainer} nestedScrollEnabled={true}>
            <ThemedText style={styles.rawDataText}>
              {JSON.stringify(customerInfo, null, 2)}
            </ThemedText>
          </ScrollView>
        </ThemedView>
      )}
      
      {/* Help Section */}
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Need Help?</ThemedText>
        <ThemedText style={styles.helpText}>
          This screen provides all the tools you need for RevenueCat setup, debugging, and account management.
        </ThemedText>
        
        {/* User ID Authentication Info */}
        {!REVENUECAT_CONFIG.USE_USER_IDENTIFICATION && (
          <ThemedView style={styles.infoBox}>
            <ThemedText style={styles.infoTitle}>💡 User Identification</ThemedText>
            <ThemedText style={styles.infoText}>
              Currently using anonymous user IDs. To enable user identification with your own user IDs, 
              set <ThemedText type="defaultSemiBold">USE_USER_IDENTIFICATION: true</ThemedText> in constants/RevenueCat.ts
            </ThemedText>
          </ThemedView>
        )}
        
        {/* Web Billing Info */}
        {Platform.OS === 'web' && (
          <ThemedView style={styles.infoBox}>
            <ThemedText style={styles.infoTitle}>🌐 Web Billing</ThemedText>
            <ThemedText style={styles.infoText}>
              RevenueCat's web billing uses Stripe. Configure web billing in your RevenueCat dashboard 
              to enable web purchases.
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusContainer: {
    gap: 4,
    marginBottom: 12,
  },
  warningText: {
    color: '#ff6b35',
    fontStyle: 'italic',
    marginTop: 8,
  },
  card: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  warningCard: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  warningText: {
    marginTop: 4,
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    opacity: 0.8,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  premiumValue: {
    color: '#34C759',
  },
  entitlementItem: {
    marginBottom: 12,
  },
  entitlementName: {
    fontSize: 16,
    fontWeight: '600',
  },
  entitlementDetails: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
    marginLeft: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  primaryButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderColor: 'rgba(0, 122, 255, 0.4)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  primaryButtonText: {
    color: '#007AFF',
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleButton: {
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  configSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  configTitle: {
    marginBottom: 8,
  },
  configText: {
    fontSize: 12,
    marginBottom: 4,
  },
  rawDataContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  rawDataText: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      web: 'Monaco, Consolas, "Lucida Console", monospace',
    }),
    fontSize: 10,
    lineHeight: 14,
  },
  helpText: {
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
  },
});