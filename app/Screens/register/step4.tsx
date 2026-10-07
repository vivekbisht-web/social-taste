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
  ActivityIndicator // <-- Added for loading animation
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // <-- Added MaterialIcons for location icon
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location'; // <-- Expo Location Library imported

// Reusable components import karein
import ScreenBackground from '../../../components/ScreenBackground/ScreenBackground'; 

const { width, height } = Dimensions.get('window');
const GOLD = '#D4AF37';
const WHITE = '#FFFFFF';

// --- StepIndicator Component ---
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

// --- Floating Hearts Component ---
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

// --- Main RegisterStep3 Component ---
const RegisterStep3 = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const previousData = useLocalSearchParams();

  const [data, setData] = useState({ city: '', state: '', country: '' });
  const [isFetching, setIsFetching] = useState(false); // <-- Loader state

  // ✅ TYPEWRITER ANIMATION LOGIC FOR AUTO-FILL
  const animateAutoFill = (fetchedCity: string, fetchedState: string, fetchedCountry: string) => {
    let cityStr = '';
    let stateStr = '';
    let countryStr = '';
    let i = 0, j = 0, k = 0;

    // Pehle input fields clear karo
    setData({ city: '', state: '', country: '' });

    // Interval ke through ek-ek character fill hoga
    const interval = setInterval(() => {
      let updated = false;
      if (i < fetchedCity.length) { cityStr += fetchedCity[i]; i++; updated = true; }
      if (j < fetchedState.length) { stateStr += fetchedState[j]; j++; updated = true; }
      if (k < fetchedCountry.length) { countryStr += fetchedCountry[k]; k++; updated = true; }

      if (updated) {
        setData({ city: cityStr, state: stateStr, country: countryStr });
      } else {
        clearInterval(interval); // Animation khatam
      }
    }, 40); // Speed of typewriter animation
  };

  // ✅ AUTO-FETCH LOCATION LOGIC
  const handleAutoFetchLocation = async () => {
    setIsFetching(true);
    try {
      // 1. Permission mango
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to auto-fetch your details.');
        setIsFetching(false);
        return;
      }

      // 2. Coordinates nikalo
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      
      // 3. Coordinates se Address nikalo (Reverse Geocoding)
      let geocodeResult = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (geocodeResult.length > 0) {
        const place = geocodeResult[0];
        
        // Data properly map karna taaki null na aaye
        const fetchedCity = place.city || place.subregion || place.district || '';
        const fetchedState = place.region || '';
        const fetchedCountry = place.country || '';

        // 4. Animation ke sath Data set karo
        animateAutoFill(fetchedCity, fetchedState, fetchedCountry);
      } else {
        Alert.alert('Error', 'Could not find address details for your location.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while fetching location.');
    } finally {
      setIsFetching(false);
    }
  };

  // ✅ NEXT BUTTON LOGIC
  const handleNext = () => {
    const { city, state, country } = data;

    if (!city || !state || !country) {
      Alert.alert('Incomplete Data', 'Please fill all the location details before proceeding.');
      return;
    }

    const combinedPayload = { 
      ...previousData, 
      city: city, 
      state: state, 
      country: country 
    };

    console.log('\n==== COMBINED PAYLOAD (Step 1 + 2 + 3 Data) ====');
    console.log(JSON.stringify(combinedPayload, null, 2));
    console.log('================================================\n');

    router.push({
      pathname: '/Screens/register/step5',
      params: combinedPayload,
    });
  };

  return (
    <ScreenBackground>
      <FloatingHearts />
      
      <View style={{ flex: 1, paddingTop: insets.top + 10 }}>
        <View style={styles.header}>
          <StepIndicator currentStep={3} totalSteps={5} />
          <Text style={styles.stepProgressText}>Step 3 of 5</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Location Details</Text>
          <Text style={styles.subtitle}>Where are you based?</Text>

          {/* ✅ AUTO-FETCH BUTTON */}
          <TouchableOpacity 
            style={styles.autoFetchButton} 
            onPress={handleAutoFetchLocation}
            disabled={isFetching}
          >
            {isFetching ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <>
                <MaterialIcons name="my-location" size={18} color="#000" />
                <Text style={styles.autoFetchText}>AUTO-FETCH LOCATION</Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current City</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Mumbai" 
              placeholderTextColor="rgba(212, 175, 55, 0.4)" 
              value={data.city} 
              onChangeText={(t) => setData({...data, city: t})} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>State</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Maharashtra" 
              placeholderTextColor="rgba(212, 175, 55, 0.4)" 
              value={data.state} 
              onChangeText={(t) => setData({...data, state: t})} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Country</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. India" 
              placeholderTextColor="rgba(212, 175, 55, 0.4)" 
              value={data.country} 
              onChangeText={(t) => setData({...data, country: t})} 
            />
          </View>
          
          <View style={{ height: 120 }} /> 
        </ScrollView>

        <View style={[styles.footer, { bottom: Math.max(insets.bottom + 10, 30) }]}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
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
  subtitle: { color: WHITE, opacity: 0.7, marginBottom: 20 },
  
  // New Styles added for Auto-Fetch Button
  autoFetchButton: {
    flexDirection: 'row',
    backgroundColor: GOLD,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  autoFetchText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 1,
  },

  scrollContent: { paddingHorizontal: 30 },
  inputGroup: { marginBottom: 25 },
  label: { color: GOLD, fontSize: 12, marginBottom: 10, letterSpacing: 1.5, fontWeight: '600' },
  input: { borderBottomWidth: 1, borderBottomColor: 'rgba(212, 175, 55, 0.4)', color: WHITE, fontSize: 16, paddingBottom: 5 },
  footer: { position: 'absolute', left: 30, right: 30 },
  nextButton: { backgroundColor: GOLD, height: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 2 },
  nextButtonText: { fontWeight: 'bold', letterSpacing: 3, fontSize: 16, color: '#000' },
  heart: { position: 'absolute', fontSize: 20, bottom: -50, color: 'rgba(212, 175, 55, 0.3)' },
});

export default RegisterStep3;