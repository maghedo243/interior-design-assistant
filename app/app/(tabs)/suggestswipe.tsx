import {View, StyleSheet, ActivityIndicator, Text, useWindowDimensions} from 'react-native';

import ImageViewer from '@/components/ImageViewer';
import Button from '@/components/Button';

import Ionicons from '@expo/vector-icons/Ionicons';
import {useEffect, useState} from "react";
import { useSharedValue } from 'react-native-reanimated';

import { sendInteraction, getFeed } from '@/services/APIHandler';
import { useAuth } from "@/context/AuthContext";
import { Product, triggerZone } from "@/types";
import Draggable from '@/components/Draggable';
import DistanceFading from '@/components/DistanceFading';


export default function SuggestScreen() {
    const [products, setProducts] = useState<Product[]>([])
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

        if(productIndex == 40) {
            loadFeed()
            setProductIndex(0)
        }

        setLoading(false)
    }

    const loadFeed = async () => {
        setLoading(true)
        try {
            const userId = user ? user.id : "3000";

            const response = await getFeed(userId);
            const data = await response.json()

            console.log(`✅ Loaded ${data.length} products`);
            setProducts(data);
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
    console.log(`Current Product: ${currentProduct.name}`)

    
    const triggerZones: triggerZone[] = [
        {x: 0, y: 0, width: width * 0.10, height: height, onTrigger: () => scroll("dislike")},
        {x: width * 0.9, y: 0, width: width * 0.10, height: height, onTrigger: () => scroll("like")}
    ]

    return (
        <View style={styles.container}>
            <Draggable translateX={imageX} translateY={imageY} triggerZones={triggerZones} shouldRotate rotationFactor={55} style={styles.imageContainer}>
                <ImageViewer imgSource={currentProduct.image_url}/>
            </Draggable>
           
            <Text style={styles.productName}>{currentProduct.name}</Text>
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
