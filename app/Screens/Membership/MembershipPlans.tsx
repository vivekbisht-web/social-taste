import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInRight,
    Layout,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const PLANS = [
  {
    id: "silver",
    name: "Silver",
    price: "₹999",
    duration: "1 Month",
    colors: ["#D9D9D9", "#7B8794"] as [string, string],
    features: [
      "50 Matches / Day",
      "Basic Filters",
      "10 Contact Views",
      "Standard Visibility",
    ],
    badge: "Starter",
  },
  {
    id: "gold",
    name: "Gold",
    price: "₹2,499",
    duration: "3 Months",
    colors: ["#F5C74E", "#B8860B"] as [string, string],
    features: [
      "Unlimited Matches",
      "See Who Likes You",
      "Priority Messaging",
      "2x Profile Boost",
    ],
    badge: "Popular",
    popular: true,
  },
  {
    id: "platinum",
    name: "Platinum",
    price: "₹4,999",
    duration: "6 Months",
    colors: ["#F5F5F5", "#5B6574"] as [string, string],
    features: [
      "Personal Matchmaker",
      "Incognito Browsing",
      "Direct Calls",
      "Verified Premium Badge",
    ],
    badge: "Elite",
  },
];

const PlanCard = ({ plan, index, selected, onSelect }: any) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 180).springify()}
      layout={Layout.springify()}
      style={animatedStyle}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onSelect}
        onPressIn={() => {
          scale.value = withSpring(0.97);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
      >
        <LinearGradient
          colors={
            selected
              ? (["#1F1A0E", "#0A0A0A"] as [string, string])
              : (["#171717", "#090909"] as [string, string])
          }
          style={[
            styles.card,
            {
              borderColor: selected ? plan.colors[0] : "rgba(255,255,255,0.08)",
            },
          ]}
        >
          {plan.popular && (
            <LinearGradient colors={plan.colors} style={styles.popularTag}>
              <Text style={styles.popularTagText}>MOST POPULAR</Text>
            </LinearGradient>
          )}

          <View style={styles.cardTop}>
            <View>
              <Text style={[styles.planTitle, { color: plan.colors[0] }]}>
                {plan.name}
              </Text>

              <Text style={styles.duration}>{plan.duration}</Text>
            </View>

            <View style={[styles.badge, { backgroundColor: plan.colors[0] }]}>
              <Text style={styles.badgeText}>{plan.badge}</Text>
            </View>
          </View>

          <View style={styles.priceWrapper}>
            <Text style={styles.price}>{plan.price}</Text>

            <Text style={styles.priceSub}>/ total</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.featuresWrapper}>
            {plan.features.map((item: string, i: number) => (
              <Animated.View
                entering={FadeInRight.delay(150 + i * 100)}
                key={i}
                style={styles.featureRow}
              >
                <View
                  style={[
                    styles.iconWrap,
                    {
                      backgroundColor: `${plan.colors[0]}20`,
                    },
                  ]}
                >
                  <Ionicons name="checkmark" size={14} color={plan.colors[0]} />
                </View>

                <Text style={styles.featureText}>{item}</Text>
              </Animated.View>
            ))}
          </View>

          <View
            style={[
              styles.radioOuter,
              {
                borderColor: selected ? plan.colors[0] : "#444",
              },
            ]}
          >
            {selected && (
              <View
                style={[
                  styles.radioInner,
                  {
                    backgroundColor: plan.colors[0],
                  },
                ]}
              />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const MembershipPlans = () => {
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState("gold");

  const currentPlan = useMemo(
    () => PLANS.find((item) => item.id === selectedPlan),
    [selectedPlan],
  );

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
          Premium Membership
        </Animated.Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInDown.delay(100)} style={styles.hero}>
          <Text style={styles.heroTitle}>Unlock Premium Matches ✨</Text>

          <Text style={styles.heroSub}>
            Connect faster with verified profiles and get better visibility.
          </Text>
        </Animated.View>

        <View style={styles.cardsWrapper}>
          {PLANS.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={index}
              selected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id)}
            />
          ))}
        </View>
      </ScrollView>

      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.75)", "#000", "#000"]}
        style={styles.bottomOverlay}
        pointerEvents="none"
      />

      <Animated.View entering={FadeInDown.delay(200)} style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Selected Plan</Text>

          <Text style={styles.bottomPlan}>
            {currentPlan?.name} • {currentPlan?.price}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: "/Screens/Membership/purchase-membership",
              params: {
                planId: selectedPlan,
              },
            })
          }
        >
          <LinearGradient
            colors={
              currentPlan?.colors ||
              (["#F5C74E", "#B8860B"] as [string, string])
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.purchaseButton}
          >
            <Ionicons name="lock-closed" size={16} color="#000" />

            <Text style={styles.purchaseText}>Purchase</Text>
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
    paddingBottom: 180,
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
    marginBottom: 10,
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

  hero: {
    paddingHorizontal: 22,
    marginTop: 20,
    marginBottom: 24,
  },

  heroTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 38,
  },

  heroSub: {
    color: "#8E8E93",
    fontSize: 13,
    lineHeight: 22,
    marginTop: 10,
    paddingRight: 40,
  },

  cardsWrapper: {
    paddingHorizontal: 18,
    gap: 18,
  },

  card: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1.5,
    overflow: "hidden",
  },

  popularTag: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomLeftRadius: 18,
  },

  popularTagText: {
    color: "#000",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  planTitle: {
    fontSize: 24,
    fontWeight: "900",
  },

  duration: {
    color: "#7D7D7D",
    marginTop: 4,
    fontSize: 12,
  },

  badge: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 50,
  },

  badgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  priceWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 20,
    marginBottom: 20,
  },

  price: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "900",
  },

  priceSub: {
    color: "#777",
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 6,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 22,
  },

  featuresWrapper: {
    gap: 12,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  featureText: {
    color: "#E5E5E5",
    fontSize: 13,
    marginLeft: 10,
    fontWeight: "500",
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignSelf: "flex-end",
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
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
    bottom: 28,
    left: 18,
    right: 18,
    borderRadius: 24,
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
    color: "#7B7B7B",
    fontSize: 11,
    marginBottom: 3,
  },

  bottomPlan: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  purchaseButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },

  purchaseText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 0.3,
  },
});

export default MembershipPlans;
