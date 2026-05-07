import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  useWindowDimensions, 
  SafeAreaView,
  ImageBackground, 

  Platform //Platform import
} from 'react-native';
import ImageViewer from '@/components/ImageViewer';
import { useEffect, useState } from "react";
import { useSharedValue } from 'react-native-reanimated';
import { sendInteraction, getFeed } from '@/services/APIHandler';
import { useAuth } from "@/context/AuthContext";
import { Product, triggerZone } from "@/types";
import Draggable from '@/components/Draggable';
import LearnIda from '@/components/LearnIda';


const BackgroundImg = require('@/assets/images/BackgroundHome.ida.png');

export default function SuggestScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [productIndex, setProductIndex] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false); 
    const { user } = useAuth();

    const { height, width } = useWindowDimensions();

    const imageX = useSharedValue(0);
    const imageY = useSharedValue(0);

    const scroll = async (interaction: 'like' | 'dislike' | 'maybe') => {
        const currentItem = products[productIndex];
        
        // Update index first for immediate UI feedback
        setProductIndex(prev => prev + 1);

        // Send interaction in the background
        await sendInteraction(user ? user.id : "3000", currentItem, interaction);

        if (productIndex >= 40) {
            loadFeed();
            setProductIndex(0);
        }
    };

    const loadFeed = async () => {
        setLoading(true);
        try {
            const userId = user ? user.id : "3000";
            const response = await getFeed(userId);
            const data = await response.json();
            setProducts(data);
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

    const currentProduct = products[productIndex];

    const triggerZones: triggerZone[] = [
        { x: 0, y: 0, width: width * 0.10, height: height, onTrigger: () => scroll("dislike") },
        { x: width * 0.9, y: 0, width: width * 0.10, height: height, onTrigger: () => scroll("like") }
    ];

    return (
        <ImageBackground source={BackgroundImg} style={styles.container} resizeMode="cover">
             
                
            <View style={styles.overlay}>
                <Draggable 
                    translateX={imageX} 
                    translateY={imageY} 
                    triggerZones={triggerZones} 
                    shouldRotate 
                    rotationFactor={55} 
                    style={styles.imageContainer}
                >
                    <ImageViewer imgSource={currentProduct.image_url} />
                </Draggable>
                <Text style={styles.text}>{currentProduct.name}</Text>
            </View>
            {/* Header container to position the LearnIda pill top-left */}
                          <View style={styles.header}>
                            <LearnIda />
                          </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 0 : 20, // SafeAreaView handles the iOS notch
    left: 20,
    zIndex: 999, 
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