import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import Header from '../components/Header';

export default function AttendanceLog({ onLogout, attendanceLog }) {
  
  const exportToExcel = async () => {
    try {
      // Prepare data for Excel
      const excelData = attendanceLog.map((item, index) => ({
        'No.': index + 1,
        'Worker Name': item.worker,
        'Date': new Date(item.time).toLocaleDateString(),
        'Time': new Date(item.time).toLocaleTimeString(),
        'Full Timestamp': new Date(item.time).toLocaleString()
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 5 },   // No.
        { wch: 20 },  // Worker Name
        { wch: 12 },  // Date
        { wch: 12 },  // Time
        { wch: 25 }   // Full Timestamp
      ];
      ws['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance Log');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      
      // Create filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `attendance_log_${currentDate}.xlsx`;
      
      // Save file
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, excelBuffer, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Share or save file
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(fileUri);
      } else {
        // For Android, you might want to use a different approach
        await Sharing.shareAsync(fileUri);
      }

      Alert.alert('Success', 'Excel file has been exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export Excel file. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Attendance Log" onLogout={onLogout} />
      
      {/* Export Button */}
      <View style={styles.exportContainer}>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={exportToExcel}
          disabled={attendanceLog.length === 0}
        >
          <Text style={styles.exportButtonText}>📊 Export to Excel</Text>
        </TouchableOpacity>
        
        {attendanceLog.length > 0 && (
          <Text style={styles.recordCount}>
            {attendanceLog.length} record{attendanceLog.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <FlatList
        data={attendanceLog}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Text style={styles.worker}>{item.worker}</Text>
            <Text style={styles.timestamp}>{new Date(item.time).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No attendance records found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  exportContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  exportButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordCount: {
    color: '#ccc',
    fontSize: 14,
  },
  list: {
    padding: 20,
  },
  logItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  worker: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
  },
});