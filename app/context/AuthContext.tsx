import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, User } from '../types/auth';
import {userLogin, userSignup} from "@/services/APIHandler";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// App-wide authentication storage
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [newUser, setNewUser] = useState(true);
    const [loading, setLoading] = useState(true);
    const [homePage, setHomePage] = useState(true);

    const isAuthenticated = !!token && !!user;

    // Load stored session on app start
    useEffect(() => {
        loadStoredAuth();
    }, []);

    //Loads stored auth from previous app use
    const loadStoredAuth = async () => {
        try {
            const [storedToken, storedUser] = await Promise.all([
                SecureStore.getItemAsync('authToken'),
                AsyncStorage.getItem('userData'),
            ]);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                setNewUser(false);
            }


        } finally {
            setLoading(false);
        }
    };

    //Handles login overhead for authentication
    const login = async (username: string, password: string, mode: string) => {
        try {
            setLoading(true);

            //Logs in/Signs up with API call
            let response: any;
            if (mode === "login") response = await userLogin(username, password)
            else response = await userSignup(username, password)

            const data = await response.json();

            if(data.token) {
                const userData: User = {
                    id: data.userid,
                    username: username,
                    role: 'user'
                }

                //Storing credentials in storage
                await Promise.all([
                    SecureStore.setItemAsync('authToken', data.token),
                    AsyncStorage.setItem('userData', JSON.stringify(userData)),
                ]);

                setToken(data.token);
                setUser(userData);
                setNewUser(mode === "signup");
            }

            return data;
        } catch (error) {
            throw error
        } finally {
            setLoading(false);
        }
    };

    //Clear credentials from storage on logout
    const logout = async () => {
        await Promise.all([
            SecureStore.deleteItemAsync('authToken'),
            AsyncStorage.removeItem('userData'),
        ]);
        setToken(null);
        setUser(null);
        setHomePage(true);
    };

    //Sets up provider framework for React use
    return (
        <AuthContext.Provider
            value={{ user, token, isAuthenticated, newUser, loading, homePage, login, logout, setNewUser, setHomePage }}
        >
            {children}
        </AuthContext.Provider>
    );
}

//Exports provider for use
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};