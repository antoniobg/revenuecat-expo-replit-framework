/**
 * RevenueCat Provider Component
 * 
 * This component initializes RevenueCat and provides a React Context for
 * accessing RevenueCat functionality throughout your app.
 * 
 * USAGE:
 * Wrap your app with this provider in app/_layout.tsx to enable RevenueCat
 * functionality across all screens.
 * 
 * FEATURES:
 * - Automatic RevenueCat SDK initialization
 * - Cross-platform API key selection
 * - Error handling and validation
 * - Optional user identification
 * - Development mode configuration
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesOffering, PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';
import { REVENUECAT_CONFIG, getPlatformApiKey, validateRevenueCatConfig } from '@/constants/RevenueCat';

/**
 * RevenueCat Context Type Definition
 * Defines the shape of data available through the RevenueCat context
 */
interface RevenueCatContextType {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  currentOffering: PurchasesOffering | null;
  isPremium: boolean;
  
  // Actions
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
  refreshCustomerInfo: () => Promise<void>;
  
  // Optional: User identification methods
  // Uncomment these if you enable USE_USER_IDENTIFICATION in constants/RevenueCat.ts
  // logIn: (userId: string) => Promise<void>;
  // logOut: () => Promise<void>;
}

/**
 * Create the RevenueCat context
 * This will be used to access RevenueCat functionality from any component
 */
const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

/**
 * RevenueCat Provider Props
 */
interface RevenueCatProviderProps {
  children: React.ReactNode;
}

/**
 * RevenueCat Provider Component
 * 
 * Initializes the RevenueCat SDK and provides context to child components
 */
