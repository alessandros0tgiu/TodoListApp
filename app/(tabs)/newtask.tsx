import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTasks, TaskCategory, TaskPriority } from '../../context/TaskContext';

// Mappa dei colori associati in modo fisso a ciascun tag di categoria
export const categoryColors: Record<TaskCategory, string> = {
  Personale: '#9b59b6', // Viola
  Lavoro: '#e67e22',    // Arancione
  Studio: '#2f95dc',    // Blu
  Spesa: '#2ecc71',     // Verde
};

// Mappa dei colori associati ai tre livelli di priorità
export const priorityColors: Record<TaskPriority, string> = {
  Alta: '#ff4444',   // Rosso
  Media: '#ffbb33',  // Giallo/Arancione
  Bassa: '#00C851',  // Verde
};

export default function NewTaskScreen() {
  // Integrazione con lo stato globale (Context)
  const { addTask } = useTasks();
  
  // Stati locali del form
  const [text, setText] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [category, setCategory] = useState<TaskCategory>('Personale');
  const [priority, setPriority] = useState<TaskPriority>('Media');
  
  // Formattatori di supporto per data e ora
  const formatDateString = (date: Date) => date.toISOString().split('T')[0];
  
  const formatTimeString = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Gestori del cambio di data e ora nei picker nativi
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

  // Sincronizza istantaneamente data e ora al momento attuale
  const setNowDateTime = () => {
    setCurrentDate(new Date());
  };

  // Validazione ed invio del form al Context globale
  const handleAdd = () => {
    if (text.trim() === '') {
      Alert.alert(
        'Attenzione',
        'Non puoi aggiungere un task vuoto. Inserisci una descrizione valida!',
        [{ text: 'OK' }]
      );
      return;
    }
    
    addTask(text, formatDateString(currentDate), formatTimeString(currentDate), category, priority);
    setText('');
    setPriority('Media'); // Reset della priorità sul valore di default
    
    Alert.alert('Successo', 'Task aggiunto correttamente!', [{ text: 'Ottimo' }]);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Aggiungi un impegno</Text>
      
      <View style={styles.formContainer}>
        {/* Input descrizione task */}
        <TextInput 
          style={styles.input} 
          placeholder="Scrivi qui cosa devi fare..." 
          placeholderTextColor="#666"
          value={text}
          onChangeText={setText}
        />

        {/* Selezione Categoria */}
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

        {/* Selezione del Livello di Priorità */}
        <Text style={styles.label}>Livello di Priorità</Text>
        <View style={styles.categoryRow}>
          {(Object.keys(priorityColors) as TaskPriority[]).map((prio) => (
            <TouchableOpacity
              key={prio}
              style={[
                styles.priorityBadge,
                { borderColor: priorityColors[prio], borderWidth: 1 },
                priority === prio && { backgroundColor: priorityColors[prio] }
              ]}
              onPress={() => setPriority(prio)}
            >
              <Text style={[
                styles.priorityBadgeText,
                priority === prio ? { color: '#fff' } : { color: priorityColors[prio] }
              ]}>
                {prio === 'Alta' ? '🔴 Alta' : prio === 'Media' ? '🟡 Media' : '🟢 Bassa'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Date e Time Pickers triggers */}
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

        {/* Pulsanti inferiori di azione */}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161622', padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  formContainer: { backgroundColor: '#1e1e2d', padding: 16, borderRadius: 10, marginBottom: 25 },
  input: { backgroundColor: '#161622', color: '#fff', padding: 12, borderRadius: 6, fontSize: 16, marginBottom: 15 },
  label: { color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 15, flexWrap: 'wrap' },
  categoryBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, opacity: 0.6 },
  categoryBadgeSelected: { opacity: 1, borderWidth: 1.5, borderColor: '#fff' },
  categoryBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  priorityBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: 'transparent' },
  priorityBadgeText: { fontSize: 12, fontWeight: '700' },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  inputWrapper: { flex: 0.47 },
  pickerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161622', padding: 12, borderRadius: 6, height: 45 },
  pickerButtonText: { color: '#fff', fontSize: 14 },
  closePickerBtn: { backgroundColor: '#222', padding: 8, borderRadius: 6, alignItems: 'center', marginBottom: 15 },
  closePickerTxt: { color: '#2f95dc', fontWeight: 'bold' },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nowButton: { flex: 0.32, backgroundColor: '#2a2a3a', borderWidth: 1, borderColor: '#444', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 6 },
  nowButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  addButton: { flex: 0.64, backgroundColor: '#2f95dc', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 6 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});