import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  MapPin,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getAcceptedInterests,
  getSentInterests,
} from "../../../Services/api/interest";
import CustomBottomTab from "../CustomBottomTab/CustomBottomTab";

const { width } = Dimensions.get("window");

const ConnectionsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeSegment, setActiveSegment] = useState("Accepted");
  const [activeTab, setActiveTab] = useState("Connections");
  const [loading, setLoading] = useState(false);
  const [listData, setListData] = useState<any[]>([]);

  useEffect(() => {
    fetchNetworkData();
  }, [activeSegment]);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const response =
        activeSegment === "Accepted"
          ? await getAcceptedInterests()
          : await getSentInterests();

      setListData(response.data || response);
    } catch (error) {
      console.error(error);
      setListData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePress = (item: any) => {
    router.push({
      pathname: "/Screens/CommonProfile/profile-detail",
      params: { profileData: JSON.stringify(item) },
    });
  };

  const handleChatPress = (item: any) => {
    router.push({
      pathname: "/Screens/ChatScreen/ChatScreen",
      params: {
        id: item._id,
        name: item.name,
        photo: item.primaryPhoto,
        lastSeen: item.lastSeen || "",
        isOnline: (item.isOnline || false).toString(),
      },
    });
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleProfilePress(item)}
          style={styles.card}
        >
          <Image
            source={{
              uri: item.primaryPhoto || "https://via.placeholder.com/150",
            }}
            style={styles.avatar}
          />

          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>{item.name}</Text>
              {activeSegment === "Accepted" && (
                <CheckCircle2
                  size={14}
                  color="#D4AF37"
                  style={{ marginLeft: 6 }}
                />
              )}
            </View>

            <View style={styles.detailRow}>
              <Briefcase size={12} color="#888" />
              <Text style={styles.detailText}>{item.occupation || "N/A"}</Text>
            </View>

            <View style={styles.detailRow}>
              <MapPin size={12} color="#888" />
              <Text style={styles.detailText}>{item.city || "N/A"}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              if (activeSegment === "Accepted") {
                handleChatPress(item);
              }
            }}
          >
            <LinearGradient
              colors={
                activeSegment === "Accepted"
                  ? ["#D4AF37", "#8A6E2F"]
                  : ["#333", "#1a1a1a"]
              }
              style={styles.btnGradient}
            >
              <Text
                style={[
                  styles.btnText,
                  { color: activeSegment === "Accepted" ? "#000" : "#fff" },
                ]}
              >
                {activeSegment === "Accepted" ? "Chat" : "Pending"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1a1a1a", "#2d1414", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Network</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        {["Accepted", "Sent"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveSegment(tab)}
            style={[styles.tab, activeSegment === tab && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeSegment === tab && styles.activeTabText,
              ]}
            >
              {tab === "Accepted" ? "Connections" : "Interests Sent"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No records found</Text>
          }
        />
      )}

      <CustomBottomTab activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#D4AF37",
    letterSpacing: 0.5,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 25,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#D4AF37",
  },
  tabText: {
    color: "#888",
    fontWeight: "700",
    fontSize: 13,
  },
  activeTabText: {
    color: "#000",
  },
  listContent: {
    paddingHorizontal: 25,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 22,
    padding: 12,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.08)",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#D4AF37",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  nameText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  detailText: {
    color: "#aaa",
    fontSize: 11,
    marginLeft: 5,
  },
  actionButton: {
    marginLeft: 8,
  },
  btnGradient: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    marginTop: 50,
    fontSize: 14,
  },
});

export default ConnectionsScreen;
