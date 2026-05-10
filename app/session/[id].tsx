import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import { formatDateShort, formatDuration } from "@/utils/date-helpers";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/components/theme-provider";

export default function SessionDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessions = useAppStore((s) => s.sessions);
  const positions = useAppStore((s) => s.settings.customPositions);
  const updateSession = useAppStore((s) => s.updateSession);
  const deleteSession = useAppStore((s) => s.deleteSession);
  const archiveSession = useAppStore((s) => s.archiveSession);

  const session = sessions.find((s) => s.id === id);
  const [isEditing, setIsEditing] = useState(false);

  // Edit state
  const [editDate, setEditDate] = useState(session?.date ?? "");
  const [editTime, setEditTime] = useState(session?.time ?? "");
  const [editDuration, setEditDuration] = useState(session?.durationMinutes ?? 30);
  const [editRounds, setEditRounds] = useState(session?.rounds ?? 1);
  const [editLocation, setEditLocation] = useState(session?.location ?? "");
  const [editPositions, setEditPositions] = useState<string[]>(
    session?.positions ?? []
  );
  const [editOrgasm, setEditOrgasm] = useState(session?.orgasm ?? false);
  const [editOrgasmCount, setEditOrgasmCount] = useState(session?.orgasmCount ?? 0);
  const [editNotes, setEditNotes] = useState(session?.notes ?? "");

  if (!session) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="alert-circle-outline" size={48} color={colors.accent} />
        <Text
          style={{
            fontFamily: Fonts.medium,
            fontSize: 16,
            color: colors.textSecondary,
            marginTop: 12,
          }}
        >
          Session not found
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: colors.accent }}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert("Delete Session", "Are you sure you want to delete this session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteSession(session.id);
          router.back();
        },
      },
    ]);
  };

  const handleArchive = (duration: '3months' | '6months' | '1year') => {
    archiveSession(session.id, duration);
    router.back();
  };

  const showArchiveOptions = () => {
    Alert.alert("Archive Session", "Choose archive duration:", [
      { text: "Cancel", style: "cancel" },
      { text: "3 Months", onPress: () => handleArchive("3months") },
      { text: "6 Months", onPress: () => handleArchive("6months") },
      { text: "1 Year", onPress: () => handleArchive("1year") },
    ]);
  };

  const handleSaveEdit = () => {
    updateSession(session.id, {
      date: editDate,
      time: editTime,
      durationMinutes: editDuration,
      rounds: editRounds,
      location: editLocation.trim(),
      positions: editPositions,
      orgasm: editOrgasm,
      orgasmCount: editOrgasm ? editOrgasmCount : 0,
      notes: editNotes.trim(),
    });
    setIsEditing(false);
  };

  const toggleEditPosition = (pos: string) => {
    setEditPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };

  const timeDisplay = () => {
    const [hours, minutes] = session.time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const detailRow = {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderCurve: "continuous" as const,
    padding: 16,
    boxShadow: `0 2px 8px ${colors.shadow}`,
  };

  const iconContainer = {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.chipInactive,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginTop: 2,
  };

  const miniStepper = {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.chipInactive,
    justifyContent: "center" as const,
    alignItems: "center" as const,
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
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </Pressable>
        <Text style={{ fontFamily: Fonts.heading, fontSize: 20, color: colors.headerText }}>
          Session Details
        </Text>
        <Pressable onPress={handleDelete} hitSlop={12}>
          <Ionicons name="trash-outline" size={22} color="rgba(255,255,255,0.8)" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }}
      >
        {/* Date & Time */}
        <View style={detailRow}>
          <View style={iconContainer}>
            <Ionicons name="calendar" size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>Date & Time</Text>
            {isEditing ? (
              <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                <TextInput
                  style={{
                    flex: 1, fontFamily: Fonts.regular, fontSize: 14, color: colors.text,
                    borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8,
                    paddingHorizontal: 8, paddingVertical: 6, backgroundColor: colors.background,
                  }}
                  value={editDate}
                  onChangeText={setEditDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
                <TextInput
                  style={{
                    width: 80, fontFamily: Fonts.regular, fontSize: 14, color: colors.text,
                    borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8,
                    paddingHorizontal: 8, paddingVertical: 6, backgroundColor: colors.background,
                  }}
                  value={editTime}
                  onChangeText={setEditTime}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            ) : (
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text, marginTop: 2 }} selectable>
                {formatDateShort(session.date)} at {timeDisplay()}
              </Text>
            )}
          </View>
        </View>

        {/* Duration */}
        <View style={detailRow}>
          <View style={iconContainer}>
            <Ionicons name="time" size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>Duration</Text>
            {isEditing ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 }}>
                <Pressable onPress={() => setEditDuration(Math.max(5, editDuration - 5))} style={miniStepper}>
                  <Ionicons name="remove" size={16} color={colors.accent} />
                </Pressable>
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text, fontVariant: ["tabular-nums"] }} selectable>
                  {editDuration} min
                </Text>
                <Pressable onPress={() => setEditDuration(editDuration + 5)} style={miniStepper}>
                  <Ionicons name="add" size={16} color={colors.accent} />
                </Pressable>
              </View>
            ) : (
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text, marginTop: 2 }} selectable>
                {formatDuration(session.durationMinutes)}
              </Text>
            )}
          </View>
        </View>

        {/* Rounds */}
        <View style={detailRow}>
          <View style={iconContainer}>
            <Ionicons name="repeat" size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>Rounds</Text>
            {isEditing ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 }}>
                <Pressable onPress={() => setEditRounds(Math.max(1, editRounds - 1))} style={miniStepper}>
                  <Ionicons name="remove" size={16} color={colors.accent} />
                </Pressable>
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text, fontVariant: ["tabular-nums"] }} selectable>
                  {editRounds}
                </Text>
                <Pressable onPress={() => setEditRounds(editRounds + 1)} style={miniStepper}>
                  <Ionicons name="add" size={16} color={colors.accent} />
                </Pressable>
              </View>
            ) : (
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text, marginTop: 2 }} selectable>
                {session.rounds} round{session.rounds > 1 ? "s" : ""}
              </Text>
            )}
          </View>
        </View>

        {/* Location */}
        <View style={detailRow}>
          <View style={iconContainer}>
            <Ionicons name="location" size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>Location</Text>
            {isEditing ? (
              <TextInput
                style={{
                  fontFamily: Fonts.regular, fontSize: 14, color: colors.text,
                  borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8,
                  paddingHorizontal: 10, paddingVertical: 8, marginTop: 4, backgroundColor: colors.background,
                }}
                value={editLocation}
                onChangeText={setEditLocation}
              />
            ) : (
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text, marginTop: 2 }} selectable>
                {session.location}
              </Text>
            )}
          </View>
        </View>

        {/* Positions */}
        <View style={detailRow}>
          <View style={iconContainer}>
            <Ionicons name="body" size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>Positions</Text>
            {isEditing ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0, marginTop: 6 }}
                contentContainerStyle={{ gap: 6 }}
              >
                {positions.map((pos) => {
                  const isSelected = editPositions.includes(pos);
                  return (
                    <Pressable
                      key={pos}
                      onPress={() => toggleEditPosition(pos)}
                      style={{
                        paddingHorizontal: 12, paddingVertical: 6,
                        backgroundColor: isSelected ? colors.chipActive : colors.chipInactive,
                        borderRadius: 16,
                      }}
                    >
                      <Text style={{ fontFamily: Fonts.medium, fontSize: 12, color: isSelected ? colors.chipTextActive : colors.chipTextInactive }}>
                        {isSelected ? "✓ " : ""}{pos}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text, marginTop: 2 }} selectable>
                {session.positions.join(", ")}
              </Text>
            )}
          </View>
        </View>

        {/* Orgasm */}
        <View style={detailRow}>
          <View style={iconContainer}>
            <Ionicons name="heart" size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>Orgasm</Text>
            {isEditing ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 }}>
                <Pressable onPress={() => setEditOrgasm(!editOrgasm)}>
                  <View
                    style={{
                      width: 42, height: 26, borderRadius: 13,
                      backgroundColor: editOrgasm ? colors.accent : colors.inputBorder,
                      justifyContent: "center", paddingHorizontal: 2,
                    }}
                  >
                    <View
                      style={{
                        width: 22, height: 22, borderRadius: 11,
                        backgroundColor: "#FFFFFF",
                        alignSelf: editOrgasm ? "flex-end" : "flex-start",
                      }}
                    />
                  </View>
                </Pressable>
                {editOrgasm && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Pressable onPress={() => setEditOrgasmCount(Math.max(1, editOrgasmCount - 1))} style={miniStepper}>
                      <Text style={{ fontFamily: Fonts.bold, color: colors.accent }}>−</Text>
                    </Pressable>
                    <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: colors.text, fontVariant: ["tabular-nums"] }}>{editOrgasmCount}</Text>
                    <Pressable onPress={() => setEditOrgasmCount(editOrgasmCount + 1)} style={miniStepper}>
                      <Text style={{ fontFamily: Fonts.bold, color: colors.accent }}>+</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ) : (
              <Text
                style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: session.orgasm ? colors.success : colors.error, marginTop: 2 }}
                selectable
              >
                {session.orgasm ? `Yes (${session.orgasmCount} time${session.orgasmCount > 1 ? "s" : ""})` : "No"}
              </Text>
            )}
          </View>
        </View>

        {/* Notes */}
        {!!(session.notes || isEditing) && (
          <View style={detailRow}>
            <View style={iconContainer}>
              <Ionicons name="document-text" size={18} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>Notes</Text>
              {isEditing ? (
                <TextInput
                  style={{
                    fontFamily: Fonts.regular, fontSize: 14, color: colors.text,
                    borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8,
                    paddingHorizontal: 10, paddingVertical: 8, marginTop: 4, backgroundColor: colors.background,
                    minHeight: 60, textAlignVertical: "top",
                  }}
                  value={editNotes}
                  onChangeText={setEditNotes}
                  multiline
                  placeholder="Add notes..."
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text, marginTop: 2 }} selectable>
                  {session.notes || "—"}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ gap: 10, marginTop: 8 }}>
          {isEditing ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setIsEditing(false)}
                style={({ pressed }) => ({
                  flex: 1, backgroundColor: colors.chipInactive, borderRadius: 12,
                  borderCurve: "continuous", paddingVertical: 14, alignItems: "center",
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveEdit}
                style={({ pressed }) => ({
                  flex: 1, backgroundColor: colors.accent, borderRadius: 12,
                  borderCurve: "continuous", paddingVertical: 14, alignItems: "center",
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: "#FFFFFF" }}>Save Changes</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Pressable
                onPress={() => setIsEditing(true)}
                style={({ pressed }) => ({
                  backgroundColor: colors.accent, borderRadius: 12, borderCurve: "continuous",
                  paddingVertical: 14, alignItems: "center", flexDirection: "row",
                  justifyContent: "center", gap: 8, opacity: pressed ? 0.9 : 1,
                  boxShadow: "0 4px 16px rgba(201, 116, 138, 0.3)",
                })}
              >
                <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: "#FFFFFF" }}>Edit Session</Text>
              </Pressable>

              <Pressable
                onPress={showArchiveOptions}
                style={({ pressed }) => ({
                  backgroundColor: colors.chipInactive, borderRadius: 12, borderCurve: "continuous",
                  paddingVertical: 14, alignItems: "center", flexDirection: "row",
                  justifyContent: "center", gap: 8, opacity: pressed ? 0.9 : 1,
                })}
              >
                <Ionicons name="archive-outline" size={18} color={colors.text} />
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text }}>Archive Session</Text>
              </Pressable>

              <Pressable
                onPress={handleDelete}
                style={({ pressed }) => ({
                  backgroundColor: "transparent", borderRadius: 12, borderCurve: "continuous",
                  paddingVertical: 14, alignItems: "center", borderWidth: 1,
                  borderColor: colors.destructive, opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.destructive }}>Delete Session</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
