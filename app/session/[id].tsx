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
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import { formatDateShort } from "@/utils/date-helpers";
import { Ionicons } from "@expo/vector-icons";

const POSITIONS = ["Missionary", "Cowgirl", "Doggy Style", "Spooning", "Other"];

export default function SessionDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessions = useAppStore((s) => s.sessions);
  const updateSession = useAppStore((s) => s.updateSession);
  const deleteSession = useAppStore((s) => s.deleteSession);

  const session = sessions.find((s) => s.id === id);
  const [isEditing, setIsEditing] = useState(false);

  // Edit state
  const [editDuration, setEditDuration] = useState(session?.durationMinutes ?? 30);
  const [editLocation, setEditLocation] = useState(session?.location ?? "");
  const [editPosition, setEditPosition] = useState(session?.position ?? "Missionary");
  const [editOrgasm, setEditOrgasm] = useState(session?.orgasm ?? false);
  const [editOrgasmCount, setEditOrgasmCount] = useState(session?.orgasmCount ?? 0);
  const [editNotes, setEditNotes] = useState(session?.notes ?? "");

  if (!session) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="alert-circle-outline" size={48} color={Colors.accent} />
        <Text
          style={{
            fontFamily: Fonts.medium,
            fontSize: 16,
            color: Colors.textSecondary,
            marginTop: 12,
          }}
        >
          Session not found
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.accent }}>
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

  const handleSaveEdit = () => {
    updateSession(session.id, {
      durationMinutes: editDuration,
      location: editLocation.trim(),
      position: editPosition,
      orgasm: editOrgasm,
      orgasmCount: editOrgasm ? editOrgasmCount : 0,
      notes: editNotes.trim(),
    });
    setIsEditing(false);
  };

  const timeDisplay = () => {
    const [hours, minutes] = session.time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

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
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text
          style={{
            fontFamily: Fonts.heading,
            fontSize: 20,
            color: Colors.white,
          }}
        >
          Session Details
        </Text>
        <Pressable onPress={handleDelete} hitSlop={12}>
          <Ionicons name="trash-outline" size={22} color="rgba(255,255,255,0.8)" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
      >
        {/* Date & Time row */}
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="calendar" size={18} color={Colors.accent} />
          </View>
          <View>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue} selectable>
              {formatDateShort(session.date)} at {timeDisplay()}
            </Text>
          </View>
        </View>

        {/* Duration */}
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="time" size={18} color={Colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>Duration</Text>
            {isEditing ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 }}>
                <Pressable
                  onPress={() => setEditDuration(Math.max(5, editDuration - 5))}
                  style={styles.miniStepper}
                >
                  <Ionicons name="remove" size={16} color={Colors.primary} />
                </Pressable>
                <Text style={[styles.detailValue, { fontVariant: ["tabular-nums"] }]} selectable>
                  {editDuration} min
                </Text>
                <Pressable
                  onPress={() => setEditDuration(editDuration + 5)}
                  style={styles.miniStepper}
                >
                  <Ionicons name="add" size={16} color={Colors.primary} />
                </Pressable>
              </View>
            ) : (
              <Text style={styles.detailValue} selectable>
                {session.durationMinutes} minutes
              </Text>
            )}
          </View>
        </View>

        {/* Location */}
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="location" size={18} color={Colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>Location</Text>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editLocation}
                onChangeText={setEditLocation}
              />
            ) : (
              <Text style={styles.detailValue} selectable>
                {session.location}
              </Text>
            )}
          </View>
        </View>

        {/* Position */}
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="body" size={18} color={Colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>Position</Text>
            {isEditing ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {POSITIONS.map((pos) => (
                  <Pressable
                    key={pos}
                    onPress={() => setEditPosition(pos)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: editPosition === pos ? Colors.chipActive : Colors.chipInactive,
                      borderRadius: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.medium,
                        fontSize: 12,
                        color: editPosition === pos ? Colors.chipTextActive : Colors.chipTextInactive,
                      }}
                    >
                      {pos}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.detailValue} selectable>
                {session.position}
              </Text>
            )}
          </View>
        </View>

        {/* Orgasm */}
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="heart" size={18} color={Colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>Orgasm</Text>
            {isEditing ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 }}>
                <Pressable onPress={() => setEditOrgasm(!editOrgasm)}>
                  <View
                    style={{
                      width: 40,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: editOrgasm ? Colors.accent : "#DDD",
                      justifyContent: "center",
                      paddingHorizontal: 2,
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: Colors.white,
                        alignSelf: editOrgasm ? "flex-end" : "flex-start",
                      }}
                    />
                  </View>
                </Pressable>
                {editOrgasm && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Pressable
                      onPress={() => setEditOrgasmCount(Math.max(1, editOrgasmCount - 1))}
                      style={styles.miniStepper}
                    >
                      <Text style={{ fontFamily: Fonts.bold, color: Colors.primary }}>−</Text>
                    </Pressable>
                    <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: Colors.text }}>
                      {editOrgasmCount}
                    </Text>
                    <Pressable
                      onPress={() => setEditOrgasmCount(editOrgasmCount + 1)}
                      style={styles.miniStepper}
                    >
                      <Text style={{ fontFamily: Fonts.bold, color: Colors.primary }}>+</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ) : (
              <Text
                style={[
                  styles.detailValue,
                  { color: session.orgasm ? Colors.success : Colors.error },
                ]}
                selectable
              >
                {session.orgasm ? `Yes (${session.orgasmCount} time${session.orgasmCount > 1 ? "s" : ""})` : "No"}
              </Text>
            )}
          </View>
        </View>

        {/* Notes */}
        {(session.notes || isEditing) && (
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="document-text" size={18} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Notes</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.editInput, { minHeight: 60, textAlignVertical: "top" }]}
                  value={editNotes}
                  onChangeText={setEditNotes}
                  multiline
                  placeholder="Add notes..."
                  placeholderTextColor={Colors.textSecondary}
                />
              ) : (
                <Text style={styles.detailValue} selectable>
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
                  flex: 1,
                  backgroundColor: Colors.chipInactive,
                  borderRadius: 12,
                  borderCurve: "continuous",
                  paddingVertical: 14,
                  alignItems: "center",
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.text }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSaveEdit}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: Colors.accent,
                  borderRadius: 12,
                  borderCurve: "continuous",
                  paddingVertical: 14,
                  alignItems: "center",
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white }}>
                  Save Changes
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setIsEditing(true)}
              style={({ pressed }) => ({
                backgroundColor: Colors.accent,
                borderRadius: 12,
                borderCurve: "continuous",
                paddingVertical: 14,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                opacity: pressed ? 0.9 : 1,
                boxShadow: '0 4px 16px rgba(201, 116, 138, 0.3)',
              })}
            >
              <Ionicons name="create-outline" size={18} color={Colors.white} />
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white }}>
                Edit Session
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => ({
              backgroundColor: "transparent",
              borderRadius: 12,
              borderCurve: "continuous",
              paddingVertical: 14,
              alignItems: "center",
              borderWidth: 1,
              borderColor: Colors.error,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.error }}>
              Delete Session
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = {
  detailRow: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderCurve: "continuous" as const,
    padding: 16,
    boxShadow: '0 2px 8px rgba(74, 25, 66, 0.04)',
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.chipInactive,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginTop: 2,
  },
  detailLabel: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  } as const,
  detailValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.text,
    marginTop: 2,
  } as const,
  editInput: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
    backgroundColor: Colors.background,
  } as const,
  miniStepper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.chipInactive,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
};
