import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getRecommendations } from '@/services/APIHandler';
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/types";

const BackgroundImg = require('@/assets/images/BackgroundHome.ida.png');

export default function IdaTalkScreen() {
  const [message, setMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<{ role: string, text: string, images?: any[], recommendations?: Product[], loading?: boolean}[] >([]);
  const router = useRouter();
  const { user } = useAuth();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      allowsMultipleSelection: true
    });

    if(!result.canceled) {
                const imagesFromPicker = result.assets.map((asset, index) => ({
                    uri: asset.uri,
                    name: asset.fileName || `upload_${index}.jpg`, 
                    type: asset.mimeType || 'image/jpeg', 
                }));

                setSelectedImages([...selectedImages, ...imagesFromPicker as any])
    }
  };

  const handleSend = async () => {
    if (message.trim().length === 0 && !selectedImages) return;
    
    const newEntry = { 
      role: 'user', 
      text: message, 
      images: selectedImages
    };

    
    setMessage('');
    setSelectedImages([]);

    if (newEntry.images) {
      const loadEntry = {
        role: 'ai',
        text: "Loading...",
        loading: true
      }
      setChatHistory([...chatHistory, newEntry, loadEntry])
      const recommendations = await getRecommendations(user, newEntry.text, newEntry.images)

      console.log("Testing Delay")

      const responseEntry = {
        role: 'ai',
        text: "Here are your recommendations",
        recommendations: recommendations
      }

      setChatHistory([...chatHistory.slice(0,-1),responseEntry])
    } else {
        setChatHistory([...chatHistory, newEntry]);
        // Space for conversational AI in the future
    }
  };

  return (
    <ImageBackground source={BackgroundImg} style={styles.container} resizeMode="cover">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#ac76a4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>I.D.A. Talk</Text>
          <View style={{ width: 28 }} /> 
        </View>

        {/* Chat History & Centered Greeting */}
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent, 
            chatHistory.length === 0 && { flex: 1 } 
          ]}
        >
          {chatHistory.length === 0 ? (
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>What can I do for you?</Text>
            </View>
          ) : (
            chatHistory.map((item, index) => (
              <View key={index} style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.idaBubble]}>
                {item.loading ? (
                  <ActivityIndicator size="large" color="#ac76a4" />
                ) : (
                  <>
                    {/* Check if images exist and map through them */}
                    {item.images && item.images.length > 0 && (
                      <View style={styles.bubbleImagesWrapper}>
                        {item.images.map((image, imgIndex) => (
                          <Image 
                            key={imgIndex} 
                            source={{ uri: image.uri }} 
                            style={styles.bubbleImage} 
                          />
                        ))}
                      </View>
                    )}
                    
                    <Text style={styles.bubbleText}>{item.text}</Text>

                    {/* Check if recommendations exist and map them into a horizontal scroll */}
                    {item.recommendations && item.recommendations.length > 0 && (
                      <ScrollView 
                        horizontal={true} 
                        showsHorizontalScrollIndicator={false} 
                        style={styles.recommendationScroll}
                      >
                        {item.recommendations.map((rec, recIndex) => (
                          <View key={recIndex} style={styles.recommendationCard}>
                            <Image 
                              source={{ uri: rec.image }} // Adjust 'rec.image' to match your actual data structure
                              style={styles.recommendationImage} 
                            />
                            <TouchableOpacity 
                              style={styles.viewButton}
                              onPress={() => console.log(`Viewing ${rec.name}`)}
                            >
                              <Text style={styles.viewButtonText}>View Name</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    )}
                  </>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Input Section */}
        <View style={styles.footerContainer}>
          {selectedImages && selectedImages.length > 0 && (
              <View style={styles.previewWrapper}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image 
                      source={{ uri: image.uri }} 
                      style={styles.selectedImagePreview} 
                    />
                    <TouchableOpacity 
                      style={styles.closeButton} 
                      onPress={() => {
                        // Filters out the image at the specific index that was clicked
                        const updatedImages = selectedImages.filter((_, i) => i !== index);
                        setSelectedImages(updatedImages);
                      }}
                    >
                      <Ionicons name="close-circle" size={24} color="#7e1c2e" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
              <Ionicons name="add-circle-outline" size={30} color="#ac76a4" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Ask IDA anything..."
              placeholderTextColor="rgba(172, 118, 164, 0.6)"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            
            <TouchableOpacity 
              style={[styles.sendButton, (!message && !selectedImages) && { opacity: 0.5 }]} 
              onPress={handleSend}
              disabled={!message && !selectedImages}
            >
              <Ionicons name="arrow-up-circle" size={42} color="#7e1c2e" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#ac76a4',
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  backButton: { padding: 5 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  greetingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingText: {
    color: '#ac76a4',
    fontSize: 34,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  bubble: {
    padding: 12,
    borderRadius: 20,
    marginVertical: 6,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(126, 28, 46, 0.85)', 
  },
  idaBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(172, 118, 164, 0.15)', 
    borderWidth: 1,
    borderColor: '#ac76a4',
  },
  bubbleText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  bubbleImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  bubbleImagesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Keeps spacing clean between multiple images
    marginBottom: 6, // Adds a little breathing room before the message text
  },
  imageContainer: {
    position: 'relative', // Allows absolute positioning inside this specific container
  },
  footerContainer: {
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
  },
  previewWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12, 
    marginTop: 10,
  },
  selectedImagePreview: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ac76a4',
  },
  closeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white', // Prevents transparent background issues behind the icon
    borderRadius: 12, // Matches half the icon size to keep the background strictly behind the circle
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 35,
    borderWidth: 1.5,
    borderColor: 'rgba(172, 118, 164, 0.5)',
    paddingLeft: 12,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 17,
    paddingVertical: 12,
    paddingHorizontal: 10,
    maxHeight: 120,
  },
  iconButton: { padding: 5 },
  sendButton: { padding: 2 },
  recommendationScroll: {
    marginTop: 10,
    flexDirection: 'row',
  },
  recommendationCard: {
    marginRight: 12,
    alignItems: 'center',
    width: 120, // Forces a consistent width for each item in the scroll
  },
  recommendationImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#e0e0e0', // Fallback color while loading
  },
  viewButton: {
    backgroundColor: '#ac76a4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});