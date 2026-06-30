import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../App';

interface OldTaskProps {
  tasks: Task[];
  completeTask: (id: string) => void; // <-- Aggiunto per gestire la deselezione
  deleteTask: (id: string) => void;
}

export default function OldTaskScreen({ tasks, completeTask, deleteTask }: OldTaskProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tutti i Task Completati</Text>

      <FlatList 
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>{item.text}</Text>
            <View style={styles.actions}>
              {/* Trasformata la spunta in un bottone per riattivare il task */}
              <TouchableOpacity onPress={() => completeTask(item.id)} style={styles.iconButton}>
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Ionicons name="trash-outline" size={24} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Non hai ancora completato nessun task.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161622', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e2d', padding: 16, borderRadius: 8, marginBottom: 10, opacity: 0.7 },
  taskText: { fontSize: 16, color: '#aaa', textDecorationLine: 'line-through', flex: 1, marginRight: 10 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginRight: 15 }, // Sostituito iconStyle con il margine corretto per il bottone
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#888', fontSize: 16 }
});