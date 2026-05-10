import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import { formatSessionDate } from "@/utils/date-helpers";
import { Ionicons } from "@expo/vector-icons";
import { Session } from "@/store/types";
import { useTheme } from "@/components/theme-provider";

type FilterType = "all" | "orgasm-yes" | "orgasm-no";
type SortType = "newest" | "oldest";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const sessions = useAppStore((s) => s.sessions);
  const deleteSession = useAppStore((s) => s.deleteSession);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");
  const [showFilter, setShowFilter] = useState(false);

  const filteredSessions = sessions
    .filter((s) => {
      if (filter === "orgasm-yes") return s.orgasm;
      if (filter === "orgasm-no") return !s.orgasm;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return sort === "newest" ? dateB - dateA : dateA - dateB;
    });

  const handleDelete = useCallback(
    (session: Session) => {
      Alert.alert(
        "Delete Session",
        "Are you sure you want to delete this session?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteSession(session.id),
          },
        ]
      );
    },
    [deleteSession]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.headerBg,
          paddingTop: insets.top + 16,
          paddingBottom: 24,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.heading,
            fontSize: 26,
            color: colors.headerText,
            textAlign: "center",
          }}
        >
          Activity History
        </Text>
        <Pressable
          onPress={() => router.push("/search")}
          hitSlop={12}
          style={{
            position: "absolute",
            right: 20,
            bottom: 28,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.12)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="search" size={18} color={colors.headerText} />
        </Pressable>
      </View>

      {/* Filter Bar */}
      <Pressable
        onPress={() => setShowFilter(!showFilter)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginHorizontal: 20,
          marginTop: 16,
          marginBottom: 8,
          backgroundColor: colors.surface,
          borderRadius: 10,
          borderCurve: "continuous",
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: colors.inputBorder,
        }}
      >
        <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: colors.text }}>
          Filter By:{" "}
          <Text style={{ color: colors.textSecondary }}>
            {filter === "all" ? "All" : filter === "orgasm-yes" ? "Orgasm ✓" : "No Orgasm"}
            {" · "}
            {sort === "newest" ? "Newest First" : "Oldest First"}
          </Text>
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </Pressable>

      {showFilter && (
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 8,
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderCurve: "continuous",
            padding: 14,
            gap: 10,
            boxShadow: `0 4px 12px ${colors.shadow}`,
          }}
        >
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 12, color: colors.textSecondary }}>
            ORGASM FILTER
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {([["all", "All"], ["orgasm-yes", "Yes ✓"], ["orgasm-no", "No ✗"]] as const).map(
              ([val, label]) => (
                <Pressable
                  key={val}
                  onPress={() => setFilter(val)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    backgroundColor: filter === val ? colors.chipActive : colors.chipInactive,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 12,
                      color: filter === val ? colors.chipTextActive : colors.chipTextInactive,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              )
            )}
          </View>
          <Text
            style={{ fontFamily: Fonts.semiBold, fontSize: 12, color: colors.textSecondary, marginTop: 4 }}
          >
            SORT
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {([["newest", "Newest First"], ["oldest", "Oldest First"]] as const).map(([val, label]) => (
              <Pressable
                key={val}
                onPress={() => setSort(val)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  backgroundColor: sort === val ? colors.chipActive : colors.chipInactive,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 12,
                    color: sort === val ? colors.chipTextActive : colors.chipTextInactive,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Session List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 40 }}
      >
        {filteredSessions.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              borderCurve: "continuous",
              padding: 40,
              alignItems: "center",
            }}
          >
            <Ionicons name="document-text-outline" size={36} color={colors.accent} />
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 15,
                color: colors.textSecondary,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              {filter !== "all"
                ? "No sessions match this filter."
                : "No sessions logged yet."}
            </Text>
          </View>
        ) : (
          filteredSessions.map((session) => (
            <Pressable
              key={session.id}
              onPress={() => router.push(`/session/${session.id}`)}
              onLongPress={() => handleDelete(session)}
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
                    selectable
                  >
                    {formatSessionDate(session.date, session.time)} - {session.durationMinutes} min.
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.regular,
                      fontSize: 13,
                      color: colors.textSecondary,
                      marginTop: 3,
                    }}
                  >
                    {session.position}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 13,
                      color: session.orgasm ? colors.success : colors.error,
                      marginTop: 3,
                    }}
                  >
                    Orgasm: {session.orgasm ? `✓ (${session.orgasmCount})` : "✗"}
                  </Text>
                </View>
              )}
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
