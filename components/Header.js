// FILE: components/Header.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function Header({ title, onLogout }) {
  const navigation = useNavigation();
  const route = useRoute();

  const hideBackButton = route.name === 'AdminDashboard' || route.name === 'GuardScanner';
  const showLogoutButton = route.name === 'AdminDashboard';

  return (
    <View style={styles.header}>
      {!hideBackButton ? (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}

      <Text style={styles.title}>{title}</Text>

      {showLogoutButton ? (
        <TouchableOpacity onPress={onLogout} style={styles.iconWrapper}>
          <Ionicons name="log-out-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 35, // prevent touching device notch
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#000',
    borderBottomColor: '#FFD700',
    borderBottomWidth: 2,
  },
  title: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  iconWrapper: {
    padding: 5,
  },
  iconPlaceholder: {
    width: 34, // match icon size + padding
  },
});
