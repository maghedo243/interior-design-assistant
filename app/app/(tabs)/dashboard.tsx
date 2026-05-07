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
      {/* Top Header Row (Learn IDA & Logout) */}
      <View style={styles.header2}>
        <LearnIda />
      </View>

      <SafeAreaView style={styles.safeArea}>
        
        {/* Title Section */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Your vibe</Text>
        </View>

        {/* Center Content Section */}
        <View style={styles.content}>
          <Image 
            source={StickyNotesImg} 
            style={styles.stickyNotes} 
            resizeMode="contain" 
          />
          <Text style={styles.tagline}>Where your spaces finds you</Text>
        </View>

        
        <View style={styles.footer}>
          
          <View style={styles.buttonRow}>
            {/* Refine Button */}
            <TouchableOpacity 
              style={styles.refineButton} 
              activeOpacity={0.8}
              onPress={() => router.push('/interests')} 
            >
              <Text style={styles.refineButtonText}>Refine your vibe</Text>
            </TouchableOpacity>

            {/* Talk to IDA Button */}
            <TouchableOpacity 
              style={[styles.refineButton, styles.talkButton]} 
              activeOpacity={0.8}
              onPress={() => router.push('/idaTalk')} 
            >
              <Text style={styles.refineButtonText}>Talk to I.D.A.</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subTagline}>AI Driven, Human Inspired.</Text>
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  safeArea: { 
    flex: 1 
  },
  header2: {
    paddingTop: 50,
    width: '100%',
    zIndex: 10,
  },
  header: { 
    alignItems: 'center', 
    marginTop: 20 
  },
  headerText: {
    color: '#ac76a4', 
    fontSize: 42,
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    fontStyle: 'italic',
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  stickyNotes: { 
    width: '90%', 
    height: 300 
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    fontStyle: 'italic',
    marginTop: -20,
  },
  footer: { 
    alignItems: 'center', 
    paddingBottom: 40 
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12, // Space between buttons
    width: '100%',
    paddingHorizontal: 20,
  },
  refineButton: {
    backgroundColor: 'rgba(126, 28, 46, 0.6)', 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ac76a4',
    minWidth: 150, // Ensures buttons feel balanced
    alignItems: 'center',
  },
  talkButton: {
    backgroundColor: 'rgba(126, 28, 46, 0.6)', 
    borderColor: '#ac76a4',
  },
  refineButtonText: {
    color: '#ac76a4',
    fontSize: 18,
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