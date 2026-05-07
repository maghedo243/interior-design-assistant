import React from 'react';
import { 
  View, 
  Platform, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ImageBackground 
} from 'react-native';
import { useRouter } from 'expo-router'; 
import { useAuth } from '@/context/AuthContext';
import ImageViewer from '@/components/ImageViewer';
import LearnIda from '@/components/LearnIda';

const BackgroundImg = require('@/assets/images/BackgroundHome.ida.png');
const PlaceholderImage = require('@/assets/images/gifHelp.gif');

export default function HomeScreen() {
  const { logout } = useAuth();
  const router = useRouter(); 

  const handlePress = () => {
    // This looks for app/login.tsx
    router.push('/login'); 
  };

  return (
    <ImageBackground 
      source={BackgroundImg} 
      style={styles.container} 
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        
        <LearnIda />

        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <ImageViewer imgSource={PlaceholderImage} />
          </View> 

          <TouchableOpacity 
            style={styles.loginButton} 
            activeOpacity={0.8}
            onPress={handlePress} 
          >
            <Text style={styles.loginButtonText}>Start Designing</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 25,
    paddingTop: 50,
    alignItems: 'flex-start', // Keeps LearnIda on the left
    
  },
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  imageContainer: {
    marginBottom: 30, 
  }, 
  loginButton: {
    backgroundColor: '#7e1c2e', 
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30, 
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, 
    shadowColor: '#ac76a4', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: '#ac76a4', 
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif', 
  }
});