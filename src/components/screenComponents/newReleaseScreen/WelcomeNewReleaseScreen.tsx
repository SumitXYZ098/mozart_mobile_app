import CustomButton from "@/components/common/CustomButton";
import { StepButtons } from "@/components/common/StepButtons";
import { Colors } from "@/theme/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

interface StepProps {
  onNext?: () => void;
}

const WelcomeNewReleaseScreen: React.FC<StepProps> = ({ onNext }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Let’s get your music ready for the world.
      </Text>
      <Text style={styles.desc}>
        Before we release your song, we just need some details about your track
        and catalogue. This helps us upload it correctly and deliver it to all
        platforms without issues.
      </Text>
      <Text
        style={[
          styles.desc,
          {
            marginBottom: 24,
            marginTop: 12,
          },
        ]}
      >
        Once our team reviews and approves everything, your song will be ready
        to go live.
      </Text>
      <View
        style={{
          flexDirection: "column",
          rowGap: 10,
          alignItems: "center",
          width: "100%",
        }}
      >
        <CustomButton
          label="Start"
          customClasses={{ display: "flex", width: "100%" }}
          onPress={onNext}
        />
        <View
          style={{
            flexDirection: "row",
            columnGap: 6,
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name="clock"
            size={20}
            color={Colors.primary}
          />
          <Text
            style={{
              fontSize: 14,
              color: Colors.gray,
              fontFamily: "Poppins_400Regular",
            }}
          >
            Takes 5+ minutes
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondary,
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    paddingHorizontal: 12,
  },
  desc: {
    fontSize: 14,
    textAlign: "center",
    color: Colors.gray,
    fontFamily: "Poppins_400Regular",
  },
});

export default WelcomeNewReleaseScreen;
