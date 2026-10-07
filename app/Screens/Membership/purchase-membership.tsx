import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const PLANS = [
  {
    id: "silver",
    name: "Silver",
    price: "₹999",
    duration: "1 Month",
    colors: ["#D9D9D9", "#7B8794"] as [string, string],
    benefits: [
      "50 Matches Daily",
      "10 Contact Views",
      "Basic Filters",
      "Standard Visibility",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: "₹2,499",
    duration: "3 Months",
    colors: ["#F5C74E", "#B8860B"] as [string, string],
    benefits: [
      "Unlimited Matches",
      "See Who Likes You",
      "Priority Messaging",
      "2x Profile Boost",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    price: "₹4,999",
    duration: "6 Months",
    colors: ["#F5F5F5", "#5B6574"] as [string, string],
    benefits: [
      "Personal Matchmaker",
      "Incognito Browsing",
      "Direct Calls",
      "Verified Premium Badge",
    ],
  },
];

const PurchaseMembership = () => {
  const router = useRouter();

  const { planId } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const selectedPlan = useMemo(() => {
    return PLANS.find((item) => item.id === planId) || PLANS[1];
  }, [planId]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#111111", "#000000"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color="#F5C74E" />
        </TouchableOpacity>

        <Animated.Text entering={FadeIn.delay(100)} style={styles.headerTitle}>
          Complete Purchase
        </Animated.Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInDown.delay(100)} style={styles.planCard}>
          <LinearGradient
            colors={selectedPlan.colors}
            style={styles.planGlow}
          />

          <View style={styles.planTop}>
            <View>
              <Text
                style={[
                  styles.planName,
                  {
                    color: selectedPlan.colors[0],
                  },
                ]}
              >
                {selectedPlan.name}
              </Text>

              <Text style={styles.planDuration}>{selectedPlan.duration}</Text>
            </View>

            <View
              style={[
                styles.activeBadge,
                {
                  backgroundColor: selectedPlan.colors[0],
                },
              ]}
            >
              <Text style={styles.activeText}>ACTIVE PLAN</Text>
            </View>
          </View>

          <Text style={styles.planPrice}>{selectedPlan.price}</Text>

          <View style={styles.divider} />

          <View style={styles.benefitsWrapper}>
            {selectedPlan.benefits.map((item, index) => (
              <Animated.View
                entering={FadeInUp.delay(150 + index * 80)}
                key={index}
                style={styles.benefitRow}
              >
                <View
                  style={[
                    styles.checkWrap,
                    {
                      backgroundColor: `${selectedPlan.colors[0]}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={selectedPlan.colors[0]}
                  />
                </View>

                <Text style={styles.benefitText}>{item}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(250)}
          style={styles.paymentCard}
        >
          <Text style={styles.sectionTitle}>Payment Details</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Card Holder Name</Text>

            <TextInput
              placeholder="Enter card holder name"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Card Number</Text>

            <TextInput
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              value={card}
              onChangeText={setCard}
              style={styles.input}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Text style={styles.label}>Expiry</Text>

              <TextInput
                placeholder="MM/YY"
                placeholderTextColor="#666"
                value={expiry}
                onChangeText={setExpiry}
                style={styles.input}
              />
            </View>

            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Text style={styles.label}>CVV</Text>

              <TextInput
                placeholder="***"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                secureTextEntry
                value={cvv}
                onChangeText={setCvv}
                style={styles.input}
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.75)", "#000", "#000"]}
        style={styles.bottomOverlay}
        pointerEvents="none"
      />

      <Animated.View entering={FadeInUp.delay(350)} style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Total Payable</Text>

          <Text style={styles.bottomPrice}>{selectedPlan.price}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient
            colors={selectedPlan.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.payButton}
          >
            <Ionicons name="lock-closed" size={16} color="#000" />

            <Text style={styles.payText}>Pay Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  scrollContent: {
    paddingBottom: 190,
  },

  glowTop: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(245,199,78,0.12)",
    top: -80,
    right: -60,
  },

  glowBottom: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: 120,
    left: -80,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 55,
    paddingHorizontal: 22,
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginLeft: 14,
  },

  planCard: {
    marginHorizontal: 20,
    borderRadius: 30,
    backgroundColor: "#111",
    padding: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  planGlow: {
    position: "absolute",
    width: width,
    height: 180,
    top: -90,
    opacity: 0.12,
  },

  planTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  planName: {
    fontSize: 28,
    fontWeight: "900",
  },

  planDuration: {
    color: "#888",
    marginTop: 5,
    fontSize: 13,
  },

  activeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
  },

  activeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  planPrice: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900",
    marginTop: 26,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 24,
  },

  benefitsWrapper: {
    gap: 14,
  },

  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  benefitText: {
    color: "#E5E5E5",
    fontSize: 14,
    marginLeft: 12,
    fontWeight: "500",
  },

  paymentCard: {
    marginTop: 22,
    marginHorizontal: 20,
    backgroundColor: "#101010",
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 24,
  },

  inputWrapper: {
    marginBottom: 18,
  },

  label: {
    color: "#9A9A9A",
    fontSize: 13,
    marginBottom: 10,
    fontWeight: "600",
  },

  input: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 18,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  row: {
    flexDirection: "row",
    gap: 14,
  },

  bottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
  },

  bottomBar: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 28,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: "rgba(10,10,10,0.96)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  bottomLabel: {
    color: "#7A7A7A",
    fontSize: 11,
    marginBottom: 4,
  },

  bottomPrice: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },

  payButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 26,
    paddingVertical: 15,
    borderRadius: 18,
    gap: 8,
  },

  payText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});

export default PurchaseMembership;
