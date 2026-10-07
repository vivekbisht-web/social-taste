import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import {
  commentOnPost,
  deletePost,
  getMyPosts,
  getPosts,
  reactToPost,
} from "../../../Services/api/posts";

import CustomBottomTab from "../CustomBottomTab/CustomBottomTab";
import CommentsModal from "./CommentsModal/CommentsModal";
import CreatePostModal from "./CreatePostModal";

const { width } = Dimensions.get("window");

interface PostItem {
  _id: string;
  caption: string;
  location: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  likes: string[];
  dislikes: string[];
  comments: any[];
  user: {
    _id: string;
    name: string;
    email: string;
    primaryPhoto: string;
  };
}

const LifestyleScreen = () => {
  const [activeTab, setActiveTab] = useState("Lifestyle");
  const [activeFeed, setActiveFeed] = useState("Explore");

  const [posts, setPosts] = useState<PostItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState("");

  const [commentsVisible, setCommentsVisible] = useState(false);
  const [selectedComments, setSelectedComments] = useState<any[]>([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const response =
        activeFeed === "Explore" ? await getMyPosts() : await getPosts();

      if (response?.success && Array.isArray(response.data)) {
        const filteredPosts = response.data.filter(
          (item: any) => item && item._id,
        );

        setPosts(filteredPosts);

        if (activeCommentPostId) {
          const currentPost = filteredPosts.find(
            (p: any) => p._id === activeCommentPostId,
          );
          if (currentPost) {
            setSelectedComments(currentPost.comments || []);
          }
        }
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.log("Fetch Posts Error:", error);
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeFeed]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, [activeFeed]);

  const openMenu = (postId: string) => {
    setSelectedPostId(postId);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedPostId("");
  };

  const openComments = (postId: string, comments: any[]) => {
    setActiveCommentPostId(postId);
    setSelectedComments(comments || []);
    setCommentsVisible(true);
  };

  const closeComments = () => {
    setCommentsVisible(false);
    setSelectedComments([]);
    setActiveCommentPostId("");
  };

  const handleDeletePost = () => {
    closeMenu();

    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await deletePost(selectedPostId);

            if (response?.success) {
              setPosts((prev) =>
                prev.filter((item) => item?._id !== selectedPostId),
              );

              Alert.alert("Success", "Post deleted successfully");
            } else {
              Alert.alert("Error", "Failed to delete post");
            }
          } catch (error) {
            console.log("Delete Post Error:", error);

            Alert.alert("Error", "Something went wrong");
          }
        },
      },
    ]);
  };

  const handleLikePost = async (postId: string) => {
    try {
      const payload = {
        action: "like" as const,
      };

      const response = await reactToPost(postId, payload);

      if (response?.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post?._id === postId) {
              return response.data;
            }

            return post;
          }),
        );
      } else {
        Alert.alert("Error", "Failed to like post");
      }
    } catch (error) {
      console.log("Like Post Error:", error);

      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleAddComment = async (text: string) => {
    if (!activeCommentPostId) return;

    try {
      const payload = { text };
      const response = await commentOnPost(activeCommentPostId, payload);

      if (response?.success) {
        if (response?.data && Array.isArray(response?.data?.comments)) {
          setPosts((prevPosts) =>
            prevPosts.map((post) => {
              if (post?._id === activeCommentPostId) {
                return response.data;
              }
              return post;
            }),
          );
          setSelectedComments(response.data.comments);
        } else {
          await fetchPosts();
        }

        Alert.alert("Success", "Comment added successfully");
      } else {
        Alert.alert("Error", "Failed to add comment");
      }
    } catch (error) {
      console.log("Add Comment Error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleSharePost = async (post: PostItem) => {
    try {
      const postUrl = `https://yourapp.com/posts/${post._id}`;
      const shareMessage = `${post.caption ? `${post.caption}\n\n` : ""}Check out this post on Lifestyle: ${postUrl}`;

      await Share.share({
        message: shareMessage,
        url: postUrl,
        title: "Share Lifestyle Post",
      });
    } catch (error) {
      console.log("Share Post Error:", error);
    }
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(
            activeFeed === "Explore" ? 0 : (width - 60) / 2,
            {
              damping: 15,
              stiffness: 120,
            },
          ),
        },
      ],
    };
  });

  const renderPost = ({ item, index }: any) => {
    if (!item) return null;

    const isLiked = item.likes?.includes(item.user?._id);

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 120).springify()}
        style={styles.postCard}
      >
        <View style={styles.userRow}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri:
                  item.user?.primaryPhoto || "https://via.placeholder.com/150",
              }}
              style={styles.avatar}
            />

            <View>
              <Text style={styles.userName}>
                {item.user?.name || "Unknown"}
              </Text>

              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={12} color="#D4AF37" />

                <Text style={styles.locationText}>
                  {item.location || "No Location"}
                </Text>
              </View>
            </View>
          </View>

          {activeFeed === "My Posts" && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => openMenu(item._id)}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          horizontal
          pagingEnabled
          data={item.images || []}
          keyExtractor={(_, i) => i.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: image }) => (
            <Image source={{ uri: image }} style={styles.postImage} />
          )}
        />

        <View style={styles.actionRow}>
          <View style={styles.leftActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionBtn}
              onPress={() => handleLikePost(item._id)}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#ff4d4d" : "#D4AF37"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionBtn}
              onPress={() => openComments(item._id, item.comments)}
            >
              <Ionicons name="chatbubble-outline" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionBtn}
              onPress={() => handleSharePost(item)}
            >
              <Ionicons name="paper-plane-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="bookmark-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.likes}>{item.likes?.length || 0} Likes</Text>

        <Text style={styles.caption}>
          <Text style={styles.captionUser}>
            {item.user?.name || "Unknown"}{" "}
          </Text>

          {item.caption || ""}
        </Text>

        {!!item.comments?.length && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openComments(item._id, item.comments)}
          >
            <Text style={styles.commentCount}>
              View all {item.comments.length} comments
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#000", "#1a1a1a", "#2d1414"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerSmall}>Experience</Text>

          <Text style={styles.headerTitle}>Lifestyle ✨</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <LinearGradient
            colors={["#D4AF37", "#8A6E2F"]}
            style={styles.addGradient}
          >
            <Ionicons name="add" size={26} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.switchContainer}>
        <View style={styles.switchBackground}>
          <Animated.View
            style={[styles.switchIndicator, animatedIndicatorStyle]}
          >
            <LinearGradient
              colors={["#D4AF37", "#8A6E2F"]}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => setActiveFeed("Explore")}
          >
            <Text
              style={[
                styles.switchText,
                activeFeed === "Explore" && styles.activeSwitchText,
              ]}
            >
              Explore
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => setActiveFeed("My Posts")}
          >
            <Text
              style={[
                styles.switchText,
                activeFeed === "My Posts" && styles.activeSwitchText,
              ]}
            >
              My Posts
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      ) : (
        <FlatList
          data={posts || []}
          keyExtractor={(item, index) =>
            item?._id ? item._id.toString() : index.toString()
          }
          renderItem={renderPost}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D4AF37"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={70} color="#333" />

              <Text style={styles.emptyText}>No moments shared yet</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <LinearGradient
          colors={["#D4AF37", "#8A6E2F"]}
          style={styles.floatingGradient}
        >
          <Ionicons name="camera" size={26} color="#000" />
        </LinearGradient>
      </TouchableOpacity>

      <CreatePostModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          fetchPosts();
        }}
      />

      <CommentsModal
        visible={commentsVisible}
        onClose={closeComments}
        comments={selectedComments}
        onAddComment={handleAddComment}
      />

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.menuButton}
                  onPress={handleDeletePost}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff4d4d" />

                  <Text style={styles.menuText}>Delete Post</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <CustomBottomTab activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
};

