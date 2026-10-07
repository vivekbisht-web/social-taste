import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  ScrollView, 
  Dimensions, 
  Platform,
  Alert 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenBackground from '../../../components/ScreenBackground/ScreenBackground'; 

const { width, height } = Dimensions.get('window');
const GOLD = '#D4AF37';
const WHITE = '#FFFFFF';

const AGE_RANGES = ["18-22", "23-27", "28-32", "33-37", "38-45", "45+"];
const HEIGHT_RANGES = ["Any", "4'10\" - 5'2\"", "5'3\" - 5'7\"", "5'8\" - 6'0\"", "6'1\"+"];
const RELIGIONS = ["Hindu", "Muslim", "Sikh", "Christian", "Jain", "Buddhist", "No Bar"];
const EDUCATION = ["Bachelors", "Masters", "PhD", "Doctorate", "Professional", "High School"];
const LOCATIONS = ["Same City", "Same State", "Within India", "Anywhere", "NRI"];

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

const RegisterStep6 = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const previousData = useLocalSearchParams();

  const [pref, setPref] = useState({ 
    age: '', 
    height: '', 
    religion: '', 
    edu: '', 
    loc: '' 
  });

  const handleNext = () => {
    const { age, height, religion, edu, loc } = pref;

    if (!age || !height || !religion || !edu || !loc) {
      Alert.alert('Incomplete Data', 'Please select all partner preferences.');
      return;
    }

    const combinedPayload = { 
      ...previousData, 
      partnerAge: age, 
      partnerHeight: height, 
      partnerReligion: religion, 
      partnerEdu: edu, 
      partnerLoc: loc 
    };

    console.log(JSON.stringify(combinedPayload, null, 2));

    router.push({
      pathname: '/Screens/register/step8',
      params: combinedPayload,
    });
  };

  const SelectionGroup = ({ title, options, selectedValue, onSelect }: any) => (
    <View style={styles.section}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.chipContainer}>
        {options.map((option: string) => {
          const isSelected = selectedValue === option;
          return (
            <TouchableOpacity 
              key={option}
              onPress={() => onSelect(option)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScreenBackground>
      <FloatingHearts />
      
      <View style={{ flex: 1, paddingTop: insets.top + 10 }}>
        <View style={styles.header}>
          <StepIndicator currentStep={6} />
          <Text style={styles.stepProgressText}>Step 6 of 9</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Partner Preferences</Text>
          <Text style={styles.subtitle}>Define your ideal match</Text>
          
          <SelectionGroup 
            title="AGE RANGE"
            options={AGE_RANGES}
            selectedValue={pref.age}
            onSelect={(val: string) => setPref({...pref, age: val})}
          />

          <SelectionGroup 
            title="HEIGHT PREFERENCE"
            options={HEIGHT_RANGES}
            selectedValue={pref.height}
            onSelect={(val: string) => setPref({...pref, height: val})}
          />

          <SelectionGroup 
            title="RELIGION PREFERENCE"
            options={RELIGIONS}
            selectedValue={pref.religion}
            onSelect={(val: string) => setPref({...pref, religion: val})}
          />

          <SelectionGroup 
            title="EDUCATION LEVEL"
            options={EDUCATION}
            selectedValue={pref.edu}
            onSelect={(val: string) => setPref({...pref, edu: val})}
          />

          <SelectionGroup 
            title="PREFERRED LOCATION"
            options={LOCATIONS}
            selectedValue={pref.loc}
            onSelect={(val: string) => setPref({...pref, loc: val})}
          />
          
          <View style={{ height: 120 }} /> 
        </ScrollView>

        <View style={[styles.footer, { bottom: Math.max(insets.bottom + 10, 30) }]}>
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
  section: { marginBottom: 30 },
  label: { color: GOLD, fontSize: 12, marginBottom: 15, letterSpacing: 1.5, fontWeight: '600' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.4)', backgroundColor: 'transparent' },
  chipSelected: { backgroundColor: GOLD, borderColor: GOLD },
  chipText: { color: WHITE, fontSize: 13, fontWeight: '500' },
  chipTextSelected: { color: '#000', fontWeight: 'bold' },
  footer: { position: 'absolute', left: 30, right: 30 },
  nextButton: { backgroundColor: GOLD, height: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 2 },
  nextButtonText: { fontWeight: 'bold', letterSpacing: 3, fontSize: 16, color: '#000' },
  heart: { position: 'absolute', fontSize: 20, bottom: -50, color: 'rgba(212, 175, 55, 0.3)' },
});

export default RegisterStep6;