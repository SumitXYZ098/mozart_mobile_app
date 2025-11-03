import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import CustomButton from "@/components/common/CustomButton";
import { Colors } from "@/theme/colors";
import InputField from "@/components/modules/InputField";
import { useDraftStore } from "@/stores/draftStore";
import SelectInputField from "@/components/common/SelectInputField";
import { genresList, languagesList } from ".";
import LabelSelector from "../LabelSelector";
import DatePickerInput from "@/components/common/DatePickerInput";
import KeyboardWrapper from "@/components/modules/KeyboardWrapper";

interface ReleaseInformationProps {
  goNext: (data: any) => void;
  draftFormData?: any;
}

const ReleaseInformation: React.FC<ReleaseInformationProps> = ({
  goNext,
  draftFormData,
}) => {
  const [subStep, setSubStep] = useState(0);
  const { control, handleSubmit, setValue, trigger } = useFormContext();
  const { draftId, setDraftId } = useDraftStore();
  useEffect(() => {
    if (draftId) {
      setDraftId(draftId);
      if (draftFormData?.data) {
        setValue("ReleaseType", draftFormData.data.ReleaseType);
        setValue("ReleaseTitle", draftFormData.data.ReleaseTitle);
        setValue("Version", draftFormData.data.Version);
        setValue("LanguageOfTheTitles", draftFormData.data.LanguageOfTheTitles);
        setValue("PrimaryGenre", draftFormData.data.PrimaryGenre);
        setValue("SecondaryGenre", draftFormData.data.SecondaryGenre);
        setValue("AddLabel", draftFormData.data.AddLabel);
        setValue("CopyrightYear", draftFormData.data.CopyrightYear);
        setValue("CopyrightholderName", draftFormData.data.CopyrightholderName);
        setValue(
          "PhonogramRightsHolderYear",
          draftFormData.data.PhonogramRightsHolderYear
        );
        setValue(
          "PhonogramRightsHolderName",
          draftFormData.data.PhonogramRightsHolderName
        );
      }
    }
  }, [draftFormData, setValue, draftId, setDraftId]);

  const handleNextStep = async () => {
    const isValid = await trigger(["ReleaseType", "ReleaseTitle"]);
    // if (!isValid)
    //   return Alert.alert("Validation", "Please fill all required fields.");
    if (isValid) {
      if (subStep < 1) {
        setSubStep((prev) => prev + 1);
      } else {
        const data = await handleSubmit((formData) => goNext(formData))();
      }
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <Text style={styles.title}>Release Information</Text>
      <Text style={styles.subtitle}>
        This is where users create new tracks or projects, upload files, and
        save drafts before distribution
      </Text>

      {subStep === 0 && (
        <>
          {/* Release Type */}
          <SelectInputField
            label="Release Type"
            placeholder="Single, EP, Album..."
            items={["Single", "EP", "Album"]}
            name="ReleaseType"
            control={control}
            rules={{ required: "Release Type is required" }}
            zIndex={2}
          />
          <Text style={styles.helperText}>
            Choose the format of your release (Single, EP, or Album).
          </Text>

          {/* Release Title */}
          <Controller
            control={control}
            name="ReleaseTitle"
            rules={{ required: "Release Title is required" }}
            render={({ field: { value, onChange, onBlur }, fieldState }) => (
              <InputField
                label="Release Title"
                placeholder="Enter release title"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldState.error?.message}
              />
            )}
          />

          <Text style={styles.helperText}>
            Enter the name of your release as it should appear publicly. Make
            sure the title is correct and written properly.
          </Text>
        </>
      )}

      {subStep === 1 && (
        <KeyboardWrapper>
          <SelectInputField
            label="Version (optional)"
            placeholder="e.g. Remix, Live, Remaster"
            items={["Remix", "Live", "Remaster"]}
            name="Version"
            control={control}
            zIndex={4}
          />
          <Text style={styles.helperText}>A Remaster, Live, Remix, etc.</Text>

          <SelectInputField
            label="Language of the Titles"
            placeholder="Select"
            items={languagesList}
            name="LanguageOfTheTitles"
            control={control}
            rules={{ required: "Language is required" }}
            zIndex={3}
          />

          <Text style={[styles.label, { marginTop: 4 }]}>Genre</Text>
          <View
            style={{
              flexDirection: "row",
              gap: 6,
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <SelectInputField
              placeholder="Primary Genre"
              items={genresList}
              name="PrimaryGenre"
              control={control}
              rules={{ required: "Primary Genre is Required" }}
              zIndex={2}
              style={{
                width: "48%",
              }}
            />
            <SelectInputField
              placeholder="Secondary Genre(optional)"
              items={genresList}
              name="SecondaryGenre"
              control={control}
              zIndex={2}
              style={{
                width: "48%",
              }}
            />
          </View>

          <LabelSelector controllerName="AddLabel" />

          <Text style={[styles.label]}>© Copyright Holder</Text>
          <View
            style={{
              flexDirection: "row",
              gap: 6,
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <DatePickerInput
              control={control}
              name="CopyrightYear"
              placeholder="Select a year"
              mode="year"
              rules={{ required: "Year is required" }}
            />
            <Controller
              control={control}
              name="CopyrightholderName"
              rules={{ required: "@ Copyright holder name is required." }}
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <InputField
                  placeholder="Copyright Holder Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>
          <Text style={styles.helperText}>
            Enter the copyright owner name for the cover art or any written
            material (like liner notes). This name also apply to the musical
            composition and lyrics. Make sure the owner’s name spelling and
            format matches the legal documents.
          </Text>

          <Text style={[styles.label]}>Phonogram Rights Holder</Text>
          <View
            style={{
              flexDirection: "row",
              gap: 6,
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <DatePickerInput
              control={control}
              name="PhonogramRightsHolderYear"
              placeholder="Select a year"
              mode="year"
              rules={{ required: "Year is required" }}
            />
            <Controller
              control={control}
              name="PhonogramRightsHolderName"
              rules={{ required: "Phonogram rights holder name is required." }}
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <InputField
                  placeholder="Phonogram Rights Holder Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="default"
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>
          <Text style={styles.helperText}>
            Enter the name of the phonographic rights owner for the recordings
            in this release. Make sure the name matches the legal documents
            exactly.
          </Text>
        </KeyboardWrapper>
      )}

      {/* Step Navigation */}
      <View style={styles.gridContainer}>
        <CustomButton
          label={subStep === 1 ? "Next Step" : "Continue"}
          buttonType="primary"
          onPress={handleNextStep}
          customClasses={{ display: "flex", width: "100%" }}
        />
        {subStep === 1 && (
          <CustomButton
            label="Back"
            buttonType="disable"
            onPress={() => setSubStep(subStep - 1)}
            customClasses={{
              display: "flex",
              width: "100%",
              borderWidth: 1,
              borderColor: Colors.lightGray,
            }}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default ReleaseInformation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  subtitle: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 12,
    fontFamily: "Poppins_400Regular",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: Colors.gray,
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 6,
    color: Colors.gray,
    fontFamily: "Poppins_400Regular",
  },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  helperText: {
    fontSize: 10,
    color: Colors.gray || "#777",
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
});
