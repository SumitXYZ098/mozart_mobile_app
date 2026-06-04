import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "@/theme/colors";

interface ArtistLimitModalProps {
  visible: boolean;
  onClose: () => void;
  planName: string;
  limit: number;
}

export const ArtistLimitModal: React.FC<ArtistLimitModalProps> = ({
  visible,
  onClose,
  planName,
  limit,
}) => {
  const navigation = useNavigation<any>();

  const handleUpgrade = () => {
    onClose();
    navigation.navigate("UpgradePlan");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Exclamation Icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.exclamationText}>!</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Artist Limit Reached</Text>

          {/* Description */}
          <Text style={styles.description}>
            Your Current {planName} Plan Allows Only {limit} Primary Artist{limit > 1 ? "s" : ""}. Please Upgrade Your Plan To Add More.
          </Text>

          {/* Buttons Row */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.upgradeButton}
              activeOpacity={0.8}
              onPress={handleUpgrade}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Continue with existing plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 5, 20, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: "#FFAE66",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  exclamationText: {
    fontSize: 44,
    color: "#FFAE66",
    fontWeight: "300",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    fontFamily: "PlusJakartaSans_700Bold",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#4A5568",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  upgradeButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
    textAlign: "center",
  },
  cancelButton: {
    flex: 1.4,
    backgroundColor: "#CCCCCC",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
    textAlign: "center",
  },
});
