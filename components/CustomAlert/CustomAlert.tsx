import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  FadeIn, 
  FadeOut,
  ZoomIn,
  SlideInUp,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { AlertTriangle, LogOut } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Yes", 
  cancelText = "No" 
}: CustomAlertProps) => {
  
  const iconScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Icon pulse animation after a small delay
      iconScale.value = withDelay(400, withSequence(
        withSpring(1.5),
        withSpring(1)
      ));
    } else {
      iconScale.value = 0;
    }
  }, [visible]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        {/* Animated Background Overlay */}
        <Animated.View 
          entering={FadeIn.duration(400)} 
          exiting={FadeOut.duration(300)} 
          style={styles.backdrop}
        >
          <Pressable style={{ flex: 1 }} onPress={onCancel} />
        </Animated.View>

        {/* Alert Container */}
        <Animated.View 
          entering={ZoomIn.springify().damping(15).stiffness(100)}
          exiting={FadeOut.duration(200)}
          style={styles.alertBox}
        >
          {/* Top Decorative Line */}
          <View style={styles.topBar} />

          {/* Animated Icon */}
          <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
            <View style={styles.iconCircle}>
               <AlertTriangle size={30} color="#D4AF37" />
            </View>
          </Animated.View>
          
          <Animated.View entering={FadeIn.delay(200)}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </Animated.View>

          {/* Buttons with staggered entrance */}
          <Animated.View entering={FadeIn.delay(400)} style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.confirmBtn} 
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <LinearGradient 
                colors={['#D4AF37', '#B8860B']} 
                style={styles.gradientBtn}
              >
                <Text style={styles.confirmBtnText}>{confirmText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Simplified LinearGradient Wrapper (In case you don't use expo-linear-gradient here)
const LinearGradient = ({ colors, children, style }: any) => (
  <View style={[style, { backgroundColor: colors[0] }]}>{children}</View>
);

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  backdrop: { 
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)' 
  },
  alertBox: {
    width: width * 0.85,
    backgroundColor: '#121212',
    borderRadius: 30,
    paddingTop: 40,
    paddingBottom: 25,
    paddingHorizontal: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    overflow: 'hidden',
    elevation: 25,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 4,
    backgroundColor: '#D4AF37',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(212,175,55,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  title: { 
    color: '#D4AF37', 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 12, 
    textAlign: 'center',
    letterSpacing: 0.5
  },
  message: { 
    color: '#A0A0A0', 
    fontSize: 15, 
    textAlign: 'center', 
    marginBottom: 30, 
    lineHeight: 22,
    paddingHorizontal: 10
  },
  buttonContainer: { 
    flexDirection: 'row', 
    width: '100%', 
    gap: 15
  },
  cancelBtn: { 
    flex: 1, 
    height: 55,
    borderRadius: 15, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333'
  },
  confirmBtn: { 
    flex: 1, 
    height: 55,
    borderRadius: 15, 
    overflow: 'hidden'
  },
  gradientBtn: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  confirmBtnText: { 
    color: '#000', 
    fontSize: 16, 
    fontWeight: 'bold',
    letterSpacing: 1
  },
});

export default CustomAlert;