/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Keyboard,
} from "react-native";
import { useFormContext } from "react-hook-form";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import { useAddLabel, useLabelsList } from "@/hooks/useLabelsList";
import BaseBottomSheet, {
  BaseBottomSheetRef,
} from "@/components/modules/baseBottomSheet/BaseBottomSheet";
import InputField from "@/components/modules/InputField";

const LabelSelector = ({ controllerName }: { controllerName: string }) => {
  const { control, setValue, watch } = useFormContext();
  const selectedLabel = watch(controllerName); // 👈 watch the current label

  const { data, isFetching, refetch } = useLabelsList();
  const { mutateAsync: addLabelMutation, isPending } = useAddLabel();

  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState("");

  const labelSheetRef = useRef<BaseBottomSheetRef>(null);
  const addLabelSheetRef = useRef<BaseBottomSheetRef>(null);

  // Populate labels from API
  useEffect(() => {
    if (data?.data) {
      const labelNames = data.data.map((labelItem: any) => labelItem.label);
      setLabels(labelNames);
    }
  }, [data]);

  const handleAddLabel = async () => {
    const trimmed = newLabel.trim();
    if (trimmed && !labels.includes(trimmed)) {
      try {
        await addLabelMutation(trimmed);
        await refetch();
        setLabels((prev) => [...prev, trimmed]);
        setValue(controllerName, trimmed);
        setNewLabel("");
        addLabelSheetRef.current?.dismiss();
      } catch (err) {
        console.error("Failed to add label:", err);
      }
    } else {
      addLabelSheetRef.current?.dismiss();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Label</Text>

      <TouchableOpacity
        style={styles.selectorButton}
        disabled={isFetching}
        onPress={() => labelSheetRef.current?.expand()}
      >
        <Text style={styles.selectorText}>
          {selectedLabel || "Choose or Add Label"}
        </Text>
        <Ionicons name="chevron-down" size={18} color={Colors.gray} />
      </TouchableOpacity>

      {/* Label Selection Sheet */}
      <BaseBottomSheet ref={labelSheetRef} title="Select Label">
        <View style={styles.sheetContent}>
          {isFetching ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            <FlatList
              data={labels}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = item === selectedLabel;
                return (
                  <TouchableOpacity
                    style={[
                      styles.labelItem,
                      isSelected && styles.selectedLabelItem,
                    ]}
                    onPress={() => {
                      setValue(controllerName, item);
                      labelSheetRef.current?.dismiss();
                    }}
                  >
                    <MaterialIcons
                      name="label"
                      size={20}
                      color={isSelected ? Colors.primary : Colors.gray}
                    />
                    <Text
                      style={[
                        styles.labelText,
                        isSelected && styles.selectedLabelText,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={Colors.primary}
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No labels found</Text>
              }
            />
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              labelSheetRef.current?.dismiss();
              addLabelSheetRef.current?.expand();
            }}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text style={styles.addButtonText}>Add New Label</Text>
          </TouchableOpacity>
        </View>
      </BaseBottomSheet>

      {/* Add Label Sheet */}
      <BaseBottomSheet ref={addLabelSheetRef} title="Add New Label">
          <View style={styles.sheetContent}>
            <InputField
              placeholder="Enter label name"
              style={styles.input}
              placeholderTextColor={Colors.gray}
              value={newLabel}
              onChangeText={setNewLabel}
            />
            <TouchableOpacity
              style={[styles.saveButton, isPending && { opacity: 0.7 }]}
              disabled={isPending}
              onPress={async () => {
                await handleAddLabel();
                Keyboard.dismiss(); // 👈 ensures the keyboard closes after saving
              }}
            >
              <Ionicons name="save" size={18} color={Colors.white} />
              <Text style={styles.saveButtonText}>
                {isPending ? "Adding..." : "Save Label"}
              </Text>
            </TouchableOpacity>
          </View>
      </BaseBottomSheet>
    </View>
  );
};

export default LabelSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    width: "100%",
    marginBottom:20
  },
  title: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: "600",
    marginBottom: 8,
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  selectorText: {
    color: Colors.black,
    fontSize: 14,
  },
  sheetContent: {
    paddingVertical: 10,
  },
  loadingText: {
    textAlign: "center",
    color: Colors.gray,
    paddingVertical: 16,
  },
  labelItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  selectedLabelItem: {
    backgroundColor: "#F3F7FF",
  },
  labelText: {
    marginLeft: 8,
    color: Colors.gray,
    fontSize: 16,
  },
  selectedLabelText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: Colors.gray,
    paddingVertical: 20,
  },
  addButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: "600",
    marginLeft: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.gray,
    backgroundColor: "#F9FAFB",
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: Colors.white,
    fontWeight: "600",
    marginLeft: 6,
  },
});
