import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/components/theme-provider";
import { CalendarPicker } from "@/components/calendar-picker";

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const sessions = useAppStore((s) => s.sessions);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const filteredSessions = useMemo(() => {
    if (!startDate && !endDate) return sessions;
    return sessions.filter((s) => {
      const sessionDate = s.date;
      if (startDate && sessionDate < startDate) return false;
      if (endDate && sessionDate > endDate) return false;
      return true;
    });
  }, [sessions, startDate, endDate]);

  // Frequency data (sessions per week, last 6 weeks)
  const weeklyFrequency = useMemo(() => {
    const weeks: number[] = [0, 0, 0, 0, 0, 0];
    const now = new Date();
    filteredSessions.forEach((s) => {
      const sessionDate = new Date(s.date);
      const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(diffDays / 7);
      if (weekIndex >= 0 && weekIndex < 6) {
        weeks[5 - weekIndex]++;
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

  // Rounds stats
  const roundsStats = useMemo(() => {
    if (filteredSessions.length === 0) return { avg: 0, max: 0, total: 0 };
    const rounds = filteredSessions.map((s) => s.rounds ?? 1);
    return {
      avg: parseFloat((rounds.reduce((a, b) => a + b, 0) / rounds.length).toFixed(1)),
      max: Math.max(...rounds),
      total: rounds.reduce((a, b) => a + b, 0),
    };
  }, [filteredSessions]);

  // Top positions (from multi-select)
  const topPositions = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSessions.forEach((s) => {
      const positions = s.positions ?? [];
      positions.forEach((pos: string) => {
        if (pos) counts[pos] = (counts[pos] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
  }, [filteredSessions]);

  // Orgasm rate
  const orgasmStats = useMemo(() => {
    if (filteredSessions.length === 0) return { rate: 0, avgCount: "0" };
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

  // Time of day heatmap
  const timeHeatmap = useMemo(() => {
    const hours = Array(24).fill(0) as number[];
    filteredSessions.forEach((s) => {
      const hour = parseInt(s.time.split(":")[0]);
      if (!isNaN(hour)) hours[hour]++;
    });
    return hours;
  }, [filteredSessions]);

  const maxWeekly = Math.max(...weeklyFrequency, 1);
  const maxPositionCount = topPositions.length > 0 ? topPositions[0][1] : 1;
  const maxHeatmapVal = Math.max(...timeHeatmap, 1);

  const clearDateRange = () => {
    setStartDate("");
    setEndDate("");
    setShowDatePicker(false);
  };

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
          Your Insights
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
      >
        {/* Custom Date Range Picker */}
        <View style={cardStyle(colors)}>
          <Pressable
            onPress={() => setShowDatePicker(!showDatePicker)}
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="calendar-outline" size={18} color={colors.accent} />
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: colors.text }}>
                Custom Date Range
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {!!(startDate || endDate) && (
                <Pressable onPress={clearDateRange} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </Pressable>
              )}
              <Ionicons
                name={showDatePicker ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textSecondary}
              />
            </View>
          </Pressable>

          {!!(startDate || endDate) && !showDatePicker && (
            <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 6 }}>
              {startDate || "Start"} → {endDate || "End"}
            </Text>
          )}

          {showDatePicker && (
            <View style={{ marginTop: 12, gap: 10 }}>
              <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: Fonts.medium, fontSize: 11, color: colors.textSecondary, marginBottom: 4 }}>
                    FROM
                  </Text>
                  <Pressable
                    onPress={() => setShowStartCalendar(true)}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 8,
                      borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8,
                      paddingHorizontal: 10, paddingVertical: 12, backgroundColor: colors.inputBg,
                    }}
                  >
                    <Ionicons name="calendar-outline" size={16} color={colors.accent} />
                    <Text
                      style={{
                        fontFamily: Fonts.regular, fontSize: 14,
                        color: startDate ? colors.text : colors.textSecondary,
                      }}
                    >
                      {startDate || "Select start"}
                    </Text>
                  </Pressable>
                </View>
                <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} style={{ marginTop: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: Fonts.medium, fontSize: 11, color: colors.textSecondary, marginBottom: 4 }}>
                    TO
                  </Text>
                  <Pressable
                    onPress={() => setShowEndCalendar(true)}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 8,
                      borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8,
                      paddingHorizontal: 10, paddingVertical: 12, backgroundColor: colors.inputBg,
                    }}
                  >
                    <Ionicons name="calendar-outline" size={16} color={colors.accent} />
                    <Text
                      style={{
                        fontFamily: Fonts.regular, fontSize: 14,
                        color: endDate ? colors.text : colors.textSecondary,
                      }}
                    >
                      {endDate || "Select end"}
                    </Text>
                  </Pressable>
                </View>
              </View>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: colors.textSecondary }}>
                Tap a date field to open the calendar. Leave empty for no limit.
              </Text>
              <CalendarPicker
                visible={showStartCalendar}
                onClose={() => setShowStartCalendar(false)}
                onSelectDate={setStartDate}
                selectedDate={startDate}
                title="Start Date"
              />
              <CalendarPicker
                visible={showEndCalendar}
                onClose={() => setShowEndCalendar(false)}
                onSelectDate={setEndDate}
                selectedDate={endDate}
                title="End Date"
              />
            </View>
          )}
        </View>

        {/* Summary Strip */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={[cardStyle(colors), { flex: 1, alignItems: "center" }]}>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 24, color: colors.accent, fontVariant: ["tabular-nums"] }}>
              {filteredSessions.length}
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: colors.textSecondary }}>
              Sessions
            </Text>
          </View>
          <View style={[cardStyle(colors), { flex: 1, alignItems: "center" }]}>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 24, color: colors.accent, fontVariant: ["tabular-nums"] }}>
              {orgasmStats.rate}%
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: colors.textSecondary }}>
              Orgasm Rate
            </Text>
          </View>
          <View style={[cardStyle(colors), { flex: 1, alignItems: "center" }]}>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 24, color: colors.accent, fontVariant: ["tabular-nums"] }}>
              {roundsStats.avg}
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: colors.textSecondary }}>
              Avg Rounds
            </Text>
          </View>
        </View>

        {filteredSessions.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 14,
              borderCurve: "continuous",
              padding: 40,
              alignItems: "center",
            }}
          >
            <Ionicons name="analytics-outline" size={36} color={colors.accent} />
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 15,
                color: colors.textSecondary,
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
            <View style={cardStyle(colors)}>
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text }}>
                Weekly Frequency
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "space-around",
                  height: 110,
                  marginTop: 12,
                }}
              >
                {weeklyFrequency.map((count, i) => (
                  <View key={i} style={{ alignItems: "center", gap: 4 }}>
                    <Text
                      style={{
                        fontFamily: Fonts.medium,
                        fontSize: 10,
                        color: colors.textSecondary,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {count}
                    </Text>
                    <View
                      style={{
                        width: 28,
                        height: Math.max(8, (count / maxWeekly) * 80),
                        backgroundColor: colors.barChart,
                        borderRadius: 4,
                        borderCurve: "continuous",
                      }}
                    />
                    <Text
                      style={{
                        fontFamily: Fonts.regular,
                        fontSize: 9,
                        color: colors.textSecondary,
                      }}
                    >
                      {i === 5 ? "Now" : `${5 - i}w`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Duration Stats */}
            <View style={cardStyle(colors)}>
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text }}>
                Duration Stats
              </Text>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                {([
                  ["time-outline", durationStats.avg, "Avg"],
                  ["hourglass-outline", durationStats.min, "Min"],
                  ["trending-up", durationStats.max, "Max"],
                ] as const).map(([icon, val, label]) => (
                  <View
                    key={label}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      backgroundColor: colors.background,
                      borderRadius: 10,
                      borderCurve: "continuous",
                      paddingVertical: 12,
                      paddingHorizontal: 6,
                      gap: 4,
                    }}
                  >
                    <Ionicons name={icon} size={18} color={colors.accent} />
                    <Text
                      style={{
                        fontFamily: Fonts.bold,
                        fontSize: 14,
                        color: colors.text,
                        fontVariant: ["tabular-nums"],
                      }}
                      selectable
                    >
                      {val}m
                    </Text>
                    <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: colors.textSecondary }}>
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Rounds Stats */}
            <View style={cardStyle(colors)}>
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text }}>
                Rounds Stats
              </Text>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                {([
                  ["repeat", roundsStats.avg, "Avg"],
                  ["trending-up", roundsStats.max, "Max"],
                  ["stats-chart", roundsStats.total, "Total"],
                ] as const).map(([icon, val, label]) => (
                  <View
                    key={label}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      backgroundColor: colors.background,
                      borderRadius: 10,
                      borderCurve: "continuous",
                      paddingVertical: 12,
                      paddingHorizontal: 6,
                      gap: 4,
                    }}
                  >
                    <Ionicons name={icon as any} size={18} color={colors.accent} />
                    <Text
                      style={{
                        fontFamily: Fonts.bold,
                        fontSize: 14,
                        color: colors.text,
                        fontVariant: ["tabular-nums"],
                      }}
                      selectable
                    >
                      {val}
                    </Text>
                    <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: colors.textSecondary }}>
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Top Positions */}
            <View style={cardStyle(colors)}>
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text, marginBottom: 12 }}>
                Top Positions
              </Text>
              <View style={{ gap: 10 }}>
                {topPositions.map(([pos, count]) => (
                  <View key={pos} style={{ gap: 4 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontFamily: Fonts.medium, fontSize: 12, color: colors.text }}>
                        {pos}
                      </Text>
                      <Text style={{ fontFamily: Fonts.medium, fontSize: 11, color: colors.textSecondary, fontVariant: ["tabular-nums"] }}>
                        {count}
                      </Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: colors.chipInactive, borderRadius: 4, overflow: "hidden" }}>
                      <View
                        style={{
                          height: 8,
                          backgroundColor: colors.barChart,
                          borderRadius: 4,
                          width: `${(count / maxPositionCount) * 100}%`,
                          minWidth: 12,
                        }}
                      />
                    </View>
                  </View>
                ))}
                {topPositions.length === 0 && (
                  <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>
                    No data yet
                  </Text>
                )}
              </View>
            </View>

            {/* Orgasm Rate */}
            <View style={cardStyle(colors)}>
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text }}>
                Orgasm Rate
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 20, marginTop: 16 }}>
                <View
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    borderWidth: 7,
                    borderColor: colors.barChart,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.bold,
                      fontSize: 20,
                      color: colors.text,
                      fontVariant: ["tabular-nums"],
                    }}
                    selectable
                  >
                    {orgasmStats.rate}%
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: colors.textSecondary }}>
                      Avg Count
                    </Text>
                    <Text style={{ fontFamily: Fonts.semiBold, fontSize: 13, color: colors.text }}>
                      {orgasmStats.avgCount}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: colors.textSecondary }}>
                      With Orgasm
                    </Text>
                    <Text style={{ fontFamily: Fonts.semiBold, fontSize: 13, color: colors.success }}>
                      {filteredSessions.filter((s) => s.orgasm).length}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: colors.textSecondary }}>
                      Without
                    </Text>
                    <Text style={{ fontFamily: Fonts.semiBold, fontSize: 13, color: colors.error }}>
                      {filteredSessions.filter((s) => !s.orgasm).length}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Time of Day Heatmap */}
            <View style={cardStyle(colors)}>
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text }}>
                Time of Day
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 3,
                  marginTop: 12,
                }}
              >
                {timeHeatmap.map((count, hour) => {
                  const intensity = count / maxHeatmapVal;
                  return (
                    <View
                      key={hour}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 5,
                        borderCurve: "continuous",
                        backgroundColor: count === 0
                          ? colors.chipInactive
                          : `rgba(201, 116, 138, ${0.2 + intensity * 0.8})`,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontFamily: Fonts.regular, fontSize: 7, color: count > 0 ? "#FFF" : colors.textSecondary }}>
                        {hour}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 10, color: colors.textSecondary }}>12am</Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 10, color: colors.textSecondary }}>6am</Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 10, color: colors.textSecondary }}>12pm</Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 10, color: colors.textSecondary }}>6pm</Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 10, color: colors.textSecondary }}>11pm</Text>
              </View>
            </View>

            {/* Streak Tracker */}
            <View style={cardStyle(colors)}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text }}>
                    Streak Tracker
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 14,
                      color: colors.text,
                      marginTop: 10,
                    }}
                    selectable
                  >
                    Current:{" "}
                    <Text style={{ fontFamily: Fonts.bold, color: colors.accent, fontSize: 18 }}>
                      {streakData.current}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}> days</Text>
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.regular,
                      fontSize: 13,
                      color: colors.textSecondary,
                      marginTop: 4,
                    }}
                    selectable
                  >
                    Best: {streakData.best} days
                  </Text>
                </View>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: colors.chipInactive,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="flame" size={26} color={colors.accent} />
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function cardStyle(colors: ReturnType<typeof useTheme>["colors"]) {
  return {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderCurve: "continuous" as const,
    padding: 16,
    boxShadow: `0 2px 10px ${colors.shadow}`,
  };
}
