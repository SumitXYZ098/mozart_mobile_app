import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAgree: () => void;
  isProcessing?: boolean;
}

export const TermsModal = ({
  visible,
  onClose,
  onAgree,
  isProcessing = false,
}: TermsModalProps) => {
  const [hasAgreed, setHasAgreed] = useState(false);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Pro Label Terms & Conditions</Text>
          </View>

          {/* Scrolling Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.sectionHeader}>1. Royalties & Revenue Share</Text>
            <Text style={styles.bodyText}>
              By subscribing to the Pro Label plan, you retain 85% of all royalties generated from your distributed releases. Mozart retains a 15% service and distribution commission.
            </Text>

            <Text style={styles.sectionHeader}>2. Ownership & Rights</Text>
            <Text style={styles.bodyText}>
              You warrant and represent that you own or possess all legal rights, licenses, and permissions for the music, cover art, lyrics, and metadata uploaded under your label.
            </Text>

            <Text style={styles.sectionHeader}>3. Streaming Integrity & Anti-Fraud</Text>
            <Text style={styles.bodyText}>
              You agree to strictly prohibit any artificial streaming, stream manipulation, or fraudulent activities. Mozart reserves the right to suspend accounts and withhold royalties for releases flagged by streaming platforms.
            </Text>

            <Text style={styles.sectionHeader}>4. Distribution Channels</Text>
            <Text style={styles.bodyText}>
              Your music will be delivered to over 100+ digital service providers (DSPs) globally, subject to individual platform ingestion and content policies.
            </Text>

            <Text style={styles.sectionHeader}>5. Service Termination</Text>
            <Text style={styles.bodyText}>
              Violating these terms will lead to immediate plan termination, suspension of distribution services, and potential legal action to recover damages.
            </Text>
          </ScrollView>

          {/* Footer & Actions */}
          <View style={styles.footer}>
            {/* Custom Premium Checkbox */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.checkboxRow}
              onPress={() => setHasAgreed(!hasAgreed)}
            >
              <View
                style={[
                  styles.checkbox,
                  hasAgreed && styles.checkboxChecked,
                ]}
              >
                {hasAgreed && (
                  <Ionicons name="checkmark" size={16} color={Colors.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                I agree to the terms and authorize Pro Label activation.
              </Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={isProcessing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.agreeButton,
                  (!hasAgreed || isProcessing) && styles.agreeButtonDisabled,
                ]}
                onPress={onAgree}
                disabled={!hasAgreed || isProcessing}
              >
                <Text style={styles.agreeButtonText}>
                  {isProcessing ? "Activating..." : "Agree & Activate"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 5, 20, 0.6)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: height * 0.85,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.lightPrimary || "#F4EBFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    flex: 1,
  },
  content: {
    height: height * 0.4,
    borderWidth: 1,
    borderColor: "#EBE6F5",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FAF9FC",
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
    fontFamily: "PlusJakartaSans_700Bold",
    marginTop: 12,
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 12,
    color: "#555555",
    fontFamily: "Poppins_400Regular",
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    marginTop: 8,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#4F4F4F",
    fontFamily: "Poppins_400Regular",
    flex: 1,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  cancelButtonText: {
    color: "#777777",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  agreeButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  agreeButtonDisabled: {
    backgroundColor: "#F3F3F3",
    shadowOpacity: 0,
    elevation: 0,
  },
  agreeButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
