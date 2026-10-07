import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeInDown,
    FadeInLeft,
    ZoomIn,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const formatTime = (date: Date) => {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
};

const KundliMatch = () => {
  const [yourName, setYourName] = useState("");
  const [partnerName, setPartnerName] = useState("");

  const [yourDob, setYourDob] = useState("");
  const [partnerDob, setPartnerDob] = useState("");

  const [yourTime, setYourTime] = useState("");
  const [partnerTime, setPartnerTime] = useState("");

  const [yourPlace, setYourPlace] = useState("");
  const [partnerPlace, setPartnerPlace] = useState("");

  const [showResult, setShowResult] = useState(false);

  const [showYourDatePicker, setShowYourDatePicker] = useState(false);
  const [showPartnerDatePicker, setShowPartnerDatePicker] = useState(false);

  const [showYourTimePicker, setShowYourTimePicker] = useState(false);
  const [showPartnerTimePicker, setShowPartnerTimePicker] = useState(false);

  const kundliData = useMemo(() => {
    const total =
      yourName.length + partnerName.length + yourDob.length + partnerDob.length;

    const gun = total % 36 || 28;

    let relation = "";
    let color = "";

    if (gun >= 30) {
      relation =
        "Aap dono ki understanding, emotional bonding aur future compatibility kaafi strong hai. Marriage ke liye excellent match mana jayega.";
      color = "#4CAF50";
    } else if (gun >= 22) {
      relation =
        "Aap dono ka bond balanced aur positive hai. Thodi understanding aur communication se relationship aur strong ho sakta hai.";
      color = "#D4AF37";
    } else {
      relation =
        "Compatibility average hai. Kundli ke according patience aur mutual trust relationship ko better bana sakta hai.";
      color = "#ff6b6b";
    }

    return { gun, relation, color };
  }, [yourName, partnerName, yourDob, partnerDob]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#0f0f0f", "#1f1111", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        entering={FadeInDown.duration(700)}
        style={styles.fixedHeader}
      >
        <View>
          <Text style={styles.smallTitle}>Perfect Milan ✨</Text>
          <Text style={styles.bigTitle}>Kundli Match</Text>
        </View>

        <View style={styles.iconCircle}>
          <Ionicons name="sparkles" size={24} color="#D4AF37" />
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          entering={FadeInLeft.delay(200)}
          style={styles.bannerCard}
        >
          <LinearGradient
            colors={["rgba(212,175,55,0.25)", "rgba(0,0,0,0.9)"]}
            style={styles.bannerGradient}
          >
            <Text style={styles.bannerEmoji}>💞</Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Find Your Perfect Match</Text>

              <Text style={styles.bannerSub}>
                Enter both kundli details and check marriage compatibility, guna
                milan & future bonding.
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.formCard}>
          <Text style={styles.cardTitle}>Your Details</Text>

          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={18} color="#D4AF37" />

            <TextInput
              placeholder="Your Name"
              placeholderTextColor="#777"
              value={yourName}
              onChangeText={setYourName}
              style={styles.textInput}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.inputBox}
            onPress={() => setShowYourDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#D4AF37" />

            <Text style={[styles.inputText, !yourDob && { color: "#777" }]}>
              {yourDob || "Select Date of Birth"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.inputBox}
            onPress={() => setShowYourTimePicker(true)}
          >
            <Ionicons name="time-outline" size={18} color="#D4AF37" />

            <Text style={[styles.inputText, !yourTime && { color: "#777" }]}>
              {yourTime || "Select Birth Time"}
            </Text>
          </TouchableOpacity>

          <View style={styles.inputBox}>
            <Ionicons name="location-outline" size={18} color="#D4AF37" />

            <TextInput
              placeholder="Birth Place"
              placeholderTextColor="#777"
              value={yourPlace}
              onChangeText={setYourPlace}
              style={styles.textInput}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450)} style={styles.formCard}>
          <Text style={styles.cardTitle}>Partner Details</Text>

          <View style={styles.inputBox}>
            <Ionicons name="heart-outline" size={18} color="#D4AF37" />

            <TextInput
              placeholder="Partner Name"
              placeholderTextColor="#777"
              value={partnerName}
              onChangeText={setPartnerName}
              style={styles.textInput}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.inputBox}
            onPress={() => setShowPartnerDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#D4AF37" />

            <Text style={[styles.inputText, !partnerDob && { color: "#777" }]}>
              {partnerDob || "Select Partner DOB"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.inputBox}
            onPress={() => setShowPartnerTimePicker(true)}
          >
            <Ionicons name="time-outline" size={18} color="#D4AF37" />

            <Text style={[styles.inputText, !partnerTime && { color: "#777" }]}>
              {partnerTime || "Select Partner Birth Time"}
            </Text>
          </TouchableOpacity>

          <View style={styles.inputBox}>
            <Ionicons name="location-outline" size={18} color="#D4AF37" />

            <TextInput
              placeholder="Partner Birth Place"
              placeholderTextColor="#777"
              value={partnerPlace}
              onChangeText={setPartnerPlace}
              style={styles.textInput}
            />
          </View>
        </Animated.View>

        {showResult && (
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.resultCard}
          >
            <LinearGradient
              colors={["rgba(212,175,55,0.15)", "rgba(0,0,0,0.95)"]}
              style={styles.resultGradient}
            >
              <View style={styles.resultTop}>
                <View>
                  <Text style={styles.resultTitle}>Kundli Result</Text>

                  <Text style={styles.resultNames}>
                    {yourName || "You"} ❤️ {partnerName || "Partner"}
                  </Text>
                </View>

                <View
                  style={[styles.gunCircle, { borderColor: kundliData.color }]}
                >
                  <Text style={[styles.gunText, { color: kundliData.color }]}>
                    {kundliData.gun}/36
                  </Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(kundliData.gun / 36) * 100}%`,
                      backgroundColor: kundliData.color,
                    },
                  ]}
                />
              </View>

              <Text style={styles.compatibilityText}>
                {kundliData.relation}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>92%</Text>
                  <Text style={styles.statLabel}>Love</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statValue}>88%</Text>
                  <Text style={styles.statLabel}>Trust</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statValue}>95%</Text>
                  <Text style={styles.statLabel}>Future</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.bottomButtonWrap}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShowResult(true)}
        >
          <Animated.View entering={ZoomIn.delay(600)} style={styles.button}>
            <LinearGradient
              colors={["#D4AF37", "#8A6E2F"]}
              style={styles.buttonGradient}
            >
              <Ionicons name="sparkles-outline" size={20} color="#000" />

              <Text style={styles.buttonText}>Check Compatibility</Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {showYourDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowYourDatePicker(false);

            if (selectedDate) {
              setYourDob(formatDate(selectedDate));
            }
          }}
        />
      )}

      {showPartnerDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowPartnerDatePicker(false);

            if (selectedDate) {
              setPartnerDob(formatDate(selectedDate));
            }
          }}
        />
      )}

      {showYourTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowYourTimePicker(false);

            if (selectedDate) {
              setYourTime(formatTime(selectedDate));
            }
          }}
        />
      )}

      {showPartnerTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowPartnerTimePicker(false);

            if (selectedDate) {
              setPartnerTime(formatTime(selectedDate));
            }
          }}
        />
      )}
    </View>
  );
};

export default KundliMatch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(10,10,10,0.96)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212,175,55,0.08)",
  },

  scrollContent: {
    paddingTop: 150,
    paddingBottom: 140,
  },

  smallTitle: {
    color: "#aaa",
    fontSize: 13,
    letterSpacing: 1,
  },

  bigTitle: {
    color: "#D4AF37",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 4,
  },

  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(212,175,55,0.12)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
  },

  bannerCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 25,
  },

  bannerGradient: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  bannerEmoji: {
    fontSize: 42,
    marginRight: 16,
  },

  bannerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4,
  },

  bannerSub: {
    color: "#aaa",
    fontSize: 12,
    lineHeight: 18,
  },

  formCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.08)",
  },

  cardTitle: {
    color: "#D4AF37",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 18,
  },

  inputBox: {
    height: 55,
    backgroundColor: "#111",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  inputText: {
    color: "#fff",
    marginLeft: 12,
    fontSize: 14,
  },

  textInput: {
    flex: 1,
    color: "#fff",
    marginLeft: 12,
    fontSize: 14,
  },

  bottomButtonWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 28,
    backgroundColor: "rgba(10,10,10,0.97)",
    borderTopWidth: 1,
    borderTopColor: "rgba(212,175,55,0.08)",
  },

  button: {
    borderRadius: 18,
    overflow: "hidden",
  },

  buttonGradient: {
    height: 58,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  buttonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },

  resultCard: {
    marginHorizontal: 20,
    borderRadius: 26,
    overflow: "hidden",
    marginTop: 10,
  },

  resultGradient: {
    padding: 22,
  },

  resultTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  resultTitle: {
    color: "#D4AF37",
    fontSize: 20,
    fontWeight: "900",
  },

  resultNames: {
    color: "#fff",
    marginTop: 6,
    fontSize: 13,
  },

  gunCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  gunText: {
    fontSize: 16,
    fontWeight: "900",
  },

  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    marginTop: 24,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
  },

  compatibilityText: {
    color: "#ddd",
    fontSize: 13,
    lineHeight: 24,
    marginTop: 20,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },

  statBox: {
    width: (width - 80) / 3,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  statValue: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "900",
  },

  statLabel: {
    color: "#aaa",
    fontSize: 11,
    marginTop: 4,
  },
});
