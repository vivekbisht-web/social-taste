import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  BookText,
  Briefcase,
  Camera,
  ChevronLeft,
  GraduationCap,
  Heart,
  Home,
  MapPin,
  PlusCircle,
  Save,
  User,
  Users,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getUserDetails,
  updateUserProfile,
} from "../../../Services/api/authService";

const { width } = Dimensions.get("window");
const PHOTO_ITEM_SIZE = (width - 60) / 3;

const MARITAL_STATUS = [
  "Never Married",
  "Divorced",
  "Widowed",
  "Awaiting Divorce",
];
const BODY_TYPES = ["Slim", "Average", "Athletic", "Heavy"];
const EATING_HABITS = ["Vegetarian", "Non-Vegetarian", "Eggetarian", "Vegan"];
const LIFESTYLE_HABITS = ["Non-Smoker", "Smoker", "Occasional", "Regular"];
const EDUCATION_LEVELS = [
  "High School",
  "Diploma",
  "B.Tech",
  "Graduate",
  "Post Graduate",
  "Doctorate",
];
const OCCUPATIONS = [
  "Software Engineer",
  "Private Sector",
  "Government",
  "Business",
  "Professional",
  "Homemaker",
  "Retired",
];
const FAMILY_TYPES = ["Nuclear Family", "Joint Family"];
const SIBLING_OPTIONS = [
  "None",
  "1 Brother",
  "1 Sister",
  "2 Siblings",
  "3+ Siblings",
];
const INCOME_RANGES = [
  "5 LPA",
  "10 LPA",
  "15 LPA",
  "20 LPA",
  "30 LPA",
  "50 LPA+",
];

const EditProfileScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<(any | null)[]>(Array(6).fill(null));

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    maritalStatus: "",
    religion: "",
    caste: "",
    motherTongue: "",
    gotra: "",
    education: "",
    college: "",
    occupation: "",
    company: "",
    annualIncome: "",
    city: "",
    state: "",
    height: "",
    bodyType: "",
    eatingHabits: "",
    habits: "",
    parentsJob: "",
    familyType: "",
    siblings: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const jsonValue = await SecureStore.getItemAsync("userData");
      if (jsonValue) {
        const storedData = JSON.parse(jsonValue);
        const id = storedData._id || storedData.id;
        setUserId(id);

        if (id) {
          const apiData = await getUserDetails(id);

          setFormData({
            name: apiData.name || "",
            bio: apiData.bio || "",
            maritalStatus: apiData.maritalStatus || "",
            religion: apiData.religion || "",
            caste: apiData.caste || "",
            motherTongue: apiData.motherTongue || "",
            gotra: apiData.gotra || "",
            education: apiData.education || "",
            college: apiData.college || "",
            occupation: apiData.occupation || "",
            company: apiData.company || "",
            annualIncome: apiData.annualIncome || "",
            city: apiData.city || "",
            state: apiData.state || "",
            height: apiData.height || "",
            bodyType: apiData.bodyType || "",
            eatingHabits: apiData.eatingHabits || "",
            habits: apiData.habits || "",
            parentsJob: apiData.parentsJob || "",
            familyType: apiData.familyType || "",
            siblings: apiData.siblings || "",
          });

          const initialPhotos = Array(6).fill(null);
          if (apiData.primaryPhoto) {
            initialPhotos[0] = apiData.primaryPhoto;
          }
          if (
            apiData.additionalPhotos &&
            Array.isArray(apiData.additionalPhotos)
          ) {
            apiData.additionalPhotos.forEach((url: string, index: number) => {
              if (index < 5) initialPhotos[index + 1] = url;
            });
          }
          setPhotos(initialPhotos);
        }
      }
    } catch (e) {
      Alert.alert("Error", "Failed to fetch profile");
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const newPhotos = [...photos];
      newPhotos[index] = {
        uri: asset.uri,
        name: `photo_${index}.jpg`,
        type: "image/jpeg",
      };
      setPhotos(newPhotos);
    }
  };

  const removeImage = (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        primaryPhoto: photos[0],
        additionalPhotos: photos.slice(1).filter((p) => p !== null),
      };
      await updateUserProfile(userId, payload);
      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Update failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof typeof formData,
    icon: any,
  ) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelRow}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <TextInput
        style={styles.textInput}
        value={formData[field]}
        onChangeText={(val) => setFormData({ ...formData, [field]: val })}
        placeholder={`Enter ${label}`}
        placeholderTextColor="#555"
      />
    </View>
  );

  const renderSelection = (
    label: string,
    field: keyof typeof formData,
    options: string[],
    icon: any,
  ) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelRow}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.chipContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setFormData({ ...formData, [field]: option })}
            style={[
              styles.chip,
              formData[field] === option && styles.chipSelected,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                formData[field] === option && styles.chipTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1a1a1a", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={28} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#D4AF37" />
          ) : (
            <Save size={26} color="#D4AF37" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                typeof photos[0] === "string"
                  ? photos[0]
                  : photos[0]?.uri ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.avatar}
          />
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => pickImage(0)}
          >
            <LinearGradient
              colors={["#D4AF37", "#B8860B"]}
              style={styles.cameraGradient}
            >
              <Camera size={20} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>About & Media</Text>
        <View style={styles.card}>
          {renderInput("Full Name", "name", <User size={16} color="#D4AF37" />)}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <BookText size={16} color="#D4AF37" />
              <Text style={styles.label}>Bio</Text>
            </View>
            <TextInput
              style={[
                styles.textInput,
                { height: 80, textAlignVertical: "top" },
              ]}
              value={formData.bio}
              onChangeText={(val) => setFormData({ ...formData, bio: val })}
              multiline
            />
          </View>
          <Text style={styles.label}>Photos</Text>
          <View style={styles.photoGrid}>
            {photos.map((item, index) => (
              <View key={index} style={styles.photoWrapper}>
                {item ? (
                  <>
                    <Image
                      source={{
                        uri: typeof item === "string" ? item : item.uri,
                      }}
                      style={styles.photoItem}
                    />
                    <TouchableOpacity
                      style={styles.removeBadge}
                      onPress={() => removeImage(index)}
                    >
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.addBox}
                    onPress={() => pickImage(index)}
                  >
                    <PlusCircle size={24} color="#D4AF37" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.card}>
          {renderSelection(
            "Marital Status",
            "maritalStatus",
            MARITAL_STATUS,
            <Heart size={16} color="#D4AF37" />,
          )}
          {renderInput("Height", "height", <User size={16} color="#D4AF37" />)}
          {renderSelection(
            "Body Type",
            "bodyType",
            BODY_TYPES,
            <User size={16} color="#D4AF37" />,
          )}
          {renderInput(
            "Religion",
            "religion",
            <Home size={16} color="#D4AF37" />,
          )}
          {renderInput("Caste", "caste", <Home size={16} color="#D4AF37" />)}
          {renderInput(
            "Mother Tongue",
            "motherTongue",
            <BookText size={16} color="#D4AF37" />,
          )}
          {renderInput("Gotra", "gotra", <Home size={16} color="#D4AF37" />)}
        </View>

        <Text style={styles.sectionTitle}>Education & Career</Text>
        <View style={styles.card}>
          {renderSelection(
            "Education",
            "education",
            EDUCATION_LEVELS,
            <GraduationCap size={16} color="#D4AF37" />,
          )}
          {renderInput(
            "College",
            "college",
            <GraduationCap size={16} color="#D4AF37" />,
          )}
          {renderSelection(
            "Occupation",
            "occupation",
            OCCUPATIONS,
            <Briefcase size={16} color="#D4AF37" />,
          )}
          {renderInput(
            "Company",
            "company",
            <Briefcase size={16} color="#D4AF37" />,
          )}
          {renderSelection(
            "Annual Income",
            "annualIncome",
            INCOME_RANGES,
            <Briefcase size={16} color="#D4AF37" />,
          )}
        </View>

        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.card}>
          {renderInput("City", "city", <MapPin size={16} color="#D4AF37" />)}
          {renderInput("State", "state", <MapPin size={16} color="#D4AF37" />)}
        </View>

        <Text style={styles.sectionTitle}>Family & Lifestyle</Text>
        <View style={styles.card}>
          {renderInput(
            "Parents Job",
            "parentsJob",
            <Users size={16} color="#D4AF37" />,
          )}
          {renderSelection(
            "Family Type",
            "familyType",
            FAMILY_TYPES,
            <Users size={16} color="#D4AF37" />,
          )}
          {renderSelection(
            "Siblings",
            "siblings",
            SIBLING_OPTIONS,
            <Users size={16} color="#D4AF37" />,
          )}
          {renderSelection(
            "Eating Habits",
            "eatingHabits",
            EATING_HABITS,
            <Heart size={16} color="#D4AF37" />,
          )}
          {renderSelection(
            "Lifestyle Habits",
            "habits",
            LIFESTYLE_HABITS,
            <Heart size={16} color="#D4AF37" />,
          )}
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  scrollContent: { padding: 20 },
  sectionTitle: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 5,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  avatarContainer: {
    alignSelf: "center",
    marginBottom: 20,
    position: "relative",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#D4AF37",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: "hidden",
  },
  cameraGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  label: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: "#000",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#000",
  },
  chipSelected: { backgroundColor: "#D4AF37", borderColor: "#D4AF37" },
  chipText: { color: "#aaa", fontSize: 13 },
  chipTextSelected: { color: "#000", fontWeight: "bold" },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  photoWrapper: { position: "relative" },
  photoItem: {
    width: PHOTO_ITEM_SIZE,
    height: PHOTO_ITEM_SIZE,
    borderRadius: 8,
  },
  addBox: {
    width: PHOTO_ITEM_SIZE,
    height: PHOTO_ITEM_SIZE,
    borderRadius: 8,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  removeBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff4444",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});

export default EditProfileScreen;
