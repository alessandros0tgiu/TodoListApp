import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemeProvider, useTheme } from "../../context/ThemeContext"; // Importa il tema

function NavigationLayout() {
  const { colors, isDarkMode } = useTheme(); // Estrae i colori correnti

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background, // Dinamico
          borderTopColor: colors.border,       // Dinamico
        },
        tabBarActiveTintColor: '#2f95dc',
        tabBarInactiveTintColor: isDarkMode ? '#888' : '#6c757d',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="newtask"
        options={{
          title: "Nuovo Task",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="oldtask"
        options={{
          title: "Tutti i Task",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// Esporta il componente avvolto nel ThemeProvider principale
export default function TabLayout() {
  return (
    <ThemeProvider>
      <NavigationLayout />
    </ThemeProvider>
  );
}