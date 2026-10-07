import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Lock,
  Mail,
  Smartphone,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import {
  changePassword,
  manageAccount,
  updateContactDetails,
} from "../../../Services/api/accountsetting";
import { getUserDetails } from "../../../Services/api/authService";
import CustomAlert from "../../../components/CustomAlert/CustomAlert";
import SuccessModal from "../../../components/SuccessModal/SuccessModal";

const { width } = Dimensions.get("window");

const AccountSettings = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successConfig, setSuccessConfig] = useState({
    title: "",
    message: "",
  });

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    action: "deactivate" as "deactivate" | "delete",
  });

  const [passModalVisible, setPassModalVisible] = useState(false);
  const [passFormData, setPassFormData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const fetchUserData = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync("userData");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser._id || parsedUser.user?._id;
        if (userId) {
          const data = await getUserDetails(userId);
          setUserData(data);
          setFormData({
            email: data?.email || "",
            phone: data?.phone || "",
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const payload = {
        email: formData.email,
        phone: formData.phone,
      };
      const response = await updateContactDetails(payload);
      if (response) {
        setUserData({ ...userData, ...payload });
        setModalVisible(false);
        setSuccessConfig({
          title: "Updated!",
          message: "Your contact details have been successfully saved.",
        });
        setShowSuccess(true);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update information",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setUpdating(true);
    try {
      const response = await changePassword(passFormData);
      if (response) {
        setPassModalVisible(false);
        setPassFormData({ oldPassword: "", newPassword: "" });
        setSuccessConfig({
          title: "Success!",
          message: "Your password has been changed successfully.",
        });
        setShowSuccess(true);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to change password",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleAccountAction = (action: "deactivate" | "delete") => {
    setAlertConfig({
      title: action === "deactivate" ? "Deactivate Account" : "Delete Account",
      message:
        action === "deactivate"
          ? "Are you sure you want to deactivate your account? You can reactivate it later."
          : "This will permanently delete your account and all data. This action cannot be undone.",
      action: action,
    });
    setAlertVisible(true);
  };

  const confirmAccountAction = async () => {
    setAlertVisible(false);
    setUpdating(true);
    try {
      const action = alertConfig.action;
      const response = await manageAccount({ action });
      console.log("Response:", response);

      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("userData");

      setSuccessConfig({
        title: action === "deactivate" ? "Deactivated" : "Deleted",
        message: `Your account has been ${action}d. Redirecting...`,
      });
      setShowSuccess(true);

      setTimeout(() => {
        router.replace("/Screens/login/login");
      }, 2000);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Operation failed",
      );
    } finally {
      setUpdating(false);
    }
  };

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
          <ArrowLeft size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.actionTextMain}>Edit All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.menuIconContainer}>
              <Smartphone size={20} color="#D4AF37" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Phone Number</Text>
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#D4AF37"
                  style={{ alignSelf: "flex-start" }}
                />
              ) : (
                <Text style={styles.menuSub}>
                  {userData?.phone || "Not available"}
                </Text>
              )}
            </View>
            <ChevronRight size={18} color="#666" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.menuIconContainer}>
              <Mail size={20} color="#D4AF37" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Email Address</Text>
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#D4AF37"
                  style={{ alignSelf: "flex-start" }}
                />
              ) : (
                <Text style={styles.menuSub}>
                  {userData?.email || "Not available"}
                </Text>
              )}
            </View>
            <ChevronRight size={18} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setPassModalVisible(true)}
          >
            <View style={styles.menuIconContainer}>
              <Lock size={20} color="#D4AF37" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Change Password</Text>
              <Text style={styles.menuSub}>
                Secure your account credentials
              </Text>
            </View>
            <ChevronRight size={18} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitleDanger}>Danger Zone</Text>
        <View style={styles.dangerCardContainer}>
          <TouchableOpacity
            style={styles.dangerMenuItem}
            activeOpacity={0.7}
            onPress={() => handleAccountAction("deactivate")}
          >
            <View style={styles.dangerIconContainer}>
              <AlertTriangle size={20} color="#ff9900" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.dangerTitleWarning}>Deactivate Account</Text>
              <Text style={styles.menuSub}>Temporarily hide your profile</Text>
            </View>
            <ChevronRight size={20} color="#666" />
          </TouchableOpacity>
          <View style={styles.dangerDivider} />
          <TouchableOpacity
            style={styles.dangerMenuItem}
            activeOpacity={0.7}
            onPress={() => handleAccountAction("delete")}
          >
            <View style={styles.dangerIconContainerRed}>
              <Trash2 size={20} color="#ff4444" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.dangerTitle}>Delete Account</Text>
              <Text style={styles.menuSub}>Permanently delete your data</Text>
            </View>
            <ChevronRight size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Animated.View entering={FadeInUp} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Contact Info</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                placeholder="Enter email"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={[styles.inputLabel, { marginTop: 20 }]}>
                Phone Number
              </Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                placeholder="Enter phone number"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdate}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={passModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Animated.View entering={FadeInUp} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setPassModalVisible(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={passFormData.oldPassword}
                onChangeText={(text) =>
                  setPassFormData({ ...passFormData, oldPassword: text })
                }
                placeholder="••••••••"
                placeholderTextColor="#666"
              />
              <Text style={[styles.inputLabel, { marginTop: 20 }]}>
                New Password
              </Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={passFormData.newPassword}
                onChangeText={(text) =>
                  setPassFormData({ ...passFormData, newPassword: text })
                }
                placeholder="••••••••"
                placeholderTextColor="#666"
              />
            </View>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handlePasswordUpdate}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.saveButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={
          alertConfig.action === "deactivate" ? "Deactivate" : "Delete"
        }
        cancelText="Cancel"
        onConfirm={confirmAccountAction}
        onCancel={() => setAlertVisible(false)}
      />

      <SuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        title={successConfig.title}
        message={successConfig.message}
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
    borderBottomWidth: 1,
    borderColor: "rgba(212,175,55,0.1)",
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
    backgroundColor: "rgba(212,175,55,0.1)",
    borderRadius: 12,
  },
  headerTitle: { color: "#D4AF37", fontSize: 22, fontWeight: "bold" },
  scrollContent: { paddingBottom: 40, paddingTop: 20 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 25,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 30,
  },
  actionTextMain: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "bold",
  },
  cardContainer: {
    marginHorizontal: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 25,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(212,175,55,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuTextContainer: { flex: 1 },
  menuTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  menuSub: { color: "#666", fontSize: 12, marginTop: 3 },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginLeft: 75,
    marginRight: 20,
  },
  sectionTitleDanger: {
    color: "#ff4444",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 30,
    marginBottom: 10,
    marginTop: 35,
  },
  dangerCardContainer: {
    marginHorizontal: 20,
    backgroundColor: "rgba(255,68,68,0.02)",
    borderRadius: 25,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.1)",
  },
  dangerMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  dangerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,153,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  dangerIconContainerRed: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,68,68,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  dangerTitleWarning: { color: "#ff9900", fontSize: 15, fontWeight: "600" },
  dangerTitle: { color: "#ff4444", fontSize: 15, fontWeight: "600" },
  dangerDivider: {
    height: 1,
    backgroundColor: "rgba(255,68,68,0.1)",
    marginLeft: 75,
    marginRight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: "#1a1a1a",
    borderRadius: 30,
    padding: 25,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitle: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputWrapper: { marginBottom: 25 },
  inputLabel: {
    color: "#888",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 5,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#000",
    borderRadius: 15,
    padding: 15,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  saveButton: {
    backgroundColor: "#D4AF37",
    borderRadius: 15,
    padding: 18,
    alignItems: "center",
  },
  saveButtonText: { color: "#000", fontSize: 16, fontWeight: "bold" },
});

export default AccountSettings;
