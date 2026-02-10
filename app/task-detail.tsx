import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '../src/store/taskStore';
import { useTagStore } from '../src/store/tagStore';
import { TagBadge } from '../src/components/TagBadge';
import { Colors } from '../src/constants/colors';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks, updateTask, deleteTask } = useTaskStore();
  const { tags } = useTagStore();

  const task = tasks.find((t) => t.id === id);
  const [title, setTitle] = useState(task?.title ?? '');
  const [note, setNote] = useState(task?.note ?? '');
  const [isImportant, setIsImportant] = useState(task?.isImportant ?? false);
  const [isMyDay, setIsMyDay] = useState(task?.isMyDay ?? false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(task?.tagIds ?? []);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(true);
  }, [title, note, isImportant, isMyDay, selectedTagIds]);

  const handleSave = async () => {
    if (!task || !title.trim()) return;
    await updateTask(task.id, {
      title: title.trim(),
      note: note.trim() || undefined,
      isImportant,
      isMyDay,
      tagIds: selectedTagIds,
    });
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (task) {
            await deleteTask(task.id);
            router.back();
          }
        },
      },
    ]);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  if (!task) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Task not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Title */}
      <View style={styles.card}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Task title..."
          placeholderTextColor={Colors.textMuted}
          multiline
          autoFocus={false}
        />
      </View>

      {/* Note */}
      <View style={styles.card}>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Add a note..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Toggles */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <Ionicons name="star" size={20} color={Colors.important} />
          <Text style={styles.toggleLabel}>Important</Text>
          <Switch
            value={isImportant}
            onValueChange={setIsImportant}
            thumbColor={Platform.OS === 'android' ? Colors.primary : undefined}
            trackColor={{ true: Colors.primaryLight }}
          />
        </View>
        <View style={[styles.toggleRow, styles.toggleRowBorder]}>
          <Ionicons name="sunny" size={20} color={Colors.warning} />
          <Text style={styles.toggleLabel}>My Day</Text>
          <Switch
            value={isMyDay}
            onValueChange={setIsMyDay}
            thumbColor={Platform.OS === 'android' ? Colors.primary : undefined}
            trackColor={{ true: Colors.primaryLight }}
          />
        </View>
      </View>

      {/* Tags */}
      {tags.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Tags</Text>
          <View style={styles.tagsGrid}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                onPress={() => toggleTag(tag.id)}
                style={[
                  styles.tagOption,
                  selectedTagIds.includes(tag.id) && {
                    borderColor: tag.colorHex,
                    backgroundColor: tag.colorHex + '22',
                  },
                ]}
              >
                <View style={[styles.tagDot, { backgroundColor: tag.colorHex }]} />
                <Text style={styles.tagOptionText}>{tag.name}</Text>
                {selectedTagIds.includes(tag.id) && (
                  <Ionicons name="checkmark" size={14} color={tag.colorHex} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={!title.trim()}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash" size={18} color={Colors.error} />
          <Text style={styles.deleteButtonText}>Delete Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    minHeight: 40,
  },
  noteInput: {
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
    lineHeight: 22,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 12,
  },
  toggleRowBorder: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 6,
  },
  tagDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tagOptionText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  actions: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 40,
    gap: 12,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.error,
    paddingVertical: 14,
    gap: 8,
  },
  deleteButtonText: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: '600',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
});
