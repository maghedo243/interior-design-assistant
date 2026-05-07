import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import LearnIda from '@/components/LearnIda';


const BackgroundImg = require('@/assets/images/BackgroundHome.ida.png');
const StickyNotesImg = require('@/assets/images/dashes.png'); 


export default function DashboardScreen() {
  const router = useRouter();

  return (
    <ImageBackground 
      source={BackgroundImg} 
      style={styles.container} 
      resizeMode="cover"
    >
        {/* Header container to position the LearnIda pill top-left */}
                  <View style={styles.header2}>
                    <LearnIda />
                    
                  </View>
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.header}>
          <Text style={styles.headerText}>Your vibe</Text>
        </View>

        <View style={styles.content}>
          <Image 
            source={StickyNotesImg} 
            style={styles.stickyNotes} 
            resizeMode="contain" 
          />
          <Text style={styles.tagline}>Where your spaces find your people</Text>
        </View>

        <View style={styles.footer}>
          {/* Added the navigation trigger here */}
          <TouchableOpacity 
            style={styles.refineButton} 
            activeOpacity={0.8}
            onPress={() => router.push('/interests')} 
          >
            <Text style={styles.refineButtonText}>Refine your vibe</Text>
          </TouchableOpacity>
          
          <Text style={styles.subTagline}>AI Driven, Human Inspired.</Text>
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { alignItems: 'center', marginTop: 20 },
  headerText: {
    color: '#ac76a4', 
    fontSize: 42,
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    fontStyle: 'italic',
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stickyNotes: { width: '90%', height: 300 },
  tagline: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    fontStyle: 'italic',
    marginTop: -20,
  },
  footer: { alignItems: 'center', paddingBottom: 40 },
  refineButton: {
    backgroundColor: 'rgba(126, 28, 46, 0.6)', 
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ac76a4',
  },
   header2: {
    paddingHorizontal: 25,
    paddingTop: 50,
    alignItems: 'flex-start', // Keeps LearnIda on the left
    
  },
  refineButtonText: {
    color: '#ac76a4',
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
  },
  subTagline: {
    color: '#fff',
    fontSize: 14,
    marginTop: 15,
    opacity: 0.8,
    fontWeight: '300',
  }
});