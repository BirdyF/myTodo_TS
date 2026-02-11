import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

const TABS = [
  { label: 'My Day',    icon: 'sunny-outline',    iconActive: 'sunny',    path: '/my-day'   },
  { label: 'Important', icon: 'star-outline',      iconActive: 'star',     path: '/important'},
  { label: 'All Tasks', icon: 'list-outline',      iconActive: 'list',     path: '/'         },
  { label: 'Settings',  icon: 'settings-outline',  iconActive: 'settings', path: '/settings' },
] as const;

export function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/' || pathname === '/(drawer)' || pathname === '/(drawer)/index';
    return pathname.includes(path);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {TABS.map((tab) => {
        const active = isActive(tab.path);
        return (
          <TouchableOpacity
            key={tab.path}
            style={styles.tab}
            onPress={() => router.push(tab.path as any)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(active ? tab.iconActive : tab.icon) as any}
              size={22}
              color={active ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.label, active && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
