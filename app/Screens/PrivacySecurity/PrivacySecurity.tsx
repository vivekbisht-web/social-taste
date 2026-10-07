import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Fingerprint,
  ShieldCheck,
  Smartphone,
  UserX,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");

const PrivacySecurity = () => {
  const router = useRouter();
  const [profileVisible, setProfileVisible] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [twoStep, setTwoStep] = useState(false);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    const [twoStepSaved, lastSeenSaved] = await Promise.all([
      SecureStore.getItemAsync("twoStepEnabled"),
      SecureStore.getItemAsync("lastSeenEnabled"),
    ]);

    if (twoStepSaved !== null) setTwoStep(twoStepSaved === "true");
    if (lastSeenSaved !== null) setShowLastSeen(lastSeenSaved === "true");
  };

  const handleLastSeenToggle = async (value: boolean) => {
    setShowLastSeen(value);
    await SecureStore.setItemAsync("lastSeenEnabled", String(value));

    console.log("--- PRIVACY UPDATE ---");
    console.log("Last Seen Visibility:", value ? "✅ ON" : "❌ OFF");
    console.log("-----------------------");
  };

  const handleTwoStepToggle = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      Alert.alert("Error", "Biometric security not available on this device.");
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to change security settings",
    });

    if (result.success) {
      const newValue = !twoStep;
      setTwoStep(newValue);
      await SecureStore.setItemAsync("twoStepEnabled", String(newValue));

      console.log("--- SECURITY UPDATE ---");
      console.log("Two-Step Verification:", newValue ? "✅ ON" : "❌ OFF");
      console.log("-----------------------");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1a1a1a", "#000", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Profile Privacy</Text>
        <View style={styles.cardContainer}>
          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Eye size={20} color="#D4AF37" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Public Visibility</Text>
              <Text style={styles.menuSub}>
                Allow everyone to see your profile
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#333", true: "#D4AF37" }}
              thumbColor={profileVisible ? "#fff" : "#888"}
              onValueChange={(val: boolean) => setProfileVisible(val)}
              value={profileVisible}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <EyeOff size={20} color="#D4AF37" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Last Seen</Text>
              <Text style={styles.menuSub}>Show when you were last active</Text>
            </View>
            <Switch
              trackColor={{ false: "#333", true: "#D4AF37" }}
              thumbColor={showLastSeen ? "#fff" : "#888"}
              onValueChange={handleLastSeenToggle}
              value={showLastSeen}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Interactions</Text>
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() =>
              router.push("/Screens/BlockedUsersScreen/BlockedUsersScreen")
            }
          >
            <View style={styles.menuIconContainer}>
              <UserX size={20} color="#D4AF37" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Blocked Users</Text>
            </View>
            <ChevronRight size={18} color="#666" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={styles.menuIconContainer}>
              <ShieldCheck size={20} color="#D4AF37" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Who can message me?</Text>
              <Text style={styles.menuSub}>Only Matches</Text>
            </View>
            <ChevronRight size={18} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>App Security</Text>
        <View style={styles.cardContainer}>
          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Fingerprint size={20} color="#D4AF37" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Two-Step Verification</Text>
              <Text style={styles.menuSub}>Extra layer of security</Text>
            </View>
            <Switch
              trackColor={{ false: "#333", true: "#D4AF37" }}
              thumbColor={twoStep ? "#fff" : "#888"}
              onValueChange={handleTwoStepToggle}
              value={twoStep}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() =>
              router.push("/Screens/LoginActivityScreen/LoginActivityScreen")
            } // Path check kar lena apne folder structure ke hisab se
          >
            <View style={styles.menuIconContainer}>
              <Smartphone size={20} color="#D4AF37" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Login Activity</Text>
              <Text style={styles.menuSub}>Check where you're logged in</Text>
            </View>
            <ChevronRight size={18} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.infoFooter}>
          Milan values your privacy. We never share your personal data with
          third parties.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#1a1a1a",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderBottomWidth: 1,
    borderColor: "rgba(212,175,55,0.1)",
  },
  backButton: {
    padding: 8,
    marginRight: 10,
    backgroundColor: "rgba(212,175,55,0.1)",
    borderRadius: 12,
  },
  headerTitle: { color: "#D4AF37", fontSize: 20, fontWeight: "bold" },
  scrollContent: { paddingBottom: 40, paddingTop: 10 },
  sectionTitle: {
    color: "#888",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginLeft: 25,
    marginBottom: 10,
    marginTop: 25,
  },
  cardContainer: {
    marginHorizontal: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(212,175,55,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuTextContainer: { flex: 1 },
  menuTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  menuSub: { color: "#666", fontSize: 12, marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginLeft: 65,
    marginRight: 15,
  },
  infoFooter: {
    color: "#444",
    fontSize: 11,
    textAlign: "center",
    marginTop: 30,
    paddingHorizontal: 40,
    lineHeight: 18,
  },
});

export default PrivacySecurity;
