/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Controller, type Control } from "react-hook-form";
import { Dropdown } from "react-native-element-dropdown";
import { Colors } from "@/theme/colors";

interface ISelectInputFieldProps {
  label?: string;
  placeholder: string;
  items: (string | number)[];
  multiple?: boolean;
  value?: string | string[] | number | number[];
  onChange?: (val: string | string[] | number | number[]) => void;
  name?: string;
  control?: Control<any>;
  rules?: any;
  errorMessage?: string;
  zIndex?: number;
  style?: any;
}

const SelectInputField: React.FC<ISelectInputFieldProps> = ({
  label,
  placeholder,
  items,
  multiple = false,
  value,
  onChange,
  name,
  control,
  rules,
  errorMessage,
  zIndex = 10,
  style,
}) => {
  const [dropdownItems] = useState(
    items.map((item) => ({ label: String(item), value: item }))
  );

  const [internalValue, setInternalValue] = useState<
    string | string[] | number | number[] | null
  >(value ?? (multiple ? [] : null));

  useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  const handleSelect = (item: any, fieldOnChange: (val: any) => void) => {
    if (multiple) {
      let updated: any[] = Array.isArray(internalValue)
        ? [...internalValue]
        : [];
      if (updated.includes(item.value)) {
        updated = updated.filter((v) => v !== item.value);
      } else {
        updated.push(item.value);
      }
      setInternalValue(updated);
      fieldOnChange(updated);
      onChange?.(updated);
    } else {
      setInternalValue(item.value);
      fieldOnChange(item.value);
      onChange?.(item.value);
    }
  };

  const renderPills = (selected: any[], fieldOnChange: (val: any) => void) => (
    <View style={styles.pillsContainer}>
      {selected.map((val) => (
        <View key={val.toString()} style={styles.pill}>
          <Text style={styles.pillText}>
            {dropdownItems.find((i) => i.value === val)?.label || val}
          </Text>
          <TouchableOpacity
            onPress={() => {
              const updated = selected.filter((v) => v !== val);
              setInternalValue(updated);
              fieldOnChange(updated);
              onChange?.(updated);
            }}
          >
            <Text style={styles.pillRemove}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderDropdown = (
    fieldValue: any,
    fieldOnChange: (val: any) => void,
    error?: boolean,
    helperText?: string
  ) => {
  const displayValue =
      multiple 
        ? `${fieldValue.length} selected`
        : fieldValue;
    return (
      <View style={[styles.dropdownContainer, { zIndex }]}>
        {label && <Text style={styles.label}>{label}</Text>}

        <Dropdown
          style={[
            styles.dropdown,
            error ? { borderColor: "#FF5A5F" } : { borderColor: Colors.gray },
          ]}
          containerStyle={styles.dropdownList}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.text}
          inputSearchStyle={styles.searchInput}
          iconColor={Colors.primary}
          data={dropdownItems}
          search
          maxHeight={250}
          flatListProps={{ nestedScrollEnabled: true }}
          labelField="label"
          valueField="value"
          placeholder={placeholder}
          searchPlaceholder="Search..."
          value={multiple ? null : displayValue}
          onChange={(item) => handleSelect(item, fieldOnChange)}
          renderItem={(item) => {
            const selected = multiple
              ? (internalValue as any[])?.includes(item.value)
              : internalValue === item.value;
            return (
              <View
                style={[
                  styles.item,
                  selected ? { backgroundColor: "#F3E8FF" } : {},
                ]}
              >
                <Text
                  style={[
                    styles.itemText,
                    selected
                      ? { color: Colors.primary, fontWeight: "600" }
                      : {},
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            );
          }}
        />

        {multiple &&
          Array.isArray(fieldValue) &&
          fieldValue.length > 0 &&
          renderPills(fieldValue, fieldOnChange)}

        {error && <Text style={styles.errorText}>{helperText}</Text>}
      </View>
    );
  };

  return (
    <View style={[styles.wrapper, style]}>
      {control && name ? (
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field, fieldState }) =>
            renderDropdown(
              field.value ?? (multiple ? [] : null),
              field.onChange,
              fieldState.invalid,
              fieldState.error?.message
            )
          }
        />
      ) : (
        renderDropdown(
          internalValue,
          setInternalValue,
          !!errorMessage,
          errorMessage
        )
      )}
    </View>
  );
};

export default SelectInputField;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  dropdownContainer: {
    position: "relative",
  },
  label: {
    marginBottom: 6,
    color: Colors.gray,
    fontSize: 14,
    fontWeight: "500",
  },
  dropdown: {
    height: 48,
    borderColor: Colors.gray,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    justifyContent: "center",
  },
  dropdownList: {
    borderRadius: 8,
    elevation: 8,
    shadowColor: "#000",
  },
  placeholder: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  text: {
    color: Colors.black,
    fontSize: 14,
  },
  searchInput: {
    borderBottomColor: Colors.gray,
    borderBottomWidth: 1,
    height: 40,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  itemText: {
    color: Colors.black,
    fontSize: 14,
  },
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    color: "#fff",
    fontSize: 12,
    marginRight: 6,
  },
  pillRemove: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF5A5F",
    fontSize: 12,
    marginTop: 4,
  },
});
