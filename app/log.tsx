import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import { getNowISO } from "@/utils/date-helpers";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/components/theme-provider";

const LOCATIONS = ["Home", "Partner's Place", "Hotel", "Other"];

export default function LogSessionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const addSession = useAppStore((s) => s.addSession);
  const positions = useAppStore((s) => s.settings.customPositions);

  const now = getNowISO();
  const [date] = useState(now.date);
  const [time] = useState(now.time);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [location, setLocation] = useState("");
  const [position, setPosition] = useState(positions[0] || "Missionary");
  const [orgasm, setOrgasm] = useState(true);
  const [orgasmCount, setOrgasmCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [showLocationPresets, setShowLocationPresets] = useState(false);
  const [customPosition, setCustomPosition] = useState("");
  const [showCustomPosition, setShowCustomPosition] = useState(false);

  const handleSave = useCallback(() => {
    if (!location.trim()) {
      Alert.alert("Missing Info", "Please enter a location.");
      return;
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    addSession({
      id,
      date,
      time,
      durationMinutes,
      location: location.trim(),
      position: showCustomPosition && customPosition.trim() ? customPosition.trim() : position,
      orgasm,
      orgasmCount: orgasm ? orgasmCount : 0,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    });

    router.back();
  }, [date, time, durationMinutes, location, position, orgasm, orgasmCount, notes, addSession, router, showCustomPosition, customPosition]);

  const formatDateForDisplay = (dateStr: string, timeStr: string): string => {
    const [, month, day] = dateStr.split("-").map(Number);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${months[month - 1]} ${day}, ${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
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
            justifyContent: "space-between",
          }}
        >
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close" size={26} color={colors.headerText} />
          </Pressable>
          <Text
            style={{
              fontFamily: Fonts.heading,
              fontSize: 22,
              color: colors.headerText,
            }}
          >
            Log Session
          </Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={{ padding: 20, gap: 20 }}>
          {/* Date & Time */}
          <View>
            <Text style={labelStyle(colors)}>Date & Time</Text>
            <View style={inputContainerStyle(colors)}>
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 15,
                  color: colors.text,
                  flex: 1,
                }}
              >
                {formatDateForDisplay(date, time)}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            </View>
          </View>

          {/* Duration */}
          <View>
            <Text style={labelStyle(colors)}>Duration</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <Pressable
                onPress={() => setDurationMinutes(Math.max(5, durationMinutes - 5))}
                style={stepperStyle(colors)}
              >
                <Ionicons name="remove" size={20} color={colors.accent} />
              </Pressable>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: 18,
                    color: colors.accent,
                    fontVariant: ["tabular-nums"],
                  }}
                  selectable
                >
                  {durationMinutes} min
                </Text>
              </View>
              <Pressable
                onPress={() => setDurationMinutes(durationMinutes + 5)}
                style={stepperStyle(colors)}
              >
                <Ionicons name="add" size={20} color={colors.accent} />
              </Pressable>
            </View>
          </View>

          {/* Location */}
          <View>
            <Text style={labelStyle(colors)}>Location</Text>
            <TextInput
              style={[inputContainerStyle(colors), { fontFamily: Fonts.regular, fontSize: 15, color: colors.text }]}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g., Home, Hotel"
              placeholderTextColor={colors.textSecondary}
              onFocus={() => setShowLocationPresets(true)}
              onBlur={() => setTimeout(() => setShowLocationPresets(false), 200)}
            />
            {showLocationPresets && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0, marginTop: 8 }}
                contentContainerStyle={{ gap: 8 }}
              >
                {LOCATIONS.map((loc) => (
                  <Pressable
                    key={loc}
                    onPress={() => {
                      setLocation(loc);
                      setShowLocationPresets(false);
                    }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      backgroundColor: colors.chipInactive,
                      borderRadius: 20,
                    }}
                  >
                    <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: colors.chipTextInactive }}>
                      {loc}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Sex Position */}
          <View>
            <Text style={labelStyle(colors)}>Sex Position</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ gap: 8, paddingRight: 8 }}
            >
              {positions.map((pos) => (
                <Pressable
                  key={pos}
                  onPress={() => {
                    setPosition(pos);
                    setShowCustomPosition(false);
                  }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    backgroundColor: position === pos && !showCustomPosition ? colors.chipActive : colors.chipInactive,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 13,
                      color: position === pos && !showCustomPosition ? colors.chipTextActive : colors.chipTextInactive,
                    }}
                  >
                    {pos}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => setShowCustomPosition(true)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: showCustomPosition ? colors.chipActive : colors.chipInactive,
                  borderRadius: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Ionicons name="add" size={14} color={showCustomPosition ? colors.chipTextActive : colors.chipTextInactive} />
                <Text
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 13,
                    color: showCustomPosition ? colors.chipTextActive : colors.chipTextInactive,
                  }}
                >
                  Custom
                </Text>
              </Pressable>
            </ScrollView>
            {showCustomPosition && (
              <TextInput
                style={[inputContainerStyle(colors), { fontFamily: Fonts.regular, fontSize: 15, color: colors.text, marginTop: 10 }]}
                value={customPosition}
                onChangeText={setCustomPosition}
                placeholder="Enter custom position..."
                placeholderTextColor={colors.textSecondary}
              />
            )}
          </View>

          {/* Orgasm toggle + count */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 24 }}>
            <View style={{ flex: 1 }}>
              <Text style={labelStyle(colors)}>Orgasm?</Text>
              <Pressable
                onPress={() => setOrgasm(!orgasm)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 4,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: orgasm ? colors.accent : colors.inputBorder,
                    justifyContent: "center",
                    paddingHorizontal: 2,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: "#FFFFFF",
                      alignSelf: orgasm ? "flex-end" : "flex-start",
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </View>
                <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.text }}>
                  {orgasm ? "Yes" : "No"}
                </Text>
              </Pressable>
            </View>

            {orgasm && (
              <View>
                <Text style={labelStyle(colors)}>Orgasm Count</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 }}>
                  <Pressable
                    onPress={() => setOrgasmCount(Math.max(1, orgasmCount - 1))}
                    style={[stepperStyle(colors), { width: 32, height: 32 }]}
                  >
                    <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: colors.accent }}>−</Text>
                  </Pressable>
                  <Text
                    style={{
                      fontFamily: Fonts.bold,
                      fontSize: 18,
                      color: colors.text,
                      fontVariant: ["tabular-nums"],
                      minWidth: 20,
                      textAlign: "center",
                    }}
                    selectable
                  >
                    {orgasmCount}
                  </Text>
                  <Pressable
                    onPress={() => setOrgasmCount(orgasmCount + 1)}
                    style={[stepperStyle(colors), { width: 32, height: 32 }]}
                  >
                    <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: colors.accent }}>+</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Notes */}
          <View>
            <Text style={labelStyle(colors)}>Notes (optional)</Text>
            <TextInput
              style={[inputContainerStyle(colors), { fontFamily: Fonts.regular, fontSize: 15, color: colors.text, minHeight: 80, textAlignVertical: "top" }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter your notes here..."
              placeholderTextColor={colors.textSecondary}
              multiline
            />
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => ({
              backgroundColor: colors.accent,
              borderRadius: 14,
              borderCurve: "continuous",
              paddingVertical: 16,
              alignItems: "center",
              opacity: pressed ? 0.9 : 1,
              marginTop: 8,
              boxShadow: '0 4px 16px rgba(201, 116, 138, 0.3)',
            })}
          >
            <Text style={{ fontFamily: Fonts.semiBold, fontSize: 16, color: "#FFFFFF" }}>
              Save Session
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function labelStyle(colors: ReturnType<typeof useTheme>["colors"]) {
  return {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  } as const;
}

function inputContainerStyle(colors: ReturnType<typeof useTheme>["colors"]) {
  return {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  } as const;
}

function stepperStyle(colors: ReturnType<typeof useTheme>["colors"]) {
  return {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.chipInactive,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  } as const;
}
