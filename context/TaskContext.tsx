import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TaskCategory = 'Personale' | 'Lavoro' | 'Studio' | 'Spesa';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  time: string;
  category: TaskCategory;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (text: string, date: string, time: string, category: TaskCategory) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  getStats: () => { completed: number; active: number; expired: number; total: number; rate: number };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);
const STORAGE_KEY = '@todo_tasks_storage';

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Carica i task salvati all'avvio dell'applicazione
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTasks !== null) {
          setTasks(JSON.parse(savedTasks));
        }
      } catch (error) {
        console.error("Errore nel caricamento dei task da AsyncStorage:", error);
      }
    };
    loadTasks();
  }, []);

  // Salva automaticamente i task ogni volta che lo stato cambia
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error("Errore nel salvataggio dei task su AsyncStorage:", error);
      }
    };
    saveTasks();
  }, [tasks]);

  const addTask = (text: string, date: string, time: string, category: TaskCategory) => {
    if (text.trim() === '') return;
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      date,
      time,
      completed: false,
      category,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const completeTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // Funzione per calcolare le statistiche in tempo reale
  const getStats = () => {
    const now = new Date();
    let completed = 0;
    let active = 0;
    let expired = 0;

    tasks.forEach((task) => {
      if (task.completed) {
        completed++;
      } else {
        const [year, month, day] = task.date.split('-').map(Number);
        const [hours, minutes] = task.time.split(':').map(Number);
        
        // Costruiamo la data esatta di scadenza senza problemi di fuso orario locale
        const taskDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

        if (now > taskDateTime) {
          expired++;
        } else {
          active++;
        }
      }
    });

    const total = tasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, active, expired, total, rate };
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, completeTask, deleteTask, getStats }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};