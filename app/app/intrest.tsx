import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  SafeAreaView,G
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ImageBackground // Added for potential background lines later
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons'; 

//Questionns
const steps = [
  {
    id: 'style',
    title: 'Architectural Style',
    subtitle: 'Which style defines you best?',
    type: 'choice',
    options: ['Minimalist', 'Bohemian', 'Scandinavian', 'Industrial', 'Mid-Century Modern', 'Art Deco', 'Coastal'],
  },
  {
    id: 'space',
    title: 'Your Space',
    subtitle: 'What kind of space are we working with?',
    type: 'choice',
    options: ['Small Apartment', 'Large Room', 'Open Concept', 'Bedroom', 'Office', 'Studio'],
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

  const currentStep = steps[currentStepIndex];

  // LOGIC 
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

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
    const finalAnswers = { ...answers, [currentStep.id]: inputText };
    saveAndFinish(finalAnswers);
  };

  const saveAndFinish = async (finalData: any) => {
    setIsSaving(true);
    // savibg logic needs fixing but that is for later 
    try {
      const fileUri = FileSystem.documentDirectory + 'user_interests.json';
      const payload = { ...finalData, savedAt: new Date().toISOString() };
      
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

  //UI renders
  const renderOptions = () => {
    return (
      <View style={styles.optionsCloud}>
        {currentStep.options?.map((option) => {
          const isSelected = answers[currentStep.id] === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.hollowPill, isSelected && styles.hollowPillSelected]}
              onPress={() => handleOptionSelect(option)}
              activeOpacity={0.6}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
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
      <View style={styles.optionsCloud}>
        <TouchableOpacity
          style={[styles.hollowPill, currentVal === true && styles.hollowPillSelected]}
          onPress={() => handleYesNo(true)}
        >
          <Text style={[styles.pillText, currentVal === true && styles.pillTextSelected]}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.hollowPill, currentVal === false && styles.hollowPillSelected]}
          onPress={() => handleYesNo(false)}
        >
          <Text style={[styles.pillText, currentVal === false && styles.pillTextSelected]}>No</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTextInput = () => {
    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInputHollow}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type details here..."
          placeholderTextColor="#rgba(255,255,255,0.6)"
          multiline
        />
        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleTextSubmit}
          disabled={!inputText.trim() || isSaving}
        >
           {isSaving ? (
              <ActivityIndicator size="small" color="#53253b" />
           ) : (
              <Ionicons name="checkmark" size={24} color="#53253b" />
           )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    //Safeareview need fixing and i need to understand what it is 
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Learn Ida</Text>
          <Ionicons name="menu" size={32} color="#rgba(255,255,255,0.5)" />
        </View>

     <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* TITLES */}
          <View style={styles.topTextSection}>
            <Text style={styles.titleText}>{currentStep.title}</Text>
            <Text style={styles.subtitleText}>{currentStep.subtitle}</Text>
          </View>

          {/* THE BUTTON CLOUD  */}
          <View style={styles.middleSection}>
            {currentStep.type === 'choice' && renderOptions()}
            {currentStep.type === 'yes-no' && renderYesNo()}
            {currentStep.type === 'text-input' && renderTextInput()}
          </View>

        </ScrollView>

      
        {/* BOTTOM PART  */}
        <View style={styles.footer}>
          {currentStepIndex > 0 ? (
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 48 }} />
          )}
          <Text style={styles.logoText}>Tell us who you are</Text>
          <View style={{ width: 48 }} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

//STYLE
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4A2338', 
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  logoText: {
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif', //  cursive vibe
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontStyle: 'italic',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', // Centers the cloud vertically. I might chnage hoe this lookd 
    paddingHorizontal: 20,
  },
  
  // Clound layout
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 300,
  },
  optionsCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',    // This makes the buttons wrap like a cloud (weird)
    justifyContent: 'center',
    gap: 12, // Space between buttons
  },
  hollowPill: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent', // Hollow look but might change later 
  },
  hollowPillSelected: {
    backgroundColor: '#fff', // Fills white when selected
  },
  pillText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',// give it the cursive vibe I wonder if android users would have a probelm with this 
    fontStyle: 'italic',
  },
  pillTextSelected: {
    color: '#4A2338', // Dark text when pill is filled
  },

  // Text Input 
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

  // TITLES & BOTTOM PART 
  topTextSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: -150,
  },
  titleText: {
    fontSize: 30,
    color: '#fff',
    textAlign: 'center',
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    fontStyle: 'italic',
  },
  subtitleText: {
    fontSize: 18,
    color: '#rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 10 : 20,
    backgroundColor: '#4A2338', // Slightly darker bottom bar (I want to take away this bottom bar )
    paddingTop: 15,
  },
  backBtn: {
    padding: 5,
  },
  footerFormText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '300',
  }
});