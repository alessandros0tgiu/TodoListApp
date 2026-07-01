import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TaskCategory = 'Personale' | 'Lavoro' | 'Studio' | 'Spesa';
export type TaskPriority = 'Alta' | 'Media' | 'Bassa';

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  time: string;
  category: TaskCategory;
  priority: TaskPriority;
  subTasks: SubTask[];
  // AGGIUNTO: Campi obbligatori per la gestione del Cestino
  deleted: boolean;
  deletedAt?: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (text: string, date: string, time: string, category: TaskCategory, priority: TaskPriority) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;         // Sposta nel cestino
  restoreTask: (id: string) => void;        // AGGIUNTO: Ripristina dal cestino
  hardDeleteTask: (id: string) => void;     // AGGIUNTO: Elimina definitivamente
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  addSubTask: (taskId: string, text: string) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
  getStats: () => { completed: number; active: number; expired: number; total: number; rate: number };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);
const STORAGE_KEY = '@todo_tasks_storage';

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTasks !== null) {
          const parsedTasks: Task[] = JSON.parse(savedTasks);
          
          // PULIZIA AUTOMATICA: Elimina i task nel cestino da più di 30 giorni
          const ora = new Date();
          const limiteTrentaGiorni = new Date();
          limiteTrentaGiorni.setDate(ora.getDate() - 30);

          const filteredTrashTasks = parsedTasks.filter((task) => {
            if (task.deleted && task.deletedAt) {
              const dataEliminazione = new Date(task.deletedAt);
              return dataEliminazione > limiteTrentaGiorni; // Tiene solo se sono passati meno di 30 giorni
            }
            return true;
          });

          setTasks(filteredTrashTasks);
        }
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

  const addTask = (text: string, date: string, time: string, category: TaskCategory, priority: TaskPriority) => {
    if (text.trim() === '') return;
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        completed: false,
        date,
        time,
        category,
        priority,
        subTasks: [],
        deleted: false, // Inizializzato come non eliminato
      },
    ]);
  };

  const completeTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  // MODIFICATO: Invece di fare il filter, imposta 'deleted: true' e registra il timestamp
  const deleteTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, deleted: true, deletedAt: new Date().toISOString() } : task
      )
    );
  };

  // AGGIUNTO: Ripristina il task e rimuove la data di eliminazione
  const restoreTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, deleted: false, deletedAt: undefined } : task
      )
    );
  };

  // AGGIUNTO: Rimuove definitivamente l'elemento dall'array (vecchio comportamento di deleteTask)
  const hardDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subTasks: task.subTasks.map((sub) =>
            sub.id === subTaskId ? { ...sub, completed: !sub.completed } : sub
          ),
        };
      })
    );
  };

  const addSubTask = (taskId: string, text: string) => {
    if (text.trim() === '') return;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subTasks: [
            ...task.subTasks,
            { id: Date.now().toString(), text, completed: false },
          ],
        };
      })
    );
  };

  const deleteSubTask = (taskId: string, subTaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subTasks: task.subTasks.filter((sub) => sub.id !== subTaskId),
        };
      })
    );
  };

  const getStats = () => {
    const now = new Date();
    let completed = 0;
    let active = 0;
    let expired = 0;
    let totalValidTasks = 0;

    tasks.forEach((task) => {
      // Ignora i task che si trovano nel cestino nel calcolo delle statistiche
      if (task.deleted) return;

      totalValidTasks++;

      if (task.completed) {
        completed++;
      } else {
        const [year, month, day] = task.date.split('-').map(Number);
        const [hours, minutes] = task.time.split(':').map(Number);
        const taskDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

        if (now > taskDateTime) {
          expired++;
        } else {
          active++;
        }
      }
    });

    const rate = totalValidTasks > 0 ? Math.round((completed / totalValidTasks) * 100) : 0;

    return { completed, active, expired, total: totalValidTasks, rate };
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        completeTask,
        deleteTask,
        restoreTask,
        hardDeleteTask,
        toggleSubTask,
        addSubTask,
        deleteSubTask,
        getStats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};