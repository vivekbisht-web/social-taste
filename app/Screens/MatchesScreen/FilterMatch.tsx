import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Heart, X } from "lucide-react-native";
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
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";

import {
  getFilteredResults,
  sendMatchInterest,
} from "../../../Services/api/match";
import CustomBottomTab from "../CustomBottomTab/CustomBottomTab";

const { width, height } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.25;

const FilterMatch = () => {
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

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await getFilteredResults();
      if (response.success) {
        setProfiles(response.profiles);
      }
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
    if (!dob) return "";
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

    if (direction === "right") {
      const currentProfile = profiles[currentIndex];
      if (currentProfile) {
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
              pathname: "/Screens/ProfileDetail/ProfileDetail",
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
            <Text style={styles.profileDetails}>
              🎓 {profile.education} • {profile.college}
            </Text>
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
          <Text style={styles.headerTitle}>Filtered Rishtey 💍</Text>
        </View>
      </Animated.View>

      <View style={styles.deckContainer}>
        {currentIndex >= profiles.length ? (
          <Animated.View entering={FadeIn} style={styles.emptyState}>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>
              We'll find more premium profiles for you soon.
            </Text>
            <TouchableOpacity onPress={loadProfiles} style={{ marginTop: 20 }}>
              <Text style={{ color: "#D4AF37" }}>Refresh Results</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <GestureDetector gesture={gesture}>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {profiles
                .map((profile, index) => renderCard(profile, index))
                .reverse()}
            </View>
          </GestureDetector>
        )}
      </View>

      {currentIndex < profiles.length && (
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.actionButtons}
        >
          <TouchableOpacity
            style={[styles.roundBtn, styles.passBtn]}
            onPress={() => {
              translateX.value = withTiming(-width);
              setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
            }}
          >
            <X size={30} color="#ff4444" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roundBtn, styles.heartBtn]}
            onPress={() => {
              const currentProfile = profiles[currentIndex];
              if (currentProfile) handleSendInterest(currentProfile._id);
              translateX.value = withTiming(width);
              setShowMatchAnim(true);
              setTimeout(() => {
                setShowMatchAnim(false);
                setCurrentIndex(currentIndex + 1);
              }, 1200);
            }}
          >
            <Heart size={34} color="#fff" fill="#fff" />
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
    paddingTop: 60,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerSubtitle: {
    color: "#aaa",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: "#D4AF37",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 2,
  },
  deckContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardContainer: {
    position: "absolute",
    width: width * 0.92,
    height: height * 0.58,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.15)",
  },
  cardImage: { width: "100%", height: "100%", resizeMode: "cover" },
  cardGradient: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "60%",
    justifyContent: "flex-end",
    padding: 20,
  },
  kundliBadge: {
    backgroundColor: "rgba(212,175,55,0.9)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 10,
  },
  kundliText: { color: "#000", fontSize: 11, fontWeight: "bold" },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  profileName: { color: "#fff", fontSize: 24, fontWeight: "bold" },
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
  incomeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  profileDetails: { color: "#ddd", fontSize: 14, marginTop: 3 },
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
    fontSize: 30,
    fontWeight: "900",
    color: "#4CAF50",
    letterSpacing: 2,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 110,
    gap: 15,
  },
  roundBtn: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  passBtn: { width: 60, height: 60, borderRadius: 30 },
  heartBtn: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: "#D4AF37",
  },
  emptyState: { alignItems: "center", justifyContent: "center", padding: 40 },
  emptyTitle: {
    color: "#D4AF37",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptySub: { color: "#aaa", fontSize: 14, textAlign: "center" },
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
    backgroundColor: "rgba(0,0,0,0.9)",
    padding: 35,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  successEmoji: { fontSize: 50, marginBottom: 15 },
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

export default FilterMatch;
