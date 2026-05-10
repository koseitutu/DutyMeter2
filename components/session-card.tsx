import { View, Text, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import { Session } from '@/store/types';
import { formatSessionDate } from '@/utils/date-helpers';

interface SessionCardProps {
  session: Session;
  onPress?: () => void;
  compact?: boolean;
}

export function SessionCard({ session, onPress, compact = false }: SessionCardProps) {
  const dateStr = formatSessionDate(session.date, session.time);

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: Colors.white,
            borderRadius: 12,
            borderCurve: 'continuous',
            paddingVertical: compact ? 12 : 16,
            paddingHorizontal: 16,
            borderLeftWidth: 3,
            borderLeftColor: Colors.accent,
            opacity: pressed ? 0.9 : 1,
            boxShadow: '0 2px 8px rgba(74, 25, 66, 0.05)',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: Fonts.semiBold,
                  fontSize: 14,
                  color: Colors.text,
                }}
                selectable
              >
                {dateStr} - {session.durationMinutes} min
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 13,
                  color: Colors.textSecondary,
                  marginTop: 2,
                }}
              >
                ({session.position})
              </Text>
            </View>
            {!compact && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 13,
                    color: session.orgasm ? Colors.success : Colors.error,
                  }}
                >
                  Orgasm: {session.orgasm ? '✓' : '✗'}
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
