import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X, MapPin, Briefcase, Heart, CheckCircle2, XCircle, HeartOff } from 'lucide-react-native';
import Animated, { 
  FadeInUp, 
  Layout, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence 
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import CustomBottomTab from '../CustomBottomTab/CustomBottomTab';
import { getReceivedInterests, handleInterest } from '../../../Services/api/interest';

const { width } = Dimensions.get('window');
const CARD_HEIGHT = 480;

// --- RE-USABLE SUCCESS MODAL ---
interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'accept' | 'reject';
  title?: string;
  message?: string;
}

const SuccessModal = ({ visible, onClose, type, title, message }: SuccessModalProps) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const isAccept = type === 'accept';
  const mainColor = isAccept ? '#22C55E' : '#EF4444'; 

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(withSpring(1.2), withSpring(1));
      opacity.value = withSpring(1);
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={modalStyles.overlay}>
        <Animated.View style={[modalStyles.modalContainer, animatedStyle, { borderColor: mainColor }]}>
          <View style={[modalStyles.iconCircle, { backgroundColor: `${mainColor}20` }]}>
             {isAccept ? (
               <Heart size={50} color={mainColor} fill={mainColor} />
             ) : (
               <HeartOff size={50} color={mainColor} fill={mainColor} />
             )}
             <View style={modalStyles.checkBadge}>
                {isAccept ? (
                  <CheckCircle2 size={24} color="#fff" fill={mainColor} />
                ) : (
                  <XCircle size={24} color="#fff" fill={mainColor} />
                )}
             </View>
          </View>
          
          <Text style={[modalStyles.title, { color: mainColor }]}>
            {title || (isAccept ? "Accepted!" : "Rejected")}
          </Text>
          <Text style={modalStyles.message}>
            {message || (isAccept ? "You have accepted this interest successfully." : "The interest has been rejected and removed.")}
          </Text>
          
          <TouchableOpacity 
            style={[modalStyles.closeButton, { backgroundColor: mainColor }]} 
            onPress={onClose}
          >
            <Text style={modalStyles.closeButtonText}>{isAccept ? "Great!" : "Close"}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// --- IMAGE SLIDER COMPONENT ---
const ImageSlider = ({ images }: { images: string[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [activeIndex]);

  const startAutoSlide = () => {
    stopAutoSlide();
    timerRef.current = setInterval(() => {
      const nextIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3000);
  };

  const stopAutoSlide = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <View style={styles.sliderContainer}>
      <FlatList
        ref={flatListRef}
        data={images}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.sliderImage} />
        )}
      />
      <View style={styles.pagination}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === activeIndex ? '#D4AF37' : 'rgba(255,255,255,0.5)' },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

// --- MAIN INTERESTS SCREEN ---
const InterestsScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Interests');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{type: 'accept' | 'reject', title: string, message: string}>({
    type: 'accept',
    title: '',
    message: ''
  });

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    try {
      setLoading(true);
      const response = await getReceivedInterests();
      setRequests(response || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch interests');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleAction = async (id: string, type: 'accept' | 'reject') => {
    try {
      const response = await handleInterest({
        targetId: id,
        action: type
      });

      console.log(`API Success (${type}):`, response);

      // Show Modal Configuration
      setModalConfig({
        type: type,
        title: type === 'accept' ? 'Interest Accepted!' : 'Interest Declined',
        message: type === 'accept' 
          ? 'Great! You can now view more details of this profile.' 
          : 'The interest request has been successfully removed.'
      });
      setModalVisible(true);

      // Remove item from list
      setRequests((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error(`API Error (${type}):`, error);
      Alert.alert('Error', `Could not ${type} interest`);
    }
  };

  const navigateToDetail = (item: any) => {
    router.push({
      pathname: '/Screens/CommonProfile/profile-detail',
      params: { profileData: JSON.stringify(item) }
    });
  };

  const renderRequestItem = ({ item, index }: any) => {
    const allImages = [item.primaryPhoto, ...(item.additionalPhotos || [])];

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 100).duration(500)}
        layout={Layout.springify()}
        style={styles.cardContainer}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigateToDetail(item)} style={styles.card}>
          <ImageSlider images={allImages} />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
            style={styles.gradientOverlay}
          />

          <View style={styles.infoOverlay}>
            <View style={styles.topInfo}>
              <Text style={styles.nameText}>
                {item.name}, {calculateAge(item.dob)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Briefcase size={14} color="#D4AF37" />
              <Text style={styles.detailText}>{item.occupation || 'Professional'}</Text>
            </View>

            <View style={styles.detailRow}>
              <MapPin size={14} color="#D4AF37" />
              <Text style={styles.detailText}>{item.city}, {item.state}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.declineBtn]} 
              onPress={() => handleAction(item._id, 'reject')}
            >
              <X size={24} color="#fff" />
              <Text style={styles.btnText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.approveBtn]} 
              onPress={() => handleAction(item._id, 'accept')}
            >
              <Check size={24} color="#fff" />
              <Text style={styles.btnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0f0f0f', '#000']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Interests Received</Text>
        <View style={styles.badgeContainer}>
           <Text style={styles.headerSub}>{requests.length} New</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No new interests found</Text>
            </View>
          }
        />
      )}

      {/* Re-usable Modal */}
      <SuccessModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
      />

      <CustomBottomTab activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
};

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: width * 0.8, backgroundColor: '#1a1a1a', borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1.5 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  checkBadge: { position: 'absolute', bottom: 5, right: 5 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  message: { color: '#ccc', fontSize: 14, textAlign: 'center', marginBottom: 25, lineHeight: 20 },
  closeButton: { paddingHorizontal: 40, paddingVertical: 12, borderRadius: 25 },
  closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  headerTitle: { color: '#D4AF37', fontSize: 26, fontWeight: 'bold' },
  headerSub: { color: '#D4AF37', fontSize: 12, fontWeight: '600' },
  badgeContainer: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)'
  },
  listContent: { padding: 15, paddingBottom: 120 },
  cardContainer: {
    marginBottom: 25,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  card: { height: CARD_HEIGHT, width: '100%', position: 'relative' },
  sliderContainer: { width: '100%', height: '100%' },
  sliderImage: { width: width - 30, height: CARD_HEIGHT, resizeMode: 'cover' },
  pagination: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
  },
  topInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  nameText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  detailText: { color: '#ddd', fontSize: 14 },
  actionRow: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    width: '100%',
    height: 70,
  },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  declineBtn: { backgroundColor: 'rgba(255,68,68,0.85)' },
  approveBtn: { backgroundColor: '#4CAF50' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#666', fontSize: 16 }
});

export default InterestsScreen;