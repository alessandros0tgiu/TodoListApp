import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configura il comportamento delle notifiche inserendo i campi mancanti richiesti (shouldShowBanner, shouldShowList)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // CORRETTO: Aggiunto per compatibilità SDK 54+
    shouldShowList: true,   // CORRETTO: Aggiunto per compatibilità SDK 54+
  }),
});

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
  deleted: boolean;
  deletedAt?: string;
  notificationIds?: string[];
}

interface TaskContextType {
  tasks: Task[];
  addTask: (text: string, date: string, time: string, category: TaskCategory, priority: TaskPriority) => Promise<void>;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  restoreTask: (id: string) => void;
  hardDeleteTask: (id: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  addSubTask: (taskId: string, text: string) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
  getStats: () => { completed: number; active: number; expired: number; total: number; rate: number };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);
const STORAGE_KEY = '@todo_tasks_storage';

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // 1. Richiesta dei permessi all'avvio dell'app
  useEffect(() => {
    const requestPermissions = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Permessi notifiche rifiutati!');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTasks !== null) {
          const parsedTasks: Task[] = JSON.parse(savedTasks);

          const ora = new Date();
          const limiteTrentaGiorni = new Date();
          limiteTrentaGiorni.setDate(ora.getDate() - 30);

          const filteredTrashTasks = parsedTasks.filter((task) => {
            if (task.deleted && task.deletedAt) {
              const dataEliminazione = new Date(task.deletedAt);
              return dataEliminazione > limiteTrentaGiorni;
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

  const cancelTaskNotifications = async (notificationIds?: string[]) => {
    if (notificationIds && notificationIds.length > 0) {
      for (const id of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    }
  };

  const addTask = async (text: string, date: string, time: string, category: TaskCategory, priority: TaskPriority) => {
    if (text.trim() === '') return;

    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const targetDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
    const now = new Date();

    const scheduledIds: string[] = [];

    if (targetDate > now) {
      try {
        // Calcoliamo quanti secondi mancano da adesso al momento esatto della scadenza
        const secondiAllaScadenza = Math.floor((targetDate.getTime() - now.getTime()) / 1000);

        if (secondiAllaScadenza > 0) {
          // 1. Notifica al momento esatto della scadenza
          const idScadenza = await Notifications.scheduleNotificationAsync({
            content: {
              title: `⏰ Task Scaduto! [${category}]`,
              body: `Il tempo per "${text}" è scaduto!`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.MAX,
            },
            // CORRETTO: Usiamo un trigger basato su un timer in secondi (tipo nativo stabilissimo)
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: secondiAllaScadenza,
            },
          });
          scheduledIds.push(idScadenza);
        }

        // 2. Notifica 15 minuti prima della scadenza
        const secondiQuindiciPrima = secondiAllaScadenza - 15 * 60; // 15 minuti in secondi
        if (secondiQuindiciPrima > 0) {
          const idPreavviso = await Notifications.scheduleNotificationAsync({
            content: {
              title: `⏳ Scadenza imminente! (${priority})`,
              body: `Il task "${text}" scade tra 15 minuti.`,
              sound: true,
            },
            // CORRETTO: Usiamo lo stesso approccio stabile a secondi anche per il preavviso
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: secondiQuindiciPrima,
            },
          });
          scheduledIds.push(idPreavviso);
        }
      } catch (error) {
        console.error("Errore nella programmazione delle notifiche:", error);
      }
    }

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
        deleted: false,
        notificationIds: scheduledIds,
      },
    ]);
  };

  const completeTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const nextCompleted = !task.completed;
          if (nextCompleted) {
            cancelTaskNotifications(task.notificationIds);
          }
          return { ...task, completed: nextCompleted };
        }
        return task;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          cancelTaskNotifications(task.notificationIds);
          return { ...task, deleted: true, deletedAt: new Date().toISOString() };
        }
        return task;
      })
    );
  };

  const restoreTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, deleted: false, deletedAt: undefined } : task
      )
    );
  };

  const hardDeleteTask = (id: string) => {
    setTasks((prev) => {
      const taskDaRimuovere = prev.find((t) => t.id === id);
      cancelTaskNotifications(taskDaRimuovere?.notificationIds);
      return prev.filter((task) => task.id !== id);
    });
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