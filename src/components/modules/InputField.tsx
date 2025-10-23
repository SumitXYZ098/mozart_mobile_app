import React, { useState } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  Text,
  TextInputProps,
  Pressable,
} from "react-native";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Search,
  User,
  Lock,
  X,
} from "lucide-react-native";
import { Colors } from "@/theme/colors";

interface Props extends TextInputProps {
  label?: string;
  type?: "text" | "email" | "password" | "number" | "search";
  error?: string;
}

export default function InputField({ label, type, error, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  // Use value passed from parent (controlled input). react-hook-form will control this.
  const controlledValue = (props.value as string) ?? "";

  const renderLeftIcon = () => {
    switch (type) {
      case "email":
        return <Mail size={20} color={Colors.primary} />;
      case "password":
        return <Lock size={20} color={Colors.primary} />;
      case "number":
        return <Phone size={20} color={Colors.primary} />;
      case "search":
        return <Search size={20} color={Colors.primary} />;
      default:
        return <User size={20} color={Colors.primary} />;
    }
  };

  const renderRightIcon = () => {
    if (type === "password") {
      return (
        <Pressable onPress={() => setVisible(!visible)} hitSlop={10}>
          {visible ? (
            <Eye size={20} color={Colors.gray} />
          ) : (
            <EyeOff size={20} color={Colors.gray} />
          )}
        </Pressable>
      );
    }

    if (type === "search" && controlledValue.length > 0) {
      return (
        <Pressable
          onPress={() => props.onChangeText && props.onChangeText("")}
          hitSlop={10}
        >
          <X size={20} color={Colors.gray} />
        </Pressable>
      );
    }

    return null;
  };

  return (
    <View
      style={{
        marginBottom: error ? 8 : 16,
        flex: 1,
      }}
    >
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          { borderColor: error ? Colors.error : Colors.gray },
        ]}
      >
        <TextInput
          {...props}
          style={styles.input}
          placeholderTextColor="#B3B3B3"
          secureTextEntry={type === "password" && !visible}
          keyboardType={
            type === "email"
              ? "email-address"
              : type === "number"
              ? "numeric"
              : "default"
          }
          value={controlledValue}
          onChangeText={props.onChangeText}
        />

        <View style={styles.iconRight}>{renderRightIcon()}</View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: Colors.gray,
    marginBottom: 6,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.black,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  error: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
  },
});
