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
  // Prendiamo la data di oggi in formato locale AAAA-MM-GG
  const todayStr = new Date().toISOString().split('T')[0];

  // Filtriamo: devono scadere OGGI e NON essere completati
  const todayTasks = tasks.filter(task => task.date === todayStr && !task.completed);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>👋 Bentornato!</Text>
      <Text style={styles.subtitle}>Ecco i tuoi impegni per la giornata di oggi:</Text>

      <FlatList 
        data={todayTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <View style={styles.taskInfo}>
              <Text style={styles.taskText}>{item.text}</Text>
              <Text style={styles.timeText}>🕒 Entro le ore: {item.time}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => completeTask(item.id)} style={styles.iconButton}>
                <Ionicons name="ellipse-outline" size={24} color="#2f95dc" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Ionicons name="trash-outline" size={24} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  taskInfo: { flex: 1, marginRight: 10 },
  taskText: { fontSize: 16, color: '#fff', fontWeight: '500' },
  timeText: { fontSize: 13, color: '#888', marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginRight: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#888', fontSize: 16, textAlign: 'center' }
});