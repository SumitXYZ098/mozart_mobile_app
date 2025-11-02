/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import WelcomeNewReleaseScreen from "@/components/screenComponents/newReleaseScreen/WelcomeNewReleaseScreen";
import StepperScreen from "@/components/screenComponents/newReleaseScreen/StepperScreen";
import { useDraftStore } from "@/stores/draftStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NewReleaseScreen = (route: any) => {
  console.log("Route:", route?.route?.params);
  const navigation = useNavigation<any>();
  const [activeStep, setActiveStep] = useState(0);
  const { setDraftId, clearDraft } = useDraftStore();

  useEffect(() => {
    const params = route?.route?.params;

    if (params?.routeId && params?.step) {
      setActiveStep(1);
      setDraftId(params?.routeId);
    } else if (params?.step && !params?.routeId) {
      setActiveStep(0);
      clearDraft();
    } else {
      setActiveStep(0);
      clearDraft();
    }
  }, [route?.route?.params]);

  const stepData = [
    {
      activeStep: 0,
      component: (
        <WelcomeNewReleaseScreen onNext={() => setActiveStep(activeStep + 1)} />
      ),
    },
    {
      activeStep: 1,
      component: <StepperScreen />,
    },
  ];

  const goBack = async () => {
    const data = await AsyncStorage.removeItem("releaseFormDraft");
    console.log("Local Store:", data);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("HomeTab", { screen: "HomeMain" }),
              clearDraft();
            goBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>New Release</Text>
        <View style={styles.placeholder}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("MusicTab", { screen: "CalendarEvent" });
            }}
            style={styles.topButton}
          >
            <Image
              source={require("../../../assets/images/solar_calendar-bold.png")}
              resizeMode="contain"
              style={styles.menuIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notification")}
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

      {/* Step Content */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: 80,
          justifyContent: activeStep === 0 ? "center" : "flex-start",
          flex: 1,
        }}
      >
        {stepData.find((item) => item.activeStep === activeStep)?.component}
      </View>
    </SafeAreaView>
  );
};

export default NewReleaseScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor:Colors.white},
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
  placeholder: { flexDirection: "row", alignItems: "center", columnGap: 6 },
  topButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 6,
    padding: 6,
  },
  menuIcon: { width: 24, height: 24 },
  scroll: {
    flex: 1,
  },
});
