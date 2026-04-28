import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#ffd33d',
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
                name="about"
                options={{
                    title: 'About',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} color={color} size={24}/>
                    ),
                }}
            />
        </Tabs>
    );
}
