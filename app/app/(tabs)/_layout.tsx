import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
    return (
        <Tabs
        
            screenOptions={{
               
               
        // This line hides the top header globally for all tabs
                headerShown: false,
                // Color of the icon when selected
                tabBarActiveTintColor: '#ac76a4', 
                
                // Color of the icon when not selected
                tabBarInactiveTintColor: '#8e8e8e', 
                
                // This changes the actual bar background
                tabBarStyle: {
                    backgroundColor: '#1a0a0a',
                    borderTopWidth: 0,          
                    elevation: 0,               // Removes shadow
                },
                headerStyle: {
                    backgroundColor: '#1a0a0a',
                },
                headerTintColor: '#fff',
            }}
            initialRouteName="scan"
        >
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'camera-outline' : 'camera-outline'} color={color} size={24}/>
                    ),
                }}
            /> 
            <Tabs.Screen
                name="suggestswipe"
                options={{
                    title: 'Suggest',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'bulb' : 'bulb-outline'} color={color} size={24} />
                    ),
                }}
            />
        
            <Tabs.Screen
                name="login"
                options={{
                    title: 'log',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'bulb' : 'bulb-outline'} color={color} size={24} />
                    ),
                }}
            />
            
            <Tabs.Screen
                name="interests"
                options={{
                    title: 'inter',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'bulb' : 'bulb-outline'} color={color} size={24} />
                    ),
                }}

            />

            
        </Tabs>
    );
}