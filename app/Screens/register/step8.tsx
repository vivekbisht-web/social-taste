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
  Alert // <-- Validation ke liye Alert add kiya
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // <-- useLocalSearchParams add kiya
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Reusable components import
import ScreenBackground from '../../../components/ScreenBackground/ScreenBackground'; 

const { width, height } = Dimensions.get('window');
const GOLD = '#D4AF37';
const WHITE = '#FFFFFF';

// --- StepIndicator Component (Custom range 5-9) ---
const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    lineAnim.setValue(0);
    Animated.timing(lineAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  return (
    <View style={styles.stepIndicatorContainer}>
      {[5, 6, 7, 8, 9].map((stepNum, index) => {
        const isLast = index === 4;
        const isActive = stepNum <= currentStep;
        const isCompleted = stepNum < currentStep;
        
        // Step 7 par hain, toh Step 6 aur 7 ke beech ki line animate hogi
        const isTargetLine = stepNum === (currentStep - 1); 

        return (
          <React.Fragment key={stepNum}>
            <View style={[styles.stepCircle, isActive ? styles.stepCircleActive : styles.stepCircleInactive]}>
              {isCompleted ? (
                <Ionicons name="checkmark" size={14} color="black" />
              ) : (
                <Text style={[styles.stepNumberText, isActive && {color: 'black'}]}>{stepNum}</Text>
              )}
            </View>
            {!isLast && (
              <View style={styles.stepLineWrapper}>
                <Animated.View style={[
                  styles.stepLineFill, 
                  { 
                    width: isTargetLine 
                      ? lineAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) 
                      : (stepNum < currentStep ? '100%' : '0%') 
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

// --- Floating Hearts Animation ---
const FloatingHearts = () => {
  const HEART_COUNT = 10;
  const hearts = useRef(Array.from({ length: HEART_COUNT }).map(() => ({
    x: Math.random() * width,
    scale: Math.random() * 0.4 + 0.3,
    opacity: Math.random() * 0.4 + 0.2,
    animation: new Animated.Value(0),
    delay: Math.random() * 5000,
    duration: Math.random() * 4000 + 7000,
  }))).current;

  useEffect(() => {
    hearts.forEach((heart) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(heart.delay),
          Animated.timing(heart.animation, { toValue: 1, duration: heart.duration, easing: (t) => t, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {hearts.map((heart, index) => {
        const translateY = heart.animation.interpolate({ inputRange: [0, 1], outputRange: [height, -100] });
        return (
          <Animated.Text key={index} style={[styles.heart, { left: heart.x, opacity: heart.opacity, transform: [{ translateY }, { scale: heart.scale }] }]}>
            ♥
          </Animated.Text>
        );
      })}
    </View>
  );
};

const RegisterStep7 = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // ✅ PICHLE SABHI SCREENS KA DATA CATCH KAR RAHE HAIN
  const previousData = useLocalSearchParams();
  const [bio, setBio] = useState('');

  // ✅ NEXT BUTTON LOGIC
  const handleNext = () => {
    // Basic Validation: Bio khali nahi honi chahiye
    if (!bio.trim() || bio.length < 20) {
      Alert.alert('Short Bio', 'Please write at least 20 characters about yourself to continue.');
      return;
    }

    // ✅ Pichla data aur Step 7 ka data MERGE kar rahe hain
    const combinedPayload = { 
      ...previousData, 
      bio: bio 
    };

    // ✅ Console me print kara rahe hain pura data
    console.log('\n==== COMBINED PAYLOAD (Up to Step 7) ====');
    console.log(JSON.stringify(combinedPayload, null, 2));
    console.log('=========================================\n');

    // Agli screen (Step 8) par bhejna aur data transfer karna
    router.push({
      pathname: '/Screens/register/step9',
      params: combinedPayload,
    });
  };

  return (
    <ScreenBackground>
      <FloatingHearts />
      
      <View style={{ flex: 1, paddingTop: insets.top + 10 }}>
        <View style={styles.header}>
          <StepIndicator currentStep={7} />
          <Text style={styles.stepProgressText}>Step 7 of 9</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Profile Info</Text>
          <Text style={styles.subtitle}>Write something about yourself</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>About Yourself (Bio)</Text>
            <View style={styles.bioContainer}>
              <TextInput 
                style={styles.bioInput} 
                placeholder="Tell us about your interests, hobbies, and what you are looking for in a partner..." 
                placeholderTextColor="rgba(212, 175, 55, 0.3)" 
                multiline 
                numberOfLines={6}
                value={bio} 
                onChangeText={setBio} 
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.charCount}>{bio.length} characters (Min 20 recommended)</Text>
          </View>

          <View style={{ height: 120 }} /> 
        </ScrollView>

        <View style={[styles.footer, { bottom: Math.max(insets.bottom + 10, 30) }]}>
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={handleNext} // ✅ handleNext call ho raha hai
          >
            <Text style={styles.nextButtonText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: 30, alignItems: 'center', marginBottom: 20 },
  stepIndicatorContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  stepCircle: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: GOLD },
  stepCircleActive: { backgroundColor: GOLD },
  stepCircleInactive: { backgroundColor: 'transparent' },
  stepNumberText: { fontSize: 11, fontWeight: 'bold', color: GOLD },
  stepLineWrapper: { height: 1.5, width: (width - 250) / 4, backgroundColor: 'rgba(212, 175, 55, 0.3)', marginHorizontal: 5 },
  stepLineFill: { height: '100%', backgroundColor: GOLD },
  stepProgressText: { fontSize: 11, fontWeight: 'bold', color: GOLD, letterSpacing: 2, textTransform: 'uppercase' },
  title: { fontSize: 32, color: GOLD, marginBottom: 5, fontFamily: Platform.OS === 'android' ? 'serif' : 'Times New Roman' },
  subtitle: { color: WHITE, opacity: 0.7, marginBottom: 30 },
  scrollContent: { paddingHorizontal: 30 },
  inputGroup: { marginBottom: 25 },
  label: { color: GOLD, fontSize: 12, marginBottom: 15, letterSpacing: 1.5, fontWeight: '600' },
  bioContainer: {
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
  },
  bioInput: { 
    color: WHITE, 
    fontSize: 16, 
    minHeight: 150,
    lineHeight: 24,
  },
  charCount: {
    color: GOLD,
    fontSize: 10,
    textAlign: 'right',
    marginTop: 8,
    opacity: 0.6,
  },
  footer: { position: 'absolute', left: 30, right: 30 },
  nextButton: { backgroundColor: GOLD, height: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 2 },
  nextButtonText: { fontWeight: 'bold', letterSpacing: 3, fontSize: 16, color: '#000' },
  heart: { position: 'absolute', fontSize: 20, bottom: -50, color: 'rgba(212, 175, 55, 0.3)' },
});

export default RegisterStep7;