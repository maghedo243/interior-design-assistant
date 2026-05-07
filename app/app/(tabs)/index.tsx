import React from 'react';
import { 
  View, 
  Platform, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ImageBackground,
  SafeAreaView 
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import ImageViewer from '@/components/ImageViewer';
import { useRouter } from 'expo-router';
import LearnIda from '@/components/LearnIda';
import LogoutButton from '@/components/LogoutButton';

const BackgroundImg = require('@/assets/images/BackgroundHome.ida.png');
const PlaceholderImage = require('@/assets/images/gifHelp.gif');

export default function HomeScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <ImageBackground 
      source={BackgroundImg} 
      style={styles.container} 
      resizeMode="cover"
    >
      
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          
          {/* Header container to position the LearnIda pill top-left */}
          <View style={styles.header}>
            <LearnIda />
            
          </View>

          <View style={styles.content}>
            {/* Original Logo/GIF section */}
            <View style={styles.imageContainer}>
              <ImageViewer imgSource={PlaceholderImage} />
            </View> 

            
            <TouchableOpacity 
              style={styles.loginButton} 
              activeOpacity={0.8}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginButtonText}>Start Designing</Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 50,
    alignItems: 'flex-start', // Keeps LearnIda on the left
    
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60, // Balances visual weight with the new top button
  },
  imageContainer: {
    marginBottom: 30, // Space between the GIF and the button
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