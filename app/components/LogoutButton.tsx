// @/components/LogoutButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <TouchableOpacity 
      style={styles.pillContainer} 
      onPress={logout}
      activeOpacity={0.7}
    >
      <Ionicons name="log-out-outline" size={22} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    padding: 10,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});