import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Briefcase,
  Camera,
  ChevronLeft,
  GraduationCap,
  Heart,
  MapPin,
  Star,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { sendMatchInterest } from "../../../Services/api/match";
import SuccessModal from "../../../components/SuccessIntesrtModal/SuccessModal";

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = height * 0.5;

const ProfileDetail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const profile = params.profileData
    ? JSON.parse(params.profileData as string)
    : {};

  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const calculateAge = (dob: string) => {
    if (!dob) return "26";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleSendInterest = async () => {
    const targetId = profile._id || profile.id;
    if (!targetId) return Alert.alert("Error", "Invalid Profile ID");
    const payload = { targetId };
    try {
      setLoading(true);
      await sendMatchInterest(payload);
      setIsSent(true);
      setShowModal(true);
    } catch (error: any) {
      Alert.alert(
        "Notice",
        error.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const InfoTag = ({ icon: Icon, label, value, delay }: any) => (
    <Animated.View entering={FadeInRight.delay(delay)} style={styles.infoTag}>
      <Icon size={16} color="#D4AF37" />
      <View style={styles.infoTagTextContainer}>
        <Text style={styles.infoTagLabel}>{label}</Text>
        <Text style={styles.infoTagValue}>{value || "N/A"}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.fixedHeader}>
        <Image
          source={{ uri: profile.primaryPhoto }}
          style={styles.mainImage}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.9)"]}
          style={StyleSheet.absoluteFill}
        />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft color="#fff" size={28} />
        </TouchableOpacity>

        <View style={styles.imageHeaderInfo}>
          <Animated.Text
            entering={FadeInDown.delay(200)}
            style={styles.nameText}
          >
            {profile.name}, {calculateAge(profile.dob)}
          </Animated.Text>
          <Animated.View
            entering={FadeInDown.delay(300)}
            style={styles.locationRow}
          >
            <MapPin size={16} color="#ccc" />
            <Text style={styles.locationText}>
              {profile.city}, {profile.state}
            </Text>
          </Animated.View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailsContent}>
          <Animated.View
            entering={FadeInDown.delay(400)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.bioText}>
              {profile.bio || "Looking for a compatible life partner."}
            </Text>
          </Animated.View>

          {profile.additionalPhotos && profile.additionalPhotos.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(450)}
              style={styles.section}
            >
              <View style={styles.sectionHeader}>
                <Camera size={18} color="#D4AF37" />
                <Text
                  style={[
                    styles.sectionTitle,
                    { marginLeft: 8, marginBottom: 0 },
                  ]}
                >
                  Photos
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryContainer}
              >
                {profile.additionalPhotos.map(
                  (photo: string, index: number) => (
                    <TouchableOpacity key={index} activeOpacity={0.9}>
                      <Image
                        source={{ uri: photo }}
                        style={styles.galleryImage}
                      />
                    </TouchableOpacity>
                  ),
                )}
              </ScrollView>
            </Animated.View>
          )}

          <View style={styles.infoGrid}>
            <InfoTag
              icon={Briefcase}
              label="Profession"
              value={profile.occupation}
              delay={500}
            />
            <InfoTag
              icon={GraduationCap}
              label="Education"
              value={profile.education}
              delay={600}
            />
            <InfoTag
              icon={Star}
              label="Religion"
              value={profile.religion}
              delay={700}
            />
            <InfoTag
              icon={Heart}
              label="Marital Status"
              value={profile.maritalStatus}
              delay={800}
            />
          </View>

          <Animated.View
            entering={FadeInDown.delay(900)}
            style={styles.detailsList}
          >
            {[
              { label: "Height", value: profile.height },
              { label: "Annual Income", value: profile.annualIncome },
              {
                label: "Caste/Gotra",
                value: `${profile.caste || "N/A"} (${profile.gotra || "N/A"})`,
              },
              { label: "Eating Habits", value: profile.eatingHabits },
              { label: "Mother Tongue", value: profile.motherTongue },
              { label: "Company", value: profile.company },
              { label: "Family Type", value: profile.familyType },
            ].map((item, idx) => (
              <View key={idx} style={styles.detailItem}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value || "N/A"}</Text>
              </View>
            ))}
          </Animated.View>
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <SuccessModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        message={`Interest sent to ${profile.name} successfully!`}
      />

      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[
            styles.interestButton,
            (loading || isSent) && { backgroundColor: "#333" },
          ]}
          onPress={handleSendInterest}
          disabled={loading || isSent}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Heart
                color={isSent ? "#D4AF37" : "#000"}
                fill={isSent ? "#D4AF37" : "#000"}
                size={20}
              />
              <Text
                style={[
                  styles.interestButtonText,
                  isSent && { color: "#D4AF37" },
                ]}
              >
                {isSent ? "SUCCESSFULLY SENT" : "SEND INTEREST"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 1,
  },
  mainImage: { width: "100%", height: "100%", resizeMode: "cover" },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  imageHeaderInfo: { position: "absolute", bottom: 40, left: 25 },
  nameText: { color: "#fff", fontSize: 32, fontWeight: "900" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  locationText: { color: "#ccc", marginLeft: 5, fontSize: 16 },
  scrollContainer: { flex: 1, marginTop: HEADER_HEIGHT - 30 },
  scrollContent: { flexGrow: 1 },
  detailsContent: {
    padding: 25,
    backgroundColor: "#000",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: height * 0.6,
  },
  section: { marginBottom: 25 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { color: "#D4AF37", fontSize: 18, fontWeight: "bold" },
  bioText: { color: "#aaa", fontSize: 15, lineHeight: 22 },
  galleryContainer: { paddingRight: 20 },
  galleryImage: {
    width: 120,
    height: 160,
    borderRadius: 15,
    marginRight: 12,
    backgroundColor: "#1a1a1a",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoTag: {
    width: "48%",
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.1)",
  },
  infoTagTextContainer: { marginLeft: 10, flex: 1 },
  infoTagLabel: { color: "#666", fontSize: 10, textTransform: "uppercase" },
  infoTagValue: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
  },
  detailsList: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  detailLabel: { color: "#777", fontSize: 14 },
  detailValue: { color: "#fff", fontSize: 14, fontWeight: "600" },
  stickyFooter: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(26,26,26,0.95)",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
    zIndex: 10,
  },

  interestButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#D4AF37",
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  actionCircleX: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,68,68,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionCircleStar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,172,237,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  interestButtonText: {
    color: "#000",
    fontWeight: "bold",
    marginLeft: 8,
    letterSpacing: 1,
    fontSize: 12,
  },
});

export default ProfileDetail;
