import { useState, useMemo } from "react";
import { View, Text, ScrollView, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import { formatSessionDate } from "@/utils/date-helpers";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/components/theme-provider";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const sessions = useAppStore((s) => s.sessions);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase().trim();
    return sessions.filter((s) => {
      // Search positions (array or legacy single)
      const positionsMatch = s.positions
        ? s.positions.some((p) => p.toLowerCase().includes(lower))
        : (s as any).position?.toLowerCase().includes(lower);
      return (
        positionsMatch ||
        s.location.toLowerCase().includes(lower) ||
        (s.notes && s.notes.toLowerCase().includes(lower))
      );
    });
  }, [sessions, query]);

  const getPositionsDisplay = (session: typeof sessions[0]) => {
    if (session.positions && session.positions.length > 0) {
      return session.positions.join(", ");
    }
    return (session as any).position || "Unknown";
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.headerBg,
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.headerText} />
          </Pressable>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              gap: 8,
            }}
          >
            <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={{
                flex: 1,
                fontFamily: Fonts.regular,
                fontSize: 15,
                color: colors.headerText,
              }}
              value={query}
              onChangeText={setQuery}
              placeholder="Search positions, locations, notes..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.6)" />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {query.trim() === "" ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 15,
                color: colors.textSecondary,
                marginTop: 16,
                textAlign: "center",
              }}
            >
              Search by position, location,{"\n"}or keyword from notes
            </Text>
          </View>
        ) : results.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 15,
                color: colors.textSecondary,
                marginTop: 16,
                textAlign: "center",
              }}
            >
              No sessions match &ldquo;{query}&rdquo;
            </Text>
          </View>
        ) : (
          <>
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 13,
                color: colors.textSecondary,
                marginBottom: 4,
              }}
            >
              {results.length} result{results.length !== 1 ? "s" : ""}
            </Text>
            {results.map((session) => (
              <Pressable
                key={session.id}
                onPress={() => router.push(`/session/${session.id}`)}
              >
                {({ pressed }) => (
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      borderCurve: "continuous",
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderLeftWidth: 3,
                      borderLeftColor: colors.accent,
                      opacity: pressed ? 0.9 : 1,
                      boxShadow: `0 2px 8px ${colors.shadow}`,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.semiBold,
                        fontSize: 14,
                        color: colors.text,
                      }}
                    >
                      {formatSessionDate(session.date, session.time)} · {session.durationMinutes} min
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.regular,
                        fontSize: 13,
                        color: colors.textSecondary,
                        marginTop: 3,
                      }}
                    >
                      {getPositionsDisplay(session)} · {session.location}
                    </Text>
                    {session.notes ? (
                      <Text
                        style={{
                          fontFamily: Fonts.regular,
                          fontSize: 12,
                          color: colors.textSecondary,
                          marginTop: 4,
                          fontStyle: "italic",
                        }}
                        numberOfLines={1}
                      >
                        &ldquo;{session.notes}&rdquo;
                      </Text>
                    ) : null}
                  </View>
                )}
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
