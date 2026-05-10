import { View, Text, Pressable } from 'react-native';
import { Fonts } from '@/constants/Typography';
import { Session } from '@/store/types';
import { formatSessionDate } from '@/utils/date-helpers';
import { useTheme } from '@/components/theme-provider';

interface SessionCardProps {
  session: Session;
  onPress?: () => void;
  compact?: boolean;
}

export function SessionCard({ session, onPress, compact = false }: SessionCardProps) {
  const { colors } = useTheme();
  const dateStr = formatSessionDate(session.date, session.time);

  // Support both old single-position and new multi-position format
  const positionsDisplay = session.positions
    ? session.positions.join(', ')
    : (session as any).position || 'Unknown';

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderCurve: 'continuous',
            paddingVertical: compact ? 12 : 16,
            paddingHorizontal: 16,
            borderLeftWidth: 3,
            borderLeftColor: colors.accent,
            opacity: pressed ? 0.9 : 1,
            boxShadow: `0 2px 8px ${colors.shadow}`,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: Fonts.semiBold,
                  fontSize: 14,
                  color: colors.text,
                }}
                selectable
              >
                {dateStr} · {session.durationMinutes} min
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {positionsDisplay}
                {session.rounds > 1 ? ` · ${session.rounds} rounds` : ''}
              </Text>
            </View>
            {!compact && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 13,
                    color: session.orgasm ? colors.success : colors.error,
                  }}
                >
                  {session.orgasm ? '✓' : '✗'}
                  {session.orgasm && ` (${session.orgasmCount})`}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}
