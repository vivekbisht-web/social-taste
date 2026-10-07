import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Modal, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  onComplete: () => void;
};

const SuccessAnimation = ({ visible, onComplete }: Props) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleValue, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(checkmarkScale, {
          toValue: 1,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 0.8,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete();
          scaleValue.setValue(0);
          opacityValue.setValue(0);
          checkmarkScale.setValue(0);
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: opacityValue }]}>
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ scale: scaleValue }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ scale: checkmarkScale }] },
              ]}
            >
              <Ionicons name="checkmark-sharp" size={42} color="#10B981" />
            </Animated.View>

            <Text style={styles.title}>Post Successfully Added</Text>
            <Text style={styles.subtitle}>Your luxury post is now live</Text>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default SuccessAnimation;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  card: {
    width: 280,
    backgroundColor: "#121212",
    borderRadius: 28,
    paddingVertical: 35,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 2,
    borderColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    textAlign: "center",
  },
});
