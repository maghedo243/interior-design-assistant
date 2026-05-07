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
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const BackgroundImg = require('@/assets/images/BackgroundHome.ida.png');

export default function IdaTalkScreen() {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: string, text: string, image?: string }[]>([]);
  const router = useRouter();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSend = () => {
    if (message.trim().length === 0 && !selectedImage) return;
    
    const newEntry = { 
      role: 'user', 
      text: message, 
      image: selectedImage || undefined 
    };
    
    setChatHistory([...chatHistory, newEntry]);
    setMessage('');
    setSelectedImage(null);
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
                {item.image && (
                  <Image source={{ uri: item.image }} style={styles.bubbleImage} />
                )}
                <Text style={styles.bubbleText}>{item.text}</Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* Input Section */}
        <View style={styles.footerContainer}>
          {selectedImage && (
            <View style={styles.previewWrapper}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImagePreview} />
              <TouchableOpacity 
                style={styles.closePreview} 
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={24} color="#7e1c2e" />
              </TouchableOpacity>
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
              style={[styles.sendButton, (!message && !selectedImage) && { opacity: 0.5 }]} 
              onPress={handleSend}
              disabled={!message && !selectedImage}
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
  footerContainer: {
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
  },
  previewWrapper: {
    marginBottom: 10,
    paddingLeft: 10,
  },
  selectedImagePreview: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ac76a4',
  },
  closePreview: {
    position: 'absolute',
    top: -10,
    left: 65,
    backgroundColor: '#fff',
    borderRadius: 12,
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
});