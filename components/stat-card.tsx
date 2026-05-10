import { View, Text } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
}

export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderCurve: 'continuous',
      }}
    >
      <Ionicons name={icon} size={20} color={Colors.accent} />
      <Text
        style={{
          fontFamily: Fonts.bold,
          fontSize: 22,
          color: Colors.text,
          marginTop: 4,
          fontVariant: ['tabular-nums'],
        }}
        selectable
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.regular,
          fontSize: 11,
          color: Colors.textSecondary,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
