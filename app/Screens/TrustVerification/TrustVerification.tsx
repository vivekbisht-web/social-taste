import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Camera as CameraIcon,
  CheckCircle2,
  ChevronRight,
  Clock,
  IdCard,
  Image as ImageIcon,
  ShieldCheck,
  UserCheck,
  X,
  XCircle,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  ZoomInEasyUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import {
  getVerificationStatus,
  uploadVerificationDocuments,
} from "../../../Services/api/documentUpload";
import SuccessModal from "../../../components/SuccessModal/SuccessModal";

const { width } = Dimensions.get("window");
const GOLD = "#D4AF37";

interface VerificationData {
  govtIdStatus: string;
  govtIdUrl: string;
  selfieStatus: string;
  selfieUrl: string;
  trustScore: number;
}

interface SelectedImage {
  uri: string;
  name: string;
  type: string;
}

const CustomAlert = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Okay",
  cancelText = "Cancel",
}: any) => {
  const iconScale = useSharedValue(0);
  useEffect(() => {
    if (visible)
      iconScale.value = withDelay(
        400,
        withSequence(withSpring(1.5), withSpring(1)),
      );
    else iconScale.value = 0;
  }, [visible]);
  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));
  if (!visible) return null;
  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.alertOverlay}>
        <Animated.View
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(300)}
          style={styles.alertBackdrop}
        >
          <Pressable style={{ flex: 1 }} onPress={onCancel} />
        </Animated.View>
        <Animated.View
          entering={ZoomIn.springify().damping(15)}
          exiting={FadeOut.duration(200)}
          style={styles.alertBox}
        >
          <View style={styles.alertTopBar} />
          <Animated.View style={[styles.alertIconContainer, animatedIconStyle]}>
            <View style={styles.alertIconCircle}>
              <AlertTriangle size={30} color={GOLD} />
            </View>
          </Animated.View>
          <Text style={styles.alertTitleText}>{title}</Text>
          <Text style={styles.alertMessageText}>{message}</Text>
          <div style={styles.alertBtnRow}>
            <TouchableOpacity style={styles.alertCancelBtn} onPress={onCancel}>
              <Text style={styles.alertCancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.alertConfirmBtn}
              onPress={onConfirm}
            >
              <LinearGradient
                colors={[GOLD, "#B8860B"]}
                style={styles.alertGradientBtn}
              >
                <Text style={styles.alertConfirmText}>{confirmText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </div>
        </Animated.View>
      </View>
    </Modal>
  );
};

