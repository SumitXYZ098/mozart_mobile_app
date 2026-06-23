/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
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
import { MaterialIcons } from "@expo/vector-icons";
import CalendarPicker from "react-native-calendar-picker";
import ReleaseTimeField from "../ReleaseTimeField";
import { useCurrencyPricing } from "@/hooks/useCurrencyPricing";

dayjs.extend(utc);
dayjs.extend(timezone);

const DeliveryOption = ({ draftFormData }: { draftFormData?: any }) => {
  const { control, setValue, getValues } = useFormContext();
  const [selectedZone, setSelectedZone] = useState(getSystemTimeZone());
  const [digitalReleaseDate, setDigitalReleaseDate] = useState<Dayjs | null>(
    dayjs().add(1, "day")
  );
  const [digitalShow, setDigitalShow] = useState(false);
  const [show, setShow] = useState(false);

  // 📝 Music Stores Bottom Sheet States
  const [storeModalVisible, setStoreModalVisible] = useState(false);
  const [storeSelectionMode, setStoreSelectionMode] = useState<"all" | "custom" | null>(null);
  const [tempSelectedStores, setTempSelectedStores] = useState<string[]>([]);

  const { symbol, convertedPrice, currency } = useCurrencyPricing({
    indiaPrice: 1099,
    canadaPrice: 12,
    usaPrice: 9,
  });

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

  useEffect(() => {
    const currentTime = getValues("ReleaseTime");
    const currentZone = getValues("TimeZoneOfReference");

    if (!currentTime || !selectedZone) return;

    const normalize = (tz: string | undefined) =>
      tz ? tz.split(" ")[0].trim() : "UTC";

    const oldZone = normalize(currentZone);
    const newZone = normalize(selectedZone);

    if (oldZone === newZone) return;

    try {
      const utcTime = dayjs.utc(currentTime, "HH:mm:ss.SSS");
      const localTimeInOldZone = utcTime.tz(oldZone);
      const converted = localTimeInOldZone.tz(newZone);

      setValue("ReleaseTime", converted.utc().format("HH:mm:ss.SSS"));
      setValue("TimeZoneOfReference", selectedZone);
    } catch (err) {
      console.warn("Time zone conversion failed:", err);
    }
  }, [selectedZone]);

  const isWithinNext10Days = (date: any) => {
    const today = dayjs();
    const maxDate = today.add(9, "day");
    return date.isAfter(today) && date.isBefore(maxDate.add(1, "day"));
  };

  return (
    <View style={styles.container}>
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
              <TouchableOpacity
                style={[
                  styles.input,
                  fieldState.error && { borderColor: Colors.error },
                ]}
                onPress={() => setDigitalShow(true)}
              >
                <Text style={{ color: value ? Colors.black : Colors.gray, fontSize: 14 }}>
                  {formatted}
                </Text>
              </TouchableOpacity>

              <Modal visible={digitalShow} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={styles.calendarContainer}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select Digital Release Date</Text>
                      <TouchableOpacity onPress={() => setDigitalShow(false)}>
                        <Text style={styles.closeText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>

                    <CalendarPicker
                      minDate={dayjs().add(1, "day").toDate()}
                      todayBackgroundColor={Colors.lightPrimary}
                      selectedDayColor={Colors.primary}
                      selectedDayTextColor={Colors.white}
                      selectedDayStyle={{ backgroundColor: Colors.primary }}
                      onDateChange={(date) => {
                        if (date) {
                          const formattedDate = dayjs(date).format("YYYY-MM-DD");
                          onChange(formattedDate);
                          setDigitalReleaseDate(dayjs(date));
                          setDigitalShow(false);
                        }
                      }}
                      customDatesStyles={Array.from({ length: 10 }).map((_, i) => {
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
                      })}
                    />
                    <Text style={styles.note}>⚡ Dates within next 10 days are highlighted</Text>
                  </View>
                </View>
              </Modal>

              {fieldState.error && <Text style={styles.errorText}>{fieldState.error.message}</Text>}
            </View>
          );
        }}
      />

      {/* Release Time */}
      <ReleaseTimeField control={control} setValue={setValue} getValues={getValues} />

      {/* Priority / Standard cards */}
      <Controller
        name="Priority"
        control={control}
        render={({ field }) => {
          const date = digitalReleaseDate ? dayjs(digitalReleaseDate) : null;
          const disableStandard = date && isWithinNext10Days(date);
          const disablePriority = date && !isWithinNext10Days(date);

          if (disableStandard && field.value === "Standard") {
            field.onChange("Priority");
          } else if (disablePriority && field.value === "Priority") {
            field.onChange("Standard");
          }

          return (
            <View style={styles.row}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => !disablePriority && field.onChange("Priority")}
                style={[
                  styles.card,
                  field.value === "Priority" && styles.selectedCard,
                  disablePriority && styles.disabledCard,
                ]}
              >
                <Text style={[styles.title, field.value === "Priority" && styles.selectedText]}>
                  Priority
                </Text>
                <Text style={styles.subText}>Any Date within 24 hours</Text>
                <Text style={styles.desc}>
                  Skip the queue to get your music out extra fast or give yourself more time to pitch for playlists.
                </Text>
                <View style={styles.footer}>
                  <Text style={[styles.price, field.value === "Priority" && styles.selectedText]}>
                    +{symbol}{convertedPrice} {currency}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => !disableStandard && field.onChange("Standard")}
                style={[
                  styles.card,
                  field.value === "Standard" && styles.selectedCard,
                  disableStandard && styles.disabledCard,
                ]}
              >
                <Text style={[styles.title, field.value === "Standard" && styles.selectedText]}>
                  Standard
                </Text>
                <Text style={styles.subText}>10 Days+ from Current Date</Text>
                <Text style={styles.desc}>
                  We'll let you know when your music has been processed and sent to stores.
                </Text>
                <View style={styles.footer}>
                  <Text style={[styles.price, field.value === "Standard" && styles.selectedText]}>
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
          const formatted = value ? dayjs(value).format("DD/MM/YYYY") : "Select date";
          const digitalReleaseDate = getValues("DigitalReleaseDate");
          const maxDate = digitalReleaseDate ? dayjs(digitalReleaseDate).toDate() : undefined;

          return (
            <View style={styles.digitalContainer}>
              <Text style={styles.digitalLabel}>Original Release Date</Text>
              <TouchableOpacity
                style={[styles.input, fieldState.error && { borderColor: Colors.error }]}
                onPress={() => setShow(true)}
              >
                <Text style={{ color: value ? Colors.black : Colors.gray, fontSize: 14 }}>
                  {formatted}
                </Text>
              </TouchableOpacity>

              <Modal visible={show} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={styles.calendarContainer}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select Original Release Date</Text>
                      <TouchableOpacity onPress={() => setShow(false)}>
                        <Text style={styles.closeText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                    <CalendarPicker
                      maxDate={maxDate}
                      todayBackgroundColor={Colors.lightPrimary}
                      selectedDayColor={Colors.primary}
                      selectedDayTextColor={Colors.white}
                      selectedDayStyle={{ backgroundColor: Colors.primary }}
                      onDateChange={(date) => {
                        if (date) {
                          const formattedDate = dayjs(date).format("YYYY-MM-DD");
                          onChange(formattedDate);
                          setShow(false);
                        }
                      }}
                    />
                  </View>
                </View>
              </Modal>
              {fieldState.error && <Text style={styles.errorText}>{fieldState.error.message}</Text>}
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
        multiple
        items={["Entire World", "India", "Canada"]}
      />

      {/* 📊 Music Stores Bottom Sheet with Images Fixed */}
      <Controller
        name="MusicStores"
        control={control}
        rules={{ required: "Please select at least one store" }}
        render={({ field: { value = [], onChange }, fieldState }) => {
          const selectedCount = value?.length || 0;
          const displayValue = selectedCount > 0 ? `${selectedCount} Stores Selected` : "Select Stores";

          const toggleStore = (storeId: string, storeName: string) => {
            const isSel = tempSelectedStores.includes(storeId) || tempSelectedStores.includes(storeName);
            if (isSel) {
              setTempSelectedStores(tempSelectedStores.filter((id: string) => id !== storeId && id !== storeName));
              setStoreSelectionMode("custom");
            } else {
              setTempSelectedStores([...tempSelectedStores, storeId]);
            }
          };

          const handleSelectAll = () => {
            if (storeSelectionMode === "all") {
              setStoreSelectionMode("custom");
              setTempSelectedStores([]);
            } else {
              setStoreSelectionMode("all");
              const allStoreIds = musicStores.map((s: any) => s.id || s);
              setTempSelectedStores(allStoreIds);
            }
          };

          return (
            <View style={styles.digitalContainer}>
              <Text style={styles.digitalLabel}>Music Stores</Text>
              <TouchableOpacity
                style={[styles.input, fieldState.error && { borderColor: Colors.error }]}
                onPress={() => {
                  setTempSelectedStores([...value]);
                  const allStoreIds = musicStores.map((s: any) => s.id || s);
                  const isAll = allStoreIds.every((id: string) => value.includes(id));
                  setStoreSelectionMode(isAll ? "all" : "custom");
                  setStoreModalVisible(true);
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: selectedCount > 0 ? Colors.black : Colors.gray, fontSize: 14 }}>
                    {displayValue}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color={Colors.gray} />
                </View>
              </TouchableOpacity>

              <Modal visible={storeModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={styles.bottomSheetContainer}>
                    <View style={styles.bsHeader}>
                      <View>
                        <Text style={styles.bsTitle}>Digital Stores</Text>
                        <Text style={styles.bsSubtitle}>Which Stores would you like</Text>
                      </View>
                      <TouchableOpacity onPress={() => setStoreModalVisible(false)}>
                        <MaterialIcons name="close" size={24} color={Colors.black} />
                      </TouchableOpacity>
                    </View>

                    {/* Top Strategies */}
                    <View style={styles.strategyContainer}>
                      <TouchableOpacity style={styles.strategyRow} onPress={handleSelectAll}>
                        <MaterialIcons
                          name={storeSelectionMode === "all" ? "check-box" : "check-box-outline-blank"}
                          size={24}
                          color={storeSelectionMode === "all" ? Colors.primary : Colors.gray}
                        />
                        <View style={{ marginLeft: 10 }}>
                          <Text style={styles.strategyTitle}>All stores</Text>
                          <Text style={styles.strategyDesc}>Select all stores.</Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.strategyRow} onPress={() => setStoreSelectionMode("custom")}>
                        <MaterialIcons
                          name={storeSelectionMode === "custom" ? "check-box" : "check-box-outline-blank"}
                          size={24}
                          color={storeSelectionMode === "custom" ? Colors.primary : Colors.gray}
                        />
                        <View style={{ marginLeft: 10 }}>
                          <Text style={styles.strategyTitle}>Custom selection of stores</Text>
                          <Text style={styles.strategyDesc}>Choose your own mix of streaming, download and social platforms.</Text>
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* 🖼 Store Row Items rendered with Real Image assets */}
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                      {musicStores.map((store: any) => {
                        const storeId = store.id || store;
                        const storeName = store.name || store;
                        const storeSub = store.subText || "STORE";
                        const isSelected = tempSelectedStores.includes(storeId) || tempSelectedStores.includes(storeName);

                        const LogoComponent = store.logo;
                        // Handle image source securely (URI string or local module requirement)
                        const imageSource = typeof store.logo === "string" ? { uri: store.logo } : store.logo;

                        return (
                          <TouchableOpacity
                            key={storeId}
                            style={styles.storeItemRow}
                            onPress={() => toggleStore(storeId, storeName)}
                          >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                              {LogoComponent ? (
                                typeof LogoComponent === "function" || typeof LogoComponent === "object" ? (
                                  <View style={[styles.storeLogoImage, { justifyContent: "center", alignItems: "center", overflow: "hidden", backgroundColor: "transparent" }]}>
                                    <LogoComponent width={40} height={40} />
                                  </View>
                                ) : (
                                  <Image
                                    source={imageSource}
                                    style={styles.storeLogoImage}
                                    resizeMode="cover"
                                  />
                                )
                              ) : (
                                <View style={styles.storeLogoFallback}>
                                  <Text style={{ fontSize: 10, fontWeight: "bold" }}>{storeName.slice(0, 2).toUpperCase()}</Text>
                                </View>
                              )}
                              <View style={{ marginLeft: 12 }}>
                                <Text style={styles.storeNameText}>{storeName}</Text>
                                <Text style={styles.storeSubText}>{storeSub}</Text>
                              </View>
                            </View>
                            <MaterialIcons
                              name={isSelected ? "check-box" : "check-box-outline-blank"}
                              size={24}
                              color={isSelected ? Colors.primary : "#D1D1D6"}
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    {/* Cancel & Save Buttons */}
                    <View style={styles.modalFooter}>
                      <TouchableOpacity
                        style={[styles.modalBtn, styles.modalCancelBtn]}
                        onPress={() => setStoreModalVisible(false)}
                      >
                        <Text style={styles.modalCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalBtn, styles.modalSaveBtn]}
                        onPress={() => {
                          onChange(tempSelectedStores);
                          setStoreModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalSaveText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
              {fieldState.error && <Text style={styles.errorText}>{fieldState.error.message}</Text>}
            </View>
          );
        }}
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
                  <Text style={[styles.priceText, field.value === cat && styles.priceTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {fieldState.error && <Text style={styles.errorText}>{fieldState.error.message}</Text>}
          </View>
        )}
      />
    </View>
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
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeader: {
    width: "100%",
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

  /* 📊 Bottom Sheet Container Layout */
  bottomSheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    maxHeight: "85%",
  },
  bsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  bsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
  },
  bsSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  strategyContainer: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 16,
    gap: 16,
    marginBottom: 20,
  },
  strategyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  strategyDesc: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
    paddingRight: 20,
  },
  storeItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  storeLogoImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E5E5EA",
  },
  storeLogoFallback: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
  },
  storeNameText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
  },
  storeSubText: {
    fontSize: 11,
    color: "#AEAEB2",
    textTransform: "uppercase",
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: "row",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: Colors.white,
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelBtn: {
    backgroundColor: "#F3F3F3",
  },
  modalSaveBtn: {
    backgroundColor: Colors.primary,
  },
  modalCancelText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "700",
  },
  modalSaveText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});