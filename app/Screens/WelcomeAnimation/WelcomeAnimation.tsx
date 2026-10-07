import React, { useEffect } from 'react';
import { View, Modal, StyleSheet, Text, Dimensions, TouchableOpacity, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  interpolate, 
  Extrapolate,
  runOnJS,
  FadeInUp,
  FadeIn
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

const WelcomeAnimation: React.FC<Props> = ({ isVisible, onClose }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      progress.value = withSpring(1, { damping: 18, stiffness: 120 });
    }
  }, [isVisible]);

  const handleClose = () => {
    progress.value = withTiming(0, { duration: 400 }, (isFinished) => {
      if (isFinished) {
        runOnJS(onClose)();
      }
    });
  };

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
    };
  });

  const heartStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.5, 0.8],
      [1, 15, 1]
    );
    const opacity = interpolate(
      progress.value,
      [0, 0.4, 0.7],
      [0, 1, 0],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });
  
  const cardContainerStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 1],
      [0.5, 1],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0, 0, 1]
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Modal visible={isVisible} transparent>
      <AnimatedPressable style={[styles.overlay, overlayStyle]} onPress={handleClose}>
        
        <Animated.Text style={[styles.heartIcon, heartStyle]}>❤️</Animated.Text>
        
        <Animated.View style={[styles.card, cardContainerStyle]}>
          <Pressable onStartShouldSetResponder={() => true}>
            <LinearGradient
              colors={['#2E1A1A', '#1a1a1a', '#000']}
              style={styles.gradient}
            >
              <Animated.Image 
                entering={FadeInUp.delay(400).duration(800)}
                source={require('.././../../assets/images/tenor.gif')} 
                style={styles.gif}
              />
              
              <Animated.Text entering={FadeInUp.delay(500).duration(800)} style={styles.title}>
                Milan Mein Swagat Hai!
              </Animated.Text>
              
              <Animated.Text entering={FadeIn.delay(800).duration(1000)} style={styles.heart}>❤️</Animated.Text>
              
              <Animated.Text entering={FadeInUp.delay(700).duration(800)} style={styles.subtitle}>
                Aapka jeevansathi aapka intezar kar raha hai.
              </Animated.Text>
              
              <Animated.View entering={FadeInUp.delay(900).duration(800)}>
                <TouchableOpacity onPress={handleClose} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#D4AF37', '#B8860B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>Continue</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </AnimatedPressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 50,
    position: 'absolute',
  },
  card: {
    width: width * 0.9,
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },
  gradient: {
    padding: 25,
    alignItems: 'center',
  },
  gif: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 30,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: 'System',
  },
  heart: {
    fontSize: 28,
    marginTop: 8,
  },
  subtitle: {
    color: '#c7c7c7',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
    fontWeight: '300',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  }
});

export default WelcomeAnimation;