import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useTaskStore } from '../../src/store/taskStore';
import { useTagStore } from '../../src/store/tagStore';
import { Colors } from '../../src/constants/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, syncEnabled, setSyncEnabled, signInWithGoogle, signOut } = useAuthStore();
  const { syncWithFirebase, deleteCompletedTasks } = useTaskStore();
  const { syncWithFirebase: syncTags } = useTagStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncNow = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await syncWithFirebase(user.uid);
      await syncTags(user.uid);
      Alert.alert('Sync Complete', 'Your tasks have been synced successfully.');
    } catch (e) {
      Alert.alert('Sync Failed', 'Could not sync. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteCompleted = () => {
    Alert.alert(
      'Delete Completed Tasks',
      'This will permanently delete all completed tasks. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCompletedTasks(),
        },
      ]
    );
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      Alert.alert('Sign In Failed', 'Could not sign in with Google.');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Tags Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tags</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push('/manage-tags')}
        >
          <Ionicons name="pricetags" size={20} color={Colors.primary} />
          <Text style={styles.rowLabel}>Manage Tags</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* App Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => {
            useTaskStore.getState().loadTasks();
            useTagStore.getState().loadTags();
            Alert.alert('Reloaded', 'App data has been refreshed.');
          }}
        >
          <Ionicons name="refresh" size={20} color={Colors.primary} />
          <Text style={styles.rowLabel}>Reload App</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Cloud Sync Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cloud Sync</Text>

        {user ? (
          <>
            <View style={styles.accountRow}>
              <View style={styles.accountAvatar}>
                <Text style={styles.accountInitial}>
                  {user.email?.[0]?.toUpperCase() ?? 'U'}
                </Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>
                  {user.displayName ?? 'Signed In'}
                </Text>
                <Text style={styles.accountEmail}>{user.email}</Text>
              </View>
              <TouchableOpacity onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <Ionicons name="cloud" size={20} color={Colors.primary} />
              <Text style={styles.rowLabel}>Enable Sync</Text>
              <Switch
                value={syncEnabled}
                onValueChange={setSyncEnabled}
                thumbColor={Platform.OS === 'android' ? Colors.primary : undefined}
                trackColor={{ true: Colors.primaryLight }}
              />
            </View>

            {syncEnabled && (
              <TouchableOpacity
                style={[styles.row, styles.syncButton]}
                onPress={handleSyncNow}
                disabled={isSyncing}
              >
                <Ionicons
                  name={isSyncing ? 'sync' : 'cloud-upload'}
                  size={20}
                  color={Colors.primary}
                />
                <Text style={styles.rowLabel}>
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <TouchableOpacity style={styles.googleSignInButton} onPress={handleSignIn}>
            <Ionicons name="logo-google" size={20} color={Colors.surface} />
            <Text style={styles.googleSignInText}>Sign in with Google</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tasks Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push('/completed')}
        >
          <Ionicons name="checkmark-done" size={20} color={Colors.primary} />
          <Text style={styles.rowLabel}>Completed Tasks</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.row, styles.destructiveRow]}
          onPress={handleDeleteCompleted}
        >
          <Ionicons name="trash" size={20} color={Colors.error} />
          <Text style={[styles.rowLabel, styles.destructiveLabel]}>
            Delete All Completed Tasks
          </Text>
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
  content: {
    paddingVertical: 16,
  },
  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  accountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInitial: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  accountEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  signOutText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '600',
  },
  syncButton: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  googleSignInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 14,
    borderRadius: 12,
    gap: 10,
    borderTopWidth: 0,
  },
  googleSignInText: {
    color: Colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  destructiveRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  destructiveLabel: {
    color: Colors.error,
  },
});
