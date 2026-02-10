import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '../src/store/taskStore';
import { useTagStore } from '../src/store/tagStore';
import { TaskItem } from '../src/components/TaskItem';
import { EmptyState } from '../src/components/EmptyState';
import { Task } from '../src/models/Task';
import { Colors } from '../src/constants/colors';

export default function CompletedTasksScreen() {
  const navigation = useNavigation();
  const { completedTasks, toggleComplete, toggleImportant, deleteCompletedTasks } =
    useTaskStore();
  const { tags } = useTagStore();
  const tasks = completedTasks();

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Completed',
      'Permanently delete all completed tasks?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: deleteCompletedTasks,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {tasks.length > 0 && (
        <TouchableOpacity style={styles.deleteAllButton} onPress={handleDeleteAll}>
          <Ionicons name="trash-outline" size={16} color={Colors.error} />
          <Text style={styles.deleteAllText}>Delete All Completed</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            tags={tags}
            onToggleComplete={toggleComplete}
            onToggleImportant={toggleImportant}
            onPress={() => {}}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-done-circle-outline"
            title="No completed tasks"
            subtitle="Tasks you complete will appear here"
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
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: 6,
  },
  deleteAllText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '600',
  },
});
