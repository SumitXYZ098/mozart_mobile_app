/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Controller, Control } from "react-hook-form";
import dayjs from "dayjs";
import { Colors } from "@/theme/colors";

type DatePickerInputProps = {
  label?: string;
  placeholder?: string;
  control: Control<any>;
  name: string;
  mode?: "date" | "time" | "year";
  rules?: any;
};

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  placeholder = "Select date",
  control,
  name,
  mode = "date",
  rules,
}) => {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  // ✅ Always return a valid date (default: now)
  const getSafeDate = (val: any): Date => {
    if (val instanceof Date && !isNaN(val.getTime())) return val;
    return new Date(); // default current date/time/year
  };

  const formatDisplayValue = (value: Date | undefined) => {
    if (!value) return placeholder;
    if (mode === "year") return dayjs(value).format("YYYY");
    if (mode === "time") return dayjs(value).format("hh:mm A");
    return dayjs(value).format("DD-MM-YYYY");
  };

  // 👇 Generate year list dynamically
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 70 }, (_, i) => currentYear - i);

  const renderYearPicker = (
    value: Date | undefined,
    onChange: (date: Date) => void
  ) => (
    <Modal visible={show} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.yearModal}>
          <Text style={styles.modalTitle}>Select Year</Text>
          <FlatList
            data={years}
            keyExtractor={(item) => item.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(item, 0, 1);
                  onChange(newDate);
                  setShow(false);
                }}
                style={[
                  styles.yearItem,
                  value && dayjs(value).year() === item && {
                    backgroundColor: Colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.yearText,
                    value && dayjs(value).year() === item && {
                      color: Colors.white,
                    },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={() => setShow(false)} style={styles.closeButton}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { value, onChange }, fieldState }) => {
        const safeValue = getSafeDate(value);

        return (
          <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TouchableOpacity
              onPress={() => {
                setTempDate(safeValue);
                setShow(true);
              }}
              style={[
                styles.input,
                fieldState.invalid && { borderColor: Colors.error },
              ]}
            >
              <Text
                style={{
                  color: value ? Colors.black : Colors.gray,
                  fontSize: 14,
                }}
              >
                {formatDisplayValue(safeValue)}
              </Text>
            </TouchableOpacity>

            {/* Year picker modal */}
            {mode === "year"
              ? renderYearPicker(safeValue, (date) => {
                  onChange(getSafeDate(date));
                })
              : Platform.OS === "ios"
              ? (
                <Modal
                  visible={show}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShow(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.iosPickerContainer}>
                      <View style={styles.iosHeader}>
                        <TouchableOpacity onPress={() => setShow(false)}>
                          <Text style={styles.iosCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.iosTitle}>
                          Select {mode === "time" ? "Time" : "Date"}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setShow(false);
                            onChange(getSafeDate(tempDate));
                          }}
                        >
                          <Text style={styles.iosDone}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={tempDate}
                        mode={mode}
                        display="spinner"
                        onChange={(
                          event: DateTimePickerEvent,
                          selectedDate?: Date
                        ) => {
                          if (selectedDate) setTempDate(selectedDate);
                        }}
                        style={{ backgroundColor: Colors.white }}
                      />
                    </View>
                  </View>
                </Modal>
              )
              : (
                show && (
                  <DateTimePicker
                    value={safeValue}
                    mode={mode}
                    display="default"
                    onChange={(
                      event: DateTimePickerEvent,
                      selectedDate?: Date
                    ) => {
                      if (Platform.OS === "android") setShow(false);
                      if (selectedDate) {
                        onChange(getSafeDate(selectedDate));
                      } else if (event.type === "dismissed") {
                        setShow(false);
                        // ✅ Ensure default current date if dismissed with no selection
                        onChange(getSafeDate(value));
                      }
                    }}
                  />
                )
              )}

            {fieldState.error && (
              <Text style={styles.errorText}>{fieldState.error.message}</Text>
            )}
          </View>
        );
      }}
    />
  );
};

export default DatePickerInput;

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { marginBottom: 6, color: Colors.gray, fontWeight: "500", fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  errorText: { color: Colors.error, fontSize: 12, marginTop: 4 },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  yearModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    maxHeight: "60%",
  },
  modalTitle: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 10,
  },
  yearItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
    borderRadius: 8,
    alignItems: "center",
  },
  yearText: { fontSize: 16, color: Colors.black },
  closeButton: { marginTop: 10, alignSelf: "center" },
  closeText: { color: Colors.primary, fontWeight: "500" },
  iosPickerContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 0,
  },
  iosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  iosTitle: { fontSize: 16, fontWeight: "600", color: Colors.black },
  iosCancel: { color: Colors.gray, fontSize: 15 },
  iosDone: { color: Colors.primary, fontWeight: "600", fontSize: 15 },
});
