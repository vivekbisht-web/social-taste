import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface CommentItem {
  _id: string;
  text: string;
  createdAt?: string;
  user?: {
    _id: string;
    name: string;
    primaryPhoto?: string;
  };
}

interface Props {
  visible: boolean;
  onClose: () => void;
  comments: CommentItem[];
  onAddComment?: (text: string) => void;
}

const CommentsModal = ({ visible, onClose, comments, onAddComment }: Props) => {
  const [commentText, setCommentText] = useState("");

  const handleSend = () => {
    if (!commentText.trim()) return;

    onAddComment?.(commentText);

    setCommentText("");
  };

  const renderComment = ({ item }: any) => {
    return (
      <View style={styles.commentCard}>
        <Image
          source={{
            uri: item?.user?.primaryPhoto || "https://via.placeholder.com/150",
          }}
          style={styles.avatar}
        />

        <View style={styles.commentContent}>
          <Text style={styles.userName}>{item?.user?.name || "Unknown"}</Text>

          <Text style={styles.commentText}>{item?.text || ""}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>Comments</Text>

                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={comments || []}
                keyExtractor={(item, index) => item?._id || index.toString()}
                renderItem={renderComment}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={60}
                      color="#444"
                    />

                    <Text style={styles.emptyText}>No comments yet</Text>
                  </View>
                }
              />

              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Write a comment..."
                  placeholderTextColor="#777"
                  style={styles.input}
                  value={commentText}
                  onChangeText={setCommentText}
                />

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.sendButton}
                  onPress={handleSend}
                >
                  <Ionicons name="send" size={18} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CommentsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  container: {
    height: "75%",
    backgroundColor: "#111",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 18,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    color: "#D4AF37",
    fontSize: 22,
    fontWeight: "800",
  },

  listContainer: {
    paddingBottom: 20,
  },

  commentCard: {
    flexDirection: "row",
    marginBottom: 18,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#D4AF37",
  },

  commentContent: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 16,
  },

  userName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },

  commentText: {
    color: "#ccc",
    lineHeight: 20,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  input: {
    flex: 1,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    paddingHorizontal: 16,
    color: "#fff",
  },

  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },

  emptyText: {
    color: "#666",
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
  },
});
