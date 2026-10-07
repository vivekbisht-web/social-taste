import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

// Components & Services
import ScreenBackground from "../../../components/ScreenBackground/ScreenBackground";
import SuccessModal from "../../../components/SuccessModal/SuccessModal";
import { loginUser } from "../../../Services/api/authService";

const Login = () => {
  const router = useRouter();

  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email/phone and password.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        emailOrPhone: email,
        password: password,
      };

      const response = await loginUser(payload);

      if (response && response.token) {
        await SecureStore.setItemAsync("userToken", response.token);

        await SecureStore.setItemAsync("userData", JSON.stringify(response));

        setShowSuccess(true);
      } else {
        Alert.alert("Login Failed", "Invalid response from server");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Invalid Email or Password";

      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccess(false);
    router.replace("/Screens/Dashboard/Dashboard");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <ScreenBackground style={styles.container}>
          <View style={styles.content}>
            {/* LOGO SECTION */}
            <View style={styles.logoContainer}>
              <Text style={styles.appName}>Social Taste</Text>

              <Text style={styles.tagline}>Discover • Connect • Taste</Text>
            </View>

            {/* TITLE */}
            <Text style={styles.title}>Welcome Back</Text>

            <Text style={styles.subtitle}>
              Login to continue your luxury experience
            </Text>

            {/* INPUTS */}
            <View style={styles.inputContainer}>
              {/* Email */}
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#D4AF37"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Email Address or Phone"
                  placeholderTextColor="rgba(212,175,55,0.5)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#D4AF37"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor="rgba(212,175,55,0.5)"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color="#D4AF37"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* LOGIN BUTTON */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Text style={styles.buttonText}>LOGIN</Text>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#000"
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </TouchableOpacity>

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>

              <TouchableOpacity
                onPress={() => router.push("/Screens/register/register")}
              >
                <Text style={styles.linkText}> Register Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SUCCESS MODAL */}
          <SuccessModal
            visible={showSuccess}
            onClose={handleModalClose}
            title="Login Successful!"
            message="Welcome back to Social Taste."
          />
        </ScreenBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },

  content: {
    width: "100%",
    paddingHorizontal: 28,
    alignItems: "center",
  },

  // LOGO
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },

  appName: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#D4AF37",
    letterSpacing: 2,
  },

  tagline: {
    marginTop: 8,
    fontSize: 12,
    color: "#FFF",
    opacity: 0.7,
    letterSpacing: 2,
  },

  // TITLE
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#AAA",
    textAlign: "center",
    marginBottom: 40,
  },

  // INPUTS
  inputContainer: {
    width: "100%",
    marginBottom: 25,
  },

  inputWrapper: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
  },

  // BUTTON
  loginButton: {
    width: "100%",
    height: 58,
    borderRadius: 18,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",

    shadowColor: "#D4AF37",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 2,
  },

  // FOOTER
  footer: {
    flexDirection: "row",
    marginTop: 28,
  },

  footerText: {
    color: "#FFF",
    opacity: 0.7,
  },

  linkText: {
    color: "#D4AF37",
    fontWeight: "bold",
  },
});

export default Login;
