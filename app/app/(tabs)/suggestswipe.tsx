import { Image } from 'expo-image';
import { View, Platform, StyleSheet } from 'react-native';

import { Link } from 'expo-router';
import ImageViewer from '@/components/ImageViewer';
import Button from '@/components/Button';

import Ionicons from '@expo/vector-icons/Ionicons';

const PlaceholderImage = require('@/assets/images/background-image.png');

export default function SuggestScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <ImageViewer imgSource={PlaceholderImage} />
            </View>
            <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                    <Button icon={(size) => (<Ionicons name="checkmark-sharp" size={size} color={"green"}/>)} label={"Like"} onPress={() => alert("WRYYYYYYYY")}/>
                </View>
                <View style={styles.buttonWrapper}>
                    <Button icon={(size) => (<Ionicons name="close-sharp" size={size} color={"red"}/>)} label={"Dislike"} onPress={() => alert("UYSHAAAAAAA")}/>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2f2f2f'
    },
    imageContainer: {
        alignSelf: 'center',
        marginTop: '10%'
    },
    buttonContainer: {
        marginTop: '5%',
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 20,
        height: '10%',
        width: '80%'
    },
    buttonWrapper: {
        flex: 1
    }
});
