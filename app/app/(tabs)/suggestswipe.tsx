import { Image } from 'expo-image';
import {View, Platform, StyleSheet, ActivityIndicator} from 'react-native';

import { Link } from 'expo-router';
import ImageViewer from '@/components/ImageViewer';
import Button from '@/components/Button';

import Ionicons from '@expo/vector-icons/Ionicons';
import {useState} from "react";

import { sendInteraction } from '@/services/APIHandler';


export default function SuggestScreen() {
    const PlaceholderImage = require('@/assets/images/background-image.png');
    const NextImage = require('@/assets/images/Emi.jpg');

    const [selectedImage, setSelectedImage] = useState(PlaceholderImage);
    const [loading, setLoading] = useState(false);


    const changeImage = (newImage: any) => {
        setSelectedImage(newImage);
    };

    const scroll = async (interaction: 'like' | 'dislike' | 'maybe') => {
        //TODO: feed pull
        setLoading(true)
        await sendInteraction("e",interaction);
        setLoading(false)
    }


    return (
        <View style={styles.container}>
            {loading ?
                (
                    <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                    <>
                        <View style={styles.imageContainer}>
                            <ImageViewer imgSource={selectedImage}/>
                        </View>
                        <View style={styles.buttonContainer}>
                            <View style={styles.topRow}>
                                <View style={styles.buttonWrapper}>
                                    <Button icon={(size) => (<Ionicons name="checkmark-sharp" size={size} color={"green"}/>)}
                                            label={"Like"} onPress={() => scroll("like")}/>
                                </View>
                                <View style={styles.buttonWrapper}>
                                    <Button icon={(size) => (<Ionicons name="close-sharp" size={size} color={"red"}/>)}
                                            label={"Dislike"} onPress={() => scroll("dislike")}/>
                                </View>
                            </View>
                            <View style={styles.maybeWrapper}>
                                <Button icon={(size) => (<Ionicons name="ellipse-outline" size={size} color={"gray"}/>)}
                                        label={"Maybe"} onPress={() => scroll("maybe")}/>
                            </View>
                        </View>
                    </>
                )
            }
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
        flexDirection: 'column',
        gap: 5,
        height: '10%',
        width: '80%'
    },
    topRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 20,
    },
    buttonWrapper: {
        flex: 1
    },
    maybeWrapper: {
        alignSelf: 'center',
        width: '50%',
    }
});
