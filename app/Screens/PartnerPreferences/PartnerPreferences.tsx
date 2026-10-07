import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  StatusBar, 
  Modal, 
  FlatList,
  Dimensions
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Users, 
  BookOpen, 
  MapPin, 
  ChevronRight, 
  Check, 
  Calendar, 
  CircleDollarSign 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getMatchFilters, applyMatchFilters, getFilteredResults } from '../../../Services/api/match';
import SuccessModal from '../../../components/SuccessIntesrtModal/SuccessModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FilterData {
  castes: string[];
  religions: string[];
  cities: string[];
}

type ModalType = 'religions' | 'castes' | 'cities' | 'minAge' | 'maxAge' | 'minIncome' | '';

const PartnerPreferences: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successVisible, setSuccessVisible] = useState<boolean>(false);
  
  const [filters, setFilters] = useState<FilterData>({ castes: [], religions: [], cities: [] });

  const [selectedCaste, setSelectedCaste] = useState<string>('');
  const [selectedReligion, setSelectedReligion] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [minAge, setMinAge] = useState<string>('21');
  const [maxAge, setMaxAge] = useState<string>('35');
  const [minIncome, setMinIncome] = useState<string>('5');

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>('');
  const [modalData, setModalData] = useState<string[]>([]);

  const ageData = Array.from({ length: 53 }, (_, i) => (i + 18).toString());
  const incomeData = ['0', '3', '6', '9', '12', '15', '20', '30', '50', '100'];

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const data: FilterData = await getMatchFilters();
      setFilters(data);
      if (data.religions.length > 0) setSelectedReligion(data.religions[0]);
      if (data.castes.length > 0) setSelectedCaste(data.castes[0]);
      if (data.cities.length > 0) setSelectedCity(data.cities[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const payload = {
        religion: selectedReligion,
        caste: selectedCaste,
        city: selectedCity,
        minAge,
        maxAge,
        minIncome
      };

      const response = await applyMatchFilters(payload);
      
      if (response.success) {
        console.log("Filter successfully applied API Status: Success");
        const results = await getFilteredResults();
        console.log("Filtered Profiles Count:", results.profiles?.length);
        setSuccessVisible(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const openSelection = (type: ModalType) => {
    let data: string[] = [];
    if (type === 'religions') data = filters.religions;
    else if (type === 'castes') data = filters.castes;
    else if (type === 'cities') data = filters.cities;
    else if (type === 'minAge' || type === 'maxAge') data = ageData;
    else if (type === 'minIncome') data = incomeData;

    setModalType(type);
    setModalData(data);
    setModalVisible(true);
  };

  const handleSelect = (item: string) => {
    switch (modalType) {
      case 'religions': setSelectedReligion(item); break;
      case 'castes': setSelectedCaste(item); break;
      case 'cities': setSelectedCity(item); break;
      case 'minAge': setMinAge(item); break;
      case 'maxAge': setMaxAge(item); break;
      case 'minIncome': setMinIncome(item); break;
    }
    setModalVisible(false);
  };

  const isItemSelected = (item: string) => {
    if (modalType === 'religions') return item === selectedReligion;
    if (modalType === 'castes') return item === selectedCaste;
    if (modalType === 'cities') return item === selectedCity;
    if (modalType === 'minAge') return item === minAge;
    if (modalType === 'maxAge') return item === maxAge;
    if (modalType === 'minIncome') return item === minIncome;
    return false;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1a1a1a', '#000', '#000']} style={StyleSheet.absoluteFill} />

      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Preferences</Text>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>Socio-Religious</Text>
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => openSelection('religions')}>
            <View style={styles.menuIconContainer}><BookOpen size={20} color="#D4AF37" /></View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Religion</Text>
              <Text style={styles.menuSub}>{selectedReligion || 'Select Religion'}</Text>
            </View>
            <ChevronRight size={18} color="#666" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} onPress={() => openSelection('castes')}>
            <View style={styles.menuIconContainer}><Users size={20} color="#D4AF37" /></View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Caste</Text>
              <Text style={styles.menuSub}>{selectedCaste || 'Select Caste'}</Text>
            </View>
            <ChevronRight size={18} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Age Range</Text>
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => openSelection('minAge')}>
            <View style={styles.menuIconContainer}><Calendar size={20} color="#D4AF37" /></View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Minimum Age</Text>
              <Text style={styles.menuSub}>{minAge} Years</Text>
            </View>
            <ChevronRight size={18} color="#666" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} onPress={() => openSelection('maxAge')}>
            <View style={styles.menuIconContainer}><Calendar size={20} color="#D4AF37" /></View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Maximum Age</Text>
              <Text style={styles.menuSub}>{maxAge} Years</Text>
            </View>
            <ChevronRight size={18} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Location & Financial</Text>
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => openSelection('cities')}>
            <View style={styles.menuIconContainer}><MapPin size={20} color="#D4AF37" /></View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Preferred City</Text>
              <Text style={styles.menuSub}>{selectedCity || 'Select City'}</Text>
            </View>
            <ChevronRight size={18} color="#666" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} onPress={() => openSelection('minIncome')}>
            <View style={styles.menuIconContainer}><CircleDollarSign size={20} color="#D4AF37" /></View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Min Annual Income</Text>
              <Text style={styles.menuSub}>{minIncome} LPA & Above</Text>
            </View>
            <ChevronRight size={18} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSavePreferences}
          disabled={saving}
        >
          <LinearGradient colors={['#D4AF37', '#B8860B']} style={styles.gradientButton}>
            {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveButtonText}>Save Preferences</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Option</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={modalData}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const selected = isItemSelected(item);
                return (
                  <TouchableOpacity 
                    style={[styles.modalItem, selected && styles.modalItemSelected]} 
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={[styles.modalItemText, selected && {color: '#D4AF37', fontWeight: 'bold'}]}>
                        {item} {modalType === 'minIncome' ? 'LPA' : (modalType.includes('Age') ? 'Years' : '')}
                    </Text>
                    {selected && <Check size={20} color="#D4AF37" />}
                  </TouchableOpacity>
                );
              }}
            />
          </Animated.View>
        </View>
      </Modal>

      <SuccessModal 
        visible={successVisible} 
        onClose={() => setSuccessVisible(false)}
        title="Preferences Saved"
        message="Your partner preferences have been updated successfully."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#1a1a1a', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, borderBottomWidth: 1, borderColor: 'rgba(212,175,55,0.1)' },
  backButton: { padding: 8, marginRight: 10, backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: 12 },
  headerTitle: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { paddingBottom: 40, paddingTop: 10 },
  sectionTitle: { color: '#888', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 25, marginBottom: 10, marginTop: 25 },
  cardContainer: { marginHorizontal: 20, backgroundColor: '#1a1a1a', borderRadius: 24, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  menuIconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(212,175,55,0.08)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuTextContainer: { flex: 1 },
  menuTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  menuSub: { color: '#D4AF37', fontSize: 13, marginTop: 3, fontWeight: '500' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 70 },
  saveButton: { marginHorizontal: 20, marginTop: 40, borderRadius: 18, overflow: 'hidden', elevation: 5 },
  gradientButton: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#161616', borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: SCREEN_HEIGHT * 0.7, borderTopWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeBtn: { backgroundColor: 'rgba(212,175,55,0.1)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  closeBtnText: { color: '#D4AF37', fontWeight: 'bold' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 25, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.02)' },
  modalItemSelected: { backgroundColor: 'rgba(212,175,55,0.05)' },
  modalItemText: { color: '#aaa', fontSize: 16 }
});

export default PartnerPreferences;