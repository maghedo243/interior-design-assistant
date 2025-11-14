import { Image } from 'expo-image';
import { View, Platform, StyleSheet } from 'react-native';

import { Link } from 'expo-router';
import ImageViewer from '@/components/ImageViewer';
import Button from '@/components/Button';

import Ionicons from '@expo/vector-icons/Ionicons';
import {useState} from "react";

export default function SuggestScreen() {
    const PlaceholderImage = require('@/assets/images/background-image.png');
    const NextImage = require('@/assets/images/Emi.jpg');

    const [selectedImage, setSelectedImage] = useState(PlaceholderImage);

    const changeImage = (newImage: any) => {
        setSelectedImage(newImage);
    };

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <ImageViewer imgSource={selectedImage} />
            </View>
            <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                    <Button icon={(size) => (<Ionicons name="checkmark-sharp" size={size} color={"green"}/>)} label={"Like"} onPress={() => changeImage(NextImage)}/>
                </View>
                <View style={styles.buttonWrapper}>
                    <Button icon={(size) => (<Ionicons name="close-sharp" size={size} color={"red"}/>)} label={"Dislike"} onPress={() => changeImage(PlaceholderImage)}/>
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
