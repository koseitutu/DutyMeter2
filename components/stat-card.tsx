import { View, Text } from 'react-native';
import { Fonts } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/theme-provider';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
}

export function StatCard({ icon, label, value }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderCurve: 'continuous',
        boxShadow: `0 2px 8px ${colors.shadow}`,
      }}
    >
      <Ionicons name={icon} size={20} color={colors.accent} />
      <Text
        style={{
          fontFamily: Fonts.bold,
          fontSize: 22,
          color: colors.text,
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
          color: colors.textSecondary,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
