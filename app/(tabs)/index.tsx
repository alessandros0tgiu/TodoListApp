import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../context/TaskContext';
import { categoryColors, priorityColors } from './newtask';

export default function StatsScreen() {
  // Recupera l'elenco completo dei compiti e la funzione delle statistiche dal contesto globale
  const { tasks, getStats } = useTasks();
  const { completed, active, expired, total, rate } = getStats();

  const now = new Date();
  // Genera la stringa della data odierna nel formato YYYY-MM-DD per isolare i task odierni
  const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

  // Isola esclusivamente i compiti attivi (non completati) la cui scadenza è fissata per oggi
  const todayTasks = tasks.filter(task => task.date === todayStr && !task.completed);

  // Sistema di messaggi motivazionali basato sulla percentuale di completamento attuale
  const getMotivationalMessage = () => {
    if (total === 0) return "Nessun dato disponibile. Inizia ad aggiungere compiti!";
    if (rate === 100) return "🚀 Livello Divino! Hai completato ogni singolo task!";
    if (rate >= 75) return "🔥 Ottimo lavoro! Sei super produttivo oggi!";
    if (rate >= 40) return "⚡ Buona andatura, continua così e svuota la lista!";
    return "📈 Puoi fare di meglio! Metticela tutta!";
  };

  // Configurazione dei quattro riquadri riassuntivi delle statistiche generali
  const statCards = [
    { id: '1', title: 'Tasso Successo', value: `${rate}%`, icon: 'analytics-outline', color: '#2f95dc' },
    { id: '2', title: 'Completati', value: completed, icon: 'checkmark-circle-outline', color: '#2ecc71' },
    { id: '3', title: 'Rimasti Attivi', value: active, icon: 'hourglass-outline', color: '#e67e22' },
    { id: '4', title: 'Scaduti', value: expired, icon: 'alert-circle-outline', color: '#ff4444' },
  ];

  // Funzione per verificare se un task di oggi ha superato l'orario di scadenza
  const isTaskExpired = (taskDate: string, taskTime: string) => {
    const [year, month, day] = taskDate.split('-').map(Number);
    const [hours, minutes] = taskTime.split(':').map(Number);
    const taskDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return now > taskDateTime;
  };

  return (
    <View style={styles.container}>
      {/* Intestazione Principale */}
      <Text style={styles.welcomeText}>Stato Attività</Text>
      <Text style={styles.subtitle}>Controlla l'andamento dei tuoi impegni e i tuoi progressi:</Text>

      {/* Riquadro riassuntivo con Barra di Progresso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Avanzamento Generale</Text>
          <Text style={styles.progressValue}>{rate}%</Text>
        </View>
        
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${rate}%` }]} />
        </View>
        
        <Text style={styles.motivationalText}>{getMotivationalMessage()}</Text>
      </View>

      {/* Griglia a 2 colonne per le schede statistiche */}
      <View style={styles.statsWrapper}>
        <FlatList
          data={statCards}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          scrollEnabled={false} // Evita conflitti di scorrimento annidati
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Ionicons name={item.icon as any} size={24} color={item.color} style={{ marginBottom: 6 }} />
              <Text style={styles.cardValue}>{item.value}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
          )}
        />
      </View>

      {/* Sezione inferiore: Focus sui task importanti di oggi */}
      <Text style={styles.sectionTitle}>🔥 Focus di Oggi</Text>
      
      <FlatList 
        data={todayTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const expired = isTaskExpired(item.date, item.time);
          // Calcola quanti sotto-task sono stati completati per questo compito
          const totalSub = item.subTasks?.length || 0;
          const completedSub = item.subTasks?.filter(s => s.completed).length || 0;

          return (
            <View style={[styles.taskItem, expired && styles.expiredItem]}>
              <View style={styles.taskInfo}>
                <View style={styles.taskTextRow}>
                  {/* Spia circolare della categoria */}
                  <View style={[styles.miniIndicator, { backgroundColor: categoryColors[item.category] || '#2f95dc' }]} />
                  <Text style={styles.taskText} numberOfLines={1}>{item.text}</Text>
                  
                  {/* Badge compatto della priorità */}
                  <Text style={[styles.priorityTag, { color: priorityColors[item.priority] }]}>
                    {item.priority === 'Alta' ? '🔴' : item.priority === 'Media' ? '🟡' : '🟢'} {item.priority}
                  </Text>
                </View>

                {/* Mostra il contatore dei sotto-task se presenti */}
                {totalSub > 0 && (
                  <Text style={styles.subtaskCounter}>
                    <Ionicons name="git-merge-outline" size={12} color="#888" /> Checklist: {completedSub}/{totalSub} completati
                  </Text>
                )}

                <Text style={[styles.dateText, expired && styles.expiredText]}>
                  {expired ? `⚠️ Scaduto alle:` : `📅 Entro le:`} {item.time}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="sunny-outline" size={32} color="#FFCC00" style={{ marginBottom: 6 }} />
            <Text style={styles.emptyText}>Ottimo! Nessun task prioritario rimasto per oggi.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161622', padding: 20, paddingTop: 60 },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 20 },
  progressContainer: { backgroundColor: '#1e1e2d', padding: 16, borderRadius: 12, marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { color: '#fff', fontSize: 15, fontWeight: '600' },
  progressValue: { color: '#2f95dc', fontSize: 16, fontWeight: 'bold' },
  progressBarBg: { height: 8, backgroundColor: '#161622', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  progressBarFill: { height: '100%', backgroundColor: '#2f95dc', borderRadius: 4 },
  motivationalText: { color: '#a3cfbb', fontSize: 12, fontWeight: '500', fontStyle: 'italic' },
  statsWrapper: { marginBottom: 10 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: { flex: 0.48, backgroundColor: '#1e1e2d', padding: 12, borderRadius: 12, alignItems: 'center', minHeight: 95 },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  cardTitle: { fontSize: 11, color: '#888', fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginTop: 10, marginBottom: 12 },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e2d', padding: 14, borderRadius: 8, marginBottom: 10 },
  expiredItem: { backgroundColor: '#7a1f1f', borderColor: '#ff4444', borderWidth: 1 },
  taskInfo: { flex: 1 },
  taskTextRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 },
  miniIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  taskText: { fontSize: 15, color: '#fff', fontWeight: '500', flexShrink: 1 },
  priorityTag: { fontSize: 11, fontWeight: '700', marginLeft: 8 },
  subtaskCounter: { fontSize: 11, color: '#888', marginTop: 2, marginBottom: 2 },
  dateText: { fontSize: 12, color: '#888', marginTop: 2 },
  expiredText: { color: '#ffcccc', fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 15, backgroundColor: '#1e1e2d', padding: 20, borderRadius: 8 },
  emptyText: { color: '#888', fontSize: 13, textAlign: 'center' }
});