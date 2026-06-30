import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../context/TaskContext';

export default function StatsScreen() {
  const { getStats } = useTasks();
  const { completed, active, expired, total, rate } = getStats();

  // Sistema di traguardi / gamification basato sulla percentuale di completamento
  const getMotivationalMessage = () => {
    if (total === 0) return "Nessun dato disponibile. Inizia ad aggiungere compiti!";
    if (rate === 100) return "🚀 Livello Divino! Hai completato ogni singolo task!";
    if (rate >= 75) return "🔥 Ottimo lavoro! Sei super produttivo oggi!";
    if (rate >= 40) return "⚡ Buona andatura, continua così e svuota la lista!";
    return "📈 Puoi fare di meglio! Metticela tutta!";
  };

  const statCards = [
    { id: '1', title: 'Tasso Successo', value: `${rate}%`, icon: 'analytics-outline', color: '#2f95dc' },
    { id: '2', title: 'Completati', value: completed, icon: 'checkmark-circle-outline', color: '#2ecc71' },
    { id: '3', title: 'Rimasti Attivi', value: active, icon: 'hourglass-outline', color: '#e67e22' },
    { id: '4', title: 'Task Scaduti', value: expired, icon: 'alert-circle-outline', color: '#ff4444' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>I tuoi Progressi</Text>
      <Text style={styles.subtitle}>Monitora i tuoi progressi e mantieni la costanza:</Text>

      {/* GRAFICO / BARRA DI PROGRESSO ORIZZONTALE */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progresso Globale</Text>
          <Text style={styles.progressValue}>{rate}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${rate}%` }]} />
        </View>
        <Text style={styles.motivationalText}>{getMotivationalMessage()}</Text>
      </View>

      {/* GRIGLIA CARTE STATISTICHE */}
      <FlatList 
        data={statCards}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.cardRow}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Ionicons name={item.icon as any} size={28} color={item.color} style={{ marginBottom: 8 }} />
            <Text style={styles.cardValue}>{item.value}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161622', padding: 20, paddingTop: 60 },
  welcomeText: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 25 },
  progressContainer: { backgroundColor: '#1e1e2d', padding: 20, borderRadius: 12, marginBottom: 25 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  progressValue: { color: '#2f95dc', fontSize: 18, fontWeight: 'bold' },
  progressBarBg: { height: 10, backgroundColor: '#161622', borderRadius: 5, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', backgroundColor: '#2f95dc', borderRadius: 5 },
  motivationalText: { color: '#a3cfbb', fontSize: 13, fontWeight: '500', fontStyle: 'italic' },
  cardRow: { justifyContent: 'space-between', marginBottom: 15 },
  card: { flex: 0.48, backgroundColor: '#1e1e2d', padding: 20, borderRadius: 12, alignItems: 'center' },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  cardTitle: { fontSize: 13, color: '#888' }
});