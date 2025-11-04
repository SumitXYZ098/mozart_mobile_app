/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { useFormContext, Controller } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";
import { Colors } from "@/theme/colors";
import { formatDate, getSystemTimeZone, timeZones } from "@/utils/utils";
import SelectInputField from "@/components/common/SelectInputField";
import { musicStores, priceCategories } from ".";
import DatePickerInput from "@/components/common/DatePickerInput";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { MaterialIcons } from "@expo/vector-icons";
import CalendarPicker from "react-native-calendar-picker";

dayjs.extend(utc);
dayjs.extend(timezone);

const DeliveryOption = ({ draftFormData }: { draftFormData?: any }) => {
  const { control, setValue, getValues } = useFormContext();
  const [selectedZone, setSelectedZone] = useState(getSystemTimeZone());
  const [digitalReleaseDate, setDigitalReleaseDate] = useState<Dayjs | null>(
    dayjs().add(1, "day")
  );
  const [show, setShow] = useState(false);
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
      />

      {/* Digital Release Date */}
      <Controller
        control={control}
        name="DigitalReleaseDate"
        rules={{ required: "Digital Release Date is required" }}
        render={({ field: { value, onChange }, fieldState }) => {
          const formatted = value
            ? dayjs(value).format("DD/MM/YYYY")
            : "Select date";

          return (
            <View style={styles.digitalContainer}>
              <Text style={styles.digitalLabel}>Digital Release Date</Text>

              {/* Touchable to open modal */}
              <TouchableOpacity
                style={[
                  styles.input,
                  fieldState.error && { borderColor: Colors.error },
                ]}
                onPress={() => setShow(true)}
              >
                <Text
                  style={{
                    color: value ? Colors.black : Colors.gray,
                    fontSize: 14,
                  }}
                >
                  {formatted}
                </Text>
              </TouchableOpacity>

              {/* Calendar modal */}
              <Modal visible={show} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={styles.calendarContainer}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>
                        Select Digital Release Date
                      </Text>
                      <TouchableOpacity onPress={() => setShow(false)}>
                        <Text style={styles.closeText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>

                    <CalendarPicker
                      minDate={dayjs().add(1, "day").toDate()} // tomorrow onwards
                      todayBackgroundColor={Colors.lightPrimary}
                      selectedDayColor={Colors.primary}
                      selectedDayTextColor={Colors.white}
                      onDateChange={(date) => {
                        if (date) {
                          const formattedDate =
                            dayjs(date).format("YYYY-MM-DD");
                          onChange(formattedDate);
                          setDigitalReleaseDate(dayjs(date));
                          setShow(false);
                        }
                      }}
                      customDatesStyles={Array.from({ length: 10 }).map(
                        (_, i) => {
                          const d = dayjs().add(i + 1, "day");
                          return {
                            date: d.toDate(),
                            style: {
                              backgroundColor: Colors.lightPrimary,
                              borderRadius: 8,
                            },
                            textStyle: { color: Colors.black },
                            allowDisabled: true,
                          };
                        }
                      )}
                    />

                    <Text style={styles.note}>
                      ⚡ Dates within next 10 days are highlighted
                    </Text>
                  </View>
                </View>
              </Modal>

              {/* Validation error */}
              {fieldState.error && (
                <Text style={styles.errorText}>{fieldState.error.message}</Text>
              )}
            </View>
          );
        }}
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
        render={({ field }) => {
          const date = digitalReleaseDate ? dayjs(digitalReleaseDate) : null;
          const disableStandard = date && isWithinNext10Days(date);
          const disablePriority = date && !isWithinNext10Days(date);

          // ✅ Auto-fix invalid state
          if (disableStandard && field.value === "Standard") {
            field.onChange("Priority");
          } else if (disablePriority && field.value === "Priority") {
            field.onChange("Standard");
          }

          return (
            <View style={styles.row}>
              {/* Priority Card */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => !disablePriority && field.onChange("Priority")}
                style={[
                  styles.card,
                  field.value === "Priority" && styles.selectedCard,
                  disablePriority && styles.disabledCard,
                ]}
              >
                <Text
                  style={[
                    styles.title,
                    field.value === "Priority" && styles.selectedText,
                  ]}
                >
                  Priority
                </Text>

                <Text style={styles.subText}>Any Date within 24 hours</Text>
                <Text style={styles.desc}>
                  Skip the queue to get your music out extra fast or give
                  yourself more time to pitch for playlists.
                </Text>

                <View style={styles.footer}>
                  <Text
                    style={[
                      styles.price,
                      field.value === "Priority" && styles.selectedText,
                    ]}
                  >
                    +₹1699
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Standard Card */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => !disableStandard && field.onChange("Standard")}
                style={[
                  styles.card,
                  field.value === "Standard" && styles.selectedCard,
                  disableStandard && styles.disabledCard,
                ]}
              >
                <Text
                  style={[
                    styles.title,
                    field.value === "Standard" && styles.selectedText,
                  ]}
                >
                  Standard
                </Text>

                <Text style={styles.subText}>10 Days+ from Current Date</Text>
                <Text style={styles.desc}>
                  We'll let you know when your music has been processed and sent
                  to stores.
                </Text>

                <View style={styles.footer}>
                  <Text
                    style={[
                      styles.price,
                      field.value === "Standard" && styles.selectedText,
                    ]}
                  >
                    Included
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Original Release Date */}
      <Controller
        name="OriginalReleaseDate"
        control={control}
        rules={{ required: "Original Release Date is required" }}
        render={({ field: { value, onChange }, fieldState }) => {
          const formatted = value
            ? dayjs(value).format("DD/MM/YYYY")
            : "Select date";

          // 🗓 Maximum date = DigitalReleaseDate
          const digitalReleaseDate = getValues("DigitalReleaseDate");
          const maxDate = digitalReleaseDate
            ? dayjs(digitalReleaseDate).toDate()
            : undefined;

          return (
            <View style={styles.digitalContainer}>
              <Text style={styles.digitalLabel}>Original Release Date</Text>

              {/* Touchable Input */}
              <TouchableOpacity
                style={[
                  styles.input,
                  fieldState.error && { borderColor: Colors.error },
                ]}
                onPress={() => setShow(true)}
              >
                <Text
                  style={{
                    color: value ? Colors.black : Colors.gray,
                    fontSize: 14,
                  }}
                >
                  {formatted}
                </Text>
              </TouchableOpacity>

              {/* Calendar Modal */}
              <Modal visible={show} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={styles.calendarContainer}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>
                        Select Original Release Date
                      </Text>
                      <TouchableOpacity onPress={() => setShow(false)}>
                        <Text style={styles.closeText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>

                    <CalendarPicker
                      maxDate={maxDate}
                      todayBackgroundColor={Colors.lightPrimary}
                      selectedDayColor={Colors.primary}
                      selectedDayTextColor={Colors.white}
                      onDateChange={(date) => {
                        if (date) {
                          const formattedDate =
                            dayjs(date).format("YYYY-MM-DD");
                          onChange(formattedDate);
                          setShow(false);
                        }
                      }}
                    />
                  </View>
                </View>
              </Modal>

              {/* Validation Error */}
              {fieldState.error && (
                <Text style={styles.errorText}>{fieldState.error.message}</Text>
              )}
            </View>
          );
        }}
      />

      {/* Countries */}
      <SelectInputField
        control={control}
        name="Countries"
        label="Countries (optional)"
        placeholder="Entire World"
        items={["Entire World", "India", "Canada"]}
      />

      {/* Music Stores */}
      <SelectInputField
        control={control}
        name="MusicStores"
        label="Music Stores"
        placeholder="All available"
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
  digitalContainer: { marginBottom: 16 },
  digitalLabel: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  calendarContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  closeText: { color: Colors.primary, fontWeight: "500" },
  note: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
    color: Colors.gray,
  },
  row: {
    flexDirection: "column",
    gap: 10,
    width: "100%",
    marginBottom: 12,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#F8F8F8",
    justifyContent: "space-between",
  },
  selectedCard: {
    backgroundColor: Colors.primary,
  },
  disabledCard: {
    opacity: 0.5,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
  },
  subText: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.gray,
  },
  desc: {
    marginTop: 10,
    fontSize: 12,
    color: Colors.gray,
  },
  footer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
  },
  selectedText: {
    color: Colors.white,
  },
  priceContainer: {
    marginTop: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  priceButton: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
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
