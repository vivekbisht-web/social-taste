import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SuccessStoryDetail = () => {
  const { storyData } = useLocalSearchParams();
  const router = useRouter();
  const story = storyData ? JSON.parse(storyData as string) : null;

  if (!story) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.imageContainer}>
          <FlatList
            data={story.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.mainImage} />
            )}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.9)']}
            style={StyleSheet.absoluteFill}
          />
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.headerRow}>
            <Text style={styles.coupleName}>{story.coupleName}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>❤️ Success Story</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Marriage Date</Text>
              <Text style={styles.infoValue}>
                {new Date(story.marriageDate).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Together Since</Text>
              <Text style={styles.infoValue}>{story.yearsTogether}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={18} color="#D4AF37" />
            <Text style={styles.locationText}>{story.location}</Text>
          </View>

          <View style={styles.storySection}>
            <Text style={styles.sectionTitle}>Our Journey</Text>
            <Text style={styles.storyText}>{story.story}</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Posted on {new Date(story.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  imageContainer: { width: width, height: height * 0.55 },
  mainImage: { width: width, height: height * 0.55, resizeMode: 'cover' },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#000',
    marginTop: -30,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  coupleName: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: '900',
    flex: 1,
    marginRight: 10,
  },
  badge: {
    backgroundColor: 'rgba(212,175,55,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  badgeText: { color: '#D4AF37', fontSize: 10, fontWeight: 'bold' },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  infoBox: { flex: 1 },
  infoLabel: { color: '#777', fontSize: 11, marginBottom: 5, textTransform: 'uppercase' },
  infoValue: { color: '#fff', fontSize: 14, fontWeight: '700' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  locationText: { color: '#aaa', marginLeft: 6, fontSize: 15 },
  storySection: { marginBottom: 30 },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  storyText: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'justify',
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    alignItems: 'center',
    marginBottom: 40,
  },
  footerText: { color: '#555', fontSize: 12 },
});

export default SuccessStoryDetail;