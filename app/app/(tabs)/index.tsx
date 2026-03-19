
import { Image } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { View, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ImageViewer from '@/components/ImageViewer';
import TypewriterText from '@/components/TypewriterText';
import LearnIda from '@/components/learnIda';

const PlaceholderImage = require('@/assets/images/gif.gif');

export default function HomeScreen() {
  const {logout} = useAuth();

  return (
    <View style={styles.container}>
      
      <LearnIda />

      {/* Wrapper to center the image and button below the header */}
      <View style={styles.content}>
        

       {/* Title right above the gif */}
  <TypewriterText 
    text="I.D.A" 
    style={styles.mainTitle} 
    delay={200} 
  />
        <View style={styles.imageContainer}>
          <ImageViewer imgSource={PlaceholderImage} />
        </View>

        {/* The login button */}
        {/* <Link href="/login" asChild> */}
        <TouchableOpacity style={styles.loginButton} activeOpacity={0.8}>
          <Text style={styles.loginButtonText}>Start Designing</Text>
        </TouchableOpacity>
        {/* </Link> */}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  //background kinda
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center', // Centers horizontally
    justifyContent: 'center', // Centers vertically in the remaining space below the header
    paddingBottom: 40, // Gives a little breathing room at the bottom
  },
  // ADDED: Styling for your new title
  mainTitle: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#491868', // Matches your login button text
    marginTop: 70,
    marginBottom: 5, // Pushes the gif down a little bit so they aren't touching
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
  },
  imageContainer: {
    // marginTop: 8,
    marginBottom: 5,
  }, 
  //Buttons
  loginButton: {
    backgroundColor: '#ede8ec', 
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30, 
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: '#491868', 
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif', 
  },
  //header 
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    width: '100%', // Ensures it spans the top
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif', 
  }
});