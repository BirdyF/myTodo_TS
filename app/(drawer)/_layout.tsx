import React from 'react';
import { Drawer } from 'expo-router/drawer';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useTagStore } from '../../src/store/tagStore';
import { Colors } from '../../src/constants/colors';

function DrawerContent(props: Record<string, unknown>) {
  const router = useRouter();
  const pathname = usePathname();
  const { tags } = useTagStore();

  const navItems = [
    { label: 'All Tasks', icon: 'list', path: '/' as const },
    { label: 'My Day', icon: 'sunny', path: '/my-day' as const },
    { label: 'Important', icon: 'star', path: '/important' as const },
    { label: 'Settings', icon: 'settings', path: '/settings' as const },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/' || pathname === '/(drawer)';
    return pathname.includes(path);
  };

  return (
    <DrawerContentScrollView
      {...(props as any)}
      contentContainerStyle={styles.drawerContainer}
    >
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={32} color={Colors.primary} />
        <Text style={styles.headerTitle}>Lists</Text>
      </View>

      <View style={styles.section}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.path}
            style={[styles.navItem, isActive(item.path) && styles.navItemActive]}
            onPress={() => router.push(item.path as any)}
          >
            <Ionicons
              name={item.icon as any}
              size={20}
              color={isActive(item.path) ? Colors.primary : Colors.textSecondary}
            />
            <Text
              style={[
                styles.navLabel,
                isActive(item.path) && styles.navLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TAGS</Text>
          {tags.map((tag) => (
            <TouchableOpacity key={tag.id} style={styles.tagItem}>
              <View
                style={[styles.tagDot, { backgroundColor: tag.colorHex }]}
              />
              <Text style={styles.tagLabel}>{tag.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.createTagButton}
            onPress={() => router.push('/manage-tags')}
          >
            <Ionicons name="add" size={16} color={Colors.primary} />
            <Text style={styles.createTagText}>+ Create Tag</Text>
          </TouchableOpacity>
        </View>
      )}

      {tags.length === 0 && (
        <TouchableOpacity
          style={styles.createTagButton}
          onPress={() => router.push('/manage-tags')}
        >
          <Ionicons name="add" size={16} color={Colors.primary} />
          <Text style={styles.createTagText}>+ Create Tag</Text>
        </TouchableOpacity>
      )}
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.headerText,
        headerTitleStyle: { fontWeight: '700', fontSize: 20 },
        drawerStyle: {
          backgroundColor: Colors.drawerBackground,
          width: 280,
        },
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.textSecondary,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'All Tasks',
          drawerLabel: 'All Tasks',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="my-day"
        options={{
          title: 'My Day',
          drawerLabel: 'My Day',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="sunny" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="important"
        options={{
          title: 'Important',
          drawerLabel: 'Important',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="star" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          drawerLabel: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: Colors.drawerBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  section: {
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  navLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  navLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  tagDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tagLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  createTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  createTagText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});
