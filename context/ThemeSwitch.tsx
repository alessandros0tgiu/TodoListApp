import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext'; // Importa il tema

export default function ThemeSwitch() {
  const { isDarkMode, toggleTheme } = useTheme(); // Sincronizzato col contesto globale
  
  const animationValue = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

  // Sincronizza l'animazione grafica se lo stato cambia
  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: isDarkMode ? 1 : 0,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [isDarkMode]);

  const backgroundColor = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#3D7EAE', '#1D1F2C'],
  });

  const translateX = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 38],
  });

  const circleColor = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ECCA2F', '#C4C9D1'],
  });

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={toggleTheme}>
      <Animated.View style={[styles.container, { backgroundColor }]}>
        
        <Animated.View style={[styles.starsContainer, { opacity: animationValue }]}>
          <Ionicons name="sparkles" size={12} color="#fff" style={styles.star1} />
          <Ionicons name="star" size={6} color="#fff" style={styles.star2} />
        </Animated.View>

        <Animated.View 
          style={[
            styles.cloudsContainer, 
            { 
              opacity: animationValue.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
              transform: [{ translateY: animationValue.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }]
            }
          ]}
        >
          <View style={styles.cloudCard} />
        </Animated.View>

        <Animated.View style={[styles.circle, { transform: [{ translateX }], backgroundColor: circleColor }]}>
          {isDarkMode && (
            <View style={styles.moonSpots}>
              <View style={[styles.spot, { width: 4, height: 4, top: 4, left: 4 }]} />
              <View style={[styles.spot, { width: 3, height: 3, top: 12, left: 14 }]} />
              <View style={[styles.spot, { width: 5, height: 5, top: 10, left: 5 }]} />
            </View>
          )}
        </Animated.View>

      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: 76, height: 40, borderRadius: 20, padding: 2, justifyContent: 'center', position: 'relative', overflow: 'hidden', elevation: 4 },
  circle: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', position: 'absolute', left: 0, elevation: 2 },
  moonSpots: { width: '100%', height: '100%', position: 'relative' },
  spot: { position: 'absolute', backgroundColor: '#959DB1', borderRadius: 99, opacity: 0.6 },
  starsContainer: { position: 'absolute', right: 12, flexDirection: 'row', alignItems: 'center', width: 30, height: '100%' },
  star1: { position: 'absolute', left: 0, top: 8 },
  star2: { position: 'absolute', right: 2, bottom: 10, opacity: 0.8 },
  cloudsContainer: { position: 'absolute', left: 32, bottom: -6 },
  cloudCard: { width: 35, height: 18, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10 },
});