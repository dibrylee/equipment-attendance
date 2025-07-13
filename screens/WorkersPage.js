import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import Header from '../components/Header';
import WorkerCard from '../components/WorkerCard';
import { initialWorkers } from '../data/workers';

export default function WorkersPage({ onLogout }) {
  const [workers, setWorkers] = useState(initialWorkers);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState({
    helmet: true,
    vest: true,
    boots: true,
    gloves: false
  });

  // Generate random equipment codes
  const generateEquipmentCode = (type) => {
    const prefixes = {
      helmet: 'HLM',
      vest: 'VST',
      boots: 'BTS',
      gloves: 'GLV'
    };
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `${prefixes[type]}-${randomNum}`;
  };

  // Add new worker
  const addWorker = () => {
    if (!newWorkerName.trim()) {
      Alert.alert('Error', 'Please enter a worker name');
      return;
    }

    const requiredEquipment = Object.keys(selectedEquipment).filter(
      key => selectedEquipment[key]
    );

    if (requiredEquipment.length === 0) {
      Alert.alert('Error', 'Please select at least one equipment item');
      return;
    }

    const equipmentItems = {};
    requiredEquipment.forEach(equipment => {
      equipmentItems[equipment] = generateEquipmentCode(equipment);
    });

    const newWorker = {
      id: Math.max(...workers.map(w => w.id)) + 1,
      name: newWorkerName.trim(),
      requiredEquipment,
      equipmentItems
    };

    setWorkers([...workers, newWorker]);
    setNewWorkerName('');
    setSelectedEquipment({
      helmet: true,
      vest: true,
      boots: true,
      gloves: false
    });
    setIsAddModalVisible(false);
  };

  // Remove worker
  const removeWorker = (workerId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this worker?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setWorkers(workers.filter(worker => worker.id !== workerId));
          }
        }
      ]
    );
  };

  const renderWorker = ({ item }) => (
    <View style={styles.workerContainer}>
      <WorkerCard worker={item} />
      
      {/* Equipment Codes Display */}
      <View style={styles.equipmentCodesContainer}>
        <Text style={styles.equipmentCodesTitle}>Equipment Codes:</Text>
        {Object.entries(item.equipmentItems).map(([type, code]) => (
          <View key={type} style={styles.equipmentCodeRow}>
            <Text style={styles.equipmentType}>
              {type.charAt(0).toUpperCase() + type.slice(1)}:
            </Text>
            <Text style={styles.equipmentCode}>{code}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeWorker(item.id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEquipmentCheckbox = (equipment) => (
    <TouchableOpacity
      key={equipment}
      style={styles.checkboxContainer}
      onPress={() => setSelectedEquipment(prev => ({
        ...prev,
        [equipment]: !prev[equipment]
      }))}
    >
      <View style={[
        styles.checkbox,
        selectedEquipment[equipment] && styles.checkboxChecked
      ]}>
        {selectedEquipment[equipment] && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>
        {equipment.charAt(0).toUpperCase() + equipment.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Workers" onLogout={onLogout} />
      
      {/* Add Worker Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Worker</Text>
      </TouchableOpacity>

      <FlatList
        data={workers}
        keyExtractor={item => item.id.toString()}
        renderItem={renderWorker}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No workers found.</Text>
        }
      />

      {/* Add Worker Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Worker</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Worker Name"
              placeholderTextColor="#666"
              value={newWorkerName}
              onChangeText={setNewWorkerName}
            />

            <Text style={styles.equipmentTitle}>Required Equipment:</Text>
            <View style={styles.equipmentList}>
              {Object.keys(selectedEquipment).map(renderEquipmentCheckbox)}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addWorker}
              >
                <Text style={styles.confirmButtonText}>Add Worker</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  list: {
    padding: 16,
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  workerContainer: {
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
  },
  equipmentCodesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  equipmentCodesTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  equipmentCodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  equipmentType: {
    color: '#ccc',
    fontSize: 13,
    flex: 1,
  },
  equipmentCode: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  equipmentList: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});