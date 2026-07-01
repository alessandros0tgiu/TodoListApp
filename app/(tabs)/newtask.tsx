import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTasks, TaskCategory, Task } from '../../context/TaskContext';

export const categoryColors: Record<TaskCategory, string> = {
  Personale: '#9b59b6',
  Lavoro: '#e67e22',
  Studio: '#2f95dc',
  Spesa: '#2ecc71',
};

export default function NewTaskScreen() {
  const { tasks, addTask, completeTask, deleteTask } = useTasks();
  // Memorizzano le scelte temporanee che l'utente fa sullo schermo prima di premere "Aggiungi Task".
  const [text, setText] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [category, setCategory] = useState<TaskCategory>('Personale');

  // Prende la lista di tutti i compiti dell'app e isola esclusivamente quelli che NON sono completati.
  const activeTasks = tasks.filter(t => !t.completed);

  const formatDateString = (date: Date) => date.toISOString().split('T')[0];

  const formatTimeString = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // FUNZIONE DI VERIFICA SCADENZA
  const isTaskExpired = (taskDate: string, taskTime: string) => {
    const now = new Date();
    const [year, month, day] = taskDate.split('-').map(Number);
    const [hours, minutes] = taskTime.split(':').map(Number);
    const taskDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return now > taskDateTime;
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) {
      const updatedDate = new Date(currentDate);
      updatedDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setCurrentDate(updatedDate);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selectedTime) {
      const updatedDate = new Date(currentDate);
      updatedDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setCurrentDate(updatedDate);
    }
  };

  const setNowDateTime = () => {
    setCurrentDate(new Date());
  };

  const handleAdd = () => {
    // Se l'utente non ha scritto nulla, mostra una finestra di avviso (Alert) e blocca il salvataggio
    if (text.trim() === '') {
      Alert.alert(
        'Attenzione',
        'Non puoi aggiungere un task vuoto. Inserisci una descrizione valida!',
        [{ text: 'OK' }]
      );
      return;
    }

    // Se il testo è valido, invia i dati formattati al contesto globale per aggiungerli alla memoria del telefono
    addTask(text, formatDateString(currentDate), formatTimeString(currentDate), category);
    setText('');
  };

  // La lista mostra semplicemente i compiti attivi ordinati per scadenza
  const sortedTasks = activeTasks.sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time}:00`);
    const dateTimeB = new Date(`${b.date}T${b.time}:00`);
    return dateTimeA.getTime() - dateTimeB.getTime();
  });

  return (
    <FlatList
      data={sortedTasks}
      keyExtractor={(item) => item.id}
      style={styles.container}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Aggiungi un impegno</Text>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Scrivi qui cosa devi fare..."
              placeholderTextColor="#666"
              value={text}
              onChangeText={setText}
            />

            <Text style={styles.label}>Assegna Categoria</Text>
            <View style={styles.categoryRow}>
              {(Object.keys(categoryColors) as TaskCategory[]).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: categoryColors[cat] },
                    category === cat && styles.categoryBadgeSelected
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={styles.categoryBadgeText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rowInputs}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Scadenza Giorno</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
                  <Ionicons name="calendar-outline" size={18} color="#2f95dc" style={{ marginRight: 8 }} />
                  <Text style={styles.pickerButtonText}>{formatDateString(currentDate)}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Scadenza Ora</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
                  <Ionicons name="time-outline" size={18} color="#2f95dc" style={{ marginRight: 8 }} />
                  <Text style={styles.pickerButtonText}>{formatTimeString(currentDate)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={currentDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                themeVariant="dark"
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={currentDate}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
                themeVariant="dark"
              />
            )}

            {Platform.OS === 'ios' && (showDatePicker || showTimePicker) && (
              <TouchableOpacity
                style={styles.closePickerBtn}
                onPress={() => { setShowDatePicker(false); setShowTimePicker(false); }}
              >
                <Text style={styles.closePickerTxt}>Conferma Orario/Data</Text>
              </TouchableOpacity>
            )}

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.nowButton} onPress={setNowDateTime}>
                <Ionicons name="flash" size={18} color="#FFCC00" style={{ marginRight: 5 }} />
                <Text style={styles.nowButtonText}>Attuale</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 5 }} />
                <Text style={styles.addButtonText}>Aggiungi Task</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>I tuoi compiti attivi</Text>
        </>
      }

      renderItem={({ item }) => {
        // Calcola se questo compito specifico ha superato l'orario massimo
        const expired = isTaskExpired(item.date, item.time);
        return (
          // Se il compito è scaduto, aggiunge una classe di stile "expiredItem" che colora lo sfondo di rosso scuro
          <View style={[styles.taskItem, expired && styles.expiredItem]}>
            <View style={styles.taskInfo}>
              <View style={styles.taskTextRow}>
                <View style={[styles.miniIndicator, { backgroundColor: categoryColors[item.category] || '#2f95dc' }]} />
                <Text style={styles.taskText}>{item.text}</Text>
              </View>
              <Text style={[styles.dateText, expired && styles.expiredText]}>
                {expired ? `⚠️ Scaduto il: ${item.date}` : `📅 Scadenza: ${item.date}`} alle {item.time}
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
          <Text style={styles.emptyText}>Ancora nessun impegno attivo aggiunto.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161622', padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  formContainer: { backgroundColor: '#1e1e2d', padding: 15, borderRadius: 8, marginBottom: 25 },
  input: { backgroundColor: '#161622', padding: 12, borderRadius: 6, color: '#fff', fontSize: 16, marginBottom: 12 },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  inputWrapper: { flex: 0.48 },
  label: { color: '#888', fontSize: 12, marginBottom: 5 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  categoryBadge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 15, opacity: 0.5 },
  categoryBadgeSelected: { opacity: 1, borderWidth: 2, borderColor: '#fff' },
  categoryBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  pickerButton: { backgroundColor: '#161622', padding: 12, borderRadius: 6, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  pickerButtonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  closePickerBtn: { backgroundColor: '#222', padding: 8, borderRadius: 6, alignItems: 'center', marginBottom: 15 },
  closePickerTxt: { color: '#2f95dc', fontWeight: 'bold' },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nowButton: { flex: 0.32, backgroundColor: '#2a2a3a', borderWidth: 1, borderColor: '#444', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 6 },
  nowButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  addButton: { flex: 0.64, backgroundColor: '#2f95dc', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 6 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e2d', padding: 14, borderRadius: 8, marginBottom: 10 },
  expiredItem: { backgroundColor: '#7a1f1f', borderColor: '#ff4444', borderWidth: 1 },
  taskInfo: { flex: 1, marginRight: 10 },
  taskTextRow: { flexDirection: 'row', alignItems: 'center' },
  miniIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  taskText: { fontSize: 16, color: '#fff' },
  dateText: { fontSize: 12, color: '#888', marginTop: 3 },
  expiredText: { color: '#ffcccc', fontWeight: 'bold' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginRight: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 10, paddingBottom: 30 },
  emptyText: { color: '#888', fontSize: 14 }
});