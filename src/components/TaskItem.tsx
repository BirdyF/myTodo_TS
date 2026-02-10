import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Task } from '../models/Task';
import { Tag } from '../models/Tag';
import { TagBadge } from './TagBadge';
import { Colors } from '../constants/colors';

interface TaskItemProps {
  task: Task;
  tags: Tag[];
  onToggleComplete: (id: string) => void;
  onToggleImportant: (id: string) => void;
  onPress: (task: Task) => void;
  showDragHandle?: boolean;
}

export function TaskItem({
  task,
  tags,
  onToggleComplete,
  onToggleImportant,
  onPress,
  showDragHandle = false,
}: TaskItemProps) {
  const taskTags = tags.filter((t) => task.tagIds.includes(t.id));

  const handleToggleComplete = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleComplete(task.id);
  }, [task.id, onToggleComplete]);

  const handleToggleImportant = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleImportant(task.id);
  }, [task.id, onToggleImportant]);

  return (
    <TouchableOpacity
      style={[styles.container, task.isCompleted && styles.containerCompleted]}
      onPress={() => onPress(task)}
      activeOpacity={0.7}
    >
      {/* Checkbox */}
      <TouchableOpacity
        onPress={handleToggleComplete}
        style={styles.checkbox}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View
          style={[
            styles.checkboxInner,
            task.isCompleted && styles.checkboxChecked,
          ]}
        >
          {task.isCompleted && (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            task.isCompleted && styles.titleCompleted,
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        {taskTags.length > 0 && (
          <View style={styles.tagsRow}>
            {taskTags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} small />
            ))}
          </View>
        )}
      </View>

      {/* Important star */}
      <TouchableOpacity
        onPress={handleToggleImportant}
        style={styles.starButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={task.isImportant ? 'star' : 'star-outline'}
          size={20}
          color={task.isImportant ? Colors.important : Colors.textMuted}
        />
      </TouchableOpacity>

      {/* Drag handle */}
      {showDragHandle && (
        <View style={styles.dragHandle}>
          <Ionicons name="reorder-three" size={20} color={Colors.textMuted} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  containerCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.completed,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  starButton: {
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  dragHandle: {
    paddingLeft: 8,
  },
});
