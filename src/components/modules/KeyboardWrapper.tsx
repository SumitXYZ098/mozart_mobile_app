import React from "react";
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  ViewProps,
} from "react-native";

interface KeyboardWrapperProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

/**
 * A wrapper that handles keyboard appearance, resizing,
 * and dismissal on outside tap.
 */
export default function KeyboardWrapper({
  children,
  scrollable = true,
  style,
}: KeyboardWrapperProps) {
  const Container = scrollable ? ScrollView : React.Fragment;

  const content = scrollable ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[{ flexGrow: 1 }, style]}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {content}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

