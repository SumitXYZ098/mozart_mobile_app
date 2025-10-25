import { Colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CalendarEventScreen = () => {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Calendar</Text>
        <View style={styles.placeholder}>
          <TouchableOpacity
            onPress={() => navigation?.navigate("Notification")}
            style={styles.topButton}
          >
            <Image
              source={require("../../../assets/images/notification.png")}
              resizeMode="contain"
              style={styles.menuIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-800">Calendar Event</Text>
        <Text className="text-gray-600 mt-2">Coming soon...</Text>
      </View>
    </SafeAreaView>
  );
};

export default CalendarEventScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.gray,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  placeholder: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
  },
  topButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 6,
    padding: 6,
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
});
