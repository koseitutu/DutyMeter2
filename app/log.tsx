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
  const [date, setDate] = useState(now.date);
  const [time, setTime] = useState(now.time);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [rounds, setRounds] = useState(1);
  const [location, setLocation] = useState("");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [orgasm, setOrgasm] = useState(true);
  const [orgasmCount, setOrgasmCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [showLocationPresets, setShowLocationPresets] = useState(false);
  const [customPosition, setCustomPosition] = useState("");
  const [showCustomPosition, setShowCustomPosition] = useState(false);
  const [showDateEdit, setShowDateEdit] = useState(false);

  const togglePosition = (pos: string) => {
    setSelectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };

  const handleAddCustomPosition = () => {
    const trimmed = customPosition.trim();
    if (trimmed && !selectedPositions.includes(trimmed)) {
      setSelectedPositions((prev) => [...prev, trimmed]);
      setCustomPosition("");
      setShowCustomPosition(false);
    }
  };

  const handleSave = useCallback(() => {
    if (!location.trim()) {
      Alert.alert("Missing Info", "Please enter a location.");
      return;
    }
    if (selectedPositions.length === 0) {
      Alert.alert("Missing Info", "Please select at least one position.");
      return;
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    addSession({
      id,
      date,
      time,
      durationMinutes,
      rounds,
      location: location.trim(),
      positions: selectedPositions,
      orgasm,
      orgasmCount: orgasm ? orgasmCount : 0,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      archivedAt: null,
      archiveDuration: null,
    });

    router.back();
  }, [date, time, durationMinutes, rounds, location, selectedPositions, orgasm, orgasmCount, notes, addSession, router]);

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
            <Pressable
              onPress={() => setShowDateEdit(!showDateEdit)}
              style={inputContainerStyle(colors)}
            >
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
            </Pressable>
            {showDateEdit && (
              <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: colors.textSecondary, marginBottom: 4 }}>
                    Date (YYYY-MM-DD)
                  </Text>
                  <TextInput
                    style={{
                      fontFamily: Fonts.regular, fontSize: 14, color: colors.text,
                      borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8,
                      paddingHorizontal: 10, paddingVertical: 10, backgroundColor: colors.inputBg,
                    }}
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: colors.textSecondary, marginBottom: 4 }}>
                    Time (HH:MM)
                  </Text>
                  <TextInput
                    style={{
                      fontFamily: Fonts.regular, fontSize: 14, color: colors.text,
                      borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8,
                      paddingHorizontal: 10, paddingVertical: 10, backgroundColor: colors.inputBg,
                    }}
                    value={time}
                    onChangeText={setTime}
                    placeholder="HH:MM"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Duration */}
          <View>
            <Text style={labelStyle(colors)}>Duration</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <Pressable
                onPress={() => setDurationMinutes(Math.max(5, durationMinutes - 5))}
                style={stepperBtnStyle(colors)}
              >
                <Ionicons name="remove" size={20} color={colors.accent} />
              </Pressable>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: 20,
                    color: colors.accent,
                    fontVariant: ["tabular-nums"],
                  }}
                  selectable
                >
                  {durationMinutes < 60
                    ? `${durationMinutes} min`
                    : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`}
                </Text>
              </View>
              <Pressable
                onPress={() => setDurationMinutes(durationMinutes + 5)}
                style={stepperBtnStyle(colors)}
              >
                <Ionicons name="add" size={20} color={colors.accent} />
              </Pressable>
            </View>
          </View>

          {/* Rounds */}
          <View>
            <Text style={labelStyle(colors)}>Rounds</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <Pressable
                onPress={() => setRounds(Math.max(1, rounds - 1))}
                style={stepperBtnStyle(colors)}
              >
                <Ionicons name="remove" size={20} color={colors.accent} />
              </Pressable>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: 20,
                    color: colors.accent,
                    fontVariant: ["tabular-nums"],
                  }}
                  selectable
                >
                  {rounds}
                </Text>
              </View>
              <Pressable
                onPress={() => setRounds(rounds + 1)}
                style={stepperBtnStyle(colors)}
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
                      backgroundColor: location === loc ? colors.chipActive : colors.chipInactive,
                      borderRadius: 20,
                    }}
                  >
                    <Text style={{
                      fontFamily: Fonts.medium,
                      fontSize: 13,
                      color: location === loc ? colors.chipTextActive : colors.chipTextInactive,
                    }}>
                      {loc}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Sex Positions — Multi-select */}
          <View>
            <Text style={labelStyle(colors)}>
              Positions{" "}
              <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>
                (select multiple)
              </Text>
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ gap: 8, paddingRight: 8 }}
            >
              {positions.map((pos) => {
                const isSelected = selectedPositions.includes(pos);
                return (
                  <Pressable
                    key={pos}
                    onPress={() => togglePosition(pos)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      backgroundColor: isSelected ? colors.chipActive : colors.chipInactive,
                      borderRadius: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.medium,
                        fontSize: 13,
                        color: isSelected ? colors.chipTextActive : colors.chipTextInactive,
                      }}
                    >
                      {isSelected ? "✓ " : ""}{pos}
                    </Text>
                  </Pressable>
                );
              })}
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
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
                <TextInput
                  style={[inputContainerStyle(colors), { flex: 1, fontFamily: Fonts.regular, fontSize: 15, color: colors.text }]}
                  value={customPosition}
                  onChangeText={setCustomPosition}
                  placeholder="Enter custom position..."
                  placeholderTextColor={colors.textSecondary}
                  onSubmitEditing={handleAddCustomPosition}
                  autoFocus
                />
                <Pressable
                  onPress={handleAddCustomPosition}
                  style={{
                    backgroundColor: colors.accent,
                    borderRadius: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{ fontFamily: Fonts.semiBold, fontSize: 13, color: "#FFFFFF" }}>Add</Text>
                </Pressable>
              </View>
            )}
            {selectedPositions.length > 0 && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {selectedPositions.map((pos) => (
                  <View
                    key={pos}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      backgroundColor: colors.chipActive,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 14,
                    }}
                  >
                    <Text style={{ fontFamily: Fonts.medium, fontSize: 12, color: colors.chipTextActive }}>
                      {pos}
                    </Text>
                    <Pressable onPress={() => togglePosition(pos)} hitSlop={4}>
                      <Ionicons name="close" size={14} color={colors.chipTextActive} />
                    </Pressable>
                  </View>
                ))}
              </View>
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
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
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
                    style={[stepperBtnStyle(colors), { width: 32, height: 32 }]}
                  >
                    <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: colors.accent }}>−</Text>
                  </Pressable>
                  <Text
                    style={{
                      fontFamily: Fonts.bold,
                      fontSize: 20,
                      color: colors.text,
                      fontVariant: ["tabular-nums"],
                      minWidth: 24,
                      textAlign: "center",
                    }}
                    selectable
                  >
                    {orgasmCount}
                  </Text>
                  <Pressable
                    onPress={() => setOrgasmCount(orgasmCount + 1)}
                    style={[stepperBtnStyle(colors), { width: 32, height: 32 }]}
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
              boxShadow: "0 4px 16px rgba(201, 116, 138, 0.3)",
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

function labelStyle(colors: ReturnType<typeof import("@/components/theme-provider").useTheme>["colors"]) {
  return {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  } as const;
}

function inputContainerStyle(colors: ReturnType<typeof import("@/components/theme-provider").useTheme>["colors"]) {
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

function stepperBtnStyle(colors: ReturnType<typeof import("@/components/theme-provider").useTheme>["colors"]) {
  return {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.chipInactive,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  } as const;
}
