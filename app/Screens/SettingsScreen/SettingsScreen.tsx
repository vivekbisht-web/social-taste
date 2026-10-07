import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Href, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  Bell,
  ChevronRight,
  Crown,
  FileText,
  HeartHandshake,
  HelpCircle,
  LogOut,
  Shield,
  Sliders,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInLeft,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import CustomAlert from "../../../components/CustomAlert/CustomAlert";
import { getUserDetails } from "../../../Services/api/authService";
import CustomBottomTab from "../CustomBottomTab/CustomBottomTab";

const { width } = Dimensions.get("window");

type SettingsMenuItem = {
  id: string;
  title: string;
  sub: string;
  icon: React.ComponentType<any>;
  route: Href;
};

const SETTINGS_MENU: SettingsMenuItem[] = [
  {
    id: "1",
    title: "Account Settings",
    sub: "Phone, Email & Password",
    icon: User,
    route: "/Screens/AccountSettings/AccountSettings",
  },
  {
    id: "2",
    title: "Partner Preferences",
    sub: "Age, Height, Religion & Gotra",
    icon: Sliders,
    route: "/Screens/PartnerPreferences/PartnerPreferences",
  },
  {
    id: "3",
    title: "Privacy & Security",
    sub: "Profile Visibility & Blocked users",
    icon: Shield,
    route: "/Screens/PrivacySecurity/PrivacySecurity",
  },
  {
    id: "4",
    title: "Notification Center",
    sub: "Push & Email alerts",
    icon: Bell,
    route: "/Screens/NotificationCenter/NotificationCenter",
  },
  {
    id: "5",
    title: "Generate Bio-data",
    sub: "Create a professional marriage PDF",
    icon: FileText,
    route: "/Screens/GenerateBioData/GenerateBioData",
  },
  {
    id: "6",
    title: "Trust & Verification",
    sub: "Verify your profile with ID",
    icon: HeartHandshake,
    route: "/Screens/TrustVerification/TrustVerification",
  },
  {
    id: "7",
    title: "Help & Support",
    sub: "FAQs & Contact our team",
    icon: HelpCircle,
    route: "/Screens/HelpSupport/HelpSupport",
  },
];

const SettingsScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Settings");
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutAlertVisible, setLogoutAlertVisible] = useState(false);

  const crownScale = useSharedValue(1);

  useEffect(() => {
    fetchFullUserData();
    crownScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, []);

  const fetchFullUserData = async () => {
    try {
      setIsLoading(true);
      const jsonValue = await SecureStore.getItemAsync("userData"); // Use getItemAsync for SecureStore

      if (jsonValue) {
        const storedData = JSON.parse(jsonValue);
        // तुरंत Local Storage से Name और Phone सेट करें
        setUserData(storedData);

        const userId = storedData._id || storedData.id;
        if (userId) {
          // अब Background में API से ताज़ा डेटा (जैसे Profile Photo) लाएं
          const apiData = await getUserDetails(userId);
          setUserData(apiData);
        }
      }
    } catch (e) {
      console.error("Error fetching settings data:", e);
    } finally {
      setIsLoading(false);
    }
  };
  const executeLogout = async () => {
    try {
      setLogoutAlertVisible(false);

      // Clear all storage
      await AsyncStorage.multiRemove(["userToken", "userData"]);
      await SecureStore.deleteItemAsync("userData");
      await SecureStore.deleteItemAsync("welcome_seen"); // Reset welcome animation

      router.replace("/Screens/login/login");
    } catch (e) {
      console.error(e);
    }
  };

  const animatedCrown = useAnimatedStyle(() => ({
    transform: [{ scale: crownScale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1a1a1a", "#000", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          entering={ZoomIn.delay(200).duration(500)}
          style={styles.profileSection}
        >
          <View style={styles.profileRow}>
            <Image
              source={{
                uri:
                  userData?.primaryPhoto || "https://via.placeholder.com/150",
              }}
              style={styles.profileAvatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userData?.name || "User"} ✨
              </Text>
              <Text style={styles.profileId}>
                Phone: {userData?.phone || "N/A"}
              </Text>

              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={() =>
                  router.push("/Screens/EditProfileScreen/EditProfileScreen")
                }
              >
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInLeft.delay(400).duration(600)}
          style={styles.premiumBannerWrapper}
        >
          <LinearGradient
            colors={["#D4AF37", "#B8860B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumBanner}
          >
            <View style={styles.premiumContent}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Animated.View style={animatedCrown}>
                  <Crown
                    size={22}
                    color="#000"
                    fill="#000"
                    style={{ marginRight: 8 }}
                  />
                </Animated.View>
                <Text style={styles.premiumTitle}>Milan Gold Member</Text>
              </View>
              <Text style={styles.premiumSub}>
                Unlock who liked you & send unlimited messages.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.upgradeBtn}
              activeOpacity={0.9}
              onPress={() => router.push("/Screens/Membership/MembershipPlans")}
            >
              <Text style={styles.upgradeBtnText}>UPGRADE</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(500)}
          style={styles.toggleCard}
        >
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Ghost Mode 👻</Text>
            <Text style={styles.toggleSub}>
              Browse profiles silently. Only matches can see you.
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#333", true: "#D4AF37" }}
            thumbColor={isGhostMode ? "#fff" : "#888"}
            ios_backgroundColor="#333"
            onValueChange={() => setIsGhostMode(!isGhostMode)}
            value={isGhostMode}
          />
        </Animated.View>

        <View style={styles.menuContainer}>
          {SETTINGS_MENU.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(600 + index * 100)}
              >
                <TouchableOpacity
                  style={styles.menuItem}
                  activeOpacity={0.7}
                  onPress={() => router.push(item.route)}
                >
                  <View style={styles.menuIconContainer}>
                    <IconComponent size={20} color="#D4AF37" />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSub}>{item.sub}</Text>
                  </View>
                  <ChevronRight size={20} color="#666" />
                </TouchableOpacity>
                {index !== SETTINGS_MENU.length - 1 && (
                  <View style={styles.divider} />
                )}
              </Animated.View>
            );
          })}
        </View>

        <Animated.View
          entering={FadeInDown.delay(1200)}
          style={styles.logoutContainer}
        >
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setLogoutAlertVisible(true)}
          >
            <LogOut size={20} color="#ff4444" style={{ marginRight: 10 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>App Version 2.4.1 (Premium)</Text>
        </Animated.View>
      </ScrollView>

      <CustomBottomTab activeTab={activeTab} onTabPress={setActiveTab} />

      <CustomAlert
        visible={logoutAlertVisible}
        title="Logout"
        message="Are you sure you want to logout? You will need to login again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={executeLogout}
        onCancel={() => setLogoutAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 20,
    backgroundColor: "#1a1a1a",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderBottomWidth: 1,
    borderColor: "rgba(212,175,55,0.1)",
    zIndex: 10,
  },
  headerTitle: { color: "#D4AF37", fontSize: 28, fontWeight: "bold" },
  scrollContent: { paddingBottom: 130, paddingTop: 20 },
  profileSection: { marginHorizontal: 20, marginBottom: 25 },
  profileRow: { flexDirection: "row", alignItems: "center" },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#D4AF37",
  },
  profileInfo: { marginLeft: 20, flex: 1 },
  profileName: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  profileId: { color: "#888", fontSize: 13, marginTop: 4, letterSpacing: 0.5 },
  editProfileBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: "rgba(212,175,55,0.1)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
  },
  editProfileText: { color: "#D4AF37", fontSize: 12, fontWeight: "bold" },
  premiumBannerWrapper: { marginHorizontal: 20, marginBottom: 25 },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#D4AF37",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  premiumContent: { flex: 1 },
  premiumTitle: { color: "#000", fontSize: 18, fontWeight: "900" },
  premiumSub: { color: "#222", fontSize: 11, marginTop: 4, fontWeight: "500" },
  upgradeBtn: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  upgradeBtnText: { color: "#D4AF37", fontSize: 12, fontWeight: "900" },
  toggleCard: {
    marginHorizontal: 20,
    marginBottom: 25,
    backgroundColor: "#1a1a1a",
    padding: 18,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  toggleInfo: { flex: 1, paddingRight: 15 },
  toggleTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  toggleSub: { color: "#888", fontSize: 11, marginTop: 4 },
  menuContainer: {
    marginHorizontal: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 25,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(212,175,55,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuTextContainer: { flex: 1 },
  menuTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  menuSub: { color: "#666", fontSize: 11, marginTop: 3 },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginLeft: 75,
    marginRight: 20,
  },
  logoutContainer: { alignItems: "center", marginTop: 35, marginBottom: 20 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,68,68,0.1)",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.3)",
  },
  logoutText: { color: "#ff4444", fontSize: 16, fontWeight: "bold" },
  versionText: { color: "#444", fontSize: 10, marginTop: 15 },
});

export default SettingsScreen;
