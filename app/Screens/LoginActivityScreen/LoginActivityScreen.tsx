import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Clock,
    Laptop,
    MapPin,
    ShieldCheck,
    Smartphone,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
    getMyLoginActivities,
    LoginActivity,
} from "../../../Services/api/loginactivity";

const { width } = Dimensions.get("window");

const LoginActivityScreen = () => {
  const router = useRouter();
  const [activities, setActivities] = useState<LoginActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const data = await getMyLoginActivities();
      setActivities(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string, isCurrent: boolean) => {
    if (isCurrent) return "Active Now";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: LoginActivity;
    index: number;
  }) => {
    const isMobile =
      item.os?.toLowerCase().includes("android") ||
      item.os?.toLowerCase().includes("ios") ||
      item.os?.toLowerCase().includes("iphone");

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).duration(500)}
        style={styles.loginCard}
      >
        <View style={styles.iconWrapper}>
          {isMobile ? (
            <Smartphone size={22} color="#D4AF37" />
          ) : (
            <Laptop size={22} color="#D4AF37" />
          )}
        </View>

        <View style={styles.infoWrapper}>
          <View style={styles.deviceRow}>
            <Text style={styles.deviceName}>
              {item.deviceName || "Unknown Device"}
            </Text>
            {item.isCurrentDevice && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>Current</Text>
              </View>
            )}
          </View>

          <View style={styles.detailRow}>
            <MapPin size={12} color="#666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>

          <View style={styles.detailRow}>
            <Clock size={12} color="#666" />
            <Text style={styles.detailText}>
              {formatTime(item.time, item.isCurrentDevice)}
            </Text>
          </View>
        </View>

        {!item.isCurrentDevice && (
          <TouchableOpacity style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1a1a1a", "#000", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login Activity</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <View style={styles.securityBanner}>
              <ShieldCheck size={20} color="#D4AF37" />
              <Text style={styles.bannerText}>
                We'll notify you if we notice any suspicious login attempts.
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#1a1a1a",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
    backgroundColor: "rgba(212,175,55,0.1)",
    borderRadius: 12,
  },
  headerTitle: { color: "#D4AF37", fontSize: 20, fontWeight: "bold" },
  listContent: { padding: 20, paddingBottom: 40 },
  securityBanner: {
    flexDirection: "row",
    backgroundColor: "rgba(212,175,55,0.05)",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.1)",
  },
  bannerText: { color: "#888", fontSize: 13, marginLeft: 12, flex: 1 },
  loginCard: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  iconWrapper: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "rgba(212,175,55,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoWrapper: { flex: 1 },
  deviceRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  deviceName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  activeBadge: {
    backgroundColor: "rgba(0, 255, 127, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  activeText: { color: "#00FF7F", fontSize: 10, fontWeight: "bold" },
  detailRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  detailText: { color: "#666", fontSize: 12, marginLeft: 6 },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  logoutBtnText: { color: "#ff4444", fontSize: 12, fontWeight: "600" },
});

export default LoginActivityScreen;
