import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function OldTaskScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tutti i Task</Text>
      <Text style={styles.subtitle}>Qui vedrai lo storico dei tuoi task.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161622', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#888' },
});