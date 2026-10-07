import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, ShieldAlert, UserCheck, UserX } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { blockUser, unblockUser } from "../../../Services/api/chat";
import { getAcceptedInterests } from "../../../Services/api/interest";
import CustomAlert from "../../../components/CustomAlert/CustomAlert";

const BlockedUsersScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState("Matches");
  const [matches, setMatches] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await getAcceptedInterests();
      setMatches(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (
    title: string,
    message: string,
    confirmText: string,
    onConfirm: () => void,
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      confirmText,
      onConfirm: () => {
        onConfirm();
        setAlertConfig((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  const handleBlockAction = (user: any) => {
    showAlert(
      "Block User",
      `Are you sure you want to block ${user.name}? This will move them to your blocked list.`,
      "Block",
      async () => {
        try {
          await blockUser(user._id);
          setMatches((prev) => prev.filter((item) => item._id !== user._id));
          setBlockedUsers((prev) => [...prev, user]);
        } catch (error) {
          console.error("Failed to block user");
        }
      },
    );
  };

  const handleUnblockAction = (user: any) => {
    showAlert(
      "Unblock User",
      `Are you sure you want to unblock ${user.name}?`,
      "Unblock",
      async () => {
        try {
          await unblockUser(user._id);
          setBlockedUsers((prev) =>
            prev.filter((item) => item._id !== user._id),
          );
          setMatches((prev) => [...prev, user]);
        } catch (error) {
          console.error("Failed to unblock user");
        }
      },
    );
  };

  const renderUserItem = ({ item, index }: { item: any; index: number }) => {
    const isBlockedTab = activeTab === "Blocked";

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        layout={Layout.springify()}
        style={styles.userCard}
      >
        <Image
          source={{
            uri: item.primaryPhoto || "https://via.placeholder.com/150",
          }}
          style={styles.avatar}
        />

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userStatus}>
            {isBlockedTab ? "Blocked" : "Connected"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            isBlockedTab ? handleUnblockAction(item) : handleBlockAction(item)
          }
          style={styles.actionBtn}
        >
          <LinearGradient
            colors={
              isBlockedTab ? ["#4CAF50", "#2E7D32"] : ["#ff4b2b", "#ff416c"]
            }
            style={styles.btnGradient}
          >
            {isBlockedTab ? (
              <UserCheck size={16} color="#fff" />
            ) : (
              <UserX size={16} color="#fff" />
            )}
            <Text style={styles.btnText}>
              {isBlockedTab ? "Unblock" : "Block"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1a1a1a", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#D4AF37" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        {["Matches", "Blocked"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "Matches"
                ? "Matches"
                : `Blocked (${blockedUsers.length})`}
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
          data={activeTab === "Matches" ? matches : blockedUsers}
          keyExtractor={(item) => item._id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <ShieldAlert size={50} color="#333" />
              <Text style={styles.emptyText}>
                {activeTab === "Matches"
                  ? "No matches found"
                  : "No blocked users"}
              </Text>
            </View>
          }
        />
      )}

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        onConfirm={alertConfig.onConfirm}
        onCancel={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
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
    borderRadius: 12,
    backgroundColor: "rgba(212,175,55,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#D4AF37" },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12 },
  activeTab: { backgroundColor: "#D4AF37" },
  tabText: { color: "#888", fontWeight: "bold", fontSize: 14 },
  activeTabText: { color: "#000" },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  userInfo: { flex: 1, marginLeft: 15 },
  userName: { color: "#fff", fontSize: 16, fontWeight: "600" },
  userStatus: { color: "#666", fontSize: 12, marginTop: 2 },
  actionBtn: { marginLeft: 10 },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
  },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  emptyState: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { color: "#444", marginTop: 15, fontSize: 14 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default BlockedUsersScreen;
