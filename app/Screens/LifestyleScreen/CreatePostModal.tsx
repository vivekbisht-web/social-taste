import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { createPost } from "../../../Services/api/posts";
import SuccessAnimation from "../../../components/SuccessAnimation/SuccessAnimation";

const { width } = Dimensions.get("window");

type Props = {
  visible: boolean;
  onClose: () => void;
};

const MAX_IMAGES = 4;
const IMAGE_WIDTH = width * 0.32;

const CreatePostModal = ({ visible, onClose }: Props) => {
  const [caption, setCaption] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [locationName, setLocationName] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (visible) {
      getLocation();
    }
  }, [visible]);

  const resetFields = () => {
    setCaption("");
    setSelectedImages([]);
    setLocationName("");
  };

  const getLocation = async () => {
    try {
      setLoadingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationName("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const city =
          address[0].city || address[0].district || address[0].region;

        const country = address[0].country;

        setLocationName(`${city}, ${country}`);
      }
    } catch (error) {
      setLocationName("Unable to fetch location");
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleGalleryPick = async () => {
    if (selectedImages.length >= MAX_IMAGES) {
      Alert.alert("Limit Reached", "You can upload maximum 4 photos");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Gallery permission is required");
      return;
    }

    const remaining = MAX_IMAGES - selectedImages.length;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);

      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  };

  const handleCameraPick = async () => {
    if (selectedImages.length >= MAX_IMAGES) {
      Alert.alert("Limit Reached", "You can upload maximum 4 photos");
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera permission is required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...selectedImages];
    updated.splice(index, 1);
    setSelectedImages(updated);
  };

  const handleCreatePost = async () => {
    try {
      if (!caption.trim()) {
        Alert.alert("Validation", "Caption is required");
        return;
      }

      if (selectedImages.length === 0) {
        Alert.alert("Validation", "Please select at least one image");
        return;
      }

      setLoading(true);

      const images = selectedImages.map((uri, index) => ({
        uri,
        name: `post_${index}.jpg`,
        type: "image/jpeg",
      })) as any;

      const response = await createPost({
        caption,
        location: locationName,
        images,
      });

      if (response.success) {
        setShowSuccess(true);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccess(false);
    resetFields();
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <View style={styles.headerRow}>
              <Text style={styles.modalTitle}>Create Lifestyle Post</Text>

              <TouchableOpacity activeOpacity={0.8} onPress={onClose}>
                <Ionicons name="close" size={26} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.locationCard}>
              <View style={styles.locationLeft}>
                <View style={styles.locationIcon}>
                  <Ionicons name="location-sharp" size={18} color="#D4AF37" />
                </View>

                <View>
                  <Text style={styles.locationLabel}>Current Location</Text>

                  {loadingLocation ? (
                    <ActivityIndicator
                      size="small"
                      color="#D4AF37"
                      style={{ marginTop: 4 }}
                    />
                  ) : (
                    <Text style={styles.locationText}>
                      {locationName || "Fetching location..."}
                    </Text>
                  )}
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.8} onPress={getLocation}>
                <Ionicons name="refresh-outline" size={22} color="#D4AF37" />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Write your luxury lifestyle caption..."
              placeholderTextColor="#777"
              value={caption}
              onChangeText={setCaption}
              multiline
              style={styles.input}
            />

            <View style={styles.uploadRow}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.uploadBtn}
                onPress={handleGalleryPick}
              >
                <LinearGradient
                  colors={["rgba(212,175,55,0.25)", "rgba(212,175,55,0.08)"]}
                  style={styles.uploadGradient}
                >
                  <Ionicons name="images-outline" size={22} color="#D4AF37" />

                  <Text style={styles.uploadText}>Gallery</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.uploadBtn}
                onPress={handleCameraPick}
              >
                <LinearGradient
                  colors={["rgba(212,175,55,0.25)", "rgba(212,175,55,0.08)"]}
                  style={styles.uploadGradient}
                >
                  <Ionicons name="camera-outline" size={22} color="#D4AF37" />

                  <Text style={styles.uploadText}>Camera</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.photoHeader}>
              <Text style={styles.previewText}>Selected Photos</Text>

              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {selectedImages.length}/{MAX_IMAGES}
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesContainer}
            >
              {selectedImages.map((img, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: img }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />

                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.85)"]}
                    style={styles.imageOverlay}
                  >
                    <View style={styles.imageBottom}>
                      <Text style={styles.imageCount}>{index + 1}</Text>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => removeImage(index)}
                        style={styles.deleteBtn}
                      >
                        <Ionicons name="trash-outline" size={15} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.postBtn}
              activeOpacity={0.9}
              onPress={handleCreatePost}
              disabled={loading}
            >
              <LinearGradient
                colors={["#E5C15A", "#B58A2C", "#7A5B16"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.postGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={20}
                      color="#000"
                    />

                    <Text style={styles.postBtnText}>
                      Upload Lifestyle Post
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              activeOpacity={0.7}
              onPress={onClose}
            >
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SuccessAnimation
        visible={showSuccess}
        onComplete={handleAnimationComplete}
      />
    </>
  );
};

export default CreatePostModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#0D0D0D",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    maxHeight: "92%",
  },

  modalHandle: {
    width: 65,
    height: 5,
    borderRadius: 20,
    backgroundColor: "#3A3A3A",
    alignSelf: "center",
    marginBottom: 24,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "900",
    width: "80%",
  },

  locationCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  locationLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(212,175,55,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  locationLabel: {
    color: "#999",
    fontSize: 12,
    marginBottom: 3,
  },

  locationText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 24,
    padding: 18,
    color: "#fff",
    minHeight: 130,
    textAlignVertical: "top",
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.1)",
    fontSize: 15,
    lineHeight: 22,
  },

  uploadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  uploadBtn: {
    width: "48%",
    borderRadius: 22,
    overflow: "hidden",
  },

  uploadGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.15)",
    borderRadius: 22,
    gap: 8,
  },

  uploadText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },

  photoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  previewText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },

  countBadge: {
    minWidth: 58,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  countText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 13,
  },

  imagesContainer: {
    paddingBottom: 8,
  },

  imageWrapper: {
    marginRight: 14,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
  },

  previewImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH * 1.4,
    borderRadius: 22,
    backgroundColor: "#1B1B1B",
  },

  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },

  imageBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  imageCount: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },

  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  postBtn: {
    marginTop: 28,
    borderRadius: 22,
    overflow: "hidden",
  },

  postGradient: {
    paddingVertical: 17,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  postBtnText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 15,
  },

  closeBtn: {
    marginTop: 18,
    alignItems: "center",
  },

  closeText: {
    color: "#8A8A8A",
    fontSize: 15,
    fontWeight: "600",
  },
});
