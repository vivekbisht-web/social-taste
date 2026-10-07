import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  ScrollView, 
  Dimensions, 
  Platform,
  Alert // <-- Alert import kiya validation ke liye
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // <-- useLocalSearchParams add kiya
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Reusable Background Component Import
import ScreenBackground from '../../../components/ScreenBackground/ScreenBackground'; 

const { width } = Dimensions.get('window');

// Theme Colors
const DARK_RED = '#D4AF37'; // NOTE: Ye hex code Gold ka hai, par variable name DARK_RED hai, maine as it is rakha hai
const WHITE = '#FFFFFF';

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => {
  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(lineAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.stepIndicatorContainer}>
      {[...Array(totalSteps)].map((_, index) => {
        const stepNum = index + 1;
        const isActive = stepNum <= currentStep;
        const isLast = stepNum === totalSteps;

        return (
          <React.Fragment key={stepNum}>
            <View style={[styles.stepCircle, isActive ? styles.stepCircleActive : styles.stepCircleInactive]}>
              {stepNum < currentStep ? (
                <Ionicons name="checkmark" size={14} color="white" />
              ) : (
                <Text style={[styles.stepNumberText, isActive && { color: 'white' }]}>
                  {stepNum}
                </Text>
              )}
            </View>
            {!isLast && (
              <View style={styles.stepLineWrapper}>
                <View style={styles.staticLine} />
                <Animated.View style={[
                  styles.stepLineFill,
                  { 
                    width: (stepNum === 2) ? lineAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) : (stepNum < currentStep ? '100%' : '0%') 
                  }
                ]} />
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const RegisterStep1 = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // ✅ PICHLE SCREENS KA DATA CATCH KAR RAHE HAIN
  const previousData = useLocalSearchParams();

  const [formData, setFormData] = useState({ email: '', password: '' });

  // ✅ NEXT BUTTON LOGIC
  const handleNext = () => {
    const { email, password } = formData;

    // Validation check
    if (!email || !password) {
      Alert.alert('Incomplete Data', 'Please enter your email and password.');
      return;
    }

    // ✅ Pichle screens ka data aur current screen ka data combine (merge) kar rahe hain
    const combinedPayload = {
      ...previousData, // Pichli sabhi screens ka data
      email: email,
      password: password
    };

    // Console me print kar rahe hain
    console.log('\n==== COMBINED PAYLOAD (All Steps Data So Far) ====');
    console.log(JSON.stringify(combinedPayload, null, 2));
    console.log('====================================================\n');

    // Agli screen (step4) par bhej rahe hain
    router.push({
      pathname: '/Screens/register/step4',
      params: combinedPayload,
    });
  };

  return (
    <ScreenBackground>
      <View style={{ flex: 1, paddingTop: insets.top + 10 }}>
        
        {/* Header with Step Indicator */}
        <View style={styles.header}>
          <StepIndicator currentStep={2} totalSteps={5} />
          <Text style={styles.stepProgressText}>Step 1 of 5</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Account Setup</Text>
          <Text style={styles.subtitle}>Create your login credentials</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email ID / Mobile Number</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your email or phone" 
              placeholderTextColor="rgba(139, 0, 0, 0.5)" 
              value={formData.email} 
              onChangeText={(t) => setFormData({...formData, email: t})} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Create a secure password" 
              placeholderTextColor="rgba(139, 0, 0, 0.5)" 
              value={formData.password} 
              onChangeText={(t) => setFormData({...formData, password: t})} 
              secureTextEntry 
            />
          </View>
        </ScrollView>

        {/* Floating Footer Button */}
        <View style={[styles.footer, { bottom: Math.max(insets.bottom + 10, 30) }]}>
          {/* ✅ Button ko ab handleNext call karne ko bola hai */}
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  header: { 
    paddingHorizontal: 30, 
    alignItems: 'center', 
    marginBottom: 20 
  },
  stepIndicatorContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 8 
  },
  stepCircle: { 
    width: 26, 
    height: 26, 
    borderRadius: 13, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: DARK_RED 
  },
  stepCircleActive: { 
    backgroundColor: DARK_RED 
  },
  stepCircleInactive: { 
    backgroundColor: 'transparent' 
  },
  stepNumberText: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: DARK_RED 
  },
  stepLineWrapper: { 
    height: 1, 
    width: (width - 250) / 4, 
    backgroundColor: 'rgba(139, 0, 0, 0.3)', 
    marginHorizontal: 5 
  },
  staticLine: { 
    position: 'absolute', 
    width: '100%', 
    height: '100%' 
  },
  stepLineFill: { 
    height: '100%', 
    backgroundColor: DARK_RED 
  },
  stepProgressText: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: DARK_RED, 
    letterSpacing: 2, 
    textTransform: 'uppercase', 
    marginTop: 5 
  },
  title: { 
    fontSize: 32, 
    color: DARK_RED, 
    marginBottom: 5,
    fontFamily: Platform.OS === 'android' ? 'serif' : 'Times New Roman',
  },
  subtitle: { 
    color: WHITE, 
    opacity: 0.7, 
    marginBottom: 30 
  },
  scrollContent: { 
    paddingHorizontal: 30 
  },
  inputGroup: { 
    marginBottom: 25 
  },
  label: { 
    color: DARK_RED, 
    fontSize: 12, 
    marginBottom: 10, 
    letterSpacing: 1.5,
    fontWeight: '600'
  },
  input: { 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(139, 0, 0, 0.4)', 
    color: WHITE, 
    fontSize: 16, 
    paddingBottom: 5 
  },
  footer: { 
    position: 'absolute', 
    left: 30, 
    right: 30 
  },
  nextButton: { 
    backgroundColor: DARK_RED, 
    height: 55, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 4
  },
  nextButtonText: { 
    color: WHITE,
    fontWeight: 'bold', 
    letterSpacing: 3, 
    fontSize: 16 
  }
});

export default RegisterStep1;