import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  CheckCheck,
  ChevronLeft,
  Phone,
  Send,
  Video,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  Layout,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { io, Socket } from "socket.io-client";
import { getChatMessages, sendMessage } from "../../../Services/api/chat";

const { width } = Dimensions.get("window");
const SOCKET_URL = "https://social-taste-matrimony.onrender.com";

const ChatScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRecipientOnline, setIsRecipientOnline] = useState(
    params.isOnline === "true",
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const socket = useRef<Socket | null>(null);
  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const sendButtonScale = useSharedValue(0);

  const fetchData = useCallback(
    async (showLoading = false) => {
      try {
        if (showLoading) setLoading(true);
        const msgRes = await getChatMessages(params.id as string);
        setMessages(msgRes || []);
      } catch (error: any) {
        console.error(
          "Axios Error Details:",
          error.response?.status,
          error.response?.data || error.message,
        );
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [params.id],
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  useEffect(() => {
    const initializeUserAndSocket = async () => {
      try {
        const userData = await SecureStore.getItemAsync("userData");
        if (userData) {
          const user = JSON.parse(userData);
          const myId = user._id || user.id || user.user?._id;
          setCurrentUserId(myId);

          console.log("Attempting Socket Connection for User:", myId);

          socket.current = io(SOCKET_URL, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
          });

          socket.current.on("connect", () => {
            console.log(
              "Socket Connected Successfully ✅ ID:",
              socket.current?.id,
            );
            socket.current?.emit("setup", myId);
            socket.current?.emit("join chat", params.id);
          });

          socket.current.on("message received", (newMessage) => {
            console.log(
              "New Message via Socket (message received):",
              newMessage,
            );
            setMessages((prev) => {
              const exists = prev.find((m) => m._id === newMessage._id);
              if (exists) return prev;
              return [newMessage, ...prev];
            });
          });

          socket.current.on("receive_message", (newMessage) => {
            console.log(
              "New Message via Socket (receive_message):",
              newMessage,
            );
            setMessages((prev) => {
              const exists = prev.find((m) => m._id === newMessage._id);
              if (exists) return prev;
              return [newMessage, ...prev];
            });
          });

          socket.current.on("user_status", (data) => {
            console.log("Status Update Received:", data);
            if (data.userId === params.id) {
              setIsRecipientOnline(data.status === "online");
            }
          });

          socket.current.on("connect_error", (err) => {
            console.error("Socket Connection Error ❌:", err.message);
          });

          socket.current.on("disconnect", (reason) => {
            console.log("Socket Disconnected ⚠️ Reason:", reason);
          });
        }
      } catch (error) {
        console.error("Initialization Error:", error);
      }
    };

    initializeUserAndSocket();

    return () => {
      if (socket.current) {
        console.log("Cleaning up socket connection...");
        socket.current.disconnect();
      }
    };
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      fetchData(true);
    }, [fetchData]),
  );

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages]);

  useEffect(() => {
    sendButtonScale.value = withSpring(inputText.trim().length > 0 ? 1 : 0);
  }, [inputText]);

  const handleSend = async () => {
    if (inputText.trim().length === 0) return;
    const tempText = inputText.trim();
    setInputText("");

    try {
      const res = await sendMessage(params.id as string, tempText);
      if (res) {
        setMessages((prev) => [res, ...prev]);
        socket.current?.emit("new message", res);
      }
    } catch (error: any) {
      console.error(
        "Send Message Failed:",
        error.response?.status || error.message,
      );
    }
  };

  const formatTime = (dateString: any) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLastSeen = (dateString: string) => {
    if (!dateString) return "Offline";
    const date = new Date(dateString);
    return `Last seen at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const animatedSendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
    opacity: sendButtonScale.value,
  }));

  const renderMessage = ({ item }: any) => {
    const isSender =
      item.sender === currentUserId ||
      item.sender?._id === currentUserId ||
      item.from === currentUserId;

    return (
      <Animated.View
        entering={isSender ? SlideInRight.springify() : SlideInLeft.springify()}
        layout={Layout.springify()}
        style={[
          styles.messageWrapper,
          isSender
            ? styles.messageWrapperSender
            : styles.messageWrapperReceiver,
        ]}
      >
        {!isSender && (
          <Image
            source={{
              uri:
                (params.photo as string) || "https://via.placeholder.com/150",
            }}
            style={styles.chatAvatar}
          />
        )}
        <View style={isSender ? styles.senderBubble : styles.receiverBubble}>
          {isSender ? (
            <LinearGradient
              colors={["#D4AF37", "#B8860B"]}
              style={styles.bubbleGradient}
            >
              <Text style={styles.senderText}>{item.message}</Text>
              <View style={styles.timeRow}>
                <Text style={styles.senderTime}>
                  {formatTime(item.createdAt || new Date())}
                </Text>
                <CheckCheck
                  size={12}
                  color="#1a1a1a"
                  style={{ marginLeft: 4 }}
                />
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.receiverBubbleContent}>
              <Text style={styles.receiverText}>{item.message}</Text>
              <Text style={styles.receiverTime}>
                {formatTime(item.createdAt || new Date())}
              </Text>
            </View>
          )}
        </View>
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}
        >
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ChevronLeft size={28} color="#D4AF37" />
            </TouchableOpacity>
            <View style={styles.profileHeader}>
              <Image
                source={{
                  uri:
                    (params.photo as string) ||
                    "https://via.placeholder.com/150",
                }}
                style={styles.headerAvatar}
              />
              {isRecipientOnline && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerName}>{params.name || "User"}</Text>
              <Text style={styles.headerStatus}>
                {isRecipientOnline
                  ? "Online"
                  : formatLastSeen(params.lastSeen as string)}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Video size={22} color="#D4AF37" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Phone size={20} color="#D4AF37" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.chatArea}>
          {loading ? (
            <ActivityIndicator color="#D4AF37" style={{ marginTop: 20 }} />
          ) : (
            <Animated.FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item, index) => item._id || index.toString()}
              renderItem={renderMessage}
              inverted
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
              maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            />
          )}
        </View>

        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Math.max(insets.bottom, 15) },
          ]}
        >
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <Animated.View
              style={[styles.sendContainer, animatedSendButtonStyle]}
            >
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={inputText.trim().length === 0}
              >
                <LinearGradient
                  colors={["#D4AF37", "#B8860B"]}
                  style={styles.sendGradient}
                >
                  <Send size={18} color="#000" style={{ marginLeft: 2 }} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 10,
    paddingBottom: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    zIndex: 10,
    borderBottomWidth: 1,
    borderColor: "rgba(212,175,55,0.1)",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  backButton: { padding: 5 },
  profileHeader: { marginHorizontal: 8 },
  headerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1.5,
    borderColor: "#D4AF37",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: "#4CAF50",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#1a1a1a",
  },
  headerTitleContainer: { marginLeft: 5 },
  headerName: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  headerStatus: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  headerRight: { flexDirection: "row", alignItems: "center" },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  chatArea: { flex: 1, paddingHorizontal: 15 },
  flatListContent: { paddingTop: 20, paddingBottom: 10 },
  messageWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 15,
  },
  messageWrapperSender: { justifyContent: "flex-end" },
  messageWrapperReceiver: { justifyContent: "flex-start" },
  chatAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
  },
  senderBubble: {
    maxWidth: "75%",
    borderRadius: 20,
    overflow: "hidden",
    borderBottomRightRadius: 5,
  },
  bubbleGradient: { padding: 12, paddingHorizontal: 16 },
  senderText: { color: "#000", fontSize: 15, fontWeight: "500" },
  timeRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  senderTime: { color: "rgba(0,0,0,0.6)", fontSize: 10, fontWeight: "bold" },
  receiverBubble: {
    maxWidth: "75%",
    borderRadius: 20,
    backgroundColor: "#222",
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: "#333",
  },
  receiverBubbleContent: { padding: 12, paddingHorizontal: 16 },
  receiverText: { color: "#e0e0e0", fontSize: 15 },
  receiverTime: { color: "#888", fontSize: 10, marginTop: 4 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  textInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 25,
    paddingHorizontal: 15,
    minHeight: 50,
    marginBottom: 5,
  },
  textInput: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 10 },
  sendContainer: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: { width: 38, height: 38, borderRadius: 19, overflow: "hidden" },
  sendGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default ChatScreen;
