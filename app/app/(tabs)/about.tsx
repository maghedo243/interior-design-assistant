import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { Text, View, StyleSheet } from 'react-native';

export default function AboutScreen(){
    const {logout} = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.text}>About screen</Text>
            <Button label="Logout" onPress={logout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2f2f2f',
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        color: '#fff'
    }
})