import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ImageBackground // Used for the background image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "@/context/AuthContext";
import { sendQuestionnaire } from '@/services/APIHandler';
import LearnIda from '@/components/LearnIda';

const BackgroundImg = require('@/assets/images/BackgroundHome.ida.png');

// TODO: Make the form repeatable

// TODO: Make the form repeatable

// Unified Step Structure
const steps = [
  { id: 'style', title: 'Architectural Style', subtitle: 'Which style defines you best?', type: 'choice', options: ['Minimalist', 'Bohemian', 'Scandinavian', 'Industrial', 'Mid-Century Modern', 'Art Deco', 'Coastal'] },
  { id: 'space', title: 'Your Space', subtitle: 'What kind of space are we working with?', type: 'choice', options: ['Small Apartment', 'Large Room', 'Open Concept', 'Bedroom', 'Office', 'Studio'] },
  { id: 'vibe', title: 'Desired Vibe', subtitle: 'How do you want the room to feel?', type: 'choice', options: ['Cozy & Warm', 'Bright & Airy', 'Bold & Colorful', 'Neutral & Calm'] },
  { id: 'interest', title: 'Primary Interest', subtitle: 'What is your main priority?', type: 'choice', options: ['DIY Projects', 'Budget-Friendly', 'Luxury', 'Smart Home', 'Plants'] },
  { id: 'mobility_bool', title: 'Accessibility', subtitle: 'Do you have trouble moving around?', type: 'yes-no' },
  { id: 'mobility_details', title: 'Accessibility Details', subtitle: 'Please describe your needs.', type: 'text-input' }
];

export default function InterestsScreen() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [inputText, setInputText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { setNewUser, user } = useAuth();

  const currentStep = steps[currentStepIndex];

  const handleBack = () => { if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1); };

  const advanceStep = (delay = 300) => {
    if (currentStepIndex < steps.length - 1) {
      setTimeout(() => {
        if (currentStep.id === 'mobility_bool' && answers['mobility_bool'] === false) {
             saveAndFinish({ ...answers, mobility_bool: false }); 
        } else {
             setCurrentStepIndex(currentStepIndex + 1);
        }
      }, delay);
    } else {
      saveAndFinish(answers);
    }
  };

  const handleOptionSelect = (option: string) => {
    setAnswers({ ...answers, [currentStep.id]: option });
    advanceStep();
  };

  const handleYesNo = (val: boolean) => {
    setAnswers({ ...answers, [currentStep.id]: val });
    advanceStep();
  };

  const handleTextSubmit = () => {
    if (!inputText.trim()) return;
    saveAndFinish({ ...answers, [currentStep.id]: inputText });
  };

  const saveAndFinish = async (finalData: any) => {
    setIsSaving(true);
    try {
      setNewUser(false);
      await sendQuestionnaire(user?.id, finalData);
      Alert.alert('Success', 'Your preferences have been saved!');
    } catch (e) {
      Alert.alert('Error', 'Could not save.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ImageBackground source={BackgroundImg} style={styles.background} resizeMode="cover">
      {/* Header container to position the LearnIda pill top-left */}
                <View style={styles.header}>
                  <LearnIda />
                </View>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
        

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.topTextSection}>
              <Text style={styles.titleText}>{currentStep.title}</Text>
              <Text style={styles.subtitleText}>{currentStep.subtitle}</Text>
            </View>

            <View style={styles.middleSection}>
              {currentStep.type === 'choice' && (
                <View style={styles.optionsCloud}>
                  {currentStep.options?.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.hollowPill, answers[currentStep.id] === option && styles.hollowPillSelected]}
                      onPress={() => handleOptionSelect(option)}
                    >
                      <Text style={[styles.pillText, answers[currentStep.id] === option && styles.pillTextSelected]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {currentStep.type === 'yes-no' && (
                <View style={styles.optionsCloud}>
                  {[true, false].map((val) => (
                    <TouchableOpacity
                      key={String(val)}
                      style={[styles.hollowPill, answers[currentStep.id] === val && styles.hollowPillSelected]}
                      onPress={() => handleYesNo(val)}
                    >
                      <Text style={[styles.pillText, answers[currentStep.id] === val && styles.pillTextSelected]}>
                        {val ? 'Yes' : 'No'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {currentStep.type === 'text-input' && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInputHollow}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type details here..."
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    multiline
                  />
                  <TouchableOpacity style={styles.submitBtn} onPress={handleTextSubmit}>
                    {isSaving ? <ActivityIndicator size="small" color="#4A2338" /> : <Ionicons name="checkmark" size={24} color="#4A2338" />}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {currentStepIndex > 0 ? (
              <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            ) : <View style={{ width: 48 }} />}
            <Text style={styles.logoText}>Tell us who you are</Text>
            <View style={{ width: 48 }} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // Inside your index.tsx styles
 header: {
    paddingHorizontal: 25,
    paddingTop: 50,
    alignItems: 'flex-start', // Keeps LearnIda on the left
    
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  logoText: {
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ac76a4',
    fontStyle: 'italic',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 300,
  },
  optionsCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  hollowPill: {
    backgroundColor: '#7e1c2e', 
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#7e1c2e',
  },
  hollowPillSelected: {
    backgroundColor: '#7e1c2e',
  },
  pillText: {
    color: '#ac76a4',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    fontStyle: 'italic',
  },
  pillTextSelected: {
    color: '#4A2338',
  },
  inputContainer: {
    alignItems: 'center',
    width: '100%',
  },
  textInputHollow: {
    width: '100%',
    minHeight: 100,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 20,
    padding: 16,
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 30,
    width: 60,
    alignItems: 'center',
  },
  topTextSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20, // Reset from -150 to keep layout clean
  },
  titleText: {
    fontSize: 30,
    color: '#ac76a4',
    textAlign: 'center',
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    fontStyle: 'italic',
  },
  subtitleText: {
    fontSize: 18,
    color: '#ac76a4',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 30,
    paddingTop: 15,
  },
  backBtn: {
    padding: 5,
  },
});