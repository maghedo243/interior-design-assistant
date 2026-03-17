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

      {/* Wrapper to center the image and button below the header */}
      <View style={styles.content}>
        

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
  //Styling for title
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
    flex: 1
  }
});
