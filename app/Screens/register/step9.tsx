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
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { registerUser } from '../../../Services/api/authService';
import ScreenBackground from '../../../components/ScreenBackground/ScreenBackground';
import SuccessModal from '../../../components/SuccessModal/SuccessModal';

const { width } = Dimensions.get('window');
const GOLD = '#D4AF37';
const WHITE = '#FFFFFF';

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const lineAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    lineAnim.setValue(0);
    Animated.timing(lineAnim, { toValue: 1, duration: 1500, useNativeDriver: false }).start();
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.stepCircle, isActive ? styles.stepCircleActive : styles.stepCircleInactive]}>
                {isCompleted ? <Ionicons name="checkmark" size={14} color="black" /> : <Text style={[styles.stepNumberText, isActive && { color: 'black' }]}>{stepNum}</Text>}
              </View>
            </View>
            {!isLast && (
              <View style={styles.stepLineWrapper}>
                <Animated.View style={[styles.stepLineFill, { width: isTargetLine ? lineAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) : (stepNum < currentStep ? '100%' : '0%') }]} />
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const RegisterStep8 = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const previousStepsData = useLocalSearchParams();

  const [primaryPhoto, setPrimaryPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<(ImagePicker.ImagePickerAsset | null)[]>(new Array(6).fill(null));
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickPrimaryPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setPrimaryPhoto(result.assets[0]);
  };

  const pickAdditionalPhoto = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      const newPhotos = [...additionalPhotos];
      newPhotos[index] = result.assets[0];
      setAdditionalPhotos(newPhotos);
    }
  };

const handleFinish = async () => {
    if (!primaryPhoto) {
      Alert.alert("Required", "Please upload a primary profile photo.");
      return;
    }

    setLoading(true);
    try {
      const finalUserData = {
        ...previousStepsData,
        primaryPhoto: primaryPhoto,
        additionalPhotos: additionalPhotos.filter(img => img !== null),
      };

      const response = await registerUser(finalUserData);
      console.log("API Success:", response);
      setModalVisible(true);
    } catch (error: any) {
      console.error("API Error:", error.response?.data || error.message);
      Alert.alert("Registration Failed", error.response?.data?.message || "Check network connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <View style={{ flex: 1, paddingTop: insets.top + 10 }}>
        <View style={styles.header}>
          <StepIndicator currentStep={8} />
          <Text style={styles.stepProgressText}>Step 8 of 9</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Upload Photos</Text>
          <Text style={styles.subtitle}>Add your best shots</Text>
          
          <Text style={styles.label}>Primary Profile Photo</Text>
          <TouchableOpacity style={styles.primaryPhotoBox} activeOpacity={0.7} onPress={pickPrimaryPhoto}>
            {primaryPhoto ? (
              <Image source={{ uri: primaryPhoto.uri }} style={styles.fullImage} />
            ) : (
              <>
                <View style={styles.iconCircle}><Ionicons name="camera" size={32} color={GOLD} /></View>
                <Text style={styles.primaryText}>Add Primary Photo</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={[styles.label, { marginTop: 30 }]}>Additional Photos</Text>
          <View style={styles.grid}>
            {additionalPhotos.map((photo, i) => (
              <TouchableOpacity key={i} style={styles.photoBox} activeOpacity={0.7} onPress={() => pickAdditionalPhoto(i)}>
                {photo ? <Image source={{ uri: photo.uri }} style={styles.fullImage} /> : <MaterialCommunityIcons name="plus-circle-outline" size={28} color="rgba(212, 175, 55, 0.4)" />}
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={[styles.footer, { bottom: Math.max(insets.bottom + 10, 30) }]}>
          <TouchableOpacity style={[styles.nextButton, loading && styles.disabledButton]} onPress={handleFinish} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.nextButtonText}>FINISH REGISTRATION</Text>}
          </TouchableOpacity>
        </View>
      </View>
      <SuccessModal 
  visible={modalVisible} 
  title="Registration Successful!" 
  message="Your account has been created successfully. Please login to continue."
  onClose={() => { 
    setModalVisible(false); 
    router.replace('/Screens/login/login'); 
  }} 
/>
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
  subtitle: { color: WHITE, opacity: 0.7, marginBottom: 30, fontSize: 16 },
  scrollContent: { paddingHorizontal: 30 },
  label: { color: GOLD, fontSize: 12, marginBottom: 15, letterSpacing: 1.5, fontWeight: '600', textTransform: 'uppercase' },
  primaryPhotoBox: { height: 220, borderWidth: 1.5, borderColor: GOLD, borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(212, 175, 55, 0.05)', overflow: 'hidden' },
  fullImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  primaryText: { color: GOLD, fontSize: 16, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  photoBox: { width: '31%', aspectRatio: 1, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 12, backgroundColor: 'rgba(255, 255, 255, 0.03)', overflow: 'hidden' },
  footer: { position: 'absolute', left: 30, right: 30 },
  nextButton: { backgroundColor: GOLD, height: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 2 },
  disabledButton: { opacity: 0.5 },
  nextButtonText: { fontWeight: 'bold', letterSpacing: 3, fontSize: 16, color: '#000' },
});

export default RegisterStep8;