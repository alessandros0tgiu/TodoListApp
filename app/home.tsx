import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../App';

interface HomeScreenProps {
  tasks: Task[];
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

export default function HomeScreen({ tasks, completeTask, deleteTask }: HomeScreenProps) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Filtriamo i task di oggi non completati
  const todayTasks = tasks.filter(task => task.date === todayStr && !task.completed);

  // Funzione per verificare se il task è scaduto rispetto a ora
  const isTaskExpired = (taskDate: string, taskTime: string) => {
    const [hours, minutes] = taskTime.split(':').map(Number);
    const taskDateTime = new Date(taskDate);
    taskDateTime.setHours(hours, minutes, 0, 0);
    return now > taskDateTime;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>👋 Buongiorno!</Text>
      <Text style={styles.subtitle}>Ecco i tuoi impegni per la giornata di oggi:</Text>

      <FlatList 
        data={todayTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const expired = isTaskExpired(item.date, item.time);

          return (
            // Se è scaduto inseriamo lo stile "expiredItem", altrimenti quello normale
            <View style={[styles.taskItem, expired && styles.expiredItem]}>
              <View style={styles.taskInfo}>
                <Text style={styles.taskText}>{item.text}</Text>
                <Text style={[styles.timeText, expired && styles.expiredText]}>
                  {expired ? '⚠️ SCADUTO - ore:' : '🕒 Entro le ore:'} {item.time}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => completeTask(item.id)} style={styles.iconButton}>
                  <Ionicons name="ellipse-outline" size={24} color={expired ? '#ff8888' : '#2f95dc'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                  <Ionicons name="trash-outline" size={24} color={expired ? '#fff' : '#ff4444'} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="sunny-outline" size={48} color="#FFCC00" style={{ marginBottom: 10 }} />
            <Text style={styles.emptyText}>Nessun task programmato per oggi. Rilassati!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161622', padding: 20 },
  welcomeText: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 25 },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e2d', padding: 16, borderRadius: 8, marginBottom: 10 },
  expiredItem: { backgroundColor: '#7a1f1f', borderColor: '#ff4444', borderWidth: 1 }, // Sfondo rosso scuro per i task scaduti
  taskInfo: { flex: 1, marginRight: 10 },
  taskText: { fontSize: 16, color: '#fff', fontWeight: '500' },
  timeText: { fontSize: 13, color: '#888', marginTop: 4 },
  expiredText: { color: '#ffcccc', fontWeight: 'bold' }, // Testo dell'ora più chiaro/evidente se scaduto
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginRight: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#888', fontSize: 16, textAlign: 'center' }
});