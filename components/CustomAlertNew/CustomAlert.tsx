import React from 'react';
import { 
  View, Text, StyleSheet, Modal, 
  TouchableOpacity, Pressable 
} from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { Info, CheckCircle2, AlertCircle, X } from 'lucide-react-native';

interface CustomAlertProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

const CustomAlert = ({ visible, onClose, title, message, type = 'info' }: CustomAlertProps) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 color="#4BB543" size={40} />;
      case 'error': return <AlertCircle color="#ff4444" size={40} />;
      default: return <Info color="#D4AF37" size={40} />;
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View entering={FadeIn} exiting={FadeOut} style={StyleSheet.absoluteFill}>
          <Pressable style={styles.blur} onPress={onClose} />
        </Animated.View>
        
        <Animated.View entering={ZoomIn.duration(300)} exiting={FadeOut} style={styles.alertBox}>
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <X color="#555" size={20} />
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>{getIcon()}</View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Okay</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  blur: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' },
  alertBox: { 
    width: '100%', 
    backgroundColor: '#1a1a1a', 
    borderRadius: 25, 
    padding: 25, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333'
  },
  closeIcon: { position: 'absolute', right: 15, top: 15 },
  iconContainer: { marginBottom: 15 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  message: { color: '#aaa', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 25 },
  btn: { 
    backgroundColor: '#D4AF37', 
    paddingVertical: 12, 
    paddingHorizontal: 40, 
    borderRadius: 15 
  },
  btnText: { color: '#000', fontWeight: '800', fontSize: 16 }
});

export default CustomAlert;