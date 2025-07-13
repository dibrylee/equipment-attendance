// FILE: screens/GuardScanner.js

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  FlatList, Alert, ScrollView, TouchableOpacity
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Header from '../components/Header';
import { initialWorkers } from '../data/workers';
import { initialEquipment } from '../data/equipment';
import { users } from '../data/users';

export default function GuardScanner({ onLogout, onMarkAttendance }) {
  const [scanInput, setScanInput] = useState('');
  const [scannedItems, setScannedItems] = useState([]);
  const [currentWorkerCheck, setCurrentWorkerCheck] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  
  // Debug logging and safe initialization
  console.log('initialWorkers:', initialWorkers);
  console.log('initialEquipment:', initialEquipment);
  
  const workers = Array.isArray(initialWorkers) ? initialWorkers : [];
  const equipment = Array.isArray(initialEquipment) ? initialEquipment : [];

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    
    // Enhanced debugging
    console.log('Raw scanned data:', JSON.stringify(data));
    console.log('Data length:', data.length);
    console.log('Data characters:', data.split('').map(c => c.charCodeAt(0)));
    
    handleScan(data);
    setTimeout(() => setScanned(false), 2000);
  };

  // Helper function to find worker by equipment item
  const findWorkerByEquipment = (equipmentId) => {
    return workers.find(worker => {
      if (!worker.equipmentItems) return false;
      return Object.values(worker.equipmentItems).includes(equipmentId);
    });
  };

  // Helper function to get equipment type from worker's equipment items
  const getEquipmentType = (worker, equipmentId) => {
    if (!worker.equipmentItems) return null;
    
    for (const [type, id] of Object.entries(worker.equipmentItems)) {
      if (id === equipmentId) return type;
    }
    return null;
  };

  const handleScan = (qrCode) => {
    console.log('Scanning QR Code:', qrCode);
    console.log('Workers array:', workers);
    
    if (!Array.isArray(workers) || workers.length === 0) {
      Alert.alert('Error', 'Worker data is not available or empty.');
      return;
    }

    // Enhanced cleaning: trim, remove invisible characters, and normalize case
    const cleanedCode = qrCode.trim().replace(/[\r\n\t]/g, '').toUpperCase();
    console.log('Cleaned QR Code:', cleanedCode);
    console.log('Original vs Cleaned:', { original: qrCode, cleaned: cleanedCode });
    
    if (!cleanedCode) {
      Alert.alert('Error', 'QR code is empty');
      return;
    }

    // Find worker who owns this equipment
    const worker = findWorkerByEquipment(cleanedCode);
    
    if (!worker) {
      // Show available equipment IDs for debugging
      const allEquipmentIds = workers.flatMap(w => 
        w.equipmentItems ? Object.values(w.equipmentItems) : []
      );
      
      Alert.alert(
        'Equipment Not Found', 
        `No worker found with equipment ID: ${cleanedCode}\n\nThis equipment may not be assigned to any worker.\n\nAvailable equipment IDs: ${allEquipmentIds.join(', ')}`
      );
      return;
    }

    // Get equipment type
    const equipmentType = getEquipmentType(worker, cleanedCode);
    
    if (!equipmentType) {
      Alert.alert('Error', 'Could not determine equipment type');
      return;
    }

    // Create equipment item object
    const equipmentItem = {
      id: cleanedCode,
      type: equipmentType,
      assignedToWorker: worker.id,
      workerName: worker.name,
      uniqueId: cleanedCode
    };

    // Check if equipment is already scanned
    const alreadyScanned = scannedItems.find(item => 
      item.id === cleanedCode
    );
    
    if (alreadyScanned) {
      Alert.alert('Already Scanned', `Equipment "${equipmentType}" (${cleanedCode}) has already been scanned.`);
      return;
    }

    // Check if equipment belongs to the same worker as previously scanned items
    if (scannedItems.length > 0) {
      const firstWorker = scannedItems[0].assignedToWorker;
      if (equipmentItem.assignedToWorker !== firstWorker) {
        const firstWorkerName = workers.find(w => w.id === firstWorker)?.name || 'Unknown';
        Alert.alert(
          'Equipment Mismatch', 
          `This equipment belongs to ${equipmentItem.workerName} but you've already scanned equipment for ${firstWorkerName}.\n\nPlease complete the current worker's scan or clear the list.`
        );
        return;
      }
    }

    const newScanned = [...scannedItems, equipmentItem];
    setScannedItems(newScanned);
    
    // Show success message with equipment details
    Alert.alert(
      'Equipment Scanned', 
      `✓ ${equipmentType.toUpperCase()}\nEquipment ID: ${cleanedCode}\nAssigned to: ${equipmentItem.workerName}`
    );
    
    // Clear manual input after successful scan
    setScanInput('');
    
    checkWorkerIdentification(newScanned);
  };

  const checkWorkerIdentification = (scanned) => {
    console.log('Checking worker identification with scanned items:', scanned);
    console.log('Workers array:', workers);
    
    if (!Array.isArray(workers) || workers.length === 0) {
      Alert.alert('Error', 'Worker data is unavailable or empty');
      return;
    }

    if (!Array.isArray(scanned) || scanned.length === 0) {
      Alert.alert('Error', 'No scanned items provided');
      return;
    }

    const workerIds = [...new Set(scanned.map(item => item && item.assignedToWorker).filter(Boolean))];
    console.log('Worker IDs found:', workerIds);
    
    if (workerIds.length === 0) {
      Alert.alert('Error', 'No worker assignments found in scanned equipment');
      return;
    }
    
    if (workerIds.length !== 1) {
      setCurrentWorkerCheck({ status: 'error', message: 'Mixed equipment from multiple workers' });
      return;
    }

    const worker = workers.find(w => w && w.id === workerIds[0]);
    if (!worker) {
      Alert.alert('Error', `Worker not found for ID: ${workerIds[0]}`);
      return;
    }

    const scannedTypes = scanned.map(item => item && item.type).filter(Boolean);
    const missing = worker.requiredEquipment ? worker.requiredEquipment.filter(type => !scannedTypes.includes(type)) : [];

    setCurrentWorkerCheck({
      status: missing.length === 0 ? 'complete' : 'incomplete',
      worker,
      missing,
      scanned
    });
  };

  const handleMarkPresent = () => {
    if (!currentWorkerCheck || !currentWorkerCheck.worker) return;

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const status = hour < 8 || (hour === 8 && minute <= 0) ? 'Present' : 'Late';

    onMarkAttendance?.({
      worker: currentWorkerCheck.worker.name,
      time: now.toISOString(),
      status
    });

    Alert.alert('Success', `Worker marked as ${status}`);
    setScanInput('');
    setScannedItems([]);
    setCurrentWorkerCheck(null);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Items',
      'Are you sure you want to clear all scanned items?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setScannedItems([]);
            setCurrentWorkerCheck(null);
            setScanInput('');
          }
        }
      ]
    );
  };

  const removeScannedItem = (itemToRemove) => {
    const updatedItems = scannedItems.filter(item => item.id !== itemToRemove.id);
    setScannedItems(updatedItems);
    
    if (updatedItems.length === 0) {
      setCurrentWorkerCheck(null);
    } else {
      checkWorkerIdentification(updatedItems);
    }
  };

  if (!permission) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Header title="Checker QR Scanner" onLogout={onLogout} />

      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={scanInput}
          onChangeText={setScanInput}
          placeholder="Enter equipment ID manually (e.g., HLM-0382)"
          style={styles.input}
          onSubmitEditing={() => handleScan(scanInput)}
          autoCapitalize="characters"
        />
        <TouchableOpacity 
          style={[styles.manualButton, !scanInput.trim() && styles.disabledButton]} 
          onPress={() => handleScan(scanInput)}
          disabled={!scanInput.trim()}
        >
          <Text style={styles.manualButtonText}>Scan Manually</Text>
        </TouchableOpacity>
      </View>

      {scannedItems.length > 0 && (
        <View style={styles.scannedSection}>
          <Text style={styles.sectionTitle}>Scanned Equipment ({scannedItems.length})</Text>
          <FlatList
            data={scannedItems}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={({ item }) => (
              <View style={styles.scannedItem}>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.type.toUpperCase()}</Text>
                  <Text style={styles.itemDetail}>Equipment ID: {item.id}</Text>
                  <Text style={styles.itemDetail}>Assigned to: {item.workerName}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeScannedItem(item)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            )}
            style={styles.list}
          />
        </View>
      )}

      {currentWorkerCheck && (
        <View style={styles.resultBox}>
          <Text style={styles.status}>Worker Identification 👷</Text>
          <Text style={styles.workerName}>Name: {currentWorkerCheck.worker?.name}</Text>
          <Text style={styles.workerDetail}>Worker ID: {currentWorkerCheck.worker?.id}</Text>
          
          {currentWorkerCheck.missing?.length > 0 ? (
            <>
              <Text style={styles.missingTitle}>⚠️ Missing Equipment:</Text>
              <Text style={styles.missingList}>{currentWorkerCheck.missing.join(', ')}</Text>
              <View style={styles.cannotMarkContainer}>
                <Text style={styles.cannotMark}>❌ Cannot Mark Present</Text>
                <Text style={styles.cannotMarkSubtext}>All required equipment must be scanned</Text>
              </View>
            </>
          ) : (
            <View style={styles.completeContainer}>
              <Text style={styles.completeText}>✅ All Equipment Verified</Text>
              <TouchableOpacity style={styles.markPresent} onPress={handleMarkPresent}>
                <Text style={styles.markPresentText}>Mark Present</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.clearButton, scannedItems.length === 0 && styles.disabledButton]} 
          onPress={handleClearAll}
          disabled={scannedItems.length === 0}
        >
          <Text style={styles.clearButtonText}>Clear All Scanned Items</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 15,
  },
  camera: {
    height: 200,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden'
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    height: 45,
    fontSize: 14,
  },
  manualButton: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  manualButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scannedSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  list: {
    marginBottom: 10,
  },
  scannedItem: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  status: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  workerDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  missingTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#FF6B35',
    fontSize: 14,
  },
  missingList: {
    color: '#FF6B35',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  cannotMarkContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  cannotMark: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cannotMarkSubtext: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 2,
  },
  completeContainer: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  completeText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 10,
  },
  markPresent: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  markPresentText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    gap: 10,
  },
  clearButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'crimson',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center'
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold'
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  permissionButton: {
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  permissionButtonText: {
    color: '#000',
    fontWeight: 'bold'
  }
});