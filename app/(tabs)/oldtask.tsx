import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks, TaskCategory } from '../../context/TaskContext';
import { categoryColors } from './newtask';

export default function OldTaskScreen() {
  const { tasks, completeTask, deleteTask } = useTasks();
  const now = new Date();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<TaskCategory | 'Tutti'>('Tutti');

  const isTaskExpired = (taskDate: string, taskTime: string) => {
    const [year, month, day] = taskDate.split('-').map(Number);
    const [hours, minutes] = taskTime.split(':').map(Number);
    const taskDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return now > taskDateTime;
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'Tutti' || task.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tutti i Task</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cerca tra tutti i tuoi impegni..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterRow}>
        {(['Tutti', 'Personale', 'Lavoro', 'Studio', 'Spesa'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonSelected
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[styles.filterButtonText, selectedFilter === filter && styles.filterButtonTextSelected]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const expired = !item.completed && isTaskExpired(item.date, item.time);

          return (
            <View style={[
              styles.taskItem,
              item.completed && styles.completedItem,
              expired && styles.expiredItem
            ]}>
              <View style={styles.taskInfo}>
                <View style={styles.taskTextRow}>
                  <View style={[
                    styles.miniIndicator,
                    { backgroundColor: item.category ? categoryColors[item.category] : '#888' }
                  ]} />
                  <Text style={[styles.taskText, item.completed && styles.completedText]}>
                    {item.text}
                  </Text>
                </View>

                <Text style={[styles.dateText, item.completed && styles.completedDateText, expired && styles.expiredText]}>
                  {item.completed ? '✅ Completato' : expired ? '⚠️ Scaduto il:' : '📅 Scadenza:'} {item.date} alle {item.time}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => completeTask(item.id)} style={styles.iconButton}>
                  <Ionicons
                    name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                    size={24}
                    color={item.completed ? "#34C759" : expired ? "#ff8888" : "#2f95dc"}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                  <Ionicons name="trash-outline" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nessun task trovato con questi filtri.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161622', padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e2d', paddingHorizontal: 12, borderRadius: 8, marginBottom: 12, height: 45 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  filterButton: { backgroundColor: '#1e1e2d', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15 },
  filterButtonSelected: { backgroundColor: '#2f95dc' },
  filterButtonText: { color: '#888', fontSize: 12, fontWeight: '600' },
  filterButtonTextSelected: { color: '#fff' },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e2d', padding: 16, borderRadius: 8, marginBottom: 10 },
  completedItem: { backgroundColor: '#1b4d22', borderColor: '#34C759', borderWidth: 1 },
  expiredItem: { backgroundColor: '#7a1f1f', borderColor: '#ff4444', borderWidth: 1 },
  taskInfo: { flex: 1, marginRight: 10 },
  taskTextRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  miniIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  taskText: { fontSize: 16, color: '#fff' },
  completedText: { color: '#d1e7dd', textDecorationLine: 'line-through' },
  dateText: { fontSize: 12, color: '#888', marginTop: 4 },
  completedDateText: { color: '#a3cfbb' },
  expiredText: { color: '#ffcccc', fontWeight: 'bold' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginRight: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 30 },
  emptyText: { color: '#888', fontSize: 14 }
});