export const Colors = {
  primary: '#7C6FCD',
  primaryDark: '#5A4FA8',
  primaryLight: '#E8E5F8',
  accent: '#FF6B35',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#E0E0E0',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  important: '#FFB300',
  completed: '#999999',
  drawerBackground: '#F8F7FF',
  headerBackground: '#7C6FCD',
  headerText: '#FFFFFF',
};

export const TagColors = [
  '#7C6FCD', // purple (primary)
  '#4CAF50', // green
  '#2196F3', // blue
  '#FF9800', // orange
  '#F44336', // red
  '#009688', // teal
  '#795548', // brown
  '#607D8B', // blue-grey
  '#E91E63', // pink
  '#9C27B0', // deep purple
];

export function colorValueToHex(colorValue: number): string {
  // Flutter's Color uses ARGB 0xFFRRGGBB format
  const hex = colorValue.toString(16).padStart(8, '0');
  const r = hex.slice(2, 4);
  const g = hex.slice(4, 6);
  const b = hex.slice(6, 8);
  return `#${r}${g}${b}`;
}

export function hexToColorValue(hex: string): number {
  const clean = hex.replace('#', '');
  return parseInt(`FF${clean}`, 16);
}