const AnimatedTouchableOpacity = ({
  onPress,
  children,
  style,
  delay = 0,
}: any) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const onPressIn = () => (scale.value = withSpring(0.92));
  const onPressOut = () => (scale.value = withSpring(1));
  return (
    <Animated.View
      entering={ZoomInEasyUp.delay(delay).springify()}
      style={[animatedStyle, style]}
    >
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

const ImagePickerModal = ({
  visible,
  onClose,
  onSelectCamera,
  onSelectGallery,
  title,
}: any) => {
  if (!visible) return null;
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.85)" },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          entering={SlideInDown.springify()}
          exiting={SlideOutDown.duration(250)}
          style={styles.modalContainer}
        >
          <View style={styles.handle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={GOLD} />
            </TouchableOpacity>
          </View>
          <View style={styles.optionsRow}>
            <AnimatedTouchableOpacity
              onPress={onSelectCamera}
              style={styles.optionBtn}
              delay={200}
            >
              <View style={styles.iconCircle}>
                <CameraIcon size={32} color={GOLD} />
              </View>
              <Text style={styles.optionLabel}>Camera</Text>
            </AnimatedTouchableOpacity>
            <AnimatedTouchableOpacity
              onPress={onSelectGallery}
              style={styles.optionBtn}
              delay={350}
            >
              <View style={styles.iconCircle}>
                <ImageIcon size={32} color={GOLD} />
              </View>
              <Text style={styles.optionLabel}>Gallery</Text>
            </AnimatedTouchableOpacity>
          </View>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const TrustVerification = () => {
  const router = useRouter();
  const [selfie, setSelfie] = useState<SelectedImage | null>(null);
  const [govtId, setGovtId] = useState<SelectedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeType, setActiveType] = useState<"selfie" | "govtId" | null>(
    null,
  );
  const [showAlert, setShowAlert] = useState(false);
  const [serverData, setServerData] = useState<VerificationData | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const userDataString = await SecureStore.getItemAsync("userData");
      if (!userDataString) return;
      const userData = JSON.parse(userDataString);
      const userId = userData.user?._id || userData._id;
      if (userId) {
        const res = await getVerificationStatus(userId);
        if (res) setServerData(res.verification || res);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const openPicker = (type: "selfie" | "govtId") => {
    const status =
      type === "selfie" ? serverData?.selfieStatus : serverData?.govtIdStatus;
    if (status === "Approved" || status === "Pending") return;
    setActiveType(type);
    setPickerVisible(true);
  };

  const handleImagePick = async (useCamera: boolean) => {
    setPickerVisible(false);
    const permissionResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) return;

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        });

    if (!result.canceled && activeType) {
      const selectedImage: SelectedImage = {
        uri: result.assets[0].uri,
        name: activeType === "selfie" ? "selfie.jpg" : "govtId.jpg",
        type: "image/jpeg",
      };
      if (activeType === "selfie") setSelfie(selectedImage);
      else setGovtId(selectedImage);
    }
  };

  const handleUpload = async () => {
    const selfieNeeded =
      serverData?.selfieStatus === "Rejected" ||
      serverData?.selfieStatus === "Not Uploaded";
    const govtIdNeeded =
      serverData?.govtIdStatus === "Rejected" ||
      serverData?.govtIdStatus === "Not Uploaded";

    if (selfieNeeded && !selfie && govtIdNeeded && !govtId) {
      Alert.alert("Error", "Please select documents to upload");
      return;
    }

    try {
      setLoading(true);
      const userDataString = await SecureStore.getItemAsync("userData");
      if (!userDataString) throw new Error("User session expired");

      const userData = JSON.parse(userDataString);
      const userId = userData.user?._id || userData._id;

      const res = await uploadVerificationDocuments(
        userId,
        selfieNeeded ? (selfie as any) : null,
        govtIdNeeded ? (govtId as any) : null,
      );

      if (res && res.verification) setServerData(res.verification);
      setShowSuccess(true);
      setSelfie(null);
      setGovtId(null);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || "";
      if (errorMsg.includes("already")) setShowAlert(true);
      else Alert.alert("Upload Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentStatus = (
    localFile: SelectedImage | null,
    type: "selfie" | "govtId",
  ) => {
    const status =
      type === "selfie" ? serverData?.selfieStatus : serverData?.govtIdStatus;
    const remoteUrl =
      type === "selfie" ? serverData?.selfieUrl : serverData?.govtIdUrl;

    if (!localFile && (!remoteUrl || status === "Not Uploaded"))
      return (
        <View style={styles.tagContainer}>
          <AlertCircle size={12} color="#FFC107" />
          <Text style={[styles.tagText, { color: "#FFC107" }]}>Required</Text>
        </View>
      );

    const isVerified = status === "Approved";
    const isPending = status === "Pending";
    const isRejected = status === "Rejected";

    return (
      <View style={styles.uploadedRow}>
        <Image
          source={{ uri: localFile?.uri || remoteUrl }}
          style={styles.thumbnail}
        />
        <View
          style={[
            styles.statusBadge,
            isVerified && { backgroundColor: "#4CAF50" },
            isPending && { backgroundColor: "#FFC107" },
            isRejected && { backgroundColor: "#F44336" },
          ]}
        >
          {isVerified && <CheckCircle2 size={10} color="#fff" />}
          {isPending && <Clock size={10} color="#000" />}
          {isRejected && <XCircle size={10} color="#fff" />}
          <Text
            style={[
              styles.statusBadgeText,
              (isVerified || isRejected) && { color: "#fff" },
            ]}
          >
            {localFile && !isPending && !isVerified
              ? "Ready to Upload"
              : status === "Pending"
                ? "Reviewing"
                : status}
          </Text>
        </View>
      </View>
    );
  };

  if (pageLoading)
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={GOLD} />
      </View>
    );

  const canShowUpload = !!(selfie || govtId);

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
          <ArrowLeft size={24} color={GOLD} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trust & Verification</Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.statusCard}
        >
          <LinearGradient
            colors={["rgba(212,175,55,0.15)", "rgba(0,0,0,0)"]}
            style={styles.statusGradient}
          >
            <ShieldCheck size={50} color={GOLD} />
            <Text style={styles.statusTitle}>
              Trust Score: {serverData?.trustScore || 0}%
            </Text>
            <Text style={styles.statusSub}>
              {serverData?.trustScore === 100
                ? "You've earned the Gold Badge! ✨"
                : "Complete all verifications to get a Gold Badge ✨"}
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${serverData?.trustScore || 0}%` },
                ]}
              />
            </View>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.sectionTitle}>Verification Steps</Text>
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={serverData?.selfieStatus === "Approved" ? 1 : 0.7}
            onPress={() => openPicker("selfie")}
          >
            <View style={styles.menuIconContainer}>
              {selfie || serverData?.selfieUrl ? (
                <Image
                  source={{ uri: selfie?.uri || serverData?.selfieUrl }}
                  style={styles.iconImage}
                />
              ) : (
                <CameraIcon size={20} color={GOLD} />
              )}
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Selfie Verification</Text>
              {renderDocumentStatus(selfie, "selfie")}
            </View>
            {serverData?.selfieStatus !== "Approved" && (
              <ChevronRight size={18} color="#666" />
            )}
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={serverData?.govtIdStatus === "Approved" ? 1 : 0.7}
            onPress={() => openPicker("govtId")}
          >
            <View style={styles.menuIconContainer}>
              {govtId || serverData?.govtIdUrl ? (
                <Image
                  source={{ uri: govtId?.uri || serverData?.govtIdUrl }}
                  style={styles.iconImage}
                />
              ) : (
                <IdCard size={20} color={GOLD} />
              )}
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Govt. ID Verification</Text>
              {renderDocumentStatus(govtId, "govtId")}
            </View>
            {serverData?.govtIdStatus !== "Approved" && (
              <ChevronRight size={18} color="#666" />
            )}
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={styles.menuIconContainer}>
              <UserCheck size={20} color={GOLD} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>LinkedIn/Social Connect</Text>
              <Text style={styles.menuSub}>
                Verify your professional details
              </Text>
            </View>
            <Text style={styles.actionText}>Link</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Why get verified?</Text>
        <View style={styles.benefitRow}>
          <Animated.View
            entering={FadeInRight.delay(400)}
            style={styles.benefitCard}
          >
            <CheckCircle2 size={24} color={GOLD} />
            <Text style={styles.benefitText}>3x More Matches</Text>
          </Animated.View>
          <Animated.View
            entering={FadeInRight.delay(500)}
            style={styles.benefitCard}
          >
            <ShieldCheck size={24} color={GOLD} />
            <Text style={styles.benefitText}>Higher Trust</Text>
          </Animated.View>
        </View>
      </ScrollView>

      {canShowUpload && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.verifyBtn, loading && { opacity: 0.7 }]}
            onPress={handleUpload}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.verifyBtnText}>Verify Now</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <ImagePickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelectCamera={() => handleImagePick(true)}
        onSelectGallery={() => handleImagePick(false)}
        title={activeType === "selfie" ? "Upload Selfie" : "Upload Govt ID"}
      />
      <SuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Upload Successful"
        message="Your documents have been uploaded successfully and are under review."
      />
      <CustomAlert
        visible={showAlert}
        title="Already Submitted"
        message="You have already submitted your documents for verification. Please wait while we review them."
        onConfirm={() => setShowAlert(false)}
        onCancel={() => setShowAlert(false)}
      />
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
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
    backgroundColor: "rgba(212,175,55,0.1)",
    borderRadius: 12,
  },
  headerTitle: { color: GOLD, fontSize: 20, fontWeight: "bold" },
  scrollContent: { paddingBottom: 120, paddingTop: 10 },
  statusCard: {
    margin: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  statusGradient: { padding: 30, alignItems: "center" },
  statusTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
  },
  statusSub: { color: "#888", fontSize: 12, marginTop: 5, textAlign: "center" },
  progressBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    marginTop: 20,
  },
  progressBarFill: { height: "100%", backgroundColor: GOLD, borderRadius: 4 },
  sectionTitle: {
    color: "#888",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginLeft: 25,
    marginBottom: 10,
    marginTop: 20,
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
    overflow: "hidden",
  },
  iconImage: { width: "100%", height: "100%", borderRadius: 10 },
  menuTextContainer: { flex: 1 },
  menuTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  menuSub: { color: "#666", fontSize: 12, marginTop: 2 },
  tagContainer: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  tagText: { fontSize: 11, fontWeight: "bold", marginLeft: 4 },
  uploadedRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  thumbnail: {
    width: 40,
    height: 25,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: "#000",
    fontSize: 9,
    fontWeight: "800",
    marginLeft: 3,
    textTransform: "uppercase",
  },
  actionText: { color: GOLD, fontSize: 14, fontWeight: "bold", marginRight: 5 },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginLeft: 65,
    marginRight: 15,
  },
  benefitRow: { flexDirection: "row", marginHorizontal: 15, marginTop: 10 },
  benefitCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  benefitText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 10,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 35,
  },
  verifyBtn: {
    backgroundColor: GOLD,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    minHeight: 55,
    justifyContent: "center",
  },
  verifyBtnText: { color: "#000", fontSize: 16, fontWeight: "bold" },
  overlay: { flex: 1, justifyContent: "flex-end" },
  modalContainer: {
    backgroundColor: "#121212",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 25,
    paddingBottom: 40,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: "rgba(212,175,55,0.4)",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(212,175,55,0.3)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  modalTitle: {
    color: GOLD,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  closeBtn: {
    backgroundColor: "rgba(212,175,55,0.15)",
    padding: 10,
    borderRadius: 15,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
  },
  optionBtn: { alignItems: "center", width: width * 0.35 },
  iconCircle: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: "rgba(212,175,55,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "rgba(212,175,55,0.3)",
  },
  optionLabel: { color: "#E0E0E0", fontSize: 16, fontWeight: "600" },
  cancelButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  cancelText: { color: "#888", fontSize: 16 },
  alertOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  alertBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  alertBox: {
    width: width * 0.85,
    backgroundColor: "#121212",
    borderRadius: 30,
    paddingTop: 40,
    paddingBottom: 25,
    paddingHorizontal: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  alertTopBar: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 4,
    backgroundColor: GOLD,
  },
  alertIconContainer: { marginBottom: 20 },
  alertIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(212,175,55,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
  },
  alertTitleText: {
    color: GOLD,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  alertMessageText: {
    color: "#A0A0A0",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  alertBtnRow: { flexDirection: "row", width: "100%", gap: 15 },
  alertCancelBtn: {
    flex: 1,
    height: 55,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#333",
  },
  alertConfirmBtn: {
    flex: 1,
    height: 55,
    borderRadius: 15,
    overflow: "hidden",
  },
  alertGradientBtn: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  alertCancelText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  alertConfirmText: { color: "#000", fontSize: 16, fontWeight: "bold" },
});

export default TrustVerification;
