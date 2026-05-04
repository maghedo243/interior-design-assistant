import {View, StyleSheet, ActivityIndicator, Text, useWindowDimensions} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import ImageViewer from '@/components/ImageViewer';

import {useEffect, useState} from "react";
import { useSharedValue } from 'react-native-reanimated';

import { sendInteraction, getFeed, getRecommendations } from '@/services/APIHandler';
import { useAuth } from "@/context/AuthContext";
import { Product, triggerZone } from "@/types";
import Draggable from '@/components/Draggable';
import DistanceFading from '@/components/DistanceFading';

// TODO: Add a "maybe"

export default function SuggestScreen() {
    const [products, setProducts] = useState<Product[]>([])
    // const [recentProducts, setRecentProducts] = useState<Product[]>([])
    const [productIndex, setProductIndex] = useState<number>(0)
    const [loading, setLoading] = useState<Boolean>(false);
    const { user } = useAuth();

    const { height, width } = useWindowDimensions();

    const imageX = useSharedValue(0)
    const imageY = useSharedValue(0)

    const scroll = async (interaction: 'like' | 'dislike' | 'maybe') => {
        setLoading(true)

        const currentItem = products[productIndex]
        setProductIndex(productIndex+1)

        await sendInteraction(user ? user.id : "3000",currentItem,interaction);

        if(productIndex == 25) { // add new products to the feed before it ends
            loadFeed()
        } else if(productIndex == 30) { // reset feed counter at 30
            setProductIndex(0)
        }

        setLoading(false)
    }

    const loadFeed = async () => {
        setLoading(true)
        try {
            const productFeed = await getFeed(user);
            
            if(productFeed === undefined) throw "products undefined";

            setProducts([...products.splice(25),...productFeed]);
            console.log(products.length)

            const result = await ImagePicker.launchImageLibraryAsync();

            if(!result.canceled) {
                const imageFromPicker = {
                    uri: result.assets[0].uri,
                    name: 'upload.jpg',
                    type: 'image/jpeg',
                };

                const recommend = await getRecommendations(user, "Post-modern gothic", [imageFromPicker as any])
                console.log(recommend)
            }
            
        } catch (error) {
            console.error("❌ Failed to load feed:", error);
            // Optional: Set an error state here to show a "Retry" button
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadFeed();
    },[])

    if(loading){
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        )
    }

    if (!products[productIndex]) {
        return (
            <View style={styles.container}>
                <Text>No more products!</Text>
            </View>
        );
    }

    const currentProduct = products[productIndex]
    console.log(`Current Product: ${currentProduct.name.value}`)

    
    const triggerZones: triggerZone[] = [
        {x: 0, y: 0, width: width * 0.10, height: height, onTrigger: () => scroll("dislike")},
        {x: width * 0.9, y: 0, width: width * 0.10, height: height, onTrigger: () => scroll("like")}
    ]

    return (
        <View style={styles.container}>
            <Draggable translateX={imageX} translateY={imageY} triggerZones={triggerZones} shouldRotate rotationFactor={55} style={styles.imageContainer}>
                <ImageViewer imgSource={currentProduct.image}/>
            </Draggable>
           
            {/* <Text style={styles.productName}>{currentProduct.name}</Text> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C4587'
    },
    imageContainer: {
        alignSelf: 'center',
        width: "90%",
        marginTop: '20%'
    },
    productName: {
        marginTop: '5%',
        color: 'white',
        textAlign: 'center'
    }
});