\// interests.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons'; // Ensure you have expo-vector-icons installed

// Unified Step Structure
const steps = [
  {
    id: 'style',
    title: 'Architectural Style',
    subtitle: 'Which style defines you best?',
    type: 'choice',
    options: [
      'Minimalist',
      'Bohemian',
      'Scandinavian',
      'Industrial',
      'Mid-Century Modern',
      'Art Deco',
      'Coastal',
    ],
  },
  {
    id: 'space',
    title: 'Your Space',
    subtitle: 'What kind of space are we working with?',
    type: 'choice',
    options: [
      'Small Apartment',
      'Large Room',
      'Open Concept',
      'Bedroom',
      'Office',
      'Studio',
    ],
  },
  {
    id: 'vibe',
    title: 'Desired Vibe',
    subtitle: 'How do you want the room to feel?',
    type: 'choice',
    options: ['Cozy & Warm', 'Bright & Airy', 'Bold & Colorful', 'Neutral & Calm'],
  },
  {
    id: 'interest',
    title: 'Primary Interest',
    subtitle: 'What is your main priority?',
    type: 'choice',
    options: ['DIY Projects', 'Budget-Friendly', 'Luxury', 'Smart Home', 'Plants'],
  },
  {
    id: 'mobility_bool',
    title: 'Accessibility',
    subtitle: 'Do you have trouble moving around in your daily life?',
    type: 'yes-no',
  },
  // This step is dynamic; usually handled by logic, but we can map it for the progress bar
  {
    id: 'mobility_details',
    title: 'Accessibility Details',
    subtitle: 'Please describe your needs so we can help.',
    type: 'text-input',
  }
];

export default function InterestsScreen() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [inputText, setInputText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // We determine the active step object
  // If the user said "No" to mobility, we might skip the last step
  const currentStep = steps[currentStepIndex];


  const handleBack = () => {
    if (currentStepIndex > 0) {
      // If we are coming back from the last step, we might need to reset the text
      if (currentStepIndex === steps.length - 1) {
          // just go back
      }
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const advanceStep = (delay = 300) => {
    if (currentStepIndex < steps.length - 1) {
      // Add a small delay so the user sees their click register
      setTimeout(() => {
        // Logic to skip the text input if they answered "No" to mobility
        if (currentStep.id === 'mobility_bool' && answers['mobility_bool'] === false) {
             saveAndFinish({ ...answers, mobility_bool: false }); // Finish early
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
    const finalAnswers = { ...answers, [currentStep.id]: inputText };
    saveAndFinish(finalAnswers);
  };

  const saveAndFinish = async (finalData: any) => {
    setIsSaving(true);
    try {
      const fileUri = FileSystem.documentDirectory + 'user_interests.json';
      const payload = {
        ...finalData,
        savedAt: new Date().toISOString(),
      };
      
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2), {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      Alert.alert('Success', 'Your preferences have been saved!');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not save.');
    } finally {
      setIsSaving(false);
    }
  };

  // -- RENDERERS --

  const renderOptions = () => {
    return (
      <View style={styles.optionsContainer}>
        {currentStep.options?.map((option) => {
          const isSelected = answers[currentStep.id] === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, isSelected && styles.optionSelected]}
              onPress={() => handleOptionSelect(option)}
              activeOpacity={0.7}
            >
              <Text style={isSelected ? styles.optionTextSelected : styles.optionText}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderYesNo = () => {
    const currentVal = answers[currentStep.id];
    return (
      <View style={styles.yesNoContainer}>
        <TouchableOpacity
          style={[styles.yesNoButton, currentVal === true && styles.optionSelected]}
          onPress={() => handleYesNo(true)}
        >
          <Text style={currentVal === true ? styles.optionTextSelected : styles.optionText}>
            Yes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.yesNoButton, currentVal === false && styles.optionSelected]}
          onPress={() => handleYesNo(false)}
        >
          <Text style={currentVal === false ? styles.optionTextSelected : styles.optionText}>
            No
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTextInput = () => {
    return (
      <View style={styles.centeredInputWrapper}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.expandingInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type details here..."
            placeholderTextColor="#999"
            multiline
            textAlign="center"
            textAlignVertical="center" 
            // This ensures logic for "submit" isn't purely "Enter" on keyboard, 
            // but we provide a button.
          />
          
          {/* Small button to submit because there is no main "Next" button */}
          <TouchableOpacity 
            style={styles.submitIconBtn} 
            onPress={handleTextSubmit}
            disabled={!inputText.trim() || isSaving}
          >
             {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
             ) : (
                <Ionicons name="arrow-up" size={20} color="#fff" />
             )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
           <View style={styles.progressBarBg}>
             <View 
               style={[
                 styles.progressBarFill, 
                 { width: `${((currentStepIndex + 1) / steps.length) * 100}%` }
               ]} 
             />
           </View>
        </View>

        <ScrollView contentContainerStyle={styles.contentScroll}>
          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.subtitle}>{currentStep.subtitle}</Text>

          {currentStep.type === 'choice' && renderOptions()}
          {currentStep.type === 'yes-no' && renderYesNo()}
          {currentStep.type === 'text-input' && renderTextInput()}
        </ScrollView>

        {/* Footer with ONLY Back Button */}
        <View style={styles.footer}>
          {currentStepIndex > 0 ? (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#666" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View /> /* Empty view to keep spacing if needed, or remove */
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  
  // Progress
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },

  // Content
  contentScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center', // Centers everything horizontally
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: '80%',
  },

  // Options (Choices)
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  optionButton: {
    width: '85%',
    paddingVertical: 14,
    borderRadius: 30, // Pill shape
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionTextSelected: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Yes or  No
  yesNoContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  yesNoButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
  },

  // Centered Expanding Input
  centeredInputWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Aligns the button to the bottom of the text input
    gap: 8,
    width: '90%',
    maxWidth: 400,
  },
  expandingInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 18,
    color: '#000',
    minHeight: 50,
    maxHeight: 200, // stops it from taking whole page
    // Layout logic
  },
  submitIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3, // Align visually with input
  },

  // Footer
  footer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
});