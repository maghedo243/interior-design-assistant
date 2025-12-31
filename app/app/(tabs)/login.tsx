import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { userLogin, userSignup } from '@/services/APIHandler';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLogin, setIsLogin] = useState(true);

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setMessage('');
    };

    const handleLogin = async () => {
        try {
            const response = await userLogin(username, password)
            const data = await response.json();

            //Invalid login entry
            if (!data.token) {
                switch(data.message) {
                    case "password":
                        setMessage("Incorrect Password")
                        break;
                    case "user":
                        setMessage("Incorrect Username")
                        break;
                    default:
                        setMessage("Login Error")
                        break;
                }
                return;
            }

            // Success
            setMessage('Login successful!');
        } catch (error) {
            let errorMessage = "Failed to do something exceptional";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.error(errorMessage);
            setMessage('Network error');
        }
    };

    const handleSignup = async () => {
        try {
            //password validation
            if (password.length < 8) {
                setMessage('Password must be at least 8 characters long.');
                return;
            } else if (!/[A-Z]/.test(password)) {
                setMessage('Password must contain at least one uppercase letter.');
                return;
            } else if (!/[a-z]/.test(password)) {
                setMessage('Password must contain at least one lowercase letter.');
                return;
            } else if (!/\d/.test(password)) {
                setMessage('Password must contain at least one digit.');
                return;
            } else if (!/[@#$%^&*!.,]/.test(password)) {
                setMessage('Password must contain at least one special character.');
                return;
            }

            const response = await userSignup(username, password)
            const data = await response.json();

            //Invalid signup entry
            if (!data.token) {
                if(data.message === "exists") {
                    setMessage("Username taken")
                }
                return;
            }

            // Success
            setMessage('Signup successful!');
        } catch (error) {
            let errorMessage = "Failed to do something exceptional";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.error(errorMessage);
            setMessage('Network error');
        }
    };

    return (
        <View style={styles.container}>
            {isLogin ?
                (
                    <>
                        <Text style={styles.title}>Login</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            value={username}
                            onChangeText={setUsername}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <View style={styles.buttonWrapper}>
                            <Button title="Login" onPress={handleLogin} />
                        </View>
                        <View style={styles.buttonWrapper}>
                            <Button title="Create an account" onPress={toggleForm} />
                        </View>

                        {message ? <Text style={styles.message}>{message}</Text> : null}
                    </>
                ) :
                (
                    <>
                        <Text style={styles.title}>Signup</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            value={username}
                            onChangeText={setUsername}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <View style={styles.buttonWrapper}>
                            <Button title="Signup" onPress={handleSignup} />
                        </View>
                        <View style={styles.buttonWrapper}>
                            <Button title="Have an account?" onPress={toggleForm} />
                        </View>

                        {message ? <Text style={styles.message}>{message}</Text> : null}
                    </>
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    message: {
        marginTop: 15,
        textAlign: 'center',
        fontSize: 16,
    },
    buttonWrapper: {
        marginBottom: 5,
    }
});
