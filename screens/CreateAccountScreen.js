import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';

export default function CreateAccountScreen({ users, setUsers, currentUser, onLogout }) {
  const navigation = useNavigation(); // ✅ FIXED

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('guard'); // default to guard

  const handleCreate = () => {
    if (currentUser?.role !== 'admin') {
      Alert.alert('Access Denied', 'Only Admins can create accounts.');
      return;
    }

    if (!username || !password || !role) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    const userExists = users.find(u => u.username === username);
    if (userExists) {
      Alert.alert('Duplicate', 'Username already exists.');
      return;
    }

    const newUser = { username, password, role };
    setUsers([...users, newUser]);
    Alert.alert('Success', `${role.charAt(0).toUpperCase() + role.slice(1)} account created.`);
    navigation.goBack(); // ✅ Now this works
  };

  return (
    <View style={styles.container}>
      <Header title="Create Account" onLogout={onLogout} />
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Role</Text>
      <View style={styles.roleButtons}>
        <Button
          title="Admin"
          color={role === 'admin' ? '#FFD700' : '#ccc'}
          onPress={() => setRole('admin')}
        />
        <Button
          title="Checker"
          color={role === 'guard' ? '#FFD700' : '#ccc'}
          onPress={() => setRole('guard')}
        />
      </View>

      <View style={styles.createBtn}>
        <Button title="Create Account" onPress={handleCreate} color="#1E1E1E" />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  createBtn: {
    marginTop: 20,
  },
});
