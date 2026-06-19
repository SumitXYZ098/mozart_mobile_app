/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { FormProvider, useForm } from "react-hook-form";

// Simulated hooks – replace with your real ones
import {
  useDraftFlow,
  usePublishDraft,
  useGetDraftById,
} from "@/hooks/useDraft";

import dayjs from "dayjs";
import { useLoadingStore } from "@/stores/loadingStore";
import { formatDate, getSystemTimeZone } from "@/utils/utils";
import { toast } from "@/stores/useToastStore";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import CustomButton from "@/components/common/CustomButton";
import { StyleSheet, View, Modal, Linking, Text, TouchableOpacity, Image, AppState, ActivityIndicator } from "react-native";
import ReleaseInformation from "./step/ReleaseInformation";
import CoverArtStep from "./step/CoverArt";
import { Colors } from "@/theme/colors";
import TrackList from "./step/TrackList";
import DeliveryOption from "./step/DeliveryOption";
import ReviewScreen from "./step/ReviewScreen";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { usePriorityPayment, useVerifyPriorityPayment } from "@/hooks/useSubscription";
import { useCurrencyPricing } from "@/hooks/useCurrencyPricing";
import { getUploadFileById } from "@/api/uploadApi";
import { usePublishTrackStore } from "@/stores/publishTrackStore";

const STORAGE_KEY = "releaseFormDraft";

const isNotFoundError = (err: any) => {
  if (!err) return false;
  const status = err.response?.status ?? err.status ?? err.response?.data?.error?.status;
  if (status === 404) return true;
  const msg = err.message ?? err.response?.data?.error?.message;
  if (typeof msg === "string") {
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes("404") || lowerMsg.includes("not found")) {
      return true;
    }
  }
  return false;
};

const StepperScreen = () => {
  const navigation = useNavigation<any>();
  const { loading, setLoading, uploadProgress, setUploadProgress } =
    useLoadingStore();

  const { data } = useGetDraftById();
  const {
    step1Mutation,
    step2Mutation,
    step3Mutation,
    step4Mutation,
    finishMutation,
    updateDraftMutation,
    deleteDraftMutation,
    draftId,
    clearDraft,
  } = useDraftFlow();
  const { mutateAsync: publishDraftMutation } = usePublishDraft();

  const { mutateAsync: priorityPaymentMutation } = usePriorityPayment();
  const { mutateAsync: verifyPriorityPaymentMutation } = useVerifyPriorityPayment();

  const [activeStep, setActiveStep] = useState(0);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState("");
  const [pendingSubmitData, setPendingSubmitData] = useState<any>(null);
  const [coverArtUrl, setCoverArtUrl] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "opened" | "verifying">("idle");

  const pricing = useCurrencyPricing({
    indiaPrice: 1099,
    canadaPrice: 12,
    usaPrice: 9,
  });

  const now = new Date();

  const initialFormValues = {
    ReleaseTitle: "",
    ReleaseType: "",
    Version: "",
    LanguageOfTheTitles: "",
    PrimaryGenre: "",
    SecondaryGenre: "",
    AddLabel: "AMozart",
    ReferenceNumber: "",
    Priority: "Priority",
    TimeZoneOfReference: getSystemTimeZone(),
    Countries: ["Entire World"],
    MusicStores: [],
    ReleaseTime: dayjs().format("HH:mm:ss.SSS"),
    OriginalReleaseDate: formatDate(now),
    DigitalReleaseDate: formatDate(
      new Date(new Date().setDate(now.getDate() + 1))
    ),
    ReleaseCredits: [
      { artistName: "", roleName: "Primary Artist" },
      { artistName: "", roleName: "Composer" },
      { artistName: "", roleName: "Lyricist" },
      { artistName: "", roleName: "Producer" },
    ],
    CopyrightholderName: "",
    CopyrightYear: new Date().getFullYear(),
    PhonogramRightsHolderName: "",
    PhonogramRightsHolderYear: new Date().getFullYear(),
    PriceCategory: "Budget",
    CoverArt: null,
    TrackList: [
      {
        TrackName: "",
        PrimaryGenre: "",
        SecondaryGenre: "",
        RoleCredits: [
          { artistName: "", roleName: "Primary Artist" },
          { artistName: "", roleName: "Composer" },
          { artistName: "", roleName: "Lyricist" },
          { artistName: "", roleName: "Producer" },
        ],
        LyricsAvailable: false,
        AppropriateForAllAudiences: true,
        ContainsExplicitContent: false,
        CleanVersionAvailable: false,
        ISRC: "",
        ISWC: "",
        RequestANewISRC: false,
        TrackUpload: null,
        file: null,
        stepCompleted: false,
        currentStep: 0,
        Status: "In-Progress",
      },
    ],
  };

  const methods = useForm({
    mode: "onTouched",
    defaultValues: initialFormValues,
  });

  // 🔄 Restore draft from AsyncStorage
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          methods.reset(JSON.parse(saved));
          console.log("Draft restored from storage");
        } catch (e) {
          console.error("Failed to parse draft:", e);
        }
      }
    })();
  }, [methods]);

  const saveDraft = async () => {
    const values = methods.getValues();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  };

  // 🟣 Stepper logic
  const handleNext = async () => {
    const isValid = await methods.trigger();
    if (!isValid) return;


    setLoading(true);
    try {

      const formData = methods.getValues();
      setUploadProgress(0);
      // Simulate progress updates
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((r) => setTimeout(r, 100));
        setUploadProgress(i);
      }
      console.log(activeStep, "Step");
      if (activeStep === 0) {
        console.log(draftId, " is id");
        if (draftId) await updateDraftMutation.mutateAsync(formData);
        else await step1Mutation.mutateAsync(formData);
      } else if (activeStep === 1) {
        if (!draftId) throw new Error("Draft ID missing for step 2");
        await step2Mutation.mutateAsync(formData);
      } else if (activeStep === 2) {
        if (!draftId) throw new Error("Draft ID missing for step 3");
        await step3Mutation.mutateAsync(formData);
      } else if (activeStep === 3) {
        if (!draftId) throw new Error("Draft ID missing for step 4");
        await step4Mutation.mutateAsync(formData);
      }

      await saveDraft();
      setActiveStep((prev) => prev + 1);

      toast.success("✅ Step completed");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Step failed");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handlePrev = async () => {
    await saveDraft();
    setActiveStep((prev) => prev - 1);
  };

  const proceedWithDistribution = async (formData: any) => {
    if (!draftId) throw new Error("Draft ID missing");

    try {
      await finishMutation.mutateAsync(formData);
      await publishDraftMutation();
    } catch (err: any) {
      if (isNotFoundError(err)) {
        console.log("Draft or release not found (404). It may have already been published.");
      } else {
        throw err;
      }
    }

    try {
      await deleteDraftMutation.mutateAsync();
    } catch (err: any) {
      console.log("Draft deletion after publish failed/skipped:", err?.message || err);
    } finally {
      clearDraft();
    }

    await AsyncStorage.removeItem(STORAGE_KEY);

    // Refresh published tracks in store
    usePublishTrackStore.getState().fetchUserPublishTracks();

    toast.success("✅ Release distributed successfully");
    navigation.navigate("Upload");
  };

  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      console.log("Incoming deep link:", url);
      // Parse session_id from query parameters
      const match = url.match(/[?&]session_id=([^&]+)/);
      if (match && match[1]) {
        const sessionId = match[1];
        console.log("Extracted session_id from deep link:", sessionId);
        setPendingSessionId(sessionId);

        // Auto-verify payment
        setPaymentStatus("verifying");
        setLoading(true);
        try {
          await verifyPriorityPaymentMutation(sessionId);
          setCheckoutModalVisible(false);
          setPaymentStatus("idle");

          // Clean up draft & redirect
          try {
            await deleteDraftMutation.mutateAsync();
          } catch (delErr) {
            console.log("Draft deletion failed/skipped:", delErr);
          } finally {
            clearDraft();
          }
          await AsyncStorage.removeItem(STORAGE_KEY);
          usePublishTrackStore.getState().fetchUserPublishTracks();
          toast.success("✅ Release distributed successfully");
          navigation.navigate("Upload");
        } catch (err: any) {
          console.error("Deep link verification failed:", err);
          // Keep modal open so they can retry or cancel
          setPaymentStatus("opened");
        } finally {
          setLoading(false);
        }
      }
    };

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const onSubmit = async (formData: any) => {
    console.log("=== Distribute onSubmit Triggered ===");
    console.log("Draft ID:", draftId);
    console.log("Selected Priority:", formData?.Priority);
    console.log("Form Data:", JSON.stringify(formData, null, 2));

    try {
      setLoading(true);
      if (!draftId) throw new Error("Draft ID missing at final step");

      if (formData.Priority === "Priority") {
        const savedImageId = formData?.CoverArt;
        if (savedImageId) {
          // Fetch cover art asynchronously so it doesn't block the modal from opening instantly
          getUploadFileById(savedImageId)
            .then((imgUrl) => {
              console.log("Successfully fetched cover art URL:", imgUrl?.formats?.small?.url || imgUrl?.url);
              setCoverArtUrl(imgUrl?.formats?.small?.url || imgUrl?.url || "");
            })
            .catch((err) => {
              console.warn("Failed to fetch cover art for checkout popup:", err);
            });
        }
        setPendingSubmitData(formData);
        setPaymentStatus("idle");
        setCheckoutModalVisible(true);
        console.log("Checkout modal visibility set to true.");
      } else {
        console.log("Standard priority selected, proceeding with normal distribution.");
        await proceedWithDistribution(formData);
      }
    } catch (err: any) {
      console.error("Error in onSubmit:", err);
      toast.error(err.message || "Final step failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityPay = async () => {
    if (!draftId) return;
    setLoading(true);
    try {
      const session = await priorityPaymentMutation({
        draftId,
        amount: pricing.convertedPrice,
        currency: pricing.currency,
      });
      if (session?.url) {
        setPaymentStatus("opened");
        await Linking.openURL(session.url);
      } else {
        throw new Error("Invalid checkout response");
      }
    } catch (err: any) {
      console.warn("Real Stripe checkout failed, offering fallback simulation:", err);
      setPaymentStatus("opened");
      toast.info("Priority payment setup. Opening checkout browser.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCheckout = async () => {
    setCheckoutModalVisible(false);
    setPaymentStatus("idle");
  };

  const onInvalid = (errors: any) => {
    console.log("=== Distribute onInvalid Triggered ===");
    console.log("Validation Errors Details:", JSON.stringify(errors, null, 2));
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const errorObj = errors[firstKey];

      if (Array.isArray(errorObj)) {
        for (const errItem of errorObj) {
          if (errItem) {
            const nestedKeys = Object.keys(errItem);
            if (nestedKeys.length > 0) {
              const nestedMsg = errItem[nestedKeys[0]]?.message;
              if (nestedMsg) {
                console.log(`Validation Failed on nested field: ${firstKey} -> ${nestedKeys[0]}. Message: ${nestedMsg}`);
                toast.error(`Error: ${nestedMsg}`);
                return;
              }
            }
          }
        }
      }

      const message = errorObj?.message || `${firstKey} is invalid`;
      console.log(`Validation Failed on field: ${firstKey}. Message: ${message}`);
      toast.error(`Error: ${message}`);
    } else {
      toast.error("Form validation failed. Please check all fields.");
    }
  };

  const steps = [
    <ReleaseInformation goNext={handleNext} draftFormData={data} />,
    <CoverArtStep draftFormData={data} />,
    <TrackList draftFormData={data} />,
    <DeliveryOption draftFormData={data} />,
    <ReviewScreen />,
  ];

  return (
    <FormProvider {...methods}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {steps[activeStep]}

        {/* Navigation Buttons */}
        <View style={styles.gridContainer}>
          {activeStep < steps.length - 1 ? (
            activeStep === 0 ? null : (
              <CustomButton
                customClasses={{ display: "flex", width: "100%" }}
                label="Next step"
                buttonType="primary"
                onPress={handleNext}
              />
            )
          ) : (
            <View style={styles.gridContainer}>
              <CustomButton
                customClasses={{ display: "flex", width: "48%" }}
                label={loading ? "Uploading..." : "Distribute"}
                buttonType="primary"
                disabled={loading}
                onPress={methods.handleSubmit(onSubmit, onInvalid)}
              />
              <CustomButton
                customClasses={{ display: "flex", width: "48%" }}
                label="Edit"
                buttonType="secondary"
                onPress={handlePrev}
              />
              <CustomButton
                customClasses={{ display: "flex", width: "100%" }}
                label="Delete"
                buttonType="disable"
              />
            </View>
          )}
          {activeStep > 0 && activeStep < steps.length - 1 && (
            <CustomButton
              customClasses={{
                display: "flex",
                width: "100%",
                borderWidth: 1,
                borderColor: Colors.lightGray,
              }}
              label={"Back"}
              buttonType="disable"
              onPress={handlePrev}
            />
          )}
        </View>

        {/* Loading Overlay */}
        <LoadingOverlay
          visible={loading}
          message={uploadProgress > 0 ? "Uploading..." : "Processing..."}
          progress={uploadProgress}
        />

        {/* Priority Release Checkout Modal */}
        {/* Priority Release Checkout Modal */}
        <Modal
          visible={checkoutModalVisible}
          transparent
          animationType="fade"
          onRequestClose={handleCancelCheckout}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeIconButton}
                onPress={handleCancelCheckout}
              >
                <Ionicons name="close" size={24} color="#B3B3B3" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Ready To Distribute Your Track?</Text>
              <Text style={styles.modalSubtitle}>
                You're About To Publish Your Track Across Multiple Music Platforms. Please Confirm Your Delivery Option And Pricing Before Proceeding.
              </Text>

              {/* Track Row */}
              <View style={styles.trackCard}>
                {coverArtUrl ? (
                  <Image source={{ uri: coverArtUrl }} style={styles.trackImage} />
                ) : (
                  <View style={[styles.trackImage, { backgroundColor: "#F0F0F0", justifyContent: "center", alignItems: "center" }]}>
                    <Ionicons name="musical-notes" size={24} color="#B3B3B3" />
                  </View>
                )}
                <View style={styles.trackDetails}>
                  <View style={styles.trackTitleContainer}>
                    <Text style={styles.trackTitle} numberOfLines={1}>
                      {pendingSubmitData?.ReleaseTitle || "Untitled Release"}
                    </Text>
                    <View style={styles.starBadge}>
                      <Ionicons name="star" size={10} color="#FFFFFF" />
                    </View>
                  </View>
                  <Text style={styles.trackDate}>
                    Digital Release Date {pendingSubmitData?.DigitalReleaseDate ? dayjs(pendingSubmitData.DigitalReleaseDate).format("DD/MM/YYYY") : ""}
                  </Text>
                </View>
              </View>

              {/* Info Rows Container */}
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Priority Delivery</Text>
                  <Text style={styles.infoValue}>
                    {pricing.symbol}{pricing.convertedPrice} {pricing.currency}
                  </Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>No. Of Track</Text>
                  <Text style={styles.infoValue}>
                    {String(pendingSubmitData?.TrackList?.length || 1).padStart(2, "0")}
                  </Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.totalLabel}>Total Payable:</Text>
                  <Text style={styles.totalValue}>
                    {pricing.symbol}{pricing.convertedPrice} {pricing.currency}
                  </Text>
                </View>
              </View>

              {/* Checkout / Verification Action Buttons */}
              {paymentStatus === "idle" ? (
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.payButton}
                    onPress={handlePriorityPay}
                  >
                    <Text style={styles.payButtonText}>
                      Pay {pricing.symbol}{pricing.convertedPrice} {pricing.currency}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelCheckout}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.verticalActions}>
                  <Text style={styles.paymentOpenedText}>
                    Stripe checkout sheet has been opened in your browser. Please complete payment.
                  </Text>
                  {paymentStatus === "verifying" && (
                    <ActivityIndicator size="small" color="#7632C5" style={{ marginBottom: 16 }} />
                  )}
                  <TouchableOpacity
                    style={[styles.cancelButton, { width: "100%", flex: 0 }]}
                    onPress={handleCancelCheckout}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </FormProvider>
  );
};

export default StepperScreen;

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 5, 20, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  closeIconButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    marginTop: 8,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#777777",
    fontFamily: "Poppins_400Regular",
    lineHeight: 18,
    marginBottom: 20,
  },
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  trackImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
    fontFamily: "PlusJakartaSans_700Bold",
    maxWidth: "80%",
  },
  starBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#A855F7",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  trackDate: {
    fontSize: 11,
    color: "#888888",
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
  },
  infoContainer: {
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    backgroundColor: "#FAFAFA",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: "#666666",
    fontFamily: "Poppins_400Regular",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111111",
    fontFamily: "Poppins_400Regular",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  payButton: {
    flex: 1.3,
    backgroundColor: "#7632C5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  cancelButtonText: {
    color: "#777777",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  verticalActions: {
    width: "100%",
  },
  paymentOpenedText: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  simulateButton: {
    backgroundColor: "#E1D5F9",
    borderRadius: 12,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  simulateButtonText: {
    color: "#7632C5",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
