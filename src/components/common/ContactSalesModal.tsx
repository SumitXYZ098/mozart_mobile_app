import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import { toast } from "@/stores/useToastStore";

interface ContactSalesModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ContactSalesModal: React.FC<ContactSalesModalProps> = ({
  visible,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Message sent! Our team will get in touch shortly.");
      setFormData({ fullName: "", email: "", company: "", phone: "", message: "" });
      onClose();
    }, 1500);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                  <Text style={styles.backText}>Back to Plans</Text>
                </TouchableOpacity>
              </View>

              <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.titleContainer}>
              <Text style={styles.title}>Contact Sales</Text>
              <Text style={styles.subtitle}>
                Interested in a custom distribution plan? Fill out the form below and our team will get in touch with you to build a plan that fits your exact needs.
              </Text>
            </View>

            <View style={styles.formContainer}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Your Name"
                  placeholderTextColor="#999"
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                />
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Email "
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                />
              </View>

              {/* Company / Label Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Company / Label Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your Label"
                  placeholderTextColor="#999"
                  value={formData.company}
                  onChangeText={(text) => setFormData({ ...formData, company: text })}
                />
              </View>

              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Phone Number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                />
              </View>

              {/* Message */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Message <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter Your Message"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={formData.message}
                  onChangeText={(text) => setFormData({ ...formData, message: text })}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer Button */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.disabledButton]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Text>
            </TouchableOpacity>
          </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.primary,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  scrollContent: {
    padding: 24,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_600SemiBold",
    marginBottom: 8,
  },
  required: {
    color: Colors.red,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#1A1A1A",
    backgroundColor: "#FAFAFA",
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: Colors.white,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