export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  // State management
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  
  // Derived state
  const currentOffering = offerings?.current || null;
  const isPremium = customerInfo?.entitlements?.active?.[REVENUECAT_CONFIG.ENTITLEMENT_ID] != null;
  
  /**
   * Initialize RevenueCat SDK
   * This happens when the provider is first mounted
   */
  useEffect(() => {
    initializeRevenueCat();
  }, []);
  
  /**
   * RevenueCat initialization function
   */
  const initializeRevenueCat = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if configuration is complete
      const isConfigComplete = validateRevenueCatConfig();
      
      if (!isConfigComplete) {
        // Enter demo mode if API keys aren't configured
        console.log('🎮 Running in DEMO MODE - Configure API keys in constants/RevenueCat.ts for full functionality');
        console.log('📚 Learn more at: https://docs.revenuecat.com/docs/getting-started');
        
        // Initialize with demo data instead of throwing errors
        setIsInitialized(true);
        setCustomerInfo(null); // Demo mode - no customer info needed
        
        // Set demo offerings
        setOfferings({
          current: null,
          all: {}
        } as PurchasesOfferings);
        
        setIsLoading(false);
        return;
      }
      
      const apiKey = getPlatformApiKey();
      
      // Configure RevenueCat with platform-specific settings
      await Purchases.configure({
        apiKey,
        // Optional: Enable debug mode for development
        ...(REVENUECAT_CONFIG.DEBUG_MODE && { logLevel: 'debug' }),
        // Optional: Configure user identification
        ...(REVENUECAT_CONFIG.USE_USER_IDENTIFICATION && { 
          appUserID: undefined // Will use anonymous ID until user logs in
        }),
      });
      
      console.log('✅ RevenueCat initialized successfully for platform:', Platform.OS);
      setIsInitialized(true);
      
      // Load initial data
      await loadInitialData();
      
    } catch (err: any) {
      console.error('❌ Failed to initialize RevenueCat:', err);
      
      // Fall back to demo mode on error
      console.log('🎮 Falling back to DEMO MODE due to initialization error');
      setIsInitialized(true);
      setCustomerInfo(null); // Demo mode - no customer info needed
      
      setOfferings({
        current: null,
        all: {}
      } as PurchasesOfferings);
      
      setError('Running in demo mode - configure RevenueCat for full functionality');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Load customer info and offerings
   */
  const loadInitialData = async () => {
    try {
      // Load customer info and offerings in parallel for better performance
      const [customerInfoResult, offeringsResult] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);
      
      setCustomerInfo(customerInfoResult);
      setOfferings(offeringsResult);
      
      // Warn if no current offering is found
      if (!offeringsResult.current) {
        console.warn('⚠️ No current offering found. Please configure offerings in RevenueCat dashboard.');
        console.warn('Learn more: https://docs.revenuecat.com/docs/entitlements');
      }
      
      // Set up customer info update listener
      const customerInfoUpdateListener = (info: CustomerInfo) => {
        console.log('📱 Customer info updated');
        setCustomerInfo(info);
      };
      
      Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);
      
      // Return cleanup function
      return () => {
        Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
      };
      
    } catch (err: any) {
      console.error('❌ Failed to load RevenueCat data:', err);
      setError(err.message || 'Failed to load RevenueCat data');
    }
  };
  
  /**
   * Purchase a package
   */
  const purchasePackage = async (packageToPurchase: PurchasesPackage) => {
    try {
      setError(null);
      console.log('🛒 Attempting purchase:', packageToPurchase.identifier);
      
      const { customerInfo: updatedCustomerInfo } = await Purchases.purchasePackage(packageToPurchase);
      setCustomerInfo(updatedCustomerInfo);
      
      console.log('✅ Purchase successful');
    } catch (err: any) {
      console.error('❌ Purchase failed:', err);
      
      // Don't treat user cancellation as an error
      if (!err.userCancelled) {
        setError(err.message || 'Purchase failed');
        throw err;
      }
    }
  };
  
  /**
   * Restore purchases
   * Note: This is primarily for iOS/Android. Web purchases are handled automatically.
   */
  const restorePurchases = async () => {
    try {
      setError(null);
      console.log('🔄 Restoring purchases...');
      
      if (Platform.OS === 'web') {
        // On web, purchases are typically restored automatically
        // Just refresh customer info instead
        await refreshCustomerInfo();
        console.log('✅ Customer info refreshed (web platform)');
        return;
      }
      
      const customerInfoResult = await Purchases.restorePurchases();
      setCustomerInfo(customerInfoResult);
      
      console.log('✅ Purchases restored successfully');
    } catch (err: any) {
      console.error('❌ Failed to restore purchases:', err);
      setError(err.message || 'Failed to restore purchases');
      throw err;
    }
  };
  
  /**
   * Refresh customer info
   */
  const refreshCustomerInfo = async () => {
    try {
      setError(null);
      const customerInfoResult = await Purchases.getCustomerInfo();
      setCustomerInfo(customerInfoResult);
    } catch (err: any) {
      console.error('❌ Failed to refresh customer info:', err);
      setError(err.message || 'Failed to refresh customer info');
    }
  };
  
  /**
   * OPTIONAL: User Login
   * Uncomment this section if you enable USE_USER_IDENTIFICATION in constants/RevenueCat.ts
   * 
   * const logIn = async (userId: string) => {
   *   try {
   *     setError(null);
   *     console.log('👤 Logging in user:', userId);
   *     
   *     const { customerInfo: updatedCustomerInfo } = await Purchases.logIn(userId);
   *     setCustomerInfo(updatedCustomerInfo);
   *     
   *     console.log('✅ User logged in successfully');
   *   } catch (err: any) {
   *     console.error('❌ Login failed:', err);
   *     setError(err.message || 'Login failed');
   *     throw err;
   *   }
   * };
   */
  
  /**
   * OPTIONAL: User Logout
   * Uncomment this section if you enable USE_USER_IDENTIFICATION in constants/RevenueCat.ts
   * 
   * const logOut = async () => {
   *   try {
   *     setError(null);
   *     console.log('👤 Logging out user...');
   *     
   *     const { customerInfo: updatedCustomerInfo } = await Purchases.logOut();
   *     setCustomerInfo(updatedCustomerInfo);
   *     
   *     console.log('✅ User logged out successfully');
   *   } catch (err: any) {
   *     console.error('❌ Logout failed:', err);
   *     setError(err.message || 'Logout failed');
   *     throw err;
   *   }
   * };
   */
  
  // Context value
  const value: RevenueCatContextType = {
    // State
    isInitialized,
    isLoading,
    error,
    customerInfo,
    offerings,
    currentOffering,
    isPremium,
    
    // Actions
    purchasePackage,
    restorePurchases,
    refreshCustomerInfo,
    
    // Optional: Uncomment if you enable user identification
    // logIn,
    // logOut,
  };
  
  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
}

/**
 * Hook to access RevenueCat context
 * 
 * USAGE:
 * const { isPremium, purchasePackage, offerings } = useRevenueCat();
 * 
 * Make sure to wrap your app with RevenueCatProvider first!
 */
export function useRevenueCat() {
  const context = useContext(RevenueCatContext);
  
  if (context === undefined) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  
  return context;
}

/**
 * Export the context for advanced use cases
 * Most components should use the useRevenueCat hook instead
 */
export { RevenueCatContext };