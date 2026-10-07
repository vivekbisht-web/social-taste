import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Dimensions } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown, 
  ZoomInEasyUp, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
  title?: string;
}

const GOLD = '#D4AF37';
const { width } = Dimensions.get('window');

// Custom Button Component for Scale Effect on Press
const AnimatedTouchableOpacity = ({ onPress, children, style, delay = 0 }: any) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => (scale.value = withSpring(0.92));
  const onPressOut = () => (scale.value = withSpring(1));

  return (
    <Animated.View 
      entering={ZoomInEasyUp.delay(delay).springify().damping(12)} 
      style={[animatedStyle, style]}
    >
      <Pressable 
        onPressIn={onPressIn} 
        onPressOut={onPressOut} 
        onPress={onPress}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

const ImagePickerModal = ({ visible, onClose, onSelectCamera, onSelectGallery, title = "Select Source" }: ImagePickerModalProps) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop Animation */}
        <Animated.View 
          entering={FadeIn.duration(300)} 
          exiting={FadeOut.duration(300)} 
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.85)' }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        
        {/* Bottom Sheet Container */}
        <Animated.View 
          entering={SlideInDown.springify().damping(18).stiffness(100)} 
          exiting={SlideOutDown.duration(250)}
          style={styles.container}
        >
          {/* Top Indicator / Handle */}
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
              <X size={20} color={GOLD} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsRow}>
            {/* Camera Option with Staggered Animation */}
            <AnimatedTouchableOpacity 
              onPress={onSelectCamera} 
              style={styles.optionBtn}
              delay={200} // Pehle ye aayega
            >
              <View style={styles.iconCircle}>
                <Camera size={32} color={GOLD} strokeWidth={1.5} />
              </View>
              <Text style={styles.optionLabel}>Camera</Text>
            </AnimatedTouchableOpacity>

            {/* Gallery Option with Staggered Animation */}
            <AnimatedTouchableOpacity 
              onPress={onSelectGallery} 
              style={styles.optionBtn}
              delay={350} // Phir ye aayega
            >
              <View style={styles.iconCircle}>
                <ImageIcon size={32} color={GOLD} strokeWidth={1.5} />
              </View>
              <Text style={styles.optionLabel}>Gallery</Text>
            </AnimatedTouchableOpacity>
          </View>

          {/* Optional: Cancel Button at Bottom */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 25,
    paddingBottom: 40,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: 'rgba(212,175,55,0.4)',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(212,175,55,0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: GOLD,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  closeBtn: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    padding: 10,
    borderRadius: 15,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionBtn: {
    alignItems: 'center',
    width: width * 0.35,
  },
  iconCircle: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: 'rgba(212,175,55,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(212,175,55,0.3)',
    // Glow effect for icons
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  optionLabel: {
    color: '#E0E0E0',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cancelButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  cancelText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  }
});

export default ImagePickerModal;