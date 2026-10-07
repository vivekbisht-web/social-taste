import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay 
} from 'react-native-reanimated';
import { Heart, CheckCircle2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

const SuccessModal = ({ visible, onClose, title = "Success!", message }: SuccessModalProps) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
      opacity.value = withSpring(1);
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [visible]);

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, animatedHeartStyle]}>
          <View style={styles.iconCircle}>
             <Heart size={50} color="#D4AF37" fill="#D4AF37" />
             <Animated.View style={styles.checkBadge}>
                <CheckCircle2 size={24} color="#fff" fill="#22C55E" />
             </Animated.View>
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message || "Interest sent successfully to this profile."}</Text>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Great!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: width * 0.8, backgroundColor: '#1a1a1a', borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#D4AF37' },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(212,175,55,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  checkBadge: { position: 'absolute', bottom: 5, right: 5 },
  title: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  message: { color: '#ccc', fontSize: 14, textAlign: 'center', marginBottom: 25, lineHeight: 20 },
  closeButton: { backgroundColor: '#D4AF37', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 25 },
  closeButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});

export default SuccessModal;