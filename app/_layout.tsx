import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/services/firebase';
import { useAuthStore } from '../src/store/authStore';
import { useTaskStore } from '../src/store/taskStore';
import { useTagStore } from '../src/store/tagStore';
import { Colors } from '../src/constants/colors';

export default function RootLayout() {
  const { setUser } = useAuthStore();
  const { loadTasks } = useTaskStore();
  const { loadTags } = useTagStore();

  useEffect(() => {
    // Initialize local data
    loadTasks();
    loadTags();

    // Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen
          name="task-detail"
          options={{
            title: 'Task Detail',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.headerText,
            headerBackTitle: 'Back',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="manage-tags"
          options={{
            title: 'Manage Tags',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.headerText,
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="completed"
          options={{
            title: 'Completed Tasks',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.headerText,
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
