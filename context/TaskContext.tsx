import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  time: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (text: string, date: string, time: string) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);
const STORAGE_KEY = '@todo_tasks_storage';

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTasks !== null) setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error(error);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error(error);
      }
    };
    saveTasks();
  }, [tasks]);

  const addTask = (text: string, date: string, time: string) => {
    if (text.trim() === '') return;
    setTasks([...tasks, { id: Date.now().toString(), text, completed: false, date, time }]);
  };

  const completeTask = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, completeTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks deve essere usato dentro un TaskProvider');
  return context;
}