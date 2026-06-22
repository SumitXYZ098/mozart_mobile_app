import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Pressable,
  Alert,
  Dimensions,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.92 - (Platform.OS === "ios" ? 60 : 40);
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import { useAuthStore } from "@/stores/useAuthStore";
import { verifyPayment, verifyPriorityPayment } from "@/api/subscriptionApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toast } from "@/stores/useToastStore";

export type PaymentBottomSheetRef = {
  present: (options: {
    title: string;
    description: string;
    priceText: string;
    paymentType?: "upgrade" | "priority";
    onCreateSession: () => Promise<{
      url?: string;
      sessionId?: string;
    }>;
    onSuccess: (sessionId: string | null) => void;
    onCancel?: () => void;
  }) => void;
  dismiss: () => void;
};

const PaymentBottomSheet = forwardRef<PaymentBottomSheetRef, {}>(
  (_, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const webViewRef = useRef<WebView>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [priceText, setPriceText] = useState("");
    const [paymentType, setPaymentType] = useState<"upgrade" | "priority">("upgrade");

    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false); // Session creation loader
    const [isWebViewLoading, setIsWebViewLoading] = useState(true); // WebView page loader
    const [isVerifying, setIsVerifying] = useState(false); // Verification spinner
    const [hasError, setHasError] = useState(false);

    const onCreateSessionRef = useRef<any>(null);
    const onSuccessRef = useRef<((sessionId: string | null) => void) | undefined>(undefined);
    const onCancelRef = useRef<(() => void) | undefined>(undefined);

    const opacity = useSharedValue(0);

    useImperativeHandle(ref, () => ({
      present: (options) => {
        setTitle(options.title);
        setPriceText(options.priceText);
        setPaymentType(options.paymentType || "upgrade");
        onCreateSessionRef.current = options.onCreateSession;
        onSuccessRef.current = options.onSuccess;
        onCancelRef.current = options.onCancel;

        // Reset state
        setPaymentUrl(null);
        setSessionId(null);
        setIsLoading(true);
        setIsWebViewLoading(true);
        setIsVerifying(false);
        setHasError(false);

        setIsOpen(true);
        bottomSheetRef.current?.expand();

        // Initiate session creation immediately
        fetchCheckoutSession();
      },
      dismiss: () => {
        handleClose(true);
      },
    }));

    const fetchCheckoutSession = async () => {
      try {
        const session = await onCreateSessionRef.current();
        if (session?.url) {
          setPaymentUrl(session.url);
          
          let extractedSessionId = session.sessionId || session.id;
          if (!extractedSessionId) {
            const match = session.url.match(/(cs_(?:test|live)_[a-zA-Z0-9_]+)/);
            if (match) {
              extractedSessionId = match[1];
            }
          }
          setSessionId(extractedSessionId || null);
          setIsLoading(false);
        } else {
          throw new Error("No checkout URL returned from the server.");
        }
      } catch (err: any) {
        console.error("Failed to fetch checkout session:", err);
        toast.error(err?.message || "Failed to setup checkout session.");
        setHasError(true);
        setIsLoading(false);
      }
    };

    const handleSheetChange = (index: number) => {
      const open = index >= 0;
      setIsOpen(open);
      opacity.value = withTiming(open ? 1 : 0, { duration: 250 });
    };

    const animatedOverlayStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    useEffect(() => {
      if (isOpen) opacity.value = withTiming(1, { duration: 250 });
      else opacity.value = withTiming(0, { duration: 250 });
    }, [isOpen]);

    const handleClose = (force = false) => {
      if (isVerifying && !force) {
        return;
      }

      if (paymentUrl && !force) {
        Alert.alert(
          "Cancel Payment",
          "Are you sure you want to cancel and exit checkout?",
          [
            { text: "No, continue payment", style: "cancel" },
            {
              text: "Yes, exit",
              style: "destructive",
              onPress: () => {
                if (onCancelRef.current) onCancelRef.current();
                bottomSheetRef.current?.close();
                setIsOpen(false);
              },
            },
          ]
        );
        return;
      }

      bottomSheetRef.current?.close();
      setIsOpen(false);
    };

    const handlePaymentSuccess = async (activeSessionId: string | null) => {
      if (isVerifying) return;
      setIsVerifying(true);
      try {
        const { user, refreshUserProfile } = useAuthStore.getState();
        const verifySessionId = activeSessionId || sessionId;

        if (verifySessionId && user?.token) {
          try {
            if (paymentType === "priority") {
              console.log("Verifying priority payment:", verifySessionId);
              await verifyPriorityPayment(verifySessionId, user.token);
            } else {
              console.log("Verifying subscription/upgrade payment:", verifySessionId);
              await verifyPayment(verifySessionId, user.token);
            }
          } catch (verifyErr) {
            // Log verification error (e.g. 405) but do not crash/halt, 
            // since payment succeeded on Stripe and webhook completes it asynchronously.
            console.warn("Payment verification API endpoint returned an error:", verifyErr);
          }
        }

        // Always refresh user profile to update local subscription status
        try {
          await refreshUserProfile();
        } catch (refreshErr) {
          console.warn("Failed to refresh user profile on success:", refreshErr);
        }

        // Clear local storage pending session since verification is handled
        await AsyncStorage.removeItem("pending_checkout_session");

        if (onSuccessRef.current) {
          onSuccessRef.current(verifySessionId);
        }
        handleClose(true);
      } catch (err: any) {
        console.error("Payment verification failed:", err);
        toast.error(err?.message || "Failed to verify transaction. Please refresh manually.");
        setHasError(true);
      } finally {
        setIsVerifying(false);
      }
    };

    const checkIsRedirect = (url: string) => {
      if (!url) return { isSuccess: false, isCancel: false };

      const lowerUrl = url.toLowerCase();
      
      // Cancel matches
      const isCancel = lowerUrl.includes("payment-cancel") || lowerUrl.includes("cancel");
      if (isCancel) {
        return { isSuccess: false, isCancel: true };
      }

      // Success matches
      const isSuccess =
        lowerUrl.includes("payment-success") ||
        lowerUrl.includes("session_id=") ||
        lowerUrl.includes("profile") ||
        lowerUrl.includes("upgrade") ||
        url.startsWith("exp://") ||
        (!url.startsWith("http://") && !url.startsWith("https://"));

      return { isSuccess, isCancel: false };
    };

    const handlePaymentCancel = () => {
      console.log("Payment canceled in WebView redirect.");
      if (onCancelRef.current) onCancelRef.current();
      handleClose(true);
      toast.info("Payment cancelled.");
    };

    const handleNavigationStateChange = (navState: any) => {
      const { url } = navState;
      if (!url) return;

      console.log("WebView navigating to URL:", url);

      const { isSuccess, isCancel } = checkIsRedirect(url);

      if (isSuccess) {
        let activeSessionId = sessionId;
        const match = url.match(/[?&]session_id=([^&]+)/);
        if (match && match[1]) {
          activeSessionId = match[1];
        }
        handlePaymentSuccess(activeSessionId);
      } else if (isCancel) {
        handlePaymentCancel();
      }
    };

    const handleShouldStartLoadWithRequest = (request: any) => {
      const { url } = request;
      const { isSuccess, isCancel } = checkIsRedirect(url);

      if (isSuccess) {
        let activeSessionId = sessionId;
        const match = url.match(/[?&]session_id=([^&]+)/);
        if (match && match[1]) {
          activeSessionId = match[1];
        }
        handlePaymentSuccess(activeSessionId);
        return false; // prevent loading the success redirect web page
      }

      if (isCancel) {
        handlePaymentCancel();
        return false; // prevent loading the cancel redirect web page
      }

      return true;
    };

    const handleWebViewError = (syntheticEvent: any) => {
      const nativeEvent = syntheticEvent?.nativeEvent;
      const url = nativeEvent?.url || "";
      console.warn("WebView load error for URL:", url, nativeEvent);

      if (isVerifying) {
        console.log("Ignoring WebView error because verification is in progress.");
        return;
      }

      const { isSuccess, isCancel } = checkIsRedirect(url);
      if (isSuccess || isCancel) {
        console.log("Ignoring WebView load error on success/cancel redirect URL.");
        return;
      }

      // Also check if code is -1002 (unsupported URL) which happens when attempting to load custom app deep link schemes like exp:// or mozart://
      if (nativeEvent?.code === -1002 || nativeEvent?.description?.includes("unsupported URL")) {
        console.log("Ignoring WebView unsupported URL error (likely custom scheme redirect).");
        return;
      }

      setHasError(true);
    };

    const handleRetry = () => {
      setHasError(false);
      if (!paymentUrl) {
        setIsLoading(true);
        fetchCheckoutSession();
      } else {
        setIsWebViewLoading(true);
        webViewRef.current?.reload();
      }
    };

    return (
      <Portal>
        {isOpen && (
          <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => handleClose(false)}
            />
          </Animated.View>
        )}

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={["92%"]}
          enableDynamicSizing={false}
          enablePanDownToClose={!isVerifying && !isLoading}
          onChange={handleSheetChange}
          backgroundStyle={styles.sheetBackground}
          keyboardBehavior="interactive"
          android_keyboardInputMode="adjustResize"
        >
          <View style={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>{title || "Secure Checkout"}</Text>
                {priceText ? <Text style={styles.headerSubtitle}>{priceText}</Text> : null}
              </View>
              <TouchableOpacity
                onPress={() => handleClose(false)}
                disabled={isVerifying}
                style={[styles.closeBtn, isVerifying && { opacity: 0.3 }]}
              >
                <Ionicons name="close" size={24} color="#777" />
              </TouchableOpacity>
            </View>

            {/* Content Body */}
            <View style={styles.body}>
              {isLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator color={Colors.primary} size="large" />
                  <Text style={styles.loaderText}>Setting up secure connection...</Text>
                </View>
              ) : hasError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="warning" size={48} color={Colors.red} />
                  <Text style={styles.errorTitle}>Connection Failure</Text>
                  <Text style={styles.errorText}>
                    We couldn't load your checkout session. Please check your internet connection and try again.
                  </Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                    <Text style={styles.retryBtnText}>Retry Connection</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.webContainer}>
                  {paymentUrl ? (
                    <WebView
                      ref={webViewRef}
                      source={{ uri: paymentUrl }}
                      onNavigationStateChange={handleNavigationStateChange}
                      onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      startInLoadingState={true}
                      scalesPageToFit={true}
                      originWhitelist={["*"]}
                      onLoadStart={() => setIsWebViewLoading(true)}
                      onLoadEnd={() => setIsWebViewLoading(false)}
                      onError={handleWebViewError}
                      style={styles.webView}
                    />
                  ) : null}

                  {/* Inline loaders for WebView loading state */}
                  {isWebViewLoading && (
                    <View style={styles.webViewLoader}>
                      <ActivityIndicator color={Colors.primary} size="large" />
                      <Text style={styles.loaderText}>Loading Stripe Checkout...</Text>
                    </View>
                  )}

                  {/* Verification Spinner */}
                  {isVerifying && (
                    <View style={styles.verifyingOverlay}>
                      <ActivityIndicator color="#10B981" size="large" />
                      <Text style={styles.verifyingText}>Verifying Payment...</Text>
                      <Text style={styles.verifyingSub}>Applying your new status, please wait.</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </BottomSheet>
      </Portal>
    );
  }
);

export default PaymentBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  contentContainer: {
    height: SHEET_HEIGHT,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
    fontFamily: "PlusJakartaSans_700Bold",
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  loaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 12,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "PlusJakartaSans_700Bold",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  webContainer: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
  },
  webViewLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  verifyingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  verifyingText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 16,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  verifyingSub: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    marginTop: 6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
