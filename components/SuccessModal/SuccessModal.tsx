import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GOLD = '#D4AF37';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const SuccessModal = ({ visible, onClose, title, message }: SuccessModalProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalBox, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="checkmark-circle" size={80} color={GOLD} />
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalSub}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OKAY</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.85)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalBox: { 
    width: '85%', 
    backgroundColor: '#1a1a1a', 
    padding: 30, 
    borderRadius: 20, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: GOLD 
  },
  modalTitle: { 
    fontSize: 22, 
    color: GOLD, 
    marginTop: 15, 
    fontWeight: 'bold',
    textAlign: 'center'
  },
  modalSub: { 
    color: 'white', 
    marginTop: 10, 
    marginBottom: 25,
    textAlign: 'center',
    opacity: 0.9 
  },
  button: { 
    backgroundColor: GOLD, 
    paddingHorizontal: 50, 
    paddingVertical: 12, 
    borderRadius: 25 
  },
  buttonText: { 
    fontWeight: 'bold', 
    color: 'black', 
    fontSize: 16 
  }
});

export default SuccessModal;