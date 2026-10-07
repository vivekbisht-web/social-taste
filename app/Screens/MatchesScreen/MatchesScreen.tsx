import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronRight, Heart, Sparkles, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  FadeIn,
  FadeInDown,
  ZoomIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  getMatchRecommendations,
  sendMatchInterest,
} from "../../../Services/api/match";
import CustomBottomTab from "../CustomBottomTab/CustomBottomTab";

const { width, height } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.25;

const MatchesScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Matches");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatchAnim, setShowMatchAnim] = useState(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const nextCardOpacity = useSharedValue(0.5);
  const nextCardScale = useSharedValue(0.9);
  const prefPulse = useSharedValue(1);

  useEffect(() => {
    loadProfiles();
    prefPulse.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1200 }),
        withTiming(1, { duration: 1200 }),
      ),
      -1,
      true,
    );
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await getMatchRecommendations();
      setProfiles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInterest = async (targetId: string) => {
    try {
      await sendMatchInterest({ targetId });
    } catch (error) {
      console.error(error);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    nextCardOpacity.value = withTiming(0.5, { duration: 300 });
    nextCardScale.value = withTiming(0.9, { duration: 300 });
  }, [currentIndex]);

  const handleNext = (direction: "left" | "right") => {
    "worklet";
    const destX = direction === "right" ? width + 100 : -width - 100;
    translateX.value = withSpring(destX, { velocity: 50 });

    const currentProfile = profiles[currentIndex];

    if (direction === "right") {
      if (currentProfile?._id) {
        runOnJS(handleSendInterest)(currentProfile._id);
      }
      runOnJS(setShowMatchAnim)(true);
      setTimeout(() => {
        runOnJS(setShowMatchAnim)(false);
        runOnJS(setCurrentIndex)(currentIndex + 1);
      }, 1200);
    } else {
      runOnJS(setCurrentIndex)(currentIndex + 1);
    }
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      const distance = Math.abs(event.translationX);
      nextCardOpacity.value = interpolate(
        distance,
        [0, width / 2],
        [0.5, 1],
        Extrapolation.CLAMP,
      );
      nextCardScale.value = interpolate(
        distance,
        [0, width / 2],
        [0.9, 1],
        Extrapolation.CLAMP,
      );
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        handleNext("right");
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        handleNext("left");
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        nextCardOpacity.value = withTiming(0.5);
        nextCardScale.value = withTiming(0.9);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [-10, 0, 10],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
      ],
    };
  });

  const animatedNextCardStyle = useAnimatedStyle(() => ({
    opacity: nextCardOpacity.value,
    transform: [{ scale: nextCardScale.value }],
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, width / 4],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const passOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, -width / 4],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const prefAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: prefPulse.value }],
  }));

  const renderCard = (profile: any, index: number) => {
    const isFirst = index === currentIndex;
    if (index < currentIndex || index > currentIndex + 1) return null;

    return (
      <Animated.View
        key={profile._id}
        style={[
          styles.cardContainer,
          isFirst ? animatedCardStyle : animatedNextCardStyle,
          { zIndex: isFirst ? 2 : 1 },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1 }}
          onPress={() =>
            router.push({
              pathname: "/Screens/ProfileDetail/ProfileDetail" as any,
              params: { profileData: JSON.stringify(profile) },
            })
          }
        >
          <Image
            source={{ uri: profile.primaryPhoto }}
            style={styles.cardImage}
          />

          {isFirst && (
            <>
              <Animated.View
                style={[styles.stampContainer, styles.likeStamp, likeOpacity]}
              >
                <Text style={styles.stampText}>INTEREST</Text>
              </Animated.View>
              <Animated.View
                style={[styles.stampContainer, styles.passStamp, passOpacity]}
              >
                <Text
                  style={[
                    styles.stampText,
                    { color: "#ff4444", borderColor: "#ff4444" },
                  ]}
                >
                  PASS
                </Text>
              </Animated.View>
            </>
          )}

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,1)"]}
            style={styles.cardGradient}
          >
            <View style={styles.kundliBadge}>
              <Text style={styles.kundliText}>
                ✨ {profile.religion} • {profile.caste}
              </Text>
            </View>

            <View style={styles.nameRow}>
              <Text style={styles.profileName}>
                {profile.name}, {calculateAge(profile.dob)}
              </Text>
              <View style={styles.incomeBadge}>
                <Text style={styles.incomeText}>{profile.annualIncome}</Text>
              </View>
            </View>

            <Text style={styles.profileDetails}>
              {profile.height} • {profile.occupation}
            </Text>
            <Text style={styles.profileDetails}>🎓 {profile.education}</Text>
            <Text style={styles.profileDetails}>
              📍 {profile.city}, {profile.state}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1a1a1a", "#2d1414", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Premium Discovery</Text>
          <Text style={styles.headerTitle}>Daily Rishtey 💍</Text>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(800)}
        style={styles.prefWrapper}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push("/Screens/MatchesScreen/FilterMatch" as any)
          }
        >
          <Animated.View style={[styles.prefCard, prefAnimatedStyle]}>
            <LinearGradient
              colors={["rgba(212,175,55,0.25)", "rgba(212,175,55,0.05)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.prefGradient}
            >
              <View style={styles.prefLeft}>
                <View style={styles.prefIconCircle}>
                  <Sparkles size={16} color="#D4AF37" fill="#D4AF37" />
                </View>
                <View>
                  <Text style={styles.prefTitle}>Match Preferences</Text>
                  <Text style={styles.prefSub}>
                    Adjust your ideal partner criteria
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#D4AF37" />
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.deckContainer}>
        {currentIndex >= profiles.length ? (
          <Animated.View entering={FadeIn} style={styles.emptyState}>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>
              We'll find more premium profiles for you soon.
            </Text>
          </Animated.View>
        ) : (
          <GestureDetector gesture={gesture}>
            <View style={styles.deckContent}>
              {profiles
                .map((profile, index) => renderCard(profile, index))
                .reverse()}
            </View>
          </GestureDetector>
        )}
      </View>

      {currentIndex < profiles.length && (
        <Animated.View
          entering={FadeInDown.delay(400)}
          style={styles.actionButtons}
        >
          <TouchableOpacity
            style={[styles.roundBtn, styles.passBtn]}
            onPress={() => {
              translateX.value = withTiming(-width);
              setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
            }}
          >
            <X size={28} color="#ff4444" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roundBtn, styles.heartBtn]}
            onPress={() => {
              const currentProfile = profiles[currentIndex];
              if (currentProfile?._id) handleSendInterest(currentProfile._id);
              translateX.value = withTiming(width);
              setShowMatchAnim(true);
              setTimeout(() => {
                setShowMatchAnim(false);
                runOnJS(setCurrentIndex)(currentIndex + 1);
              }, 1200);
            }}
          >
            <Heart size={32} color="#fff" fill="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {showMatchAnim && (
        <Animated.View
          entering={ZoomIn.duration(400)}
          style={styles.successOverlay}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.85)", "rgba(45,20,20,0.95)"]}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View entering={ZoomIn.delay(200)} style={styles.successBox}>
            <Text style={styles.successEmoji}>💖</Text>
            <Text style={styles.successTitle}>Interest Sent!</Text>
            <Text style={styles.successSub}>
              We'll notify you when they respond.
            </Text>
          </Animated.View>
        </Animated.View>
      )}

      <CustomBottomTab activeTab={activeTab} onTabPress={setActiveTab} />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 50,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerSubtitle: {
    color: "#aaa",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: "#D4AF37",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 2,
  },
  prefWrapper: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    zIndex: 10,
  },
  prefCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
  },
  prefGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  prefLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  prefIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(212,175,55,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  prefTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  prefSub: { color: "#D4AF37", fontSize: 11, opacity: 0.8 },
  deckContainer: { flex: 1, zIndex: 1 },
  deckContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardContainer: {
    position: "absolute",
    width: width * 0.9,
    height: height * 0.52,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  cardImage: { width: "100%", height: "100%", resizeMode: "cover" },
  cardGradient: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "65%",
    justifyContent: "flex-end",
    padding: 20,
  },
  kundliBadge: {
    backgroundColor: "rgba(212,175,55,0.95)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  kundliText: { color: "#000", fontSize: 10, fontWeight: "bold" },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  profileName: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  incomeBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  incomeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  profileDetails: { color: "#ddd", fontSize: 13, marginTop: 2 },
  stampContainer: {
    position: "absolute",
    top: 40,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 4,
    borderRadius: 10,
    zIndex: 10,
  },
  likeStamp: { left: 30, borderColor: "#4CAF50" },
  passStamp: { right: 30, borderColor: "#ff4444" },
  stampText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#4CAF50",
    letterSpacing: 2,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 110,
    marginTop: 15,
    gap: 20,
  },
  roundBtn: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  passBtn: { width: 55, height: 55, borderRadius: 27.5 },
  heartBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    color: "#D4AF37",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySub: { color: "#aaa", fontSize: 13, textAlign: "center" },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  successBox: {
    backgroundColor: "rgba(0,0,0,0.95)",
    padding: 35,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  successEmoji: { fontSize: 45, marginBottom: 15 },
  successTitle: {
    color: "#D4AF37",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  successSub: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
    opacity: 0.8,
  },
});

export default MatchesScreen;
