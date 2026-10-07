import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getRecentJoins } from '../../../Services/api/recentJoined';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 50) / 2;

const RecentJoins = () => {
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const data = await getRecentJoins();
      setProfiles(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePress = (profile: any) => {
    router.push({
      pathname: '/Screens/ProfileDetail/ProfileDetail',
      params: { profileData: JSON.stringify(profile) }
    });
  };

  const renderProfile = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleProfilePress(item)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.primaryPhoto }} style={styles.image} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.overlay}>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓</Text>
        </View>
        <Text style={styles.name}>{item.name}, {item.maritalStatus}</Text>
        <Text style={styles.subText}>{item.occupation}</Text>
        <Text style={styles.location}>{item.city}, {item.state}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1a1a1a', '#000']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recently Joined</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      ) : (
        <FlatList
          data={profiles}
          renderItem={renderProfile}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  headerTitle: { color: '#D4AF37', fontSize: 20, fontWeight: '900' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  listContent: { paddingHorizontal: 15, paddingBottom: 40 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    width: COLUMN_WIDTH,
    height: 250,
    margin: 5,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  name: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  subText: { color: '#D4AF37', fontSize: 10, marginTop: 2, fontWeight: '600' },
  location: { color: '#aaa', fontSize: 10, marginTop: 2 },
  verifiedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#D4AF37',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
});

export default RecentJoins;