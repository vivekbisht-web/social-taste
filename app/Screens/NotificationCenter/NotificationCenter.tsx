import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  BellRing,
  ChevronRight,
  MapPin,
  MessageSquare,
  Trash2,
} from "lucide-react-native";
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
import Animated, {
  FadeInRight,
  FadeOutLeft,
  Layout,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AcceptanceNotification,
  ChatNotification,
  clearChatNotifications,
  getAcceptanceNotifications,
  getChatNotifications,
} from "../../../Services/api/notification";

const NotificationCenter = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"Interests" | "Messages">(
    "Interests",
  );
  const [notifications, setNotifications] = useState<AcceptanceNotification[]>(
    [],
  );
  const [messages, setMessages] = useState<ChatNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [accRes, chatRes] = await Promise.all([
        getAcceptanceNotifications(),
        getChatNotifications(),
      ]);

      if (accRes.success) {
        setNotifications(accRes.notifications);
      }
      setMessages(chatRes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    try {
      if (activeTab === "Interests") {
        setNotifications([]);
      } else {
        setMessages([]);
        const response = await clearChatNotifications();
        if (response.success) {
          const freshMessages = await getChatNotifications();
          setMessages(freshMessages);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderInterestItem = ({
    item,
    index,
  }: {
    item: AcceptanceNotification;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 50).duration(400)}
      exiting={FadeOutLeft.duration(300)}
      layout={Layout.springify().damping(15)}
    >
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <Image
          source={{
            uri: item.primaryPhoto || "https://via.placeholder.com/50",
          }}
          style={styles.avatar}
        />
        <View style={styles.cardContent}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.occupation}>{item.occupation}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={12} color="#666" />
            <Text style={styles.cityText}>{item.city}</Text>
          </View>
          <Text style={styles.messageText}>
            Accepted your interest request.
          </Text>
        </View>
        <ChevronRight size={18} color="#D4AF37" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderMessageItem = ({
    item,
    index,
  }: {
    item: ChatNotification;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 50).duration(400)}
      exiting={FadeOutLeft.duration(300)}
      layout={Layout.springify().damping(15)}
    >
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: "/Screens/ChatScreen/ChatScreen",
            params: {
              id: item.senderId,
              name: item.senderName,
              photo: item.senderPhoto,
            },
          } as any)
        }
      >
        <View>
          <Image source={{ uri: item.senderPhoto }} style={styles.avatar} />
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.rowBetween}>
            <Text style={styles.userName}>{item.senderName}</Text>
            <Text style={styles.timeText}>
              {formatTime(item.lastMessageTime)}
            </Text>
          </View>
          <Text style={styles.messageText} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1a1a1a", "#000"]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
          <Trash2 color="#D4AF37" size={20} />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.tabContainer}>
        {(["Interests", "Messages"] as const).map((tab) => (
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
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      ) : (
        <FlatList
          data={(activeTab === "Interests" ? notifications : messages) as any[]}
          keyExtractor={(item) =>
            (item as any)._id ||
            (item as any).senderId ||
            Math.random().toString()
          }
          renderItem={({ item, index }) =>
            activeTab === "Interests"
              ? renderInterestItem({ item: item as any, index })
              : renderMessageItem({ item: item as any, index })
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Animated.View entering={FadeInRight} style={styles.emptyState}>
              {activeTab === "Interests" ? (
                <BellRing size={60} color="#333" />
              ) : (
                <MessageSquare size={60} color="#333" />
              )}
              <Text style={styles.emptyText}>
                No {activeTab.toLowerCase()} yet
              </Text>
            </Animated.View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#D4AF37", fontSize: 20, fontWeight: "900" },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  clearBtn: { padding: 8 },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 15,
    padding: 5,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 12 },
  activeTab: { backgroundColor: "#D4AF37" },
  tabText: { color: "#888", fontWeight: "700", fontSize: 14 },
  activeTabText: { color: "#000" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.1)",
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 1.5,
    borderColor: "#D4AF37",
  },
  badge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: "#D4AF37",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  badgeText: { color: "#000", fontSize: 10, fontWeight: "900" },
  cardContent: { flex: 1, marginLeft: 15 },
  userName: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  occupation: { color: "#D4AF37", fontSize: 12, marginTop: 2 },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  cityText: { color: "#888", fontSize: 11, marginLeft: 4 },
  messageText: {
    color: "#bbb",
    fontSize: 12,
    marginTop: 6,
    fontStyle: "italic",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: { color: "#666", fontSize: 11 },
  emptyState: { alignItems: "center", marginTop: 100 },
  emptyText: { color: "#444", marginTop: 15, fontSize: 16, fontWeight: "600" },
});

export default NotificationCenter;
