import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTasks } from '../../context/TaskContext';

export default function NewTaskScreen() {
  const { tasks, addTask, completeTask, deleteTask } = useTasks();
  const [text, setText] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const activeTasks = tasks.filter(t => !t.completed);

  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const formatTimeString = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

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

  const handleAdd = () => {
    if (text.trim() === '') return;
    addTask(text, formatDateString(currentDate), formatTimeString(currentDate));
    setText('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aggiungi un impegno</Text>
      
      <View style={styles.formContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Scrivi qui cosa devi fare..." 
          placeholderTextColor="#666"
          value={text}
          onChangeText={setText}
        />
        
        <View style={styles.rowInputs}>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={18} color="#2f95dc" style={{ marginRight: 8 }} />
            <Text style={styles.pickerButtonText}>{formatDateString(currentDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
            <Ionicons name="time-outline" size={18} color="#2f95dc" style={{ marginRight: 8 }} />
            <Text style={styles.pickerButtonText}>{formatTimeString(currentDate)}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker value={currentDate} mode="date" display="default" onChange={onDateChange} themeVariant="dark" />
        )}
        {showTimePicker && (
          <DateTimePicker value={currentDate} mode="time" is24Hour={true} display="default" onChange={onTimeChange} themeVariant="dark" />
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 5 }} />
          <Text style={styles.addButtonText}>Aggiungi</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>I tuoi task attivi</Text>
      <FlatList 
        data={activeTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const expired = isTaskExpired(item.date, item.time);
          return (
            <View style={[styles.taskItem, expired && styles.expiredItem]}>
              <View style={styles.taskInfo}>
                <Text style={styles.taskText}>{item.text}</Text>
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161622', padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  formContainer: { backgroundColor: '#1e1e2d', padding: 15, borderRadius: 8, marginBottom: 25 },
  input: { backgroundColor: '#161622', padding: 12, borderRadius: 6, color: '#fff', fontSize: 16, marginBottom: 15 },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  pickerButton: { flex: 0.48, backgroundColor: '#161622', padding: 12, borderRadius: 6, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  pickerButtonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  addButton: { backgroundColor: '#2f95dc', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 6 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e2d', padding: 14, borderRadius: 8, marginBottom: 10 },
  expiredItem: { backgroundColor: '#7a1f1f', borderColor: '#ff4444', borderWidth: 1 },
  taskInfo: { flex: 1, marginRight: 10 },
  taskText: { fontSize: 16, color: '#fff' },
  dateText: { fontSize: 12, color: '#888', marginTop: 3 },
  expiredText: { color: '#ffcccc', fontWeight: 'bold' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginRight: 15 }
});