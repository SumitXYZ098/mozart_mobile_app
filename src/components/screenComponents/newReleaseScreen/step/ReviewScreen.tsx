/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { useFormContext } from "react-hook-form";
import dayjs from "dayjs";
import { getUploadFileById } from "@/api/uploadApi";
import { formatTimeTo12Hour } from "@/utils/utils";
import { Colors } from "@/theme/colors";

const ReviewScreen = () => {
  const { watch } = useFormContext();
  const formValues = watch(); // all form data
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const savedImageId = formValues?.CoverArt;
        if (savedImageId) {
          const imgUrl = await getUploadFileById(savedImageId);
          setPreviewUrl(imgUrl?.formats?.small?.url || imgUrl?.url);
        }
      } catch (err) {
        console.warn("Failed to fetch cover image", err);
      }
    };
    fetchImageUrl();
  }, [formValues?.CoverArt]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.heading}>Review Your Release</Text>

      <View style={styles.row}>
        {/* Cover Art */}
        <Image
          source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${previewUrl}` }}
          style={styles.coverArt}
          resizeMode="cover"
        />

        {/* Details */}
        <View style={styles.details}>
          <Text style={styles.releaseTitle}>
            {formValues?.ReleaseTitle || "Untitled Release"}
          </Text>
          <View style={styles.grid}>
            <InfoRow label="Release Type" value={formValues?.ReleaseType} />
            <InfoRow label="Primary Genre" value={formValues?.PrimaryGenre} />
            <InfoRow
              label="Secondary Genre"
              value={formValues?.SecondaryGenre}
            />
            <InfoRow label="Language" value={formValues?.LanguageOfTheTitles} />
             <InfoRow label="Copyright Year" value={formValues?.CopyrightYear + " "+ formValues?.CopyrightholderName} />
            <InfoRow label="Price Band" value={formValues?.PriceCategory} />
            <InfoRow
              label="Digital Release Date"
              value={
                formValues?.DigitalReleaseDate
                  ? dayjs(formValues.DigitalReleaseDate).format("DD/MM/YYYY")
                  : "—"
              }
            />

            <InfoRow
              label="Original Release Date"
              value={
                formValues?.OriginalReleaseDate
                  ? dayjs(formValues.OriginalReleaseDate).format("DD/MM/YYYY")
                  : "N/A"
              }
            />
            
            <InfoRow
              label="Release Time"
              value={
                formValues?.ReleaseTime
                  ? formatTimeTo12Hour(formValues.ReleaseTime)
                  : "N/A"
              }
            />
            <InfoRow label="Copyright Year" value={formValues?.CopyrightYear} />
            <InfoRow label="Label" value={formValues?.AddLabel} />
            <InfoRow
              label="Production"
              value={formValues?.PhonogramRightsHolderName}
            />
            <InfoRow
              label="Various Artists"
              value={formValues?.TrackList?.data?.length > 1 ? "Yes" : "No"}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ReviewScreen;

/* ---------------- Helper Component ---------------- */
const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value?.toString() || "—"}</Text>
  </View>
);

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  row: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
    gap: 16,
  },
  coverArt: {
    width: "100%",
    height: 320,
    aspectRatio: 1,
    borderRadius: 16,
    alignSelf: "center",
  },
  details: {
    flex: 1,
  },
  releaseTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    textTransform: "capitalize",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  separator: {
    height: 2,
    backgroundColor: "#7632C5",
    width: "60%",
    borderRadius: 2,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "column",
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EAEAEA",
  },
  label: {
    fontSize: 16,
    color: Colors.gray,
    width: "48%",
    fontFamily: "Poppins_400Regular",
  },
  value: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: "400",
    width: "48%",
    textAlign: "right",
    fontFamily: "Poppins_400Regular",
  },
});
