import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NewTaskScreen() {
  const [text, setText] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuovo Task</Text>
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Scrivi qui..." 
          placeholderTextColor="#666"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161622', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  inputContainer: { flexDirection: 'row' },
  input: { flex: 1, backgroundColor: '#1e1e2d', padding: 12, borderRadius: 8, color: '#fff', marginRight: 10 },
  addButton: { backgroundColor: '#2f95dc', justifyContent: 'center', alignItems: 'center', width: 50, borderRadius: 8 },
});