import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../../src/store/taskStore';
import { useTagStore } from '../../src/store/tagStore';
import { TaskItem } from '../../src/components/TaskItem';
import { AddTaskInput } from '../../src/components/AddTaskInput';
import { EmptyState } from '../../src/components/EmptyState';
import { Task } from '../../src/models/Task';
import { Colors } from '../../src/constants/colors';

export default function MyDayScreen() {
  const router = useRouter();
  const tasks = useTaskStore((state) => state.tasks.filter((t) => t.isMyDay && !t.isCompleted));
  const { addTask, toggleComplete, toggleImportant } = useTaskStore();
  const { tags } = useTagStore();

  const handleAddTask = useCallback(
    async (title: string) => {
      await addTask({ title, isMyDay: true });
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
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="sunny-outline"
            title="No tasks for today"
            subtitle="Add tasks you want to focus on today"
          />
        }
        contentContainerStyle={tasks.length === 0 ? styles.emptyContent : styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <AddTaskInput onAdd={handleAddTask} placeholder="Add to My Day..." />
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
