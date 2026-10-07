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

const HEIGHT_OPTIONS = ["5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\""];
const BODY_TYPES = ["Slim", "Athletic", "Average", "Heavy"];
const EATING_HABITS = ["Veg", "Non-Veg", "Eggetarian", "Vegan"];
const LIFESTYLE_HABITS = ["Non-smoker", "Social smoker", "Regular smoker", "Non-drinker", "Social drinker", "Regular drinker"];

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => {
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
      {[...Array(totalSteps)].map((_, index) => {
        const stepNum = index + 1;
        const isActive = stepNum <= currentStep;
        const isLast = stepNum === totalSteps;
        const isTargetLine = stepNum === (currentStep - 1); 

        return (
          <React.Fragment key={stepNum}>
            <View style={[styles.stepCircle, isActive ? styles.stepCircleActive : styles.stepCircleInactive]}>
              {stepNum < currentStep ? (
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

const RegisterStep4 = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const previousData = useLocalSearchParams();

  const [data, setData] = useState({ 
    height: '', 
    bodyType: '', 
    eating: '', 
    habits: [] as string[] 
  });

  const toggleHabit = (habit: string) => {
    setData(prev => {
      const exists = prev.habits.includes(habit);
      if (exists) {
        return { ...prev, habits: prev.habits.filter(h => h !== habit) };
      } else {
        return { ...prev, habits: [...prev.habits, habit] };
      }
    });
  };

  const handleNext = () => {
    const { height, eating, habits } = data;

    if (!height || !eating || habits.length === 0) {
      Alert.alert('Incomplete Data', 'Please select your height, eating habits, and lifestyle habits.');
      return;
    }

    const combinedPayload = { 
      ...previousData, 
      height: data.height, 
      bodyType: data.bodyType || 'Not Specified', 
      eating: data.eating, 
      habits: data.habits.join(', ') 
    };

    router.push({
      pathname: '/Screens/register/step6',
      params: combinedPayload,
    });
  };

  const SelectionGroup = ({ options, selectedValue, onSelect, isMulti = false }: any) => (
    <View style={styles.chipContainer}>
      {options.map((option: string) => {
        const isSelected = isMulti 
          ? (selectedValue as string[]).includes(option)
          : selectedValue === option;
        
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
  );

  return (
    <ScreenBackground>
      <FloatingHearts />
      
      <View style={{ flex: 1, paddingTop: insets.top + 10 }}>
        <View style={styles.header}>
          <StepIndicator currentStep={4} totalSteps={5} />
          <Text style={styles.stepProgressText}>Step 4 of 5</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Physical & Lifestyle</Text>
          <Text style={styles.subtitle}>A little about your routine</Text>
          
          <View style={styles.section}>
            <Text style={styles.label}>HEIGHT</Text>
            <SelectionGroup 
              options={HEIGHT_OPTIONS} 
              selectedValue={data.height} 
              onSelect={(val: string) => setData({...data, height: val})} 
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>BODY TYPE (OPTIONAL)</Text>
            <SelectionGroup 
              options={BODY_TYPES} 
              selectedValue={data.bodyType} 
              onSelect={(val: string) => setData({...data, bodyType: val})} 
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>EATING HABITS</Text>
            <SelectionGroup 
              options={EATING_HABITS} 
              selectedValue={data.eating} 
              onSelect={(val: string) => setData({...data, eating: val})} 
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>SMOKING / DRINKING HABITS</Text>
            <SelectionGroup 
              options={LIFESTYLE_HABITS} 
              selectedValue={data.habits} 
              onSelect={toggleHabit}
              isMulti={true}
            />
          </View>
          
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

export default RegisterStep4;