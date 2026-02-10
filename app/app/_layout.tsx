import {Navigator, Redirect, Stack, usePathname, useRouter} from 'expo-router';
import 'react-native-reanimated';
import {AuthProvider, useAuth} from "@/context/AuthContext";
import {ActivityIndicator, View} from "react-native";
import {useEffect} from "react";

//Root of all navigation
function RootLayoutNav() {
    const { isAuthenticated, loading, newUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    //Switches between pages. Must be changed whenever a new page is added and not in tabs
    useEffect(() => {
        if (!loading) {
            if (isAuthenticated && !newUser && pathname !== '/(tabs)') {
                router.replace('/(tabs)');
            }
            else if (!isAuthenticated && pathname !== '/login') {
                router.replace('/login');
            }
            else if (isAuthenticated && newUser && pathname !== '/interests') {
                router.replace('/interests');
            }
        }
    }, [isAuthenticated, loading, newUser]); //Called when any these properties change

    if (loading) null;

    return (
        <Stack>
            {isAuthenticated && !newUser ? (
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            ) : isAuthenticated && newUser ? (
                <Stack.Screen name="interests" options={{ headerShown: false }} />
            ) : (
                <Stack.Screen name="login" options={{ headerShown: false }} />
            )}
        </Stack>
    );
}

export default function RootLayout() {
    return (
        //AuthProvider needed to use auth provider in children
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
    );
}