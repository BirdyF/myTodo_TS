import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { InteractionManager } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../src/store/authStore';
import { useTaskStore } from '../src/store/taskStore';
import { useTagStore } from '../src/store/tagStore';
import { Colors } from '../src/constants/colors';

export default function RootLayout() {
  const { setUser } = useAuthStore();
  const { loadTasks } = useTaskStore();
  const { loadTags } = useTagStore();

  useEffect(() => {
    // Load local SQLite data immediately — fast, no network required
    loadTasks();
    loadTags();

    // Defer Firebase initialization until after first render + interactions.
    // This keeps the JS thread free during startup so the UI is responsive sooner.
    let unsubscribe: (() => void) | undefined;
    const task = InteractionManager.runAfterInteractions(async () => {
      const [{ onAuthStateChanged }, { auth }] = await Promise.all([
        import('firebase/auth'),
        import('../src/services/firebase'),
      ]);
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });
    });

    return () => {
      task.cancel();
      unsubscribe?.();
    };
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
