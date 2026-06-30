import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './app/home';
import NewTaskScreen from './app/newtask';
import OldTaskScreen from './app/oldtask';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Nuovo Task') iconName = 'add-circle';
            else if (route.name === 'Tutti i Task') iconName = 'list';

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2f95dc',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: { backgroundColor: '#161622', borderTopWidth: 0 },
          headerStyle: { backgroundColor: '#161622' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ headerTitle: 'To do List App' }} />
        <Tab.Screen name="Nuovo Task" component={NewTaskScreen} />
        <Tab.Screen name="Tutti i Task" component={OldTaskScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}