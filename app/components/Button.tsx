import { StyleSheet, Pressable, Text, ViewStyle, StyleProp, TextStyle} from 'react-native'
import React, {useState} from "react";

type Props = {
    icon? (size: number): React.ReactNode;
    label?: string;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
};

export default function Button({ icon, label, onPress, style, textStyle }: Props){
    const [buttonHeight, setButtonHeight] = useState(0);

    const iconSize = buttonHeight * 0.5;

    return (
        <Pressable style={style} onPress={onPress} onLayout={(event) => {
            setButtonHeight(event.nativeEvent.layout.height);
        }}>
            {icon && buttonHeight > 0 ? icon(iconSize) : null}
            <Text style={[textStyle, styles.defaultLabelStyle]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    defaultLabelStyle: {
        alignSelf: 'center'
    }
});