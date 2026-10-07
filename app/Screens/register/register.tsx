import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

// Path adjust kar lena apne folder structure ke hisaab se
import ScreenBackground from '../../../components/ScreenBackground/ScreenBackground';

const { width, height } = Dimensions.get('window');

const GOLD = '#D4AF37';
const WHITE = '#FFFFFF';
const DARK_BG = '#1A1A1A';

// Religions List
const RELIGIONS = [
  'Hindu',
  'Muslim',
  'Sikh',
  'Christian',
  'Jain',
  'Buddhist',
  'Parsi',
  'Jewish',
  'Other',
];

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

interface CustomInputProps {
  label: string;
  icon: string;
  IconComponent: any;
  placeholder: string;
  value: string;
  onChangeText?: (text: string) => void;
  isFocused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  editable?: boolean;
  onPress?: () => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <View style={styles.stepIndicatorContainer}>
      {[...Array(totalSteps)].map((_, index) => {
        const stepNum = index + 1;
        const isActive = stepNum <= currentStep;
        const isLast = stepNum === totalSteps;

        return (
          <React.Fragment key={stepNum}>
            <View style={[styles.stepCircle, isActive ? styles.stepCircleActive : styles.stepCircleInactive]}>
              {isActive ? (
                <Ionicons name="checkmark" size={14} color="black" />
              ) : (
                <Text style={styles.stepNumberText}>{stepNum}</Text>
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

const FloatingHearts = () => {
  const HEART_COUNT = 12;
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
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {hearts.map((heart, index) => {
        const translateY = heart.animation.interpolate({
          inputRange: [0, 1],
          outputRange: [height, -100],
        });
        return (
          <Animated.Text
            key={index}
            style={[
              styles.heart,
              { left: heart.x, opacity: heart.opacity, transform: [{ translateY }, { scale: heart.scale }] },
            ]}
          >
            ♥
          </Animated.Text>
        );
      })}
    </View>
  );
};

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  icon,
  IconComponent,
  placeholder,
  value,
  onChangeText,
  isFocused,
  onFocus,
  onBlur,
  editable = true,
  onPress,
}) => {
  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        <IconComponent
          name={icon}
          size={18}
          color={isFocused ? GOLD : 'rgba(212, 175, 55, 0.4)'}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(212, 175, 55, 0.4)"
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          editable={editable}
          pointerEvents={editable ? 'auto' : 'none'}
        />
      </View>
    </TouchableOpacity>
  );
};

const Register = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [religion, setReligion] = useState('');

  // Calendar States
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const currentStep = 1;
  const totalSteps = 5;

  const fadeAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
  const slideAnims = useRef([...Array(6)].map(() => new Animated.Value(30))).current;

  useEffect(() => {
    const animations = fadeAnims.map((anim, index) => {
      return Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnims[index], { toValue: 0, duration: 600, useNativeDriver: true }),
      ]);
    });
    Animated.stagger(100, animations).start();
  }, []);

  const handleNext = () => {
    if (!name || !gender || !dob || !maritalStatus || !religion) {
      Alert.alert('Incomplete Data', 'Please fill all the fields before proceeding.');
      return;
    }

    const payload = { 
      name, 
       gender: gender.toLowerCase(),  
      dob, 
      maritalStatus, 
      religion 
    };

    console.log('\n==== STEP 1 PAYLOAD ====');
    console.log(JSON.stringify(payload, null, 2));

    router.push({
      pathname: '/Screens/register/step2',
      params: payload,
    });
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      setDob(`${day} / ${month} / ${year}`);
    }
  };

  return (
    <ScreenBackground>
      <View style={{ flex: 1, paddingTop: insets.top + 10 }}>
        <FloatingHearts />

        <View style={styles.header}>
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          <Text style={styles.stepProgressText}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Animated.View style={{ opacity: fadeAnims[0], transform: [{ translateY: slideAnims[0] }] }}>
              <Text style={styles.title}>Basic Info</Text>
              <Text style={styles.subtitle}>Begin your elegant journey with us</Text>
            </Animated.View>

            {/* Name Input */}
            <Animated.View style={{ opacity: fadeAnims[1], transform: [{ translateY: slideAnims[1] }], marginTop: 20 }}>
              <CustomInput
                label="Full Name"
                icon="user-alt"
                IconComponent={FontAwesome5}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                isFocused={focusedField === 'name'}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </Animated.View>

            {/* Gender Selection */}
            <Animated.View style={{ opacity: fadeAnims[2], transform: [{ translateY: slideAnims[2] }] }}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.chipContainer}>
                  {['Male', 'Female'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.chip, gender === item && styles.chipActive]}
                      onPress={() => setGender(item)}
                    >
                      <Ionicons
                        name={item === 'Male' ? 'male' : 'female'}
                        size={16}
                        color={gender === item ? '#000' : GOLD}
                      />
                      <Text style={[styles.chipText, gender === item && styles.chipTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* DOB Input */}
            <Animated.View style={{ opacity: fadeAnims[3], transform: [{ translateY: slideAnims[3] }] }}>
              <CustomInput
                label="Date of Birth"
                icon="calendar-heart"
                IconComponent={MaterialCommunityIcons}
                placeholder="DD / MM / YYYY"
                value={dob}
                editable={false}
                onPress={() => setShowDatePicker(true)}
                isFocused={showDatePicker}
              />
            </Animated.View>

            {/* Marital Status Selection */}
            <Animated.View style={{ opacity: fadeAnims[4], transform: [{ translateY: slideAnims[4] }] }}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Marital Status</Text>
                <View style={styles.chipContainer}>
                  {['Never Married', 'Divorced', 'Widowed'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.chip, maritalStatus === item && styles.chipActive]}
                      onPress={() => setMaritalStatus(item)}
                    >
                      <Text style={[styles.chipText, maritalStatus === item && styles.chipTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* Religion Selection (Update: Selected via Chips) */}
            <Animated.View style={{ opacity: fadeAnims[5], transform: [{ translateY: slideAnims[5] }] }}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Religion</Text>
                <View style={styles.chipContainer}>
                  {RELIGIONS.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.chip, religion === item && styles.chipActive]}
                      onPress={() => setReligion(item)}
                    >
                      <Text style={[styles.chipText, religion === item && styles.chipTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>

            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={[styles.footer, { bottom: Math.max(insets.bottom + 10, 30) }]}>
          <TouchableOpacity activeOpacity={0.8} onPress={handleNext}>
            <View style={styles.nextButton}>
              <Text style={styles.nextButtonText}>CONTINUE</Text>
              <Ionicons name="arrow-forward" size={18} color="#000" style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Calendar Modal */}
        {showDatePicker && Platform.OS === 'ios' && (
          <Modal transparent animationType="slide">
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Date of Birth</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  textColor={GOLD}
                  onChange={onChangeDate}
                  maximumDate={new Date()}
                />
              </View>
            </View>
          </Modal>
        )}

        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
            maximumDate={new Date()}
          />
        )}
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: 30, paddingBottom: 10, alignItems: 'center' },
  stepIndicatorContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 8 },
  stepCircle: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  stepCircleActive: { backgroundColor: GOLD, borderColor: GOLD },
  stepCircleInactive: { backgroundColor: 'transparent', borderColor: 'rgba(212, 175, 55, 0.4)' },
  stepNumberText: { fontSize: 11, fontWeight: 'bold', color: GOLD },
  stepLine: { height: 1, width: (width - 250) / 4, marginHorizontal: 5 },
  stepLineActive: { backgroundColor: GOLD },
  stepLineInactive: { backgroundColor: 'rgba(212, 175, 55, 0.3)' },
  stepProgressText: { fontSize: 11, fontWeight: 'bold', color: GOLD, letterSpacing: 2, textTransform: 'uppercase' },
  scrollContent: { paddingHorizontal: 30, paddingTop: 10 },
  title: { fontSize: 38, color: GOLD, fontFamily: Platform.OS === 'android' ? 'serif' : 'Times New Roman', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: WHITE, opacity: 0.7, marginTop: 5, letterSpacing: 0.5 },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 12, color: GOLD, marginBottom: 10, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '600' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 55, borderBottomWidth: 1, borderBottomColor: 'rgba(212, 175, 55, 0.4)', paddingHorizontal: 5 },
  inputWrapperFocused: { borderBottomColor: GOLD, backgroundColor: 'rgba(212, 175, 55, 0.05)' },
  inputIcon: { marginRight: 15 },
  input: { flex: 1, fontSize: 16, color: WHITE, fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 2, borderWidth: 1, borderColor: GOLD },
  chipActive: { backgroundColor: GOLD },
  chipText: { fontSize: 13, fontWeight: 'bold', color: GOLD, letterSpacing: 1 },
  chipTextActive: { color: '#000' },
  footer: { position: 'absolute', left: 30, right: 30 },
  nextButton: { backgroundColor: GOLD, height: 55, borderRadius: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  nextButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold', letterSpacing: 3 },
  heart: { position: 'absolute', fontSize: 20, bottom: -50, color: 'rgba(212, 175, 55, 0.3)' },
  modalBackground: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  modalContent: { backgroundColor: DARK_BG, paddingBottom: 30, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: GOLD },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(212, 175, 55, 0.2)' },
  modalTitle: { color: WHITE, fontSize: 16 },
  modalDoneText: { color: GOLD, fontSize: 16, fontWeight: 'bold' },
});

export default Register;