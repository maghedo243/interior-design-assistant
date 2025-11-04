import { Image } from 'expo-image';
import { View, Platform, StyleSheet } from 'react-native';

import { Link } from 'expo-router';
import ImageViewer from '@/components/ImageViewer'

const PlaceholderImage = require('@/assets/images/background-image.png');

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={PlaceholderImage} />
      </View>
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
