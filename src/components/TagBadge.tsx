import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tag } from '../models/Tag';

interface TagBadgeProps {
  tag: Tag;
  small?: boolean;
}

export function TagBadge({ tag, small = false }: TagBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: tag.colorHex + '22', borderColor: tag.colorHex },
        small && styles.badgeSmall,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: tag.colorHex },
          small && styles.textSmall,
        ]}
        numberOfLines={1}
      >
        {tag.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 4,
    marginTop: 4,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 10,
  },
});
