import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext'; // IMPORTATO: Hook del tema
import ThemeSwitch from '../../context/ThemeSwitch';
import { categoryColors, priorityColors } from './newtask';

export default function StatsScreen() {
  const { tasks, getStats } = useTasks();
  const { completed, active, expired, total, rate } = getStats();
  const { colors, isDarkMode } = useTheme(); // ESTRATTO: Colori di giorno/notte reattivi

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  const todayTasks = tasks.filter(task => task.date === todayStr && !task.completed);

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
    { id: '4', title: 'Scaduti', value: expired, icon: 'alert-circle-outline', color: '#ff4444' },
  ];

  const isTaskExpired = (taskDate: string, taskTime: string) => {
    const [year, month, day] = taskDate.split('-').map(Number);
    const [hours, minutes] = taskTime.split(':').map(Number);
    const taskDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return now > taskDateTime;
  };

  return (
    // DINAMICO: Colore di sfondo dello schermo principale
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        {/* DINAMICO: Colore del testo del titolo */}
        <Text style={[styles.welcomeText, { color: colors.text }]}>Stato Attività</Text>
        <ThemeSwitch />
      </View>
      {/* DINAMICO: Sottotitolo */}
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Controlla l'andamento dei tuoi impegni e i tuoi progressi:</Text>

      {/* DINAMICO: Card avanzamento */}
      <View style={[styles.progressContainer, { backgroundColor: colors.card }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.text }]}>Avanzamento Generale</Text>
          <Text style={styles.progressValue}>{rate}%</Text>
        </View>
        
        {/* DINAMICO: Sfondo barra */}
        <View style={[styles.progressBarBg, { backgroundColor: colors.progressBarBg }]}>
          <View style={[styles.progressBarFill, { width: `${rate}%` }]} />
        </View>
        
        {/* DINAMICO: Testo motivazionale verde chiaro di notte, verde più scuro/leggibile di giorno */}
        <Text style={[styles.motivationalText, { color: isDarkMode ? '#a3cfbb' : '#1e4620' }]}>{getMotivationalMessage()}</Text>
      </View>

      <View style={styles.statsWrapper}>
        <FlatList
          data={statCards}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
          renderItem={({ item }) => (
            // DINAMICO: Riquadri statistiche
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Ionicons name={item.icon as any} size={24} color={item.color} style={{ marginBottom: 6 }} />
              <Text style={[styles.cardValue, { color: colors.text }]}>{item.value}</Text>
              <Text style={[styles.cardTitle, { color: colors.textMuted }]}>{item.title}</Text>
            </View>
          )}
        />
      </View>

      {/* DINAMICO: Titolo sezione focus */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🔥 Focus di Oggi</Text>
      
      <FlatList 
        data={todayTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const expired = isTaskExpired(item.date, item.time);
          const totalSub = item.subTasks?.length || 0;
          const completedSub = item.subTasks?.filter(s => s.completed).length || 0;

          return (
            // DINAMICO: Item del task (colore normale o varianti di errore se scaduto)
            <View style={[
              styles.taskItem, 
              { backgroundColor: colors.card },
              expired && { backgroundColor: colors.expiredBg, borderColor: colors.expiredBorder, borderWidth: 1 }
            ]}>
              <View style={styles.taskInfo}>
                <View style={styles.taskTextRow}>
                  <View style={[styles.miniIndicator, { backgroundColor: categoryColors[item.category] || '#2f95dc' }]} />
                  {/* DINAMICO: Testo del task */}
                  <Text style={[styles.taskText, { color: colors.text }]} numberOfLines={1}>{item.text}</Text>
                  
                  <Text style={[styles.priorityTag, { color: priorityColors[item.priority] }]}>
                    {item.priority === 'Alta' ? '🔴' : item.priority === 'Media' ? '🟡' : '🟢'} {item.priority}
                  </Text>
                </View>

                {totalSub > 0 && (
                  <Text style={[styles.subtaskCounter, { color: colors.textMuted }]}>
                    <Ionicons name="git-merge-outline" size={12} color={colors.textMuted} /> Checklist: {completedSub}/{totalSub} completati
                  </Text>
                )}

                {/* DINAMICO: Testo dell'orario e scadenze */}
                <Text style={[styles.dateText, { color: colors.textMuted }, expired && { color: colors.expiredText, fontWeight: 'bold' }]}>
                  {expired ? `⚠️ Scaduto alle:` : `📅 Entro le:`} {item.time}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          // DINAMICO: Box vuoto se non ci sono task
          <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="sunny-outline" size={32} color="#FFCC00" style={{ marginBottom: 6 }} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Ottimo! Nessun task prioritario rimasto per oggi.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  welcomeText: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 13, marginBottom: 20 },
  progressContainer: { padding: 16, borderRadius: 12, marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 15, fontWeight: '600' },
  progressValue: { color: '#2f95dc', fontSize: 16, fontWeight: 'bold' },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  progressBarFill: { height: '100%', backgroundColor: '#2f95dc', borderRadius: 4 },
  motivationalText: { fontSize: 12, fontWeight: '500', fontStyle: 'italic' },
  statsWrapper: { marginBottom: 10 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: { flex: 0.48, padding: 12, borderRadius: 12, alignItems: 'center', minHeight: 95 },
  cardValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  cardTitle: { fontSize: 11, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 12 },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 8, marginBottom: 10 },
  taskInfo: { flex: 1 },
  taskTextRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 },
  miniIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  taskText: { fontSize: 15, fontWeight: '500', flexShrink: 1 },
  priorityTag: { fontSize: 11, fontWeight: '700', marginLeft: 8 },
  subtaskCounter: { fontSize: 11, marginTop: 2, marginBottom: 2 },
  dateText: { fontSize: 12, marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 15, padding: 20, borderRadius: 8 },
  emptyText: { fontSize: 13, textAlign: 'center' }
});