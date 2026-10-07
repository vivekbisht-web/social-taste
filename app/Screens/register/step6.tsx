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

const OCCUPATION_OPTIONS = ["Business", "Service", "Professional", "Retired", "Homemaker"];
const FAMILY_TYPES = ["Nuclear", "Joint"];
const SIBLING_OPTIONS = ["None", "1", "2", "3", "3+"];

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

const RegisterStep5 = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const previousData = useLocalSearchParams();

  const [data, setData] = useState({ 
    parentsJob: '', 
    familyType: '', 
    brothers: '', 
    sisters: '' 
  });

  const handleNext = () => {
    const { parentsJob, familyType, brothers, sisters } = data;

    if (!parentsJob || !familyType || !brothers || !sisters) {
      Alert.alert('Incomplete Data', 'Please select all family details.');
      return;
    }

    const finalCombinedPayload = { 
      ...previousData, 
      parentsJob, 
      familyType, 
      siblings: `${brothers} Brother(s), ${sisters} Sister(s)`
    };

    console.log(JSON.stringify(finalCombinedPayload, null, 2));

    router.push({
      pathname: '/Screens/register/step7',
      params: finalCombinedPayload,
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
          <StepIndicator currentStep={5} totalSteps={5} />
          <Text style={styles.stepProgressText}>Step 5 of 5</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Family Details</Text>
          <Text style={styles.subtitle}>Share your family background</Text>
          
          <SelectionGroup 
            title="FATHER / MOTHER OCCUPATION"
            options={OCCUPATION_OPTIONS}
            selectedValue={data.parentsJob}
            onSelect={(val: string) => setData({...data, parentsJob: val})}
          />

          <SelectionGroup 
            title="FAMILY TYPE"
            options={FAMILY_TYPES}
            selectedValue={data.familyType}
            onSelect={(val: string) => setData({...data, familyType: val})}
          />

          <SelectionGroup 
            title="NO. OF BROTHERS"
            options={SIBLING_OPTIONS}
            selectedValue={data.brothers}
            onSelect={(val: string) => setData({...data, brothers: val})}
          />

          <SelectionGroup 
            title="NO. OF SISTERS"
            options={SIBLING_OPTIONS}
            selectedValue={data.sisters}
            onSelect={(val: string) => setData({...data, sisters: val})}
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

export default RegisterStep5;