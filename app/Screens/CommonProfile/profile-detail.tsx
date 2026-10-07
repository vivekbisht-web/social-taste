import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, Dimensions,
  TouchableOpacity, StatusBar, Modal, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, Pressable
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChevronLeft, MapPin, Briefcase, 
  Heart, User, Flag, Camera, Info, X,
  Home, Users, Utensils
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { reportSpam } from '../../../Services/api/spam';
import CustomAlert from '../../../components/CustomAlertNew/CustomAlert';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.55;

const ProfileDetailScreen = () => {
  const router = useRouter();
  const { profileData } = useLocalSearchParams();
  const user = profileData ? JSON.parse(profileData as string) : {};

  const [modalVisible, setModalVisible] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'error'
  });

  const calculateAge = (dobString: string) => {
    if (!dobString) return "";
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const showAlert = (title: string, message: string, type: any) => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const handleReportSubmit = async () => {
    if (!reason.trim()) {
      showAlert("Required", "Please type a reason to report this profile.", "info");
      return;
    }

    const payload = {
      targetId: user.id || user._id,
      reason: reason.trim()
    };

    setLoading(true);
    try {
      const response: any = await reportSpam(payload);
      setModalVisible(false);
      setReason('');
      if (response.success === false) {
        showAlert("Note", response.message, "info");
      } else {
        showAlert("Success", "Report submitted successfully.", "success");
      }
    } catch (error: any) {
      setModalVisible(false);
      const errorMsg = error.response?.data?.message || "Something went wrong.";
      showAlert("Already Reported", errorMsg, "info");
    } finally {
      setLoading(false);
    }
  };

  const InfoSection = ({ title, icon: Icon, children, delay = 0 }: any) => (
    <Animated.View entering={FadeInDown.delay(delay)} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon size={18} color="#D4AF37" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </Animated.View>
  );

  const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'Not specified'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <View style={styles.fixedHeader}>
        <Image source={{ uri: user.primaryPhoto }} style={styles.mainImage} />
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,1)']}
          style={styles.imageOverlay}
        />
        
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>

          <Animated.View entering={FadeInRight.delay(400)}>
            <TouchableOpacity 
              style={[styles.navButton, styles.reportBtn]} 
              onPress={() => setModalVisible(true)}
            >
              <Flag color="#ff4444" size={20} />
              <Text style={styles.reportText}>Report</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        <View style={styles.headerInfo}>
          <Animated.Text entering={FadeInDown.delay(200)} style={styles.nameText}>
            {user.name}{user.dob ? `, ${calculateAge(user.dob)}` : ''}
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(300)} style={styles.locationContainer}>
            <MapPin size={16} color="#D4AF37" /> 
            <Text style={styles.locationText}>{user.city}, {user.state}</Text>
          </Animated.View>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentCard}>
          <InfoSection title="About" icon={User} delay={400}>
            <Text style={styles.bioText}>{user.bio?.trim() || "No bio added yet."}</Text>
          </InfoSection>

          <InfoSection title="Basic Details" icon={Heart} delay={500}>
            <View style={styles.grid}>
              <DetailItem label="Religion" value={user.religion} />
              <DetailItem label="Caste" value={user.caste} />
              <DetailItem label="Gotra" value={user.gotra} />
              <DetailItem label="Mother Tongue" value={user.motherTongue} />
              <DetailItem label="Marital Status" value={user.maritalStatus} />
              <DetailItem label="Height" value={user.height} />
            </View>
          </InfoSection>

          <InfoSection title="Lifestyle" icon={Utensils} delay={550}>
            <View style={styles.grid}>
              <DetailItem label="Eating Habits" value={user.eatingHabits} />
              <DetailItem label="Smoking" value={user.habits} />
              <DetailItem label="Body Type" value={user.bodyType} />
            </View>
          </InfoSection>

          <InfoSection title="Professional" icon={Briefcase} delay={600}>
            <View style={styles.grid}>
              <DetailItem label="Education" value={user.education} />
              <DetailItem label="College" value={user.college} />
              <DetailItem label="Occupation" value={user.occupation} />
              <DetailItem label="Company" value={user.company} />
              <DetailItem label="Annual Income" value={user.annualIncome} />
            </View>
          </InfoSection>

          <InfoSection title="Family" icon={Home} delay={650}>
            <View style={styles.grid}>
              <DetailItem label="Family Type" value={user.familyType} />
              <DetailItem label="Parents Job" value={user.parentsJob} />
              <DetailItem label="Siblings" value={user.siblings} />
            </View>
          </InfoSection>

          <InfoSection title="Partner Preferences" icon={Users} delay={700}>
            <View style={styles.grid}>
              <DetailItem label="Age Preference" value={user.partnerAge} />
              <DetailItem label="Religion" value={user.partnerReligion} />
              <DetailItem label="Education" value={user.partnerEdu} />
              <DetailItem label="Location" value={user.partnerLoc} />
            </View>
          </InfoSection>

          {user.additionalPhotos && user.additionalPhotos.length > 0 && (
            <Animated.View entering={FadeInDown.delay(750)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Camera size={18} color="#D4AF37" />
                <Text style={styles.sectionTitle}>Gallery</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
                {user.additionalPhotos.map((img: string, i: number) => (
                  <Image key={i} source={{ uri: img }} style={styles.additionalPhoto} />
                ))}
              </ScrollView>
            </Animated.View>
          )}

          <TouchableOpacity style={styles.bottomReportArea} onPress={() => setModalVisible(true)}>
             <Info size={14} color="#555" />
             <Text style={styles.bottomReportText}>Report this profile if it seems suspicious</Text>
          </TouchableOpacity>
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>

      <Modal transparent visible={modalVisible} animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeIn} exiting={FadeOut} style={StyleSheet.absoluteFill}>
             <Pressable style={styles.modalBlur} onPress={() => setModalVisible(false)} />
          </Animated.View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardContainer}>
            <Animated.View entering={ZoomIn} exiting={FadeOut} style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Report User</Text>
                  <Text style={styles.modalSubtitle}>Help us keep the community safe</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <X color="#fff" size={20} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.reasonInput}
                placeholder="Tell us why you're reporting this profile..."
                placeholderTextColor="#666"
                multiline
                value={reason}
                onChangeText={setReason}
                autoFocus
              />
              <TouchableOpacity 
                style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
                onPress={handleReportSubmit}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#000" /> : (
                  <>
                    <Flag color="#000" size={18} />
                    <Text style={styles.submitBtnText}>Submit Report</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  fixedHeader: { 
    height: HEADER_HEIGHT, 
    width: width, 
    position: 'absolute', 
    top: 0, 
    zIndex: 0 
  },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  topNav: { 
    position: 'absolute', 
    top: 60, 
    left: 20, 
    right: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    zIndex: 10 
  },
  navButton: { 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    borderRadius: 25, 
    width: 45, 
    height: 45, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  reportBtn: { 
    width: 'auto', 
    paddingHorizontal: 15, 
    flexDirection: 'row', 
    gap: 6, 
    borderColor: 'rgba(255,68,68,0.4)', 
    borderWidth: 1 
  },
  reportText: { color: '#ff4444', fontWeight: 'bold', fontSize: 13 },
  headerInfo: { position: 'absolute', bottom: 60, left: 20, right: 20 },
  nameText: { color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: 0.5 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 5 },
  locationText: { color: '#D4AF37', fontSize: 16, fontWeight: '500' },
  scrollView: { flex: 1, marginTop: HEADER_HEIGHT - 40 },
  scrollContent: { flexGrow: 1 },
  contentCard: { 
    padding: 20, 
    backgroundColor: '#000', 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    minHeight: height * 0.6 
  },
  section: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  sectionTitle: { color: '#D4AF37', fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  sectionContent: { backgroundColor: '#0A0A0A', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#1A1A1A' },
  bioText: { color: '#aaa', lineHeight: 24, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  detailItem: { width: '48%', marginBottom: 15 },
  detailLabel: { color: '#555', fontSize: 10, marginBottom: 4, textTransform: 'uppercase' },
  detailValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  photoList: { marginTop: 5 },
  additionalPhoto: { width: 140, height: 190, borderRadius: 15, marginRight: 12, backgroundColor: '#111' },
  bottomReportArea: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 20, opacity: 0.7 },
  bottomReportText: { color: '#555', fontSize: 13, textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBlur: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)' },
  keyboardContainer: { width: '90%', alignItems: 'center' },
  modalContent: { 
    width: '100%', 
    backgroundColor: '#111', 
    borderRadius: 30, 
    padding: 25, 
    borderWidth: 1, 
    borderColor: '#222' 
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  modalSubtitle: { color: '#666', fontSize: 14, marginTop: 4 },
  closeBtn: { backgroundColor: '#222', padding: 8, borderRadius: 20 },
  reasonInput: { 
    backgroundColor: '#000', 
    color: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    height: 150, 
    textAlignVertical: 'top',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20
  },
  submitBtn: { 
    backgroundColor: '#D4AF37', 
    paddingVertical: 18, 
    borderRadius: 20, 
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10
  },
  submitBtnText: { color: '#000', fontSize: 17, fontWeight: '800' }
});

export default ProfileDetailScreen;