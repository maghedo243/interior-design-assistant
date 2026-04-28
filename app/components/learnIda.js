import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// leanrIda commponet

export default function LearnIda() {
  return (
    <View style={styles.header}>
      <Text style={styles.logoText}>Learn Ida</Text>
      <Ionicons name="menu" size={32} color="rgba(9, 9, 9, 0.5)" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    width: '100%', 
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif', 
  }
});