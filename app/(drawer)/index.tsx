import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '../../src/store/taskStore';
import { useTagStore } from '../../src/store/tagStore';
import { TaskItem } from '../../src/components/TaskItem';
import { AddTaskInput } from '../../src/components/AddTaskInput';
import { EmptyState } from '../../src/components/EmptyState';
import { Task } from '../../src/models/Task';
import { Colors } from '../../src/constants/colors';

export default function AllTasksScreen() {
  const router = useRouter();
  const { activeTasks, addTask, toggleComplete, toggleImportant } = useTaskStore();
  const { tags } = useTagStore();
  const tasks = activeTasks();

  const handleAddTask = useCallback(
    async (title: string) => {
      await addTask({ title });
    },
    [addTask]
  );

  const handleTaskPress = useCallback(
    (task: Task) => {
      router.push({ pathname: '/task-detail', params: { id: task.id } });
    },
    [router]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            tags={tags}
            onToggleComplete={toggleComplete}
            onToggleImportant={toggleImportant}
            onPress={handleTaskPress}
            showDragHandle
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-circle-outline"
            title="No tasks yet"
            subtitle="Add a task below to get started"
          />
        }
        contentContainerStyle={tasks.length === 0 ? styles.emptyContent : styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <AddTaskInput onAdd={handleAddTask} placeholder="Add a task..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  emptyContent: {
    flex: 1,
  },
});
