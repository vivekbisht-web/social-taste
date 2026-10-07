import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

const { width, height } = Dimensions.get("window");

const FloatingHeart = ({ delay }: { delay: number }) => {
  const animatedValue = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const randomLeft = useRef(Math.random() * (width - 30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: -50,
        duration: 6000,
        delay: delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 6000,
        delay: delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.heart,
        {
          left: randomLeft,
          transform: [{ translateY: animatedValue }],
          opacity,
        },
      ]}
    >
      <Text style={{ fontSize: 20 }}>💛</Text>
    </Animated.View>
  );
};

const ScreenBackground = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) => {
  return (
    <ImageBackground
      source={require("../../assets/images/abcc.jpg")}
      style={styles.background}
      resizeMode="cover"
      blurRadius={1}
    >
      <View style={styles.overlay} />

      {[...Array(8)].map((_, i) => (
        <FloatingHeart key={i} delay={i * 800} />
      ))}

      <View style={[styles.container, style]}>{children}</View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  container: {
    flex: 1,
  },
  heart: {
    position: "absolute",
    zIndex: 1,
  },
});

export default ScreenBackground;
