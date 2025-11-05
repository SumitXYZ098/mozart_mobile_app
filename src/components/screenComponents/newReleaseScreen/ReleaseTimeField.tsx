/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  StyleSheet,
} from "react-native";
import { Controller, useWatch } from "react-hook-form";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  format,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Colors } from "@/theme/colors";

type Props = {
  control: any;
  getValues: any;
  setValue: any;
};

const ReleaseTimeField: React.FC<Props> = ({
  control,
  getValues,
  setValue,
}) => {
  const [show, setShow] = useState(false);
  const [tempTime, setTempTime] = useState<Date>(new Date());

  const selectedTimeZoneRaw = useWatch({
    control,
    name: "TimeZoneOfReference",
  });
  const storedTime = useWatch({ control, name: "ReleaseTime" });

  /** Normalize timezone (fallback to UTC) */
  const normalizeTimeZone = (tz: string | undefined): string => {
    if (!tz) return "UTC";
    const clean = tz.split(" ")[0].trim();
    return clean || "UTC";
  };

  const selectedTimeZone = normalizeTimeZone(selectedTimeZoneRaw);

  /** Convert local time (in timezone) → UTC string */
  const zonedTimeToUtc = (date: Date, timeZone: string): string => {
    const utcDate = toZonedTime(date, timeZone);
    return format(utcDate, "HH:mm:ss.SSS");
  };

  /** Parse time string or ISO into local Date */
  const getLocalDate = (utcTime?: string): Date => {
    if (!utcTime) return new Date();

    try {
      // Case 1: ISO or full datetime string
      const isoDate = new Date(utcTime);
      if (!isNaN(isoDate.getTime())) {
        return toZonedTime(isoDate, selectedTimeZone);
      }

      // Case 2: Plain time string (HH:mm:ss or HH:mm:ss.SSS)
      const [h = "0", m = "0", sMs = "0.000"] = utcTime.split(":");
      const [s = "0", ms = "000"] = sMs.includes(".")
        ? sMs.split(".")
        : [sMs, "000"];

      const now = new Date();
      const utcDate = setMilliseconds(
        setSeconds(setMinutes(setHours(now, Number(h)), Number(m)), Number(s)),
        Number(ms)
      );

      return toZonedTime(utcDate, selectedTimeZone);
    } catch (err) {
      console.warn("Invalid ReleaseTime:", utcTime, err);
      return new Date();
    }
  };

  /** Recalculate time when timezone or storedTime changes */
  useEffect(() => {
    if (!storedTime) {
      const nowLocal = toZonedTime(new Date(), selectedTimeZone);
      const formatted = format(nowLocal, "HH:mm:ss.SSS");
      setValue("ReleaseTime", formatted, { shouldDirty: true });
      setTempTime(nowLocal);
    } else {
      const newLocal = getLocalDate(storedTime);
      setTempTime(newLocal);
    }
  }, [storedTime, selectedTimeZone, getValues, setValue]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Release Time</Text>

      <Controller
        name="ReleaseTime"
        control={control}
        rules={{ required: "Release Time is required" }}
        render={({ field: { value, onChange }, fieldState }) => {
          let displayTime = "Select time";
          try {
            if (value) {
              const parsed = getLocalDate(value);
              if (!isNaN(parsed.getTime())) {
                displayTime = format(parsed, "hh:mm a");
              }
            }
          } catch {
            displayTime = "Select time";
          }

          return (
            <>
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
                  {displayTime}
                </Text>
              </TouchableOpacity>

              {/* iOS Picker */}
              {Platform.OS === "ios" ? (
                <Modal visible={show} transparent animationType="slide">
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                      <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShow(false)}>
                          <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Select Time</Text>
                        <TouchableOpacity
                          onPress={() => {
                            const formatted = zonedTimeToUtc(
                              tempTime,
                              selectedTimeZone
                            );
                            onChange(formatted);
                            setShow(false);
                          }}
                        >
                          <Text style={styles.doneText}>Done</Text>
                        </TouchableOpacity>
                      </View>

                      <DateTimePicker
                        value={tempTime}
                        mode="time"
                        display="spinner"
                        onChange={(_, selectedDate) => {
                          if (selectedDate) setTempTime(selectedDate);
                        }}
                      />
                    </View>
                  </View>
                </Modal>
              ) : (
                // Android Picker
                show && (
                  <DateTimePicker
                    value={tempTime}
                    mode="time"
                    display="default"
                    onChange={(
                      event: DateTimePickerEvent,
                      selectedDate?: Date
                    ) => {
                      if (event.type === "dismissed") {
                        setShow(false);
                        return;
                      }
                      if (selectedDate) {
                        const formatted = zonedTimeToUtc(
                          selectedDate,
                          selectedTimeZone
                        );
                        onChange(formatted);
                        setShow(false);
                      }
                    }}
                  />
                )
              )}

              {fieldState.error && (
                <Text style={styles.errorText}>{fieldState.error.message}</Text>
              )}
            </>
          );
        }}
      />
    </View>
  );
};

export default ReleaseTimeField;

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 16, fontWeight: "600", color: Colors.black },
  cancelText: { color: Colors.gray, fontSize: 15 },
  doneText: { color: Colors.primary, fontWeight: "600", fontSize: 15 },
});
