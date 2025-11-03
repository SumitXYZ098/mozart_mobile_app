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
import Step3 from "./step/TrackList";
import Step4 from "./step/DeliveryOption";
import Step5 from "./step/Review";
import CustomButton from "@/components/common/CustomButton";
import { StyleSheet, View } from "react-native";
import ReleaseInformation from "./step/ReleaseInformation";
import CoverArtStep from "./step/CoverArt";
import { Colors } from "@/theme/colors";
import TrackList from "./step/TrackList";

const STORAGE_KEY = "releaseFormDraft";

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
  } = useDraftFlow();
  const { mutateAsync: publishDraftMutation } = usePublishDraft();

  const [activeStep, setActiveStep] = useState(0);
  const now = new Date();

  const initialFormValues = {
    ReleaseTitle: "",
    ReleaseType: "",
    Version: "",
    LanguageOfTheTitles: "",
    PrimaryGenre: "",
    SecondaryGenre: "",
    AddLabel: "",
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
          { artistName: "", roleName: "Vocals" },
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
      } else if (activeStep === 4) {
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

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      if (!draftId) throw new Error("Draft ID missing at final step");
      await finishMutation.mutateAsync(data);
      await publishDraftMutation();
      await deleteDraftMutation.mutateAsync();

      await AsyncStorage.removeItem(STORAGE_KEY);
      toast.success("✅ Release published successfully");
      navigation.navigate("MusicTab", { screen: "MyRelease" });
    } catch (err: any) {
      console.error(err);
      toast.error("Final step failed");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    <ReleaseInformation goNext={handleNext} draftFormData={data} />,
    <CoverArtStep draftFormData={data} />,
    <TrackList draftFormData={data} />,
    <Step4 onNext={handleNext} onBack={handlePrev} />,
    <Step5 onNext={methods.handleSubmit(onSubmit)} onBack={handlePrev} />,
  ];

  return (
    <FormProvider {...methods}>
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
              label="Distribute"
              buttonType="primary"
              onPress={methods.handleSubmit(onSubmit)}
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
            customClasses={{ display: "flex", width: "100%", borderWidth:1, borderColor:Colors.lightGray }}
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
});
