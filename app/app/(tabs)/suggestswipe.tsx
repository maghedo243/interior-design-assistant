import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  ImageBackground, 

  Platform //Platform import
, useWindowDimensions} from 'react-native';
import ImageViewer from '@/components/ImageViewer';
import { SafeAreaView } from 'react-native-safe-area-context';


import {useEffect, useState} from "react";
import { useSharedValue } from 'react-native-reanimated';

import { sendInteraction, getFeed, getRecommendations } from '@/services/APIHandler';
import { useAuth } from "@/context/AuthContext";
import { Product, triggerZone } from "@/types";
import Draggable from '@/components/Draggable';
import DistanceFading from '@/components/DistanceFading';
import LearnIda from '@/components/LearnIda';



const BackgroundImg = require('@/assets/images/BackgroundHome.ida.png');
// TODO: Add a "maybe"

export default function SuggestScreen() {
    const [products, setProducts] = useState<Product[]>([])
    // const [recentProducts, setRecentProducts] = useState<Product[]>([])
    const [productIndex, setProductIndex] = useState<number>(0)
    const [loading, setLoading] = useState<Boolean>(false);
    const { user } = useAuth();

    const { height, width } = useWindowDimensions();

    const imageX = useSharedValue(0);
    const imageY = useSharedValue(0);

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
    };

    const loadFeed = async () => {
        setLoading(true);
        try {
            const productFeed = await getFeed(user);
            
            if(productFeed === undefined) throw "products undefined";

            setProducts([...products.splice(25),...productFeed]);
            console.log(products.length)

            const result = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true });

            if(!result.canceled) {
                const imagesFromPicker = result.assets.map((asset, index) => ({
                    uri: asset.uri,
                    name: asset.fileName || `upload_${index}.jpg`, 
                    type: asset.mimeType || 'image/jpeg', 
                }));

                const recommend = await getRecommendations(user, "Post-modern gothic", imagesFromPicker as any)
                console.log(recommend)
            }
            
        } catch (error) {
            console.error("❌ Failed to load feed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFeed();
    }, []);

    if (loading && products.length === 0) {
        return (
            <ImageBackground source={BackgroundImg} style={styles.container} resizeMode="cover">
                <View style={[styles.container, styles.centerContent]}>
                    <ActivityIndicator size="large" color="#ac76a4" />
                </View>
               
            </ImageBackground>
        );
    }

    if (!products[productIndex]) {
        return (
            <ImageBackground source={BackgroundImg} style={styles.container} resizeMode="cover">
                <View style={[styles.container, styles.centerContent]}>
                    <Text style={styles.productName}>No more products!</Text>
                </View>
            </ImageBackground>
        );
    }

    const currentProduct = products[productIndex]
    console.log(`Current Product: ${currentProduct.name.value}`)

    
    const triggerZones: triggerZone[] = [
        {x: 0, y: 0, width: width * 0.10, height: height, onTrigger: () => scroll("dislike")},
        {x: width * 0.9, y: 0, width: width * 0.10, height: height, onTrigger: () => scroll("like")}
    ]

    return (
    <ImageBackground source={BackgroundImg} style={styles.container} resizeMode="cover">
        <SafeAreaView style={styles.header}>
            <LearnIda />
        </SafeAreaView>
         
        <View style={styles.overlay}>
            <Draggable 
                translateX={imageX} 
                translateY={imageY} 
                triggerZones={triggerZones} 
                shouldRotate 
                rotationFactor={55} 
                style={styles.imageContainer}
            >
                <ImageViewer imgSource={currentProduct.image} />
            </Draggable>
            {/* <Text style={styles.text}>{currentProduct.name}</Text> */}
        </View>
    </ImageBackground>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
    paddingHorizontal: 25,
    paddingTop: 20,
    alignItems: 'flex-start', // Keeps LearnIda on the left
    
  },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(68, 36, 36, 0.1)',
        justifyContent: 'center',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        alignSelf: 'center',
        width: "90%",
        height: "60%", 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    productName: {
        color: 'white',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold'
    }, 
    text: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
        fontStyle: 'italic',
    }
});