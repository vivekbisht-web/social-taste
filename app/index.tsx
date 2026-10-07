import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const SplashScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const zoomAnim = useRef(new Animated.Value(1)).current;
  const textSlide = useRef(new Animated.Value(30)).current;
  const lineScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(zoomAnim, {
        toValue: 1.15,
        duration: 8000,
        useNativeDriver: true,
      }),
      Animated.timing(textSlide, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(lineScale, {
        toValue: 1,
        duration: 1200,
        delay: 800,
        useNativeDriver: false,
      }),
    ]).start();

    const checkAuthAndNavigate = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        const isBiometricEnabled =
          await SecureStore.getItemAsync("twoStepEnabled");

        // Console log add kiya
        console.log("--- APP STARTUP ---");
        console.log(
          "Biometric Setting in Store:",
          isBiometricEnabled === "true" ? "✅ ENABLED" : "❌ DISABLED",
        );
        console.log("User Token exists:", token ? "Yes" : "No");
        console.log("-------------------");

        setTimeout(async () => {
          if (token) {
            if (isBiometricEnabled === "true") {
              const result = await LocalAuthentication.authenticateAsync({
                promptMessage: "Unlock SocialTaste",
                fallbackLabel: "Use Passcode",
                disableDeviceFallback: false,
              });

              if (result.success) {
                console.log("Fingerprint: Success");
                router.replace("/Screens/Dashboard/Dashboard");
              } else {
                console.log("Fingerprint: Failed/Cancelled");
                Alert.alert("Authentication Required", "Please authenticate.", [
                  { text: "Try Again", onPress: () => checkAuthAndNavigate() },
                ]);
              }
            } else {
              router.replace("/Screens/Dashboard/Dashboard");
            }
          } else {
            router.replace("/Screens/login/login");
          }
        }, 4500);
      } catch (error) {
        console.log("Error in Splash:", error);
        router.replace("/Screens/login/login");
      }
    };

    checkAuthAndNavigate();
  }, []);

  const lineWidth = lineScale.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "60%"],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <Animated.View
        style={[styles.bgWrapper, { transform: [{ scale: zoomAnim }] }]}
      >
        <ImageBackground
          source={require("../assets/images/abcc.jpg")}
          style={styles.fullImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
        </ImageBackground>
      </Animated.View>

      <View style={styles.mainContainer}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: textSlide }],
          }}
        >
          <Text style={styles.brandText}>SOCIAL TASTE</Text>

          <Animated.View style={[styles.premiumLine, { width: lineWidth }]} />

          <Text style={styles.tagline}>DEFINING LUXURY</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footerContainer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>SINCE MMXXIV</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  bgWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  fullImage: {
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  brandText: {
    fontSize: 52,
    color: "#D4AF37",
    fontWeight: "300",
    textAlign: "center",
    letterSpacing: 12,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 15,
    ...Platform.select({
      android: { fontFamily: "serif" },
      ios: { fontFamily: "Optima" },
    }),
  },
  premiumLine: {
    height: 1,
    backgroundColor: "#D4AF37",
    alignSelf: "center",
    marginVertical: 25,
    shadowColor: "#D4AF37",
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  tagline: {
    fontSize: 13,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 8,
    fontWeight: "400",
    opacity: 0.9,
    ...Platform.select({
      android: { fontFamily: "sans-serif-light" },
      ios: { fontFamily: "Helvetica-Light" },
    }),
  },
  footerContainer: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
  },
  footerText: {
    color: "#D4AF37",
    fontSize: 10,
    letterSpacing: 5,
    fontWeight: "600",
  },
});

export default SplashScreen;