export default LifestyleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  headerSmall: {
    color: "#777",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 2,
  },

  headerTitle: {
    color: "#D4AF37",
    fontSize: 28,
    fontWeight: "900",
  },

  addButton: {
    borderRadius: 18,
    overflow: "hidden",
  },

  addGradient: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  switchContainer: {
    paddingHorizontal: 25,
    marginBottom: 20,
  },

  switchBackground: {
    flexDirection: "row",
    height: 50,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 15,
    padding: 4,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  switchIndicator: {
    position: "absolute",
    width: "50%",
    height: 40,
    top: 4,
    left: 4,
    borderRadius: 12,
    overflow: "hidden",
  },

  switchBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  switchText: {
    color: "#888",
    fontWeight: "700",
    fontSize: 14,
  },

  activeSwitchText: {
    color: "#000",
  },

  listContainer: {
    paddingBottom: 150,
  },

  postCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    marginHorizontal: 18,
    marginBottom: 25,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.1)",
  },

  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#D4AF37",
  },

  userName: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  locationText: {
    color: "#888",
    fontSize: 11,
    marginLeft: 4,
  },

  postImage: {
    width: width - 36,
    height: 400,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 15,
  },

  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionBtn: {
    marginRight: 18,
  },

  likes: {
    color: "#fff",
    fontWeight: "700",
    paddingHorizontal: 18,
    marginTop: 12,
  },

  caption: {
    color: "#bbb",
    paddingHorizontal: 18,
    paddingBottom: 10,
    marginTop: 6,
    lineHeight: 20,
  },

  captionUser: {
    color: "#D4AF37",
    fontWeight: "800",
  },

  commentCount: {
    color: "#777",
    paddingHorizontal: 18,
    paddingBottom: 20,
    fontSize: 13,
  },

  floatingButton: {
    position: "absolute",
    bottom: 100,
    right: 25,
    zIndex: 10,
    borderRadius: 31,
    elevation: 5,
    shadowColor: "#D4AF37",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  floatingGradient: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },

  emptyText: {
    color: "#555",
    fontSize: 16,
    marginTop: 15,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 140,
    paddingRight: 25,
  },

  menuContainer: {
    width: 180,
    backgroundColor: "#111",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
    overflow: "hidden",
  },

  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },

  menuText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 12,
  },
});
