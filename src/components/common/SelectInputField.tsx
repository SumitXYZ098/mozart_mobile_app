/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ViewProps } from "react-native";
import { Controller, type Control } from "react-hook-form";
import { Dropdown } from "react-native-element-dropdown";
import { Colors } from "@/theme/colors";

interface ISelectInputFieldProps extends ViewProps {
  label?: string;
  placeholder: string;
  customClassesOuter?: string;
  items: (string | number)[];
  multiple?: boolean;
  value?: string | string[] | number | number[];
  onChange?: (val: string | string[] | number | number[]) => void;
  name?: string;
  control?: Control<any>;
  rules?: any;
  errorMessage?: string;
  zIndex?: number;
}

const SelectInputField: React.FC<ISelectInputFieldProps> = ({
  label,
  placeholder,
  customClassesOuter,
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
  const [dropdownItems, setDropdownItems] = useState(
    items.map((item) => ({ label: String(item), value: item }))
  );
  const [internalValue, setInternalValue] = useState<
    string | string[] | number | number[] | null
  >(value ?? (multiple ? [] : null));

  useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  const renderDropdown = (
    fieldValue: any,
    fieldOnChange: (val: any) => void,
    error?: boolean,
    helperText?: string
  ) => (
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
        data={dropdownItems}
        search
        maxHeight={250}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        searchPlaceholder="Search..."
        value={fieldValue}
        onChange={(item) => {
          const newVal = multiple ? [item.value] : item.value;
          setInternalValue(newVal);
          fieldOnChange(newVal);
          onChange?.(newVal);
        }}
        renderItem={(item) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.label}</Text>
          </View>
        )}
        
      />

      {error && <Text style={styles.errorText}>{helperText}</Text>}
    </View>
  );

  return (
    <View
      style={[
        styles.wrapper,
        customClassesOuter ? { marginBottom: 10 } : null,
        style,
      ]}
    >
      {control && name ? (
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field, fieldState }) =>
            renderDropdown(
              field.value,
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
    fontWeight: "400",
    fontSize: 14,
  },
  dropdown: {
    height: 48,
    borderColor: Colors.gray,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
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
  selectedItem: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedItemText: {
    color: Colors.white,
    fontSize: 12,
  },
  errorText: {
    color: "#FF5A5F",
    fontSize: 12,
    marginTop: 4,
  },
});
