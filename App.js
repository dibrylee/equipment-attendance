// FILE: App.js

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import AdminDashboard from './screens/AdminDashboard';
import GuardScanner from './screens/GuardScanner';
import WorkersPage from './screens/WorkersPage';
import AttendanceLog from './screens/AttendanceLog';
import CreateAccount from './screens/CreateAccountScreen';

import { users as defaultUsers } from './data/users';

const Stack = createNativeStackNavigator();

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(defaultUsers);
  const [attendanceLog, setAttendanceLog] = useState([]);

  const handleLogin = (role, user) => {
    setUserRole(role);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentUser(null);
  };

  const handleMarkAttendance = (record) => {
    setAttendanceLog(prev => [...prev, record]);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userRole ? (
          <Stack.Screen name="Login">
            {() => (
              <LoginScreen
                onLogin={handleLogin}
                users={users}
              />
            )}
          </Stack.Screen>
        ) : userRole === 'admin' ? (
          <>
            <Stack.Screen name="AdminDashboard">
              {() => <AdminDashboard onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="WorkersPage">
              {() => <WorkersPage onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="AttendanceLog">
              {() => <AttendanceLog attendanceLog={attendanceLog} />}
            </Stack.Screen>
            <Stack.Screen name="CreateAccount">
              {() => (
                <CreateAccount
                  users={users}
                  setUsers={setUsers}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="GuardScanner">
            {() => (
              <GuardScanner
                onLogout={handleLogout}
                onMarkAttendance={handleMarkAttendance}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
