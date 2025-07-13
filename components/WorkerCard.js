import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WorkerCard({ worker }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{worker.name}</Text>
      <Text style={styles.role}>Role: {worker.role}</Text>
      <Text style={styles.equipment}>Equipment: {worker.requiredEquipment.join(', ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderColor: '#FFD700',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  name: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  role: {
    color: '#fff',
    marginTop: 5,
  },
  equipment: {
    color: '#ccc',
    marginTop: 5,
    fontStyle: 'italic',
  },
});
