import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolate,
  FadeIn,
  FadeInDown,
  FadeInLeft,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { getUserDetails } from "../../../Services/api/authService";
import { getVerificationStatus } from "../../../Services/api/documentUpload";
import { getBestMatch } from "../../../Services/api/match";
import {
  getRecentJoins,
  getRishteyOfTheDay,
} from "../../../Services/api/recentJoined";
import { getSuccessStories } from "../../../Services/api/successStories";
import CustomBottomTab from "../CustomBottomTab/CustomBottomTab";
import WelcomeAnimation from "../WelcomeAnimation/WelcomeAnimation";

const { width } = Dimensions.get("window");
const ITEM_SIZE = width * 0.75;
const SPACER_ITEM_SIZE = (width - ITEM_SIZE) / 2;
const MATCH_CARD_WIDTH = 155;

const CarouselItem = ({ item, index, scrollX, onPress }: any) => {
  if (item.spacer) return <View style={{ width: SPACER_ITEM_SIZE }} />;
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    if (item.images && item.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImgIndex((prev) => (prev + 1) % item.images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [item.images]);

  const displayImage =
    item.images && item.images.length > 0
      ? item.images[currentImgIndex]
      : "https://via.placeholder.com/400";

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 2) * ITEM_SIZE,
      (index - 1) * ITEM_SIZE,
      index * ITEM_SIZE,
    ];
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1.05, 0.8],
      Extrapolate.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolate.CLAMP,
    );
    return { transform: [{ scale }], opacity };
  });

  return (
    <View style={{ width: ITEM_SIZE }}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(item)}>
        <Animated.View style={[styles.carouselCard, animatedStyle]}>
          <Image source={{ uri: displayImage }} style={styles.cardImage} />
          {item.images && item.images.length > 1 && (
            <View style={styles.paginationDots}>
              {item.images.map((_: any, i: number) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === currentImgIndex
                          ? "#D4AF37"
                          : "rgba(255,255,255,0.5)",
                    },
                  ]}
                />
              ))}
            </View>
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.9)"]}
            style={styles.cardGradient}
          >
            <Text style={styles.cardTitle}>{item.coupleName}</Text>
            <Text style={styles.cardStory} numberOfLines={2}>
              {item.story}
            </Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const Dashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Home");
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userPhoto, setUserPhoto] = useState(null);
  const [bestMatch, setBestMatch] = useState<any>(null);
  const [successStories, setSuccessStories] = useState<any[]>([]);
  const [recentJoins, setRecentJoins] = useState<any[]>([]);
  const [rishteyDay, setRishteyDay] = useState<any[]>([]);
  const [trustScore, setTrustScore] = useState(0);
  const hasShaken = useRef(false);

  const scrollX = useSharedValue(0);
  const pulse = useSharedValue(1);
  const floatAnim = useSharedValue(0);
  const shake = useSharedValue(0);

  const successRef = useRef<FlatList>(null);
  const matchesRef = useRef<FlatList>(null);
  const matchIndex = useRef(0);
  const successIndex = useRef(0);

  const fetchData = useCallback(async () => {
    try {
      const storedUser = await SecureStore.getItemAsync("userData");
      const welcomeSeen = await SecureStore.getItemAsync("welcome_seen");

      if (!welcomeSeen) {
        setShowWelcome(true);
      }

      let userId = "";

      if (storedUser) {
        const parsedData = JSON.parse(storedUser);

        userId = parsedData._id || parsedData.user?._id;
      }

      if (userId) {
        try {
          const userDetailRes = await getUserDetails(userId);

          const userData = Array.isArray(userDetailRes)
            ? userDetailRes[0]
            : userDetailRes;

          if (userData) {
            setUserName(userData.name || "User");
            setUserPhoto(userData.primaryPhoto || null);
          }
        } catch (err) {
          console.log("Error fetching user details:", err);
        }
      }

      const [
        bestMatchRes,
        storiesRes,
        recentRes,
        rishteyRes,
        verificationRes,
        userDetailRes,
      ] = await Promise.all([
        getBestMatch().catch(() => null),
        getSuccessStories().catch(() => []),
        getRecentJoins().catch(() => []),
        getRishteyOfTheDay().catch(() => []),
        userId ? getVerificationStatus(userId).catch(() => null) : null,
        userId ? getUserDetails(userId).catch(() => null) : null,
      ]);

      console.log(
        "Verification API Full Response =====>",
        JSON.stringify(verificationRes, null, 2),
      );

      // Baaki states update karein
      if (bestMatchRes) setBestMatch(bestMatchRes);
      if (rishteyRes && Array.isArray(rishteyRes)) {
        setRishteyDay(rishteyRes);
      } else {
        console.log("Rishtey data format sahi nahi hai ya empty hai");
      }

      if (verificationRes) {
        const score =
          (verificationRes as any).verification?.trustScore ??
          (verificationRes as any).trustScore ??
          0;
        setTrustScore(score);
      }

      if (storiesRes && Array.isArray(storiesRes)) {
        setSuccessStories([
          { _id: "left-spacer", spacer: true },
          ...storiesRes,
          { _id: "right-spacer", spacer: true },
        ]);
      }

      if (recentRes && Array.isArray(recentRes)) {
        setRecentJoins(recentRes.slice(0, 4));
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      const popupTimer = setTimeout(() => setShowWelcome(false), 4000);
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
      );
      floatAnim.value = withRepeat(
        withSequence(
          withTiming(-15, { duration: 1500 }),
          withTiming(0, { duration: 1500 }),
        ),
        -1,
        true,
      );

      const matchInterval = setInterval(() => {
        if (matchesRef.current && rishteyDay.length > 0) {
          matchIndex.current = (matchIndex.current + 1) % rishteyDay.length;
          matchesRef.current.scrollToIndex({
            index: matchIndex.current,
            animated: true,
          });
        }
      }, 3000);

      const successInterval = setInterval(() => {
        if (successRef.current && successStories.length > 2) {
          successIndex.current =
            (successIndex.current + 1) % (successStories.length - 2);
          successRef.current.scrollToIndex({
            index: successIndex.current + 1,
            animated: true,
          });
        }
      }, 6000);

      return () => {
        clearTimeout(popupTimer);
        clearInterval(matchInterval);
        clearInterval(successInterval);
      };
    }, [fetchData, successStories.length, rishteyDay.length]),
  );

  useEffect(() => {
    if ((trustScore === 0 || trustScore === 50) && !hasShaken.current) {
      shake.value = withSequence(
        withRepeat(
          withSequence(
            withTiming(-3, { duration: 45 }),
            withTiming(3, { duration: 45 }),
          ),
          8,
          true,
        ),
        withTiming(0, { duration: 50 }),
      );

      hasShaken.current = true;
    }

    // reset jab score change ho
    if (trustScore > 50) {
      hasShaken.current = false;
    }
  }, [trustScore]);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleProfilePress = (profile: any) => {
    router.push({
      pathname: "/Screens/ProfileDetail/ProfileDetail",
      params: { profileData: JSON.stringify(profile) },
    });
  };

  const handleStoryPress = (story: any) => {
    if (!story || story.spacer) return;
    router.push({
      pathname: "/Screens/SuccessStoryDetail/SuccessStoryDetail",
      params: { storyData: JSON.stringify(story) },
    });
  };

  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  const animatedFloat = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnim.value }],
  }));
  const animatedShake = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <View style={styles.container}>
      <WelcomeAnimation
        isVisible={showWelcome}
        onClose={async () => {
          setShowWelcome(false);
          await SecureStore.setItemAsync("welcome_seen", "true");
        }}
      />
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1a1a1a", "#2d1414", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.fixedHeaderContainer}>
        <Animated.View
          entering={FadeInDown.duration(800)}
          style={styles.header}
        >
          <View>
            <Text style={styles.welcomeText}>Perfect Milan,</Text>
            <Text style={styles.userName}>{userName} ✨</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Notification Icon */}
            <TouchableOpacity
              style={styles.notificationIcon}
              onPress={() =>
                router.push("/Screens/NotificationCenter/NotificationCenter")
              } // Apna path yahan change karein
            >
              <Ionicons
                name="notifications-outline"
                size={26}
                color="#D4AF37"
              />
              <View style={styles.badge} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileCircle}>
              <Image
                source={{ uri: userPhoto || "https://via.placeholder.com/150" }}
                style={styles.avatar}
              />
              <Animated.View style={[styles.onlineDot, animatedPulse]} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInLeft.delay(200)}
          style={[styles.completionCard, animatedShake]}
        >
          <LinearGradient
            colors={["rgba(212,175,55,0.15)", "rgba(0,0,0,0.8)"]}
            style={styles.completionGradient}
          >
            <View style={styles.completionInfo}>
              <Text style={styles.completionTitle}>Trust Score Status</Text>
              <Text style={styles.completionSub}>
                {trustScore < 100
                  ? "Complete verification to gain 2x matches"
                  : "Your profile is fully verified"}
              </Text>
            </View>
            <View
              style={[
                styles.progressCircle,
                (trustScore === 0 || trustScore === 50) && {
                  borderColor: "#ff4d4d",
                },
              ]}
            >
              <Text
                style={[
                  styles.progressText,
                  (trustScore === 0 || trustScore === 50) && {
                    color: "#ff4d4d",
                  },
                ]}
              >
                {trustScore}%
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.statsRow}>
          {[
            { label: "Total Matches", val: "12.5k" },
            { label: "Active Now", val: "840" },
            { label: "Daily Rishtey", val: "150+" },
          ].map((item, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(400 + index * 100)}
              style={styles.statBox}
            >
              <Text style={styles.statVal}>{item.val}</Text>
              <Text style={styles.statLab}>{item.label}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {bestMatch && bestMatch.profile && (
          <Animated.View
            entering={FadeIn.delay(600)}
            style={styles.compatibilitySection}
          >
            <Text style={styles.sectionTitle}>Top Compatibility Match 💎</Text>
            <TouchableOpacity
              style={styles.compatCard}
              onPress={() => handleProfilePress(bestMatch.profile)}
            >
              <Image
                source={{ uri: bestMatch.profile.primaryPhoto }}
                style={styles.compatImg}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.9)"]}
                style={styles.compatOverlay}
              >
                <View style={styles.compatBadge}>
                  <Text style={styles.compatBadgeText}>
                    {bestMatch.matchPercentage}% Match
                  </Text>
                </View>
                <Text style={styles.compatName}>
                  {bestMatch.profile.name}, {bestMatch.profile.maritalStatus}
                </Text>
                <Text style={styles.compatDetails}>
                  {bestMatch.profile.caste} • {bestMatch.profile.occupation} •{" "}
                  {bestMatch.profile.city}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.matchSection}>
          <Text style={styles.sectionTitle}>Rishtey of the Day 💝</Text>
          <FlatList
            ref={matchesRef}
            data={rishteyDay}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 25 }}
            keyExtractor={(item) => item._id} // Ensure _id exist karta hai
            snapToInterval={MATCH_CARD_WIDTH + 15}
            decelerationRate="fast"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.matchCard}
                onPress={() => handleProfilePress(item)}
              >
                {/* Yahan check karein image URL exist karta hai ya nahi */}
                <Image
                  source={{
                    uri: item.primaryPhoto || "https://via.placeholder.com/150",
                  }}
                  style={styles.matchImg}
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.85)"]}
                  style={styles.matchOverlay}
                >
                  <Text style={styles.matchName}>{item.name || "Unknown"}</Text>
                  <Text style={styles.matchSub}>
                    {item.occupation || item.education || "N/A"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.carouselWrapper}>
          <Text
            style={[styles.sectionTitle, { marginLeft: 25, marginBottom: 15 }]}
          >
            Success Stories ❤️
          </Text>
          <Animated.FlatList
            ref={successRef}
            data={successStories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            snapToInterval={ITEM_SIZE}
            decelerationRate="fast"
            onScroll={onScroll}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: ITEM_SIZE,
              offset: ITEM_SIZE * index,
              index,
            })}
            renderItem={({ item, index }) => (
              <CarouselItem
                item={item}
                index={index}
                scrollX={scrollX}
                onPress={handleStoryPress}
              />
            )}
          />
        </View>

        <Animated.View
          entering={FadeInDown.delay(800)}
          style={styles.horoscopeCard}
        >
          <LinearGradient
            colors={["#2d1414", "#1a1a1a"]}
            style={styles.horoscopeGradient}
          >
            <Text style={styles.horoscopeEmoji}>♈</Text>
            <View style={styles.horoscopeContent}>
              <Text style={styles.horoscopeTitle}>Daily Kundli Insights</Text>
              <Text style={styles.horoscopeText}>
                Today is auspicious for meeting new people from the North
                direction.
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(900)}
          style={styles.premiumBanner}
        >
          <LinearGradient
            colors={["#D4AF37", "#B8860B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.premiumGradient}
          >
            <View style={styles.premiumContent}>
              <Text style={styles.premiumText}>Upgrade to Gold Milan</Text>
              <Text style={styles.premiumSub}>
                See who likes you & Unlimited Chat
              </Text>
            </View>
            <TouchableOpacity
              style={styles.goldButton}
              onPress={() => router.push("/Screens/Membership/MembershipPlans")}
            >
              <Text style={styles.goldButtonText}>JOIN GOLD</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently Joined 🆕</Text>
          <TouchableOpacity
            onPress={() => router.push("/Screens/RecentJoins/RecentJoins")}
          >
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recentGrid}>
          {recentJoins.map((person, idx) => (
            <TouchableOpacity
              key={person._id}
              onPress={() => handleProfilePress(person)}
            >
              <Animated.View
                entering={FadeInDown.delay(1000 + idx * 100)}
                style={styles.recentItem}
              >
                <Image
                  source={{ uri: person.primaryPhoto }}
                  style={styles.recentImg}
                />
                <View style={styles.verifiedMini}>
                  <Text style={styles.check}>✓</Text>
                </View>
                <Text style={styles.recentName}>{person.name}</Text>
                <Text style={styles.recentLoc}>{person.city}</Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionGrid}>
          {[
            { e: "🔍", t: "Browse" },
            { e: "📍", t: "Nearby" },
            { e: "💍", t: "Kundli" },
            { e: "💼", t: "Career" },
          ].map((act, idx) => (
            <TouchableOpacity key={idx} style={styles.actionItem}>
              <View style={styles.emojiContainer}>
                <Text style={styles.actionEmoji}>{act.e}</Text>
              </View>
              <Text style={styles.actionText}>{act.t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.trustBanner}>
          <Text style={styles.trustText}>
            ✓ 100% SECURE • ✓ VERIFIED RISHTEY • ✓ PRIVACY PROTECTED
          </Text>
        </View>
        <View style={{ height: 160 }} />
      </Animated.ScrollView>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push("/Screens/KundliMatch/KundliMatch")}
      >
        <Animated.View style={[styles.floatingButton, animatedFloat]}>
          <LinearGradient
            colors={["#D4AF37", "#8A6E2F"]}
            style={styles.fabGradient}
          >
            <Ionicons name="chatbubble-ellipses" size={28} color="#000" />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
      <CustomBottomTab activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  fixedHeaderContainer: {
    paddingTop: 50,
    backgroundColor: "#1a1a1a",
    zIndex: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 15,
  },
  scrollContent: { paddingTop: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  welcomeText: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 1,
  },
  userName: { color: "#D4AF37", fontSize: 24, fontWeight: "900" },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#D4AF37",
    padding: 2,
  },
  avatar: { width: "100%", height: "100%", borderRadius: 25 },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#000",
  },
  completionCard: {
    marginHorizontal: 25,
    marginBottom: 15,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  completionGradient: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
  },
  completionInfo: { flex: 1 },
  completionTitle: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  completionSub: { color: "#aaa", fontSize: 10, marginTop: 2 },
  progressCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
    borderColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: { color: "#D4AF37", fontSize: 10, fontWeight: "bold" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  statBox: {
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 10,
    borderRadius: 12,
    width: (width - 60) / 3,
    alignItems: "center",
  },
  statVal: { color: "#D4AF37", fontSize: 14, fontWeight: "800" },
  statLab: { color: "#fff", fontSize: 8, marginTop: 2, opacity: 0.5 },
  compatibilitySection: { marginBottom: 30 },
  compatCard: {
    marginHorizontal: 25,
    height: 200,
    borderRadius: 25,
    overflow: "hidden",
  },
  compatImg: { width: "100%", height: "100%", resizeMode: "cover" },
  compatOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    justifyContent: "flex-end",
    padding: 20,
  },
  compatBadge: {
    backgroundColor: "#D4AF37",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 5,
  },
  compatBadgeText: { color: "#000", fontSize: 9, fontWeight: "bold" },
  compatName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  compatDetails: { color: "#ccc", fontSize: 11 },
  matchSection: { marginBottom: 30 },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 25,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 25,
    marginBottom: 10,
  },
  viewAll: { color: "#D4AF37", fontSize: 12, fontWeight: "700" },
  matchCard: {
    width: MATCH_CARD_WIDTH,
    height: 180,
    borderRadius: 22,
    marginRight: 15,
    overflow: "hidden",
  },
  matchImg: { width: "100%", height: "100%" },
  matchOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
    justifyContent: "flex-end",
    padding: 12,
  },
  matchName: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  matchSub: { color: "#ddd", fontSize: 9 },
  carouselWrapper: { height: 360, marginBottom: 10 },
  carouselCard: {
    height: 300,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  cardImage: { width: "100%", height: "100%" },
  cardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    justifyContent: "flex-end",
    padding: 20,
  },
  cardTitle: { color: "#D4AF37", fontSize: 18, fontWeight: "bold" },
  cardStory: { color: "#fff", fontSize: 11, marginTop: 4 },
  paginationDots: {
    position: "absolute",
    top: 15,
    right: 15,
    flexDirection: "row",
    zIndex: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginLeft: 4 },
  horoscopeCard: {
    marginHorizontal: 25,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 25,
  },
  horoscopeGradient: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
  },
  horoscopeEmoji: { fontSize: 30, marginRight: 12 },
  horoscopeContent: { flex: 1 },
  horoscopeTitle: { color: "#D4AF37", fontSize: 15, fontWeight: "bold" },
  horoscopeText: { color: "#aaa", fontSize: 10 },
  recentGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
  },
  recentItem: { alignItems: "center", width: (width - 70) / 4 },
  recentImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  verifiedMini: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#D4AF37",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
  check: { color: "#000", fontSize: 7, fontWeight: "bold" },
  recentName: { color: "#fff", fontSize: 11, fontWeight: "600", marginTop: 5 },
  recentLoc: { color: "#777", fontSize: 9 },
  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    paddingHorizontal: 25,
  },
  actionItem: { alignItems: "center" },
  emojiContainer: {
    width: 55,
    height: 55,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  actionEmoji: { fontSize: 22 },
  actionText: { color: "#aaa", fontSize: 10 },
  trustBanner: {
    backgroundColor: "rgba(212,175,55,0.03)",
    paddingVertical: 12,
    marginTop: 25,
    alignItems: "center",
  },
  trustText: { color: "#D4AF37", fontSize: 8, fontWeight: "700" },
  premiumBanner: {
    marginHorizontal: 20,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 30,
  },
  premiumGradient: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  premiumContent: { flex: 1 },
  premiumText: { color: "#000", fontSize: 16, fontWeight: "900" },
  premiumSub: { color: "#333", fontSize: 10 },
  goldButton: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  goldButtonText: { color: "#D4AF37", fontWeight: "900", fontSize: 9 },
  floatingButton: {
    position: "absolute",
    bottom: 100,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 10,
    zIndex: 5,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  fabEmoji: { fontSize: 24 },
  notificationIcon: {
    marginRight: 15,
    position: "relative",
    padding: 5,
  },
  badge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff4d4d",
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
});

export default Dashboard;
