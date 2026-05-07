// @/components/LearnIda.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function LearnIda() {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.pillContainer} 
      onPress={() => router.push('/about')} 
      activeOpacity={0.7}
    >
      <Text style={styles.pillText}>Learn I.D.A.</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pillContainer: { 
    
    paddingVertical: 10, 
    paddingHorizontal: 22, 
    borderRadius: 25, 
    borderWidth: 2, // Thicker border
    borderColor: '#7e1c2e', // Solid white border for visibility
    backgroundColor: '#7e1c2e', // Darker translucent background to contrast with white text
    alignItems: 'center', 
    justifyContent: 'center',
    zIndex: 99, // Ensure it's on top
  },
  pillText: { 
    color: '#ac76a4', 
    fontSize: 16, // Slightly larger
    fontWeight: 'bold', 
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif', 
    fontStyle: 'italic' 
  },
});