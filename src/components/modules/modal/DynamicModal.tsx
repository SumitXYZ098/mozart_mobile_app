import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";

type ModalType = "warning" | "success" | "error" | "info";

interface DynamicModalProps {
  visible: boolean;
  type?: ModalType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const typeConfig = {
  warning: { color: "#f59e0b", icon: "warning-outline" },
  success: { color: "#22c55e", icon: "checkmark-circle-outline" },
  error: { color: "#ef4444", icon: "close-circle-outline" },
  info: { color: "#3b82f6", icon: "information-circle-outline" },
};

export default function DynamicModal({
  visible,
  type = "info",
  title,
  message,
  confirmText = "OK",
  cancelText,
  onConfirm,
  onCancel,
}: DynamicModalProps) {
  const { color, icon } = typeConfig[type];

  return (
    <Modal isVisible={visible} animationIn="zoomIn" animationOut="zoomOut">
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          padding: 25,
          alignItems: "center",
        }}
      >
        <Ionicons
          name={icon as any}
          size={50}
          color={color}
          style={{ marginBottom: 10 }}
        />
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 10 }}>
          {title}
        </Text>
        {message ? (
          <Text
            style={{
              fontSize: 16,
              color: "#555",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {message}
          </Text>
        ) : null}

        <View
          style={{
            flexDirection: cancelText ? "row" : "column",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {cancelText ? (
            <TouchableOpacity
              onPress={onCancel}
              style={{
                backgroundColor: "#d33",
                flex: 1,
                padding: 12,
                borderRadius: 8,
                marginRight: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: Colors.white, fontWeight: "600" }}>
                {cancelText}
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={onConfirm}
            style={{
              backgroundColor: color,
              padding: 12,
              borderRadius: 8,
              marginLeft: cancelText ? 8 : 0,
              alignItems: "center",
              flex: cancelText ? 1 : 0,
            }}
          >
            <Text style={{ color: Colors.white, fontWeight: "600" }}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
