// FILE: screens/AdminDashboard.js

import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';

export default function AdminDashboard({ onLogout }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Header title="Admin Dashboard" onLogout={onLogout} />

      <View style={styles.buttonGroup}>
        <Button
          title="Create Account"
          onPress={() => navigation.navigate('CreateAccount')}
          color="#FFD700"
        />
        <Button
          title="Manage Workers"
          onPress={() => navigation.navigate('WorkersPage')}
          color="#FFD700"
        />
        <Button
          title="View Attendance Log"
          onPress={() => navigation.navigate('AttendanceLog')}
          color="#FFD700"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  buttonGroup: {
    marginTop: 30,
    gap: 20,
    paddingHorizontal: 20,
  },
});
