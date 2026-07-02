import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks, TaskCategory, TaskPriority } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext'; // IMPORTATO
import ThemeSwitch from '../../context/ThemeSwitch'; // IMPORTATO
import { categoryColors, priorityColors } from './newtask';

type OrderType = 'Data' | 'Priorità' | 'Alfabetico';

export default function OldTaskScreen() {
  // Estratte le nuove funzioni dal Context modificato per gestire il Cestino
  const { tasks, completeTask, deleteTask, restoreTask, hardDeleteTask, toggleSubTask, addSubTask, deleteSubTask } = useTasks();
  const { colors, isDarkMode } = useTheme(); // ESTRATTO
  const now = new Date();

  // Stati locali per filtri, ricerca e ordinamento originali
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<TaskCategory | 'Tutti'>('Tutti');
  const [currentOrder, setCurrentOrder] = useState<OrderType>('Data');
  
  const [showOrderMenu, setShowOrderMenu] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newSubTaskText, setNewSubTaskText] = useState('');

  // Funzione di calcolo scadenza originale
  const isTaskExpired = (taskDate: string, taskTime: string) => {
    const [year, month, day] = taskDate.split('-').map(Number);
    const [hours, minutes] = taskTime.split(':').map(Number);
    const taskDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return now > taskDateTime;
  };

  // Calcola i giorni rimasti nel cestino prima dei 30 giorni
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

  // 1. APPLICAZIONE FILTRI DI RICERCA E CATEGORIA (Include tutti i task per vederli insieme)
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'Tutti' || task.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // 2. APPLICAZIONE LOGICA DI ORDINAMENTO SELEZIONATA originale
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

      {/* BARRA DI RICERCA + PULSANTE 3 LINEE (MENU) */}
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

      {/* PANNELLO DI ORDINAMENTO A SCOMPARSA */}
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

      {/* FILTRI CATEGORIA STATICI */}
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

      {/* LISTA DEI TASK */}
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
                  item.deleted && styles.trashTaskItem // Applica stile opaco se cestinato
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

                  {/* Scritta dinamica in base allo stato attivo o cestinato */}
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

                {/* Pulsanti Azione Condizionali */}
                <View style={styles.actions}>
                  {item.deleted ? (
                    <>
                      {/* Se cancellato: Bottone Ripristina */}
                      <TouchableOpacity onPress={() => restoreTask(item.id)} style={styles.iconButton}>
                        <Ionicons name="arrow-undo-outline" size={24} color="#2f95dc" />
                      </TouchableOpacity>
                      {/* Se cancellato: Bottone Eliminazione Definitiva */}
                      <TouchableOpacity onPress={() => Alert.alert('Elimina Definitivamente', 'Vuoi cancellare per sempre questo task?', [{ text: 'No' }, { text: 'Sì', onPress: () => hardDeleteTask(item.id) }])}>
                        <Ionicons name="trash-sharp" size={24} color="#ff4444" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      {/* Se Attivo: Pulsanti standard originali */}
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

              {/* SEZIONE SOTTO-TASK (Disponibile solo se il task non è cancellato) */}
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
  emptyText: { fontSize: 14 }
});