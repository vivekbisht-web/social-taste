import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { 
  ChevronLeft, 
  Download, 
  User, 
  Briefcase, 
  Users, 
  MapPin, 
  BookOpen,
  Heart
} from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { getUserDetails } from '../../../Services/api/authService';

const { width } = Dimensions.get('window');

const GenerateBioData = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const jsonValue = await SecureStore.getItemAsync('userData');
      if (jsonValue) {
        const storedData = JSON.parse(jsonValue);
        const userId = storedData._id || storedData.id;
        
        if (userId) {
          const apiData = await getUserDetails(userId);
          setUserData(apiData);
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to load profile information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePDF = () => {
    Alert.alert("Success", "Your professional bio-data PDF is being generated.");
  };

  const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <View style={styles.sectionHeader}>
      <Icon size={18} color="#D4AF37" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1a1a1a', '#000']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#D4AF37" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bio-Data Preview</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.previewCard}>
          <View style={styles.cardHeaderContainer}>
            <Text style={styles.cardHeader}>MARRIAGE BIO-DATA</Text>
            <View style={styles.headerLine} />
          </View>
          
          <View style={styles.section}>
            <SectionHeader icon={User} title="Personal Details" />
            <InfoRow label="Full Name" value={userData?.name} />
            <InfoRow label="Date of Birth" value={userData?.dob} />
            <InfoRow label="Gender" value={userData?.gender} />
            <InfoRow label="Height" value={userData?.height} />
            <InfoRow label="Marital Status" value={userData?.maritalStatus} />
            <InfoRow label="Religion" value={userData?.religion} />
            <InfoRow label="Caste / Gotra" value={`${userData?.caste || ''} ${userData?.gotra ? '/ ' + userData.gotra : ''}`} />
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <SectionHeader icon={BookOpen} title="Education & Career" />
            <InfoRow label="Education" value={userData?.education} />
            <InfoRow label="Occupation" value={userData?.occupation} />
            <InfoRow label="Annual Income" value={userData?.annualIncome} />
            <InfoRow label="Work Location" value={userData?.city} />
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <SectionHeader icon={Users} title="Family Details" />
            <InfoRow label="Father's Name" value={userData?.fatherName} />
            <InfoRow label="Mother's Name" value={userData?.motherName} />
            <InfoRow label="Family Type" value={userData?.familyType} />
            <InfoRow label="Native Place" value={userData?.nativePlace} />
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <SectionHeader icon={Heart} title="Lifestyle" />
            <InfoRow label="Eating Habits" value={userData?.eatingHabits} />
            <InfoRow label="Drinking/Smoking" value={userData?.lifestyle} />
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <SectionHeader icon={MapPin} title="Contact Information" />
            <InfoRow label="Mobile Number" value={userData?.phone} />
            <InfoRow label="Email Address" value={userData?.email} />
            <InfoRow label="Current Residence" value={`${userData?.city || ''}, ${userData?.state || ''}`} />
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(400)} style={styles.footer}>
        <TouchableOpacity style={styles.generateButton} onPress={handleGeneratePDF}>
          <LinearGradient
            colors={['#D4AF37', '#B8860B']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Download size={20} color="#000" style={{ marginRight: 10 }} />
            <Text style={styles.buttonText}>Download PDF Bio-Data</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { padding: 5 },
  headerTitle: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 25,
    shadowColor: '#D4AF37',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  cardHeaderContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  cardHeader: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerLine: {
    height: 3,
    width: 60,
    backgroundColor: '#D4AF37',
    marginTop: 8,
  },
  section: { marginBottom: 15 },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 4,
  },
  sectionTitle: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#B8860B', 
    marginLeft: 10, 
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 10,
    paddingHorizontal: 5
  },
  infoLabel: { color: '#555', fontSize: 13, flex: 1, fontWeight: '500' },
  infoValue: { color: '#000', fontSize: 13, fontWeight: '700', flex: 1.5, textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15, borderStyle: 'dashed', borderRadius: 1 },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 40,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  generateButton: { width: '100%', height: 55, borderRadius: 12, overflow: 'hidden' },
  gradientButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});

export default GenerateBioData;