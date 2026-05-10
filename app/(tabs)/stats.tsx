import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import { Ionicons } from "@expo/vector-icons";

type DateRange = "7" | "30" | "90" | "all";

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const sessions = useAppStore((s) => s.sessions);
  const [dateRange, setDateRange] = useState<DateRange>("30");

  const filteredSessions = useMemo(() => {
    if (dateRange === "all") return sessions;
    const daysAgo = parseInt(dateRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysAgo);
    cutoff.setHours(0, 0, 0, 0);
    return sessions.filter((s) => new Date(s.date) >= cutoff);
  }, [sessions, dateRange]);

  // Frequency data (sessions per week, last 5 weeks)
  const weeklyFrequency = useMemo(() => {
    const weeks: number[] = [0, 0, 0, 0, 0];
    const now = new Date();
    filteredSessions.forEach((s) => {
      const sessionDate = new Date(s.date);
      const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(diffDays / 7);
      if (weekIndex >= 0 && weekIndex < 5) {
        weeks[4 - weekIndex]++;
      }
    });
    return weeks;
  }, [filteredSessions]);

  // Duration stats
  const durationStats = useMemo(() => {
    if (filteredSessions.length === 0) return { avg: 0, min: 0, max: 0 };
    const durations = filteredSessions.map((s) => s.durationMinutes);
    return {
      avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      min: Math.min(...durations),
      max: Math.max(...durations),
    };
  }, [filteredSessions]);

  // Top positions
  const topPositions = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSessions.forEach((s) => {
      counts[s.position] = (counts[s.position] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  }, [filteredSessions]);

  // Orgasm rate
  const orgasmStats = useMemo(() => {
    if (filteredSessions.length === 0) return { rate: 0, avgCount: 0 };
    const withOrgasm = filteredSessions.filter((s) => s.orgasm);
    const avgCount =
      withOrgasm.length > 0
        ? (withOrgasm.reduce((sum, s) => sum + s.orgasmCount, 0) / withOrgasm.length).toFixed(1)
        : "0";
    return {
      rate: Math.round((withOrgasm.length / filteredSessions.length) * 100),
      avgCount,
    };
  }, [filteredSessions]);

  // Streak calculation
  const streakData = useMemo(() => {
    if (sessions.length === 0) return { current: 0, best: 0 };

    const uniqueDates = [...new Set(sessions.map((s) => s.date))].sort().reverse();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let current = 0;
    let best = 0;
    let streak = 0;
    let checkDate = new Date(today);

    // Check current streak
    for (let i = 0; i < uniqueDates.length; i++) {
      const sessionDate = new Date(uniqueDates[i]);
      sessionDate.setHours(0, 0, 0, 0);
      const diff = Math.round((checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diff <= 1) {
        current++;
        checkDate = sessionDate;
      } else {
        break;
      }
    }

    // Calculate best streak
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        streak = 1;
      } else {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);
        const diff = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
        if (diff <= 1) {
          streak++;
        } else {
          streak = 1;
        }
      }
      best = Math.max(best, streak);
    }

    return { current, best };
  }, [sessions]);

  const maxWeekly = Math.max(...weeklyFrequency, 1);
  const maxPositionCount = topPositions.length > 0 ? topPositions[0][1] : 1;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: Colors.primary,
          paddingTop: insets.top + 16,
          paddingBottom: 24,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.heading,
            fontSize: 26,
            color: Colors.white,
            textAlign: "center",
          }}
        >
          Your Insights
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
      >
        {/* Date Range Filter */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text }}>
            Date Range
          </Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {([
              ["7", "7D"],
              ["30", "30D"],
              ["90", "90D"],
              ["all", "All"],
            ] as const).map(([val, label]) => (
              <Pressable
                key={val}
                onPress={() => setDateRange(val)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: dateRange === val ? Colors.chipActive : Colors.chipInactive,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 12,
                    color: dateRange === val ? Colors.chipTextActive : Colors.chipTextInactive,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {filteredSessions.length === 0 ? (
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 12,
              borderCurve: "continuous",
              padding: 40,
              alignItems: "center",
            }}
          >
            <Ionicons name="analytics-outline" size={36} color={Colors.accent} />
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 15,
                color: Colors.textSecondary,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              No data for this period.{"\n"}Log sessions to see insights!
            </Text>
          </View>
        ) : (
          <>
            {/* Frequency Chart */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Frequency</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "space-around",
                  height: 100,
                  marginTop: 12,
                }}
              >
                {weeklyFrequency.map((count, i) => (
                  <View key={i} style={{ alignItems: "center", gap: 4 }}>
                    <Text
                      style={{
                        fontFamily: Fonts.medium,
                        fontSize: 10,
                        color: Colors.textSecondary,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {count}
                    </Text>
                    <View
                      style={{
                        width: 32,
                        height: Math.max(8, (count / maxWeekly) * 80),
                        backgroundColor: Colors.barChart,
                        borderRadius: 4,
                        borderCurve: "continuous",
                      }}
                    />
                    <Text
                      style={{
                        fontFamily: Fonts.regular,
                        fontSize: 10,
                        color: Colors.textSecondary,
                      }}
                    >
                      {i === 0 ? "5w" : i === 4 ? "Now" : `${4 - i}w`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Duration Stats */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Duration Stats</Text>
              <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
                <View style={styles.miniStat}>
                  <Ionicons name="time-outline" size={18} color={Colors.accent} />
                  <Text style={styles.miniStatValue}>{durationStats.avg} min</Text>
                  <Text style={styles.miniStatLabel}>Avg</Text>
                </View>
                <View style={styles.miniStat}>
                  <Ionicons name="hourglass-outline" size={18} color={Colors.accent} />
                  <Text style={styles.miniStatValue}>{durationStats.min} min</Text>
                  <Text style={styles.miniStatLabel}>Min</Text>
                </View>
                <View style={styles.miniStat}>
                  <Ionicons name="trending-up" size={18} color={Colors.accent} />
                  <Text style={styles.miniStatValue}>{durationStats.max} min</Text>
                  <Text style={styles.miniStatLabel}>Max</Text>
                </View>
              </View>
            </View>

            {/* Top Positions & Orgasm Rate side by side */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Top Positions */}
              <View style={[styles.card, { flex: 1 }]}>
                <Text style={styles.cardTitle}>Top Positions</Text>
                <View style={{ gap: 8, marginTop: 12 }}>
                  {topPositions.map(([pos, count]) => (
                    <View key={pos} style={{ gap: 4 }}>
                      <Text
                        style={{
                          fontFamily: Fonts.regular,
                          fontSize: 11,
                          color: Colors.textSecondary,
                        }}
                      >
                        {pos}
                      </Text>
                      <View
                        style={{
                          height: 14,
                          backgroundColor: Colors.barChart,
                          borderRadius: 3,
                          width: `${(count / maxPositionCount) * 100}%`,
                          minWidth: 20,
                        }}
                      />
                    </View>
                  ))}
                  {topPositions.length === 0 && (
                    <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary }}>
                      No data
                    </Text>
                  )}
                </View>
              </View>

              {/* Orgasm Rate */}
              <View style={[styles.card, { flex: 1, alignItems: "center" }]}>
                <Text style={[styles.cardTitle, { alignSelf: "flex-start" }]}>Orgasm Rate</Text>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    borderWidth: 6,
                    borderColor: Colors.barChart,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 12,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.bold,
                      fontSize: 18,
                      color: Colors.text,
                      fontVariant: ["tabular-nums"],
                    }}
                    selectable
                  >
                    {orgasmStats.rate}%
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: 11,
                    color: Colors.textSecondary,
                    marginTop: 8,
                  }}
                >
                  Avg Count: {orgasmStats.avgCount}
                </Text>
              </View>
            </View>

            {/* Streak Tracker */}
            <View style={styles.card}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View>
                  <Text style={styles.cardTitle}>Streak Tracker</Text>
                  <Text
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 14,
                      color: Colors.text,
                      marginTop: 8,
                    }}
                    selectable
                  >
                    Current Streak:{" "}
                    <Text style={{ fontFamily: Fonts.bold, color: Colors.accent }}>
                      {streakData.current} days
                    </Text>
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.regular,
                      fontSize: 13,
                      color: Colors.textSecondary,
                      marginTop: 4,
                    }}
                    selectable
                  >
                    Best Streak: {streakData.best} days
                  </Text>
                </View>
                <Text style={{ fontSize: 32 }}>🔥</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = {
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderCurve: "continuous" as const,
    padding: 16,
    boxShadow: '0 2px 10px rgba(74, 25, 66, 0.05)',
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.text,
  } as const,
  miniStat: {
    flex: 1,
    alignItems: "center" as const,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderCurve: "continuous" as const,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 4,
  },
  miniStatValue: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.text,
    fontVariant: ["tabular-nums"] as ("tabular-nums")[],
  },
  miniStatLabel: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.textSecondary,
  } as const,
};
