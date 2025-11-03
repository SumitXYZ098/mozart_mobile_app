/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useFormContext, Controller } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";
import { Colors } from "@/theme/colors";
import { formatDate, getSystemTimeZone } from "@/utils/utils";
import SelectInputField from "@/components/common/SelectInputField";
import { musicStores, priceCategories, timeZones } from ".";
import DatePickerInput from "@/components/common/DatePickerInput";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const DeliveryOption = ({ draftFormData }: { draftFormData?: any }) => {
  const { control, setValue, getValues } = useFormContext();
  const [selectedZone, setSelectedZone] = useState(getSystemTimeZone());
  const [digitalReleaseDate, setDigitalReleaseDate] = useState<Dayjs | null>(
    dayjs().add(1, "day")
  );
  useEffect(() => {
    if (draftFormData?.data) {
      const track = draftFormData.data;

      setValue(
        "DigitalReleaseDate",
        track.DigitalReleaseDate ?? dayjs().add(1, "day").format("YYYY-MM-DD")
      );
      setValue(
        "ReleaseTime",
        track.ReleaseTime ?? dayjs().format("HH:mm:ss.SSS")
      );
      setValue("Priority", track.Priority ?? "Standard");
      setValue(
        "TimeZoneOfReference",
        track.TimeZoneOfReference ?? getSystemTimeZone()
      );
      setValue(
        "OriginalReleaseDate",
        track.OriginalReleaseDate ?? formatDate(new Date())
      );
      setValue("Countries", track.Countries ?? ["Entire World"]);
      setValue("MusicStores", track.MusicStores ?? []);
      setValue("PriceCategory", track.PriceCategory ?? "Budget");

      setDigitalReleaseDate(
        track.DigitalReleaseDate
          ? dayjs(track.DigitalReleaseDate)
          : dayjs().add(1, "day")
      );
      setSelectedZone(track.TimeZoneOfReference || getSystemTimeZone());
    } else {
      // fallback defaults when draft is null/empty
      setValue(
        "DigitalReleaseDate",
        dayjs().add(1, "day").format("YYYY-MM-DD")
      );
      setValue("ReleaseTime", dayjs().format("HH:mm:ss.SSS"));
      setValue("Priority", "Standard");
      setValue("TimeZoneOfReference", getSystemTimeZone());
      setValue("OriginalReleaseDate", formatDate(new Date()));
      setValue("Countries", ["Entire World"]);
      setValue("MusicStores", []);
      setValue("PriceCategory", "Budget");
      setDigitalReleaseDate(dayjs().add(1, "day"));
      setSelectedZone(getSystemTimeZone());
    }
  }, [draftFormData, setValue]);

  // Update time when timezone changes
  useEffect(() => {
    const currentTime = getValues("ReleaseTime");
    const currentZone = getValues("TimeZoneOfReference");

    if (
      currentTime &&
      currentZone &&
      selectedZone &&
      selectedZone !== currentZone
    ) {
      const todayDate = dayjs(
        getValues("DigitalReleaseDate") || dayjs().format("YYYY-MM-DD")
      );

      // Parse current time in current timezone
      const dateTimeInCurrentZone = dayjs.tz(
        `${todayDate.format("YYYY-MM-DD")} ${currentTime}`,
        "YYYY-MM-DD HH:mm:ss.SSS",
        currentZone
      );

      // Convert to new timezone
      const convertedTime = dateTimeInCurrentZone
        .tz(selectedZone)
        .format("HH:mm:ss.SSS");

      setValue("ReleaseTime", convertedTime);
      setValue("TimeZoneOfReference", selectedZone);
    }
  }, [selectedZone, setValue, getValues]);

  const isWithinNext10Days = (date: any) => {
    const today = dayjs();
    const maxDate = today.add(9, "day");
    return date.isAfter(today) && date.isBefore(maxDate.add(1, "day")); // inclusive of maxDate
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Delivery Options</Text>

      {/* Time Zone */}
      <SelectInputField
        control={control}
        name="TimeZoneOfReference"
        label="Time Zone of Reference"
        placeholder="Select Time Zone"
        items={timeZones}
        onChange={(val: string | number | string[] | number[]) =>
          setSelectedZone(Array.isArray(val) ? String(val[0]) : String(val))
        }
      />

      {/* Digital Release Date */}
      <DatePickerInput
        control={control}
        name="DigitalReleaseDate"
        label="Digital Release Date"
        placeholder="Select Date"
        mode="date"
        rules={{ required: "Digital Release Date is required" }}
      />

      {/* Release Time */}
      <DatePickerInput
        control={control}
        name="ReleaseTime"
        label="Release Time"
        placeholder="Select Time"
        mode="time"
        rules={{ required: "Release Time is required" }}
      />

      {/* Priority / Standard cards */}
      <Controller
        name="Priority"
        control={control}
        render={({ field }) => (
          <View style={styles.priorityContainer}>
            <TouchableOpacity
              onPress={() => field.onChange("Priority")}
              style={[
                styles.priorityCard,
                field.value === "Priority" && styles.priorityActive,
              ]}
            >
              <Text
                style={[
                  styles.priorityTitle,
                  field.value === "Priority" && styles.priorityTextActive,
                ]}
              >
                Priority
              </Text>
              <Text style={styles.priorityDesc}>
                Get your music out extra fast (+₹1699)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => field.onChange("Standard")}
              style={[
                styles.priorityCard,
                field.value === "Standard" && styles.priorityActive,
              ]}
            >
              <Text
                style={[
                  styles.priorityTitle,
                  field.value === "Standard" && styles.priorityTextActive,
                ]}
              >
                Standard
              </Text>
              <Text style={styles.priorityDesc}>
                10 days or more (Included)
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Original Release Date */}
      <DatePickerInput
        control={control}
        name="OriginalReleaseDate"
        label="Original Release Date"
        placeholder="Select Date"
        mode="date"
        rules={{ required: "Original Release Date is required" }}
      />

      {/* Countries */}
      <SelectInputField
        control={control}
        name="Countries"
        label="Countries (optional)"
        placeholder="Entire World"
        multiple
        items={["Entire World", "India", "Canada"]}
      />

      {/* Music Stores */}
      <SelectInputField
        control={control}
        name="MusicStores"
        label="Music Stores"
        placeholder="All available"
        multiple
        rules={{ required: "Please select at least one store" }}
        items={musicStores}
      />

      {/* Price Category */}
      <Controller
        name="PriceCategory"
        control={control}
        rules={{ required: "Select a price category" }}
        render={({ field, fieldState }) => (
          <View style={styles.priceContainer}>
            <Text style={styles.label}>Price Category</Text>
            <View style={styles.priceRow}>
              {priceCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => field.onChange(cat)}
                  style={[
                    styles.priceButton,
                    field.value === cat && styles.priceButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.priceText,
                      field.value === cat && styles.priceTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {fieldState.error && (
              <Text style={styles.errorText}>{fieldState.error.message}</Text>
            )}
          </View>
        )}
      />
    </ScrollView>
  );
};

export default DeliveryOption;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 6,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  priorityContainer: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 20,
  },
  priorityCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#F8F8F8",
  },
  priorityActive: {
    backgroundColor: Colors.primary,
  },
  priorityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  priorityDesc: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 6,
  },
  priorityTextActive: {
    color: Colors.white,
  },
  priceContainer: {
    marginTop: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  priceButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginHorizontal: 4,
  },
  priceButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  priceText: {
    color: Colors.black,
    fontWeight: "500",
  },
  priceTextActive: {
    color: Colors.white,
  },
});
