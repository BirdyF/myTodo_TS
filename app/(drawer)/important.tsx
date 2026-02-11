import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../../src/store/taskStore';
import { useTagStore } from '../../src/store/tagStore';
import { TaskItem } from '../../src/components/TaskItem';
import { EmptyState } from '../../src/components/EmptyState';
import { Task } from '../../src/models/Task';
import { Colors } from '../../src/constants/colors';

export default function ImportantScreen() {
  const router = useRouter();
  const tasks = useTaskStore((state) => state.tasks.filter((t) => t.isImportant && !t.isCompleted));
  const { toggleComplete, toggleImportant } = useTaskStore();
  const { tags } = useTagStore();

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
            icon="star-outline"
            title="No important tasks"
            subtitle="Tap the star on any task to mark it as important"
          />
        }
        contentContainerStyle={tasks.length === 0 ? styles.emptyContent : styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
