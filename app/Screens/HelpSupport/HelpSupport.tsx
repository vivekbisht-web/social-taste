import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  TextInput,
  Linking
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Search,
  MessageCircle,
  Mail,
  Phone,
  ChevronRight,
  ExternalLink,
  LifeBuoy,
  ShieldCheck,
  CreditCard,
  UserCircle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const FAQ_CATEGORIES = [
  { id: '1', title: 'Account & Profile', icon: UserCircle },
  { id: '2', title: 'Safety & Privacy', icon: ShieldCheck },
  { id: '3', title: 'Premium & Payments', icon: CreditCard },
  { id: '4', title: 'Matching & Chat', icon: MessageCircle },
];

const HelpSupport = () => {
  const router = useRouter();

  const handleContact = (type:any) => {
    // Apne contact details yahan add karein
    if (type === 'whatsapp') Linking.openURL('whatsapp://send?phone=+919876543210');
    if (type === 'email') Linking.openURL('mailto:support@milan.com');
    if (type === 'call') Linking.openURL('tel:+919876543210');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1a1a1a', '#000', '#000']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput 
            placeholder="How can we help you?" 
            placeholderTextColor="#666"
            style={styles.searchInput}
          />
        </View>

        {/* Quick Contact Options */}
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={() => handleContact('whatsapp')}>
            <View style={[styles.contactIconCircle, { backgroundColor: 'rgba(37,211,102,0.1)' }]}>
              <MessageCircle size={24} color="#25D366" />
            </View>
            <Text style={styles.contactText}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={() => handleContact('email')}>
            <View style={[styles.contactIconCircle, { backgroundColor: 'rgba(212,175,55,0.1)' }]}>
              <Mail size={24} color="#D4AF37" />
            </View>
            <Text style={styles.contactText}>Email Us</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={() => handleContact('call')}>
            <View style={[styles.contactIconCircle, { backgroundColor: 'rgba(0,122,255,0.1)' }]}>
              <Phone size={24} color="#007AFF" />
            </View>
            <Text style={styles.contactText}>Call Support</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Categories */}
        <Text style={styles.sectionTitle}>FAQ Categories</Text>
        <View style={styles.cardContainer}>
          {FAQ_CATEGORIES.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={item.id}>
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                  <View style={styles.menuIconContainer}>
                    <Icon size={20} color="#D4AF37" />
                  </View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <ChevronRight size={18} color="#666" />
                </TouchableOpacity>
                {index !== FAQ_CATEGORIES.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>

        {/* Useful Links */}
        <Text style={styles.sectionTitle}>Useful Links</Text>
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <ExternalLink size={16} color="#666" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <ExternalLink size={16} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <LifeBuoy size={40} color="rgba(212,175,55,0.2)" />
          <Text style={styles.footerText}>Our support team is available 24/7</Text>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderRadius: 12,
  },
  headerTitle: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { paddingBottom: 40, paddingTop: 10 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    margin: 20,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  sectionTitle: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginLeft: 25,
    marginBottom: 15,
    marginTop: 15,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginBottom: 20,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 5,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  contactIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  cardContainer: {
    marginHorizontal: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(212,175,55,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTitle: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },
  linkText: { color: '#888', fontSize: 14, flex: 1 },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: 65,
    marginRight: 15,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 20,
  },
  footerText: {
    color: '#444',
    fontSize: 12,
    marginTop: 10,
    fontWeight: '500',
  },
});

export default HelpSupport;