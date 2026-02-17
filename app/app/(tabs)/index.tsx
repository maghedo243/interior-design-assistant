import {View, Platform, StyleSheet, Button} from 'react-native';
import {useAuth} from "@/context/AuthContext";
import ImageViewer from '@/components/ImageViewer'
import React from "react";

const PlaceholderImage = require('@/assets/images/background-image.png');

export default function HomeScreen() {
  const {logout} = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={PlaceholderImage} />
      </View>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2f2f2f',
    alignItems: 'center'
  },
  imageContainer: {
    flex: 1
  }
});
