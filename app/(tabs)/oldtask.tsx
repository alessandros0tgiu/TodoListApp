import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks, TaskCategory, TaskPriority } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext'; 
import ThemeSwitch from '../../context/ThemeSwitch'; 
import { categoryColors, priorityColors } from './newtask';

type OrderType = 'Data' | 'Priorità' | 'Alfabetico';

export default function OldTaskScreen() {
  const { tasks, completeTask, deleteTask, restoreTask, hardDeleteTask, toggleSubTask, addSubTask, deleteSubTask } = useTasks();
  const { colors, isDarkMode } = useTheme();
  const now = new Date();

  // Stati per filtri, ricerca e ordinamento
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<TaskCategory | 'Tutti'>('Tutti');
  const [currentOrder, setCurrentOrder] = useState<OrderType>('Data');
  
  const [showOrderMenu, setShowOrderMenu] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newSubTaskText, setNewSubTaskText] = useState('');

  // Stati per la modale di conferma personalizzata
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  const isTaskExpired = (taskDate: string, taskTime: string) => {
    const [year, month, day] = taskDate.split('-').map(Number);
    const [hours, minutes] = taskTime.split(':').map(Number);
    const taskDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return now > taskDateTime;
  };

  const getDaysLeft = (deletedAt?: string) => {
    if (!deletedAt) return 30;
    const diffTime = now.getTime() - new Date(deletedAt).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = 30 - diffDays;
    return daysLeft > 0 ? daysLeft : 0;
  };

  const toggleExpand = (id: string) => {
    if (expandedTaskId === id) {
      setExpandedTaskId(null);
      setNewSubTaskText('');
    } else {
      setExpandedTaskId(id);
    }
  };

  const handleCreateSubTask = (taskId: string) => {
    if (newSubTaskText.trim() === '') return;
    addSubTask(taskId, newSubTaskText.trim());
    setNewSubTaskText('');
  };

  const triggerHardDelete = (id: string) => {
    setTaskToDeleteId(id);
    setIsModalVisible(true);
  };

  const confirmHardDelete = () => {
    if (taskToDeleteId) {
      hardDeleteTask(taskToDeleteId);
    }
    setIsModalVisible(false);
    setTaskToDeleteId(null);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'Tutti' || task.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const priorityWeight: Record<TaskPriority, number> = { Alta: 3, Media: 2, Bassa: 1 };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (currentOrder === 'Priorità') {
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
    }
    if (currentOrder === 'Alfabetico') {
      return a.text.localeCompare(b.text);
    }
    const dateTimeA = new Date(`${a.date}T${a.time}:00`);
    const dateTimeB = new Date(`${b.date}T${b.time}:00`);
    return dateTimeA.getTime() - dateTimeB.getTime();
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Tutti i Task</Text>
        <ThemeSwitch />
      </View>

      <View style={styles.headerActionsRow}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cerca impegni..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.menuButton, { backgroundColor: colors.card }, showOrderMenu && styles.menuButtonActive]} 
          onPress={() => setShowOrderMenu(!showOrderMenu)}
        >
          <Ionicons name="options-outline" size={22} color={showOrderMenu ? "#fff" : colors.textMuted} />
        </TouchableOpacity>
      </View>

      {showOrderMenu && (
        <View style={[styles.dropdownPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Ordina l'elenco per:</Text>
          <View style={styles.filterRow}>
            {(['Data', 'Priorità', 'Alfabetico'] as OrderType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.orderOptionButton,
                  { backgroundColor: colors.background },
                  currentOrder === type && styles.orderButtonSelected
                ]}
                onPress={() => {
                  setCurrentOrder(type);
                  setShowOrderMenu(false);
                }}
              >
                <Text style={[styles.filterButtonText, { color: colors.textMuted }, currentOrder === type && styles.filterButtonTextSelected]}>
                  {type === 'Data' ? '📅 Scadenza' : type === 'Priorità' ? '🔥 Priorità' : '🔤 Alfabetico'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.filterRow}>
        {(['Tutti', 'Personale', 'Lavoro', 'Studio', 'Spesa'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              { backgroundColor: colors.card },
              selectedFilter === filter && styles.filterButtonSelected
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[styles.filterButtonText, { color: colors.textMuted }, selectedFilter === filter && styles.filterButtonTextSelected]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 5 }}
        renderItem={({ item }) => {
          const expired = !item.completed && isTaskExpired(item.date, item.time);
          const isExpanded = expandedTaskId === item.id;

          return (
            <View style={[styles.taskWrapper, { backgroundColor: colors.card }]}>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => !item.deleted && toggleExpand(item.id)}
                disabled={item.deleted}
                style={[
                  styles.taskItem,
                  item.completed && !item.deleted && styles.completedItem,
                  expired && !item.deleted && { backgroundColor: colors.expiredBg, borderColor: colors.expiredBorder, borderWidth: 1 },
                  item.deleted && styles.trashTaskItem
                ]}
              >
                <View style={styles.taskInfo}>
                  <View style={styles.taskTextRow}>
                    <View style={[
                      styles.miniIndicator,
                      { backgroundColor: item.category ? categoryColors[item.category] : '#888' }
                    ]} />
                    <Text style={[styles.taskText, { color: colors.text }, item.completed && !item.deleted && styles.completedText, item.deleted && styles.trashText]}>
                      {item.text}
                    </Text>
                    <Text style={[styles.priorityTag, { color: priorityColors[item.priority] }]}>
                      • {item.priority}
                    </Text>
                  </View>

                  {item.deleted ? (
                    <Text style={[styles.dateText, { color: '#ffbb33', fontWeight: 'bold' }]}>
                      ⚠️ Nel Cestino (Rimozione automatica tra: {getDaysLeft(item.deletedAt)} gg)
                    </Text>
                  ) : (
                    <Text style={[styles.dateText, { color: colors.textMuted }, item.completed && styles.completedDateText, expired && { color: colors.expiredText, fontWeight: 'bold' }]}>
                      {item.completed ? '✅ Completato' : expired ? '⚠️ Scaduto il:' : '📅 Scadenza:'} {item.date} alle {item.time}
                    </Text>
                  )}
                </View>

                <View style={styles.actions}>
                  {item.deleted ? (
                    <>
                      <TouchableOpacity onPress={() => restoreTask(item.id)} style={styles.iconButton}>
                        <Ionicons name="arrow-undo-outline" size={24} color="#2f95dc" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => triggerHardDelete(item.id)}>
                        <Ionicons name="trash-sharp" size={24} color="#ff4444" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity onPress={() => completeTask(item.id)} style={styles.iconButton}>
                        <Ionicons
                          name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                          size={24}
                          color={item.completed ? "#34C759" : expired ? colors.expiredBorder : "#2f95dc"}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteTask(item.id)}>
                        <Ionicons name="trash-outline" size={24} color="#ff4444" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              {!item.deleted && isExpanded && (
                <View style={[styles.subTaskSection, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                  <Text style={[styles.subSectionTitle, { color: colors.textMuted }]}>📋 Checklist Sotto-task:</Text>
                  
                  {item.subTasks?.map((sub) => (
                    <View key={sub.id} style={[styles.subTaskItem, { borderBottomColor: colors.border }]}>
                      <TouchableOpacity style={styles.subCheckRow} onPress={() => toggleSubTask(item.id, sub.id)}>
                        <Ionicons 
                          name={sub.completed ? "checkbox" : "square-outline"} 
                          size={18} 
                          color={sub.completed ? "#34C759" : colors.textMuted} 
                        />
                        <Text style={[styles.subTaskText, { color: colors.text }, sub.completed && styles.subTaskTextCompleted]}>
                          {sub.text}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity onPress={() => deleteSubTask(item.id, sub.id)}>
                        <Ionicons name="close-circle-outline" size={18} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <View style={styles.subTaskInputRow}>
                    <TextInput
                      style={[styles.subTaskInput, { backgroundColor: colors.card, color: colors.text }]}
                      placeholder="Aggiungi micro-obiettivo..."
                      placeholderTextColor={colors.textMuted}
                      value={newSubTaskText}
                      onChangeText={setNewSubTaskText}
                    />
                    <TouchableOpacity style={styles.subTaskAddBtn} onPress={() => handleCreateSubTask(item.id)}>
                      <Ionicons name="add" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Nessun task trovato con questi filtri.</Text>
          </View>
        }
      />

      {/* MODALE DI CONFERMA ELIMINAZIONE CUSTOM */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalContent}>
              <Ionicons name="trash" size={48} color="#ff4444" style={styles.trashIcon} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sei sicuro?</Text>
              <Text style={[styles.modalDescription, { color: colors.textMuted }]}>
                Vuoi davvero procedere? Questa azione è definitiva e il compito non potrà più essere recuperato.
              </Text>
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: isDarkMode ? '#2a2a3a' : '#e2e8f0', borderColor: colors.border }]} 
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Annulla</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmButton} onPress={confirmHardDelete}>
                <Text style={styles.confirmButtonText}>Conferma</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  headerActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 8, height: 45 },
  searchInput: { flex: 1, fontSize: 15 },
  menuButton: { width: 45, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  menuButtonActive: { backgroundColor: '#e67e22' },
  dropdownPanel: { padding: 12, borderRadius: 8, marginBottom: 14, borderWidth: 1 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginLeft: 2 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  filterButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15 },
  filterButtonSelected: { backgroundColor: '#2f95dc' },
  orderOptionButton: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  orderButtonSelected: { backgroundColor: '#e67e22' },
  filterButtonText: { fontSize: 12, fontWeight: '600' },
  filterButtonTextSelected: { color: '#fff' },
  taskWrapper: { marginBottom: 12, borderRadius: 8, overflow: 'hidden' },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  trashTaskItem: { borderColor: '#444', borderWidth: 1, opacity: 0.4 },
  completedItem: { backgroundColor: '#1b4d22', borderColor: '#34C759', borderWidth: 1 },
  taskInfo: { flex: 1, marginRight: 10 },
  taskTextRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' },
  miniIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  taskText: { fontSize: 16, fontWeight: '500' },
  priorityTag: { fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  completedText: { color: '#d1e7dd', textDecorationLine: 'line-through' },
  trashText: { textDecorationLine: 'line-through', color: '#666' },
  dateText: { fontSize: 12, marginTop: 4 },
  completedDateText: { color: '#a3cfbb' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginRight: 15 },
  subTaskSection: { padding: 12, borderTopWidth: 1, marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 6 },
  subSectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  subTaskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#222' },
  subCheckRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  subTaskText: { fontSize: 14 },
  subTaskTextCompleted: { color: '#666', textDecorationLine: 'line-through' },
  subTaskInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  subTaskInput: { flex: 1, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 4, fontSize: 13 },
  subTaskAddBtn: { backgroundColor: '#2f95dc', width: 32, height: 32, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 30, padding: 10 },
  emptyText: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '85%', maxWidth: 320, borderRadius: 20, borderWidth: 1, padding: 24, alignItems: 'center', elevation: 10 },
  modalContent: { alignItems: 'center', marginBottom: 20 },
  trashIcon: { marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  modalDescription: { fontSize: 13, textAlign: 'center', lineHeight: 18, fontWeight: '500', paddingHorizontal: 5 },
  modalActionsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 12 },
  cancelButton: { flex: 1, paddingVertical: 10, borderRadius: 99, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  cancelButtonText: { fontSize: 14, fontWeight: '600' },
  confirmButton: { flex: 1, backgroundColor: '#ff4444', paddingVertical: 10, borderRadius: 99, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#ff4444' },
  confirmButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' }
});