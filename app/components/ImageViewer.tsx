import { ImageSourcePropType, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

type Props = {
    imgSource: ImageSourcePropType;
};

export default function ImageViewer({ imgSource }: Props) {
    return <Image source={imgSource} style={styles.image} />;
}

const styles = StyleSheet.create({
    image: {
        width: '80%',
        aspectRatio: 320 / 440,
        borderRadius: 18
    }
});