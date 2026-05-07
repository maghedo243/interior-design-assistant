import { View, StyleSheet, ImageBackground, Platform, Image } from 'react-native';
import TypewriterText from '@/components/TypewriterText'; 

const BackgroundImg = require('@/assets/images/BackgroundHome.ida.png');
const ExplainGraphic = require('../assets/images/02.png');
export default function AboutScreen() {
    const aboutText = "The USA is facing a \"Third Space\" crisis, making it harder than ever to find places to connect. I.D.A. is here to change that. Our AI-driven assistant helps you transform your home into the ultimate \"Third Space\"—a cozy, accessible, and beautiful environment perfect for hosting friends and building community.\n\nI.D.A.: Driven by AI, inspired by human connection.";

    return (
        <ImageBackground 
            source={BackgroundImg} 
            style={styles.container} 
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                {/* Top/Middle section for text */}
                <View style={styles.textWrapper}>
                    <TypewriterText 
                        text={aboutText} 
                        style={styles.text} 
                        delay={10} 
                    />
                </View>

                {/* Bottom section for the instruction PNG */}
                <View style={styles.footer}>
                    <Image 
                        source={ExplainGraphic} 
                        style={styles.bottomImage} 
                        resizeMode="contain" 
                    />
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 60, // Gives room for the status bar and bottom edge
  },
  textWrapper: {
    width: '85%', 
    alignItems: 'center',
    marginTop: 40,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  bottomImage: {
    width: '90%', // Adjust width as needed
    height: 300,  // Adjust height as needed
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16, // Upped from 10 for better readability
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 28,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 6,
  }
});