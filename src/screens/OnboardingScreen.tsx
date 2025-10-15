import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Colors } from "../theme/colors";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../navigation/AuthNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  // Animations
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(
    new Animated.Value(Dimensions.get("window").height / 2)
  ).current; // Start from center screen vertically

  const buttonsFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo first, then buttons
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoFade, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 94, // animate to its top position: styles.logo.top
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonsFade, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.bg}
    >
      <Animated.Image
        source={require("../../assets/icon.png")}
        style={[
          styles.logo,
          {
            opacity: logoFade,
            transform: [{ translateY: logoTranslateY }],
          },
        ]}
        resizeMode="contain"
      />

      <Animated.View style={[styles.buttonsWrapper, { opacity: buttonsFade }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signUpbutton}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  button: {
    backgroundColor: Colors.white,
    paddingVertical: 14,
    textAlign: "center",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.white,
    marginBottom: 16,
    width: "100%",
  },
  signUpbutton: {
    backgroundColor: "transparent",
    paddingVertical: 14,

    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.white,
    width: "100%",
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 14,
    textAlign: "center",
    fontFamily: 'PlusJakartaSans_700Bold'
  },
  signUpText: {
    textAlign: "center",
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold'
  },
  logo: {
    width: 172,
    height: 80,
    position: "absolute",
    left: "50%",
    marginLeft: -86, // -(width/2)
    top: 94,
  },
  buttonsWrapper: {
    position: "absolute",
    bottom: 64,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 24,
    flexDirection: "column",
  },
});
