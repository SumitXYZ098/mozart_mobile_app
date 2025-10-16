import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Touchable,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";
import { useAuthStore } from "@/stores/useAuthStore";

export default function HomeScreen() {
  const { logOut } = useAuthStore();
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Welcome to the Home Screen 🎶</Text>
      <TouchableOpacity style={styles.button} onPress={() => logOut()}>
        <Text style={styles.buttonText}>LogOut</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  text: { color: Colors.primary, fontSize: 22, fontWeight: "600" },
  button: {
    backgroundColor: Colors.white,
    padding: 14,
    textAlign: "center",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBlock: 16,
    
    
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 14,
    textAlign: "center",
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
