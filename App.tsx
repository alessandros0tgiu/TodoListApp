import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './app/home';
import NewTaskScreen from './app/newtask';
import OldTaskScreen from './app/oldtask';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string; 
  time: string; 
}

const Tab = createBottomTabNavigator();
const STORAGE_KEY = '@todo_tasks_storage';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTasks !== null) {
          setTasks(JSON.parse(savedTasks));
        }
      } catch (error) {
        console.error("Errore nel caricamento dei task:", error);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error("Errore nel salvataggio dei task:", error);
      }
    };
    saveTasks();
  }, [tasks]);

  const addTask = (text: string, date: string, time: string) => {
    if (text.trim() === '') return;
    setTasks([...tasks, { 
      id: Date.now().toString(), 
      text, 
      completed: false, 
      date, 
      time 
    }]);
  };

  const completeTask = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: any = 'home';
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
        <Tab.Screen name="Home">
          {(props) => (
            <HomeScreen 
              {...props} 
              tasks={tasks} 
              completeTask={completeTask} 
              deleteTask={deleteTask} 
            />
          )}
        </Tab.Screen>
        
        <Tab.Screen name="Nuovo Task">
          {(props) => (
            <NewTaskScreen 
              {...props}
              tasks={tasks.filter(t => !t.completed)} 
              addTask={addTask} 
              completeTask={completeTask}
              deleteTask={deleteTask}
            />
          )}
        </Tab.Screen>
        
        <Tab.Screen name="Tutti i Task">
          {(props) => (
            <OldTaskScreen 
              {...props}
              tasks={tasks.filter(t => t.completed)} 
              completeTask={completeTask}
              deleteTask={deleteTask}
            />
          )}
        </Tab.Screen>

      </Tab.Navigator>
    </NavigationContainer>
  );
}