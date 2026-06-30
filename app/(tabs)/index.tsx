import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../context/TaskContext';

export default function HomeScreen() {
  const { tasks, completeTask, deleteTask } = useTasks();
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

  const todayTasks = tasks.filter(task => task.date === todayStr && !task.completed);

  const isTaskExpired = (taskDate: string, taskTime: string) => {
    const [year, month, day] = taskDate.split('-').map(Number);
    const [hours, minutes] = taskTime.split(':').map(Number);
    const taskDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return now > taskDateTime;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Dashboard</Text>
      <Text style={styles.subtitle}>I tuoi impegni per la giornata di oggi:</Text>

      <FlatList 
        data={todayTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const expired = isTaskExpired(item.date, item.time);
          return (
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
            <Text style={styles.emptyText}>Nessun task programmato per oggi.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161622', padding: 20, paddingTop: 60 },
  welcomeText: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 25 },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e2d', padding: 16, borderRadius: 8, marginBottom: 10 },
  expiredItem: { backgroundColor: '#7a1f1f', borderColor: '#ff4444', borderWidth: 1 },
  taskInfo: { flex: 1, marginRight: 10 },
  taskText: { fontSize: 16, color: '#fff', fontWeight: '500' },
  timeText: { fontSize: 13, color: '#888', marginTop: 4 },
  expiredText: { color: '#ffcccc', fontWeight: 'bold' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginRight: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#888', fontSize: 16 }
});