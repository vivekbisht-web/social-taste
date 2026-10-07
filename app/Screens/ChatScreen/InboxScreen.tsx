import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Edit, Search } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  Layout,
} from "react-native-reanimated";
import { ChatListItem, getChatList } from "../../../Services/api/chat";
import { getAcceptedInterests } from "../../../Services/api/interest";
import CustomBottomTab from "../CustomBottomTab/CustomBottomTab";

const { width } = Dimensions.get("window");

const InboxScreen = () => {
  const [activeTab, setActiveTab] = useState("Chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [acceptedMatches, setAcceptedMatches] = useState<any[]>([]);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const fetchAllData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const [matchesRes, chatsRes] = await Promise.all([
        getAcceptedInterests(),
        getChatList(),
      ]);
      setAcceptedMatches(matchesRes || []);
      setChats(chatsRes || []);
    } catch (error) {
      console.error(error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllData(chats.length === 0);

      const interval = setInterval(() => {
        fetchAllData(false);
      }, 3000);

      return () => clearInterval(interval);
    }, [chats.length]),
  );

  const formatLastSeen = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleOpenChat = (item: any) => {
    router.push({
      pathname: "/Screens/ChatScreen/ChatScreen",
      params: {
        id: item._id,
        name: item.name,
        photo: item.primaryPhoto,
        isOnline: item.isOnline ? "true" : "false",
        lastSeen: item.lastSeen || "",
      },
    });
  };

  const renderNewMatch = ({ item, index }: any) => (
    <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
      <TouchableOpacity
        style={styles.newMatchItem}
        onPress={() => handleOpenChat(item)}
      >
        <LinearGradient colors={["#D4AF37", "#B8860B"]} style={styles.goldRing}>
          <Image
            source={{
              uri: item.primaryPhoto || "https://via.placeholder.com/150",
            }}
            style={styles.newMatchImage}
          />
        </LinearGradient>
        <Text style={styles.newMatchName} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderChatItem = ({
    item,
    index,
  }: {
    item: ChatListItem;
    index: number;
  }) => {
    return (
      <Animated.View
        entering={FadeInDown.delay(300 + index * 100).springify()}
        layout={Layout.springify()}
        key={item._id}
      >
        <TouchableOpacity
          style={styles.chatItem}
          activeOpacity={0.7}
          onPress={() => handleOpenChat(item)}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: item.primaryPhoto || "https://via.placeholder.com/150",
              }}
              style={styles.chatAvatar}
            />
            {item.isOnline && <View style={styles.onlineDot} />}
          </View>

          <View style={styles.chatInfo}>
            <View style={styles.chatHeaderRow}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.chatTime}>
                {item.isOnline ? "Online" : formatLastSeen(item.lastSeen)}
              </Text>
            </View>

            <View style={styles.chatMessageRow}>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.isOnline
                  ? "Active now"
                  : `Last seen at ${formatLastSeen(item.lastSeen)}`}
              </Text>
            </View>
          </View>
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

      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Edit size={20} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Search size={18} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search matches or messages..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeIn.delay(200)}>
          <Text style={styles.sectionTitle}>New Matches ✨</Text>
          {loading ? (
            <ActivityIndicator color="#D4AF37" style={{ marginLeft: 20 }} />
          ) : (
            <FlatList
              data={acceptedMatches}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.newMatchesList}
              renderItem={renderNewMatch}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No new matches yet</Text>
              }
            />
          )}
        </Animated.View>

        <View style={styles.divider} />

        <View style={styles.chatListContainer}>
          <Text style={styles.sectionTitle}>Recent Conversations</Text>
          {loading ? (
            <ActivityIndicator color="#D4AF37" />
          ) : (
            chats.map((item, index) => renderChatItem({ item, index }))
          )}
          {!loading && chats.length === 0 && (
            <Text style={styles.emptyText}>No conversations found</Text>
          )}
        </View>
      </ScrollView>

      <CustomBottomTab activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#1a1a1a",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    zIndex: 10,
    borderBottomWidth: 1,
    borderColor: "rgba(212,175,55,0.1)",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#D4AF37", fontSize: 28, fontWeight: "bold" },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(212,175,55,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginTop: 15,
    height: 45,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: "#fff", fontSize: 14 },
  scrollContent: { paddingBottom: 130 },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  newMatchesList: { paddingLeft: 20, paddingRight: 10 },
  newMatchItem: { alignItems: "center", marginRight: 18, width: 75 },
  goldRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  newMatchImage: {
    width: "100%",
    height: "100%",
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#1a1a1a",
  },
  newMatchName: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500",
    textAlign: "center",
  },
  emptyText: { color: "#666", marginLeft: 20, fontSize: 14 },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
    marginTop: 20,
  },
  chatListContainer: { paddingHorizontal: 20 },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  avatarContainer: { marginRight: 15 },
  chatAvatar: { width: 55, height: 55, borderRadius: 27.5 },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    backgroundColor: "#4CAF50",
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#1a1a1a",
  },
  chatInfo: { flex: 1, justifyContent: "center" },
  chatHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: { color: "#fff", fontSize: 16, fontWeight: "600" },
  chatTime: { color: "#888", fontSize: 11 },
  chatMessageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 20,
  },
  lastMessage: { flex: 1, color: "#888", fontSize: 13 },
});

export default InboxScreen;
