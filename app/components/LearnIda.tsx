import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from "@/context/AuthContext"; 

export default function LearnIda() {
  const router = useRouter();
  const { logout } = useAuth(); 

  return (
    <View style={styles.headerRow}>
      {/* Pushed to the far left */}
      <TouchableOpacity 
        style={styles.pillContainer} 
        onPress={() => router.push('/about')} 
        activeOpacity={0.7}
      >
        <Text style={styles.pillText}>Learn I.D.A.</Text>
      </TouchableOpacity>

      {/* Pushed to the far right */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={logout} 
        activeOpacity={0.7}
      >
        <Text style={styles.logoutText}>logout.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', // This pushes them to opposite ends
    alignItems: 'center',
    width: '100%',                 // Essential to span the whole screen
    paddingHorizontal: 20,         // Keeps them from touching the very edge
  },
  pillContainer: { 
    paddingVertical: 10, 
    paddingHorizontal: 22, 
    borderRadius: 25, 
    borderWidth: 2, 
    borderColor: '#7e1c2e', 
    backgroundColor: '#7e1c2e', 
  },
  pillText: { 
    color: '#ac76a4', 
    fontSize: 16, 
    fontWeight: 'bold', 
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif', 
    fontStyle: 'italic' 
  },
  logoutButton: {
    paddingVertical: 10,
  },
  logoutText: { 
    color: '#ac76a4', 
    fontSize: 16, 
    fontWeight: 'bold', 
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif', 
    fontStyle: 'italic',
    textDecorationLine: 'underline', // Optional: makes it look more like a link
  },
});