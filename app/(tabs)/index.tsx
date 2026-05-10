import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import { StatCard } from "@/components/stat-card";
import { SessionCard } from "@/components/session-card";
import { getGreeting, isThisWeek, isThisMonth } from "@/utils/date-helpers";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/components/theme-provider";
import { Image } from "expo-image";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const sessions = useAppStore((s) => s.sessions);
  const username = useAppStore((s) => s.settings.username || "there");

  const totalSessions = sessions.length;
  const thisWeek = sessions.filter((s) => isThisWeek(s.date)).length;
  const thisMonth = sessions.filter((s) => isThisMonth(s.date)).length;
  const recentSessions = sessions.slice(0, 3);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.headerBg,
          paddingTop: insets.top + 12,
          paddingBottom: 40,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        {/* Search icon top right */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 8 }}>
          <Pressable
            onPress={() => router.push("/search")}
            hitSlop={12}
            style={{
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

        <View style={{ alignItems: "center" }}>
          {/* App Icon */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              borderCurve: "continuous",
              overflow: "hidden",
              marginBottom: 10,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          >
            <Image
              source={require("@/assets/app_icon.png")}
              style={{ width: 56, height: 56 }}
              contentFit="cover"
            />
          </View>
          <Text
            style={{
              fontFamily: Fonts.heading,
              fontSize: 28,
              color: colors.headerText,
            }}
          >
            DutyMeter
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              fontSize: 14,
              color: "rgba(255,255,255,0.75)",
              marginTop: 4,
            }}
          >
            {getGreeting()}, {username}.
          </Text>
        </View>
      </View>

      {/* Stats Strip */}
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          marginHorizontal: 20,
          marginTop: -24,
        }}
      >
        <StatCard icon="people" label="Total" value={totalSessions} />
        <StatCard icon="calendar" label="This Week" value={thisWeek} />
        <StatCard icon="calendar-outline" label="This Month" value={thisMonth} />
      </View>

      {/* Quick Log CTA */}
      <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
        <Pressable
          onPress={() => router.push("/log")}
          style={({ pressed }) => ({
            backgroundColor: colors.accent,
            borderRadius: 14,
            borderCurve: "continuous",
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            opacity: pressed ? 0.9 : 1,
            boxShadow: "0 4px 16px rgba(201, 116, 138, 0.3)",
          })}
        >
          <Ionicons name="add-circle" size={22} color="#FFFFFF" />
          <Text
            style={{
              fontFamily: Fonts.semiBold,
              fontSize: 16,
              color: "#FFFFFF",
            }}
          >
            Log New Session
          </Text>
        </Pressable>
      </View>

      {/* Recent Activity */}
      <View style={{ marginTop: 28, paddingHorizontal: 20 }}>
        <Text
          style={{
            fontFamily: Fonts.headingSemiBold,
            fontSize: 20,
            color: colors.text,
            marginBottom: 14,
          }}
        >
          Recent Activity
        </Text>

        {recentSessions.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 14,
              borderCurve: "continuous",
              padding: 32,
              alignItems: "center",
              boxShadow: `0 2px 10px ${colors.shadow}`,
            }}
          >
            <Ionicons name="moon-outline" size={36} color={colors.accent} />
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 15,
                color: colors.textSecondary,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              No sessions logged yet.{"\n"}Tap + to get started!
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {recentSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                compact
                onPress={() => router.push(`/session/${session.id}`)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
