import { StyleSheet, View, Pressable, Text} from 'react-native'
import React, {useState} from "react";

type Props = {
    icon? (size: number): React.ReactNode;
    label?: string;
    onPress?: () => void;
};

export default function Button({ icon, label, onPress }: Props){
    const [buttonHeight, setButtonHeight] = useState(0);

    const iconSize = buttonHeight * 0.5;

    return (
        <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={onPress} onLayout={(event) => {
                setButtonHeight(event.nativeEvent.layout.height);
            }}>
                {icon && buttonHeight > 0 ? icon(iconSize) : null}
                <Text style={styles.buttonLabel}>{label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: '100%',
        height: '100%',
        //marginHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
    },
    button: {
        borderRadius: 10,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#7f7f7f'
    },
    buttonLabel: {
        color: 'black',
        fontSize: 16,
    },
});