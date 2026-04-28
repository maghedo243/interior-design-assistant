import {Navigator, Redirect, Stack, usePathname, useRouter} from 'expo-router';
import 'react-native-reanimated';
import {AuthProvider, useAuth} from "@/context/AuthContext";
import {ActivityIndicator, View} from "react-native";
import {useEffect} from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

//Root of all navigation
function RootLayoutNav() {
    const { isAuthenticated, loading, newUser, homePage } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    //Switches between pages. Must be changed whenever a new page is added and not in tabs
    useEffect(() => {
        if (!loading) {
            if (homePage) {
                if (pathname !== '/') router.replace('/');
                return;
            }
            if (isAuthenticated && !newUser && pathname !== '/about') {
                router.replace('/about');
            }
            else if (!isAuthenticated && pathname !== '/login') {
                router.replace('/login');
            }
            else if (isAuthenticated && newUser && pathname !== '/interests') {
                router.replace('/interests');
            }
        }
    }, [isAuthenticated, loading, newUser, homePage]); //Called when any these properties change

    const getActiveScreen = () => { //gets correct screen to show
        if (homePage) return "index";
        if (!isAuthenticated) return "login";
        if (newUser) return "interests";
        return "(tabs)";
    }

    if (loading) null;

    console.log("Home: "+homePage)
    console.log("Auth: "+isAuthenticated)

    const activeName = getActiveScreen();

    console.log("Page Chosen: "+activeName)

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name={activeName} options={{ headerShown: false }} />
        </Stack>
    );
}


export default function RootLayout() {
    return (
        //AuthProvider needed to use auth provider in children
        //GestureHandlerRootView needed to use gesture based components in children
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <RootLayoutNav />
            </AuthProvider>
        </GestureHandlerRootView>
    );
}