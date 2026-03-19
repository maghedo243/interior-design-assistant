import { ImageSourcePropType, StyleProp, StyleSheet, ImageStyle } from 'react-native';
import { Image } from 'expo-image';

type Props = {
    imgSource: string | ImageSourcePropType;
    style?: StyleProp<ImageStyle>;
};

export default function ImageViewer({ imgSource, style } : Props) {
    const finalSource = typeof imgSource === 'string'
        ? {
            uri: imgSource,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        }
        : imgSource;
    return <Image source={finalSource} style={[style, styles.image]} onError={(e) => console.log("Image Load Error:", e.error)}/>;
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        aspectRatio: 320 / 440,
        borderRadius: 18
    }
});