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
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import { getNowISO } from "@/utils/date-helpers";
import { Ionicons } from "@expo/vector-icons";

const POSITIONS = ["Missionary", "Cowgirl", "Doggy Style", "Spooning", "Other"];
const LOCATIONS = ["Home", "Partner's Place", "Hotel", "Other"];

export default function LogSessionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addSession = useAppStore((s) => s.addSession);

  const now = getNowISO();
  const [date] = useState(now.date);
  const [time] = useState(now.time);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [location, setLocation] = useState("");
  const [position, setPosition] = useState("Missionary");
  const [orgasm, setOrgasm] = useState(true);
  const [orgasmCount, setOrgasmCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [showLocationPresets, setShowLocationPresets] = useState(false);

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
      position,
      orgasm,
      orgasmCount: orgasm ? orgasmCount : 0,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    });

    router.back();
  }, [date, time, durationMinutes, location, position, orgasm, orgasmCount, notes, addSession, router]);

  const formatDateForDisplay = (dateStr: string, timeStr: string): string => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${months[month - 1]} ${day}, ${year}, ${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: Colors.primary,
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
            <Ionicons name="close" size={26} color={Colors.white} />
          </Pressable>
          <Text
            style={{
              fontFamily: Fonts.heading,
              fontSize: 22,
              color: Colors.white,
            }}
          >
            Log Session
          </Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={{ padding: 20, gap: 20 }}>
          {/* Date & Time */}
          <View>
            <Text style={styles.label}>Date & Time</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formatDateForDisplay(date, time)}
                onChangeText={(text) => {
                  // For simplicity, we keep the current date/time
                }}
                editable={false}
              />
              <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
            </View>
          </View>

          {/* Duration */}
          <View>
            <Text style={styles.label}>Duration</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <Pressable
                onPress={() => setDurationMinutes(Math.max(5, durationMinutes - 5))}
                style={styles.stepperButton}
              >
                <Ionicons name="remove" size={20} color={Colors.primary} />
              </Pressable>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: 18,
                    color: Colors.accent,
                    fontVariant: ["tabular-nums"],
                  }}
                  selectable
                >
                  {durationMinutes} min
                </Text>
              </View>
              <Pressable
                onPress={() => setDurationMinutes(durationMinutes + 5)}
                style={styles.stepperButton}
              >
                <Ionicons name="add" size={20} color={Colors.primary} />
              </Pressable>
            </View>
          </View>

          {/* Location */}
          <View>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={[styles.inputContainer, styles.input]}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g., Home, Hotel"
              placeholderTextColor={Colors.textSecondary}
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
                      backgroundColor: Colors.chipInactive,
                      borderRadius: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.medium,
                        fontSize: 13,
                        color: Colors.chipTextInactive,
                      }}
                    >
                      {loc}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Sex Position */}
          <View>
            <Text style={styles.label}>Sex Position</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {POSITIONS.map((pos) => (
                <Pressable
                  key={pos}
                  onPress={() => setPosition(pos)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    backgroundColor: position === pos ? Colors.chipActive : Colors.chipInactive,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 13,
                      color: position === pos ? Colors.chipTextActive : Colors.chipTextInactive,
                    }}
                  >
                    {pos}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Orgasm toggle + count */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 24 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Orgasm?</Text>
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
                    backgroundColor: orgasm ? Colors.accent : "#DDD",
                    justifyContent: "center",
                    paddingHorizontal: 2,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: Colors.white,
                      alignSelf: orgasm ? "flex-end" : "flex-start",
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 14,
                    color: Colors.text,
                  }}
                >
                  {orgasm ? "Yes" : "No"}
                </Text>
              </Pressable>
            </View>

            {orgasm && (
              <View>
                <Text style={styles.label}>Orgasm Count</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 }}>
                  <Pressable
                    onPress={() => setOrgasmCount(Math.max(1, orgasmCount - 1))}
                    style={[styles.stepperButton, { width: 32, height: 32 }]}
                  >
                    <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: Colors.primary }}>−</Text>
                  </Pressable>
                  <Text
                    style={{
                      fontFamily: Fonts.bold,
                      fontSize: 18,
                      color: Colors.text,
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
                    style={[styles.stepperButton, { width: 32, height: 32 }]}
                  >
                    <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: Colors.primary }}>+</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Notes */}
          <View>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.inputContainer, styles.input, { minHeight: 80, textAlignVertical: "top" }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter your notes here..."
              placeholderTextColor={Colors.textSecondary}
              multiline
            />
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => ({
              backgroundColor: Colors.accent,
              borderRadius: 14,
              borderCurve: "continuous",
              paddingVertical: 16,
              alignItems: "center",
              opacity: pressed ? 0.9 : 1,
              marginTop: 8,
              boxShadow: '0 4px 16px rgba(201, 116, 138, 0.3)',
            })}
          >
            <Text
              style={{
                fontFamily: Fonts.semiBold,
                fontSize: 16,
                color: Colors.white,
              }}
            >
              Save Session
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = {
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  } as const,
  inputContainer: {
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  } as const,
  input: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  } as const,
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.chipInactive,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  } as const,
};
