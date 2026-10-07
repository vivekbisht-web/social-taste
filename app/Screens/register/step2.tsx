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
  Alert,
  Modal,
  FlatList,
  Easing,
  KeyboardAvoidingView, // <-- Added this import
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Reusable Background
import ScreenBackground from '../../../components/ScreenBackground/ScreenBackground';

const { width, height } = Dimensions.get('window');
const GOLD = '#D4AF37';
const WHITE = '#FFFFFF';

// Data Options
const EDUCATION_LEVELS = [
  'Doctorate / PhD',
  "Master's Degree",
  "Bachelor's Degree",
  'Diploma',
  'High School',
  'Other',
];

const INCOME_RANGES = [
  'Under 3 LPA',
  '3 - 6 LPA',
  '6 - 10 LPA',
  '10 - 15 LPA',
  '15 - 25 LPA',
  '25 - 50 LPA',
  '50L - 1Cr',
  '1Cr +',
];

// --- StepIndicator Component ---
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
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
                <Ionicons name="checkmark" size={14} color="black" />
              ) : (
                <Text style={[styles.stepNumberText, isActive && { color: 'black' }]}>{stepNum}</Text>
              )}
            </View>
            {!isLast && (
              <View style={[styles.stepLine, stepNum < currentStep ? styles.stepLineActive : styles.stepLineInactive]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// --- Floating Hearts ---
const FloatingHearts = () => {
  const HEART_COUNT = 10;
  const hearts = useRef(
    Array.from({ length: HEART_COUNT }).map(() => ({
      x: Math.random() * width,
      scale: Math.random() * 0.4 + 0.3,
      opacity: Math.random() * 0.4 + 0.2,
      animation: new Animated.Value(0),
      delay: Math.random() * 5000,
      duration: Math.random() * 4000 + 7000,
    }))
  ).current;

  useEffect(() => {
    hearts.forEach((heart) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(heart.delay),
          Animated.timing(heart.animation, {
            toValue: 1,
            duration: heart.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {hearts.map((heart, index) => {
        const translateY = heart.animation.interpolate({ inputRange: [0, 1], outputRange: [height, -100] });
        return (
          <Animated.Text
            key={index}
            style={[styles.heart, { left: heart.x, opacity: heart.opacity, transform: [{ translateY }, { scale: heart.scale }] }]}
          >
            ♥
          </Animated.Text>
        );
      })}
    </View>
  );
};

// --- Custom Input Component ---
const CustomInput = ({ label, icon, IconComp, placeholder, value, onChangeText }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <IconComp name={icon} size={18} color="rgba(212, 175, 55, 0.6)" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(212, 175, 55, 0.3)"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  </View>
);

const RegisterStep2 = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const step1Data = useLocalSearchParams();

  // Form States
  const [edu, setEdu] = useState('');
  const [college, setCollege] = useState('');
  const [job, setJob] = useState('');
  const [company, setCompany] = useState('');
  const [income, setIncome] = useState('');

  // UI States
  const [showEduModal, setShowEduModal] = useState(false);

  // Animations
  const fadeAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
  const slideAnims = useRef([...Array(6)].map(() => new Animated.Value(20))).current;

  useEffect(() => {
    const animations = fadeAnims.map((anim, i) =>
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnims[i], { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    );
    Animated.stagger(100, animations).start();
  }, []);

  const handleNext = () => {
    if (!edu || !college || !job || !company || !income) {
      Alert.alert('Incomplete Info', 'Please fill all fields to build a perfect profile.');
      return;
    }

    const combinedPayload = {
      ...step1Data,
      education: edu,
      college,
      jobTitle: job,
      company,
      annualIncome: income,
    };

    console.log('\n==== MERGED DATA (Step 1 + Step 2) ====');
    console.log(JSON.stringify(combinedPayload, null, 2));

    router.push({
      pathname: '/Screens/register/step3',
      params: combinedPayload,
    });
  };

  return (
    <ScreenBackground>
      <FloatingHearts />
      <View style={{ flex: 1, paddingTop: insets.top + 10 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <StepIndicator currentStep={2} totalSteps={5} />
          <Text style={styles.stepProgressText}>Education & Career</Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <Animated.View style={{ opacity: fadeAnims[0], transform: [{ translateY: slideAnims[0] }] }}>
              <Text style={styles.title}>Professional Life</Text>
              <Text style={styles.subtitle}>Help us find someone who matches your ambition</Text>
            </Animated.View>

            {/* Education Selection (Modal Trigger) */}
            <Animated.View style={{ opacity: fadeAnims[1], transform: [{ translateY: slideAnims[1] }] }}>
              <TouchableOpacity style={styles.inputGroup} onPress={() => setShowEduModal(true)}>
                <Text style={styles.label}>Highest Qualification</Text>
                <View style={styles.inputWrapper}>
                  <FontAwesome5 name="graduation-cap" size={18} color={GOLD} style={styles.inputIcon} />
                  <Text style={[styles.inputFieldText, !edu && { color: 'rgba(212, 175, 55, 0.3)' }]}>
                    {edu || 'Select Qualification'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={GOLD} />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* College Input */}
            <Animated.View style={{ opacity: fadeAnims[2], transform: [{ translateY: slideAnims[2] }] }}>
              <CustomInput
                label="College / University"
                icon="university"
                IconComp={FontAwesome5}
                placeholder="Where did you study?"
                value={college}
                onChangeText={setCollege}
              />
            </Animated.View>

            {/* Job Title */}
            <Animated.View style={{ opacity: fadeAnims[3], transform: [{ translateY: slideAnims[3] }] }}>
              <CustomInput
                label="Occupation"
                icon="briefcase-variant"
                IconComp={MaterialCommunityIcons}
                placeholder="e.g. Senior Manager, Doctor"
                value={job}
                onChangeText={setJob}
              />
            </Animated.View>

            {/* Company */}
            <Animated.View style={{ opacity: fadeAnims[4], transform: [{ translateY: slideAnims[4] }] }}>
              <CustomInput
                label="Company Name"
                icon="office-building"
                IconComp={MaterialCommunityIcons}
                placeholder="Where do you work?"
                value={company}
                onChangeText={setCompany}
              />
            </Animated.View>

            {/* Annual Income (Chips) */}
            <Animated.View style={{ opacity: fadeAnims[5], transform: [{ translateY: slideAnims[5] }] }}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Annual Income</Text>
                <View style={styles.chipGrid}>
                  {INCOME_RANGES.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.chip, income === item && styles.chipActive]}
                      onPress={() => setIncome(item)}
                    >
                      <Text style={[styles.chipText, income === item && styles.chipTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>

            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer Button */}
        <View style={[styles.footer, { bottom: Math.max(insets.bottom + 10, 30) }]}>
          <TouchableOpacity activeOpacity={0.8} style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>CONTINUE</Text>
            <Ionicons name="arrow-forward" size={20} color="black" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Education Selection Modal --- */}
      <Modal visible={showEduModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Highest Qualification</Text>
              <TouchableOpacity onPress={() => setShowEduModal(false)}>
                <Ionicons name="close" size={24} color={GOLD} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={EDUCATION_LEVELS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setEdu(item);
                    setShowEduModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, edu === item && { color: GOLD, fontWeight: 'bold' }]}>
                    {item}
                  </Text>
                  {edu === item && <Ionicons name="checkmark" size={20} color={GOLD} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: 30, alignItems: 'center', marginBottom: 15 },
  stepIndicatorContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  stepCircle: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  stepCircleActive: { backgroundColor: GOLD, borderColor: GOLD },
  stepCircleInactive: { backgroundColor: 'transparent', borderColor: 'rgba(212, 175, 55, 0.4)' },
  stepNumberText: { fontSize: 11, fontWeight: 'bold', color: GOLD },
  stepLine: { height: 1.5, width: (width - 250) / 4, marginHorizontal: 5 },
  stepLineActive: { backgroundColor: GOLD },
  stepLineInactive: { backgroundColor: 'rgba(212, 175, 55, 0.2)' },
  stepProgressText: { fontSize: 11, fontWeight: 'bold', color: GOLD, letterSpacing: 2, textTransform: 'uppercase' },

  scrollContent: { paddingHorizontal: 30, paddingTop: 10 },
  title: { fontSize: 34, color: GOLD, fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif' },
  subtitle: { fontSize: 14, color: WHITE, opacity: 0.6, marginTop: 5, marginBottom: 25 },

  inputGroup: { marginBottom: 22 },
  label: { color: GOLD, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
    height: 50,
  },
  inputIcon: { width: 30 },
  input: { flex: 1, color: WHITE, fontSize: 16 },
  inputFieldText: { flex: 1, color: WHITE, fontSize: 16 },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  chipActive: { backgroundColor: GOLD, borderColor: GOLD },
  chipText: { color: GOLD, fontSize: 12, fontWeight: 'bold' },
  chipTextActive: { color: 'black' },

  footer: { position: 'absolute', left: 30, right: 30 },
  nextButton: {
    backgroundColor: GOLD,
    height: 55,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  nextButtonText: { color: 'black', fontWeight: 'bold', letterSpacing: 2, fontSize: 16 },
  heart: { position: 'absolute', fontSize: 20, bottom: -50, color: 'rgba(212, 175, 55, 0.2)' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    maxHeight: height * 0.6,
    borderTopWidth: 1,
    borderColor: GOLD,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: GOLD, fontSize: 18, fontWeight: 'bold' },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(212, 175, 55, 0.1)',
  },
  modalItemText: { color: WHITE, fontSize: 16 },
});

export default RegisterStep2;