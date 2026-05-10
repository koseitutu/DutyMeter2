import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/components/theme-provider";
import { DarkMode } from "@/store/types";
import { Image } from "expo-image";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const settings = useAppStore((s) => s.settings);
  const sessions = useAppStore((s) => s.sessions);
  const archivedSessions = useAppStore((s) => s.archivedSessions);
  const setUsername = useAppStore((s) => s.setUsername);
  const setDarkMode = useAppStore((s) => s.setDarkMode);
  const addPosition = useAppStore((s) => s.addPosition);
  const removePosition = useAppStore((s) => s.removePosition);
  const restoreSession = useAppStore((s) => s.restoreSession);
  const deleteArchivedSession = useAppStore((s) => s.deleteArchivedSession);

  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState(settings.username);
  const [newPosition, setNewPosition] = useState("");
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const [showPositions, setShowPositions] = useState(false);

  const handleSaveUsername = () => {
    const trimmed = usernameInput.trim();
    if (trimmed) {
      setUsername(trimmed);
    }
    setEditingUsername(false);
  };

  const handleAddPosition = () => {
    const trimmed = newPosition.trim();
    if (!trimmed) {
      Alert.alert("Error", "Position name cannot be empty.");
      return;
    }
    if (settings.customPositions.includes(trimmed)) {
      Alert.alert("Error", "This position already exists.");
      return;
    }
    addPosition(trimmed);
    setNewPosition("");
    setShowAddPosition(false);
  };

  const handleRemovePosition = (pos: string) => {
    if (settings.customPositions.length <= 1) {
      Alert.alert("Error", "You must keep at least one position.");
      return;
    }
    Alert.alert("Remove Position", `Remove "${pos}" from your list?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removePosition(pos) },
    ]);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ sessions, archivedSessions, settings }, null, 2);
    Alert.alert(
      "Backup Data",
      `Your backup contains ${sessions.length} active + ${archivedSessions.length} archived sessions (${dataStr.length} bytes).\n\nIn production, this would save via share sheet or file system.`,
      [{ text: "OK" }]
    );
  };

  const handleImportJSON = () => {
    Alert.alert(
      "Import Backup",
      "In production, this would open the document picker to select a JSON file. For now, paste data via the prompt on iOS.",
      [{ text: "OK" }]
    );
  };

  const handleExportCSV = () => {
    const header = "id,date,time,durationMinutes,rounds,location,positions,orgasm,orgasmCount,notes";
    const rows = sessions.map((s) => {
      const posStr = s.positions ? s.positions.join(";") : "";
      return `"${s.id}","${s.date}","${s.time}",${s.durationMinutes},${s.rounds},"${s.location}","${posStr}",${s.orgasm},${s.orgasmCount},"${(s.notes || "").replace(/"/g, '""')}"`;
    });
    const csvContent = [header, ...rows].join("\n");
    Alert.alert(
      "Export CSV",
      `Exported ${sessions.length} sessions as CSV (${csvContent.length} chars).\n\nIn production, this would save via share sheet or DocumentPicker.`,
      [{ text: "OK" }]
    );
  };

  const handleImportCSV = () => {
    Alert.alert(
      "Import CSV",
      "In production, this would open the document picker to select a CSV file from your device.",
      [{ text: "OK" }]
    );
  };

  const handleRestoreArchived = (id: string) => {
    restoreSession(id);
  };

  const handleDeleteArchived = (id: string) => {
    Alert.alert("Delete", "Permanently delete this archived session?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteArchivedSession(id) },
    ]);
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
          Settings
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
      >
        {/* Username Section */}
        <View>
          <Text style={sectionTitle(colors)}>PROFILE</Text>
          <View style={sectionCard(colors)}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View
                  style={{
                    width: 40, height: 40, borderRadius: 20,
                    backgroundColor: colors.chipInactive,
                    justifyContent: "center", alignItems: "center",
                  }}
                >
                  <Ionicons name="person" size={20} color={colors.accent} />
                </View>
                <View>
                  <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>
                    Username
                  </Text>
                  {editingUsername ? (
                    <TextInput
                      style={{
                        fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text,
                        borderBottomWidth: 1, borderBottomColor: colors.accent,
                        paddingVertical: 2, minWidth: 120,
                      }}
                      value={usernameInput}
                      onChangeText={setUsernameInput}
                      autoFocus
                      onSubmitEditing={handleSaveUsername}
                      onBlur={handleSaveUsername}
                      returnKeyType="done"
                    />
                  ) : (
                    <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text }}>
                      {settings.username}
                    </Text>
                  )}
                </View>
              </View>
              {!editingUsername && (
                <Pressable
                  onPress={() => {
                    setUsernameInput(settings.username);
                    setEditingUsername(true);
                  }}
                  hitSlop={8}
                >
                  <Ionicons name="create-outline" size={20} color={colors.accent} />
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View>
          <Text style={sectionTitle(colors)}>APPEARANCE</Text>
          <View style={sectionCard(colors)}>
            <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text, marginBottom: 12 }}>
              Theme
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {([
                ["light", "Light", "sunny-outline"],
                ["dark", "Dark", "moon-outline"],
                ["system", "System", "phone-portrait-outline"],
              ] as const).map(([mode, label, icon]) => (
                <Pressable
                  key={mode}
                  onPress={() => setDarkMode(mode as DarkMode)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    backgroundColor: settings.darkMode === mode ? colors.chipActive : colors.chipInactive,
                    borderRadius: 12,
                    borderCurve: "continuous",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Ionicons
                    name={icon}
                    size={20}
                    color={settings.darkMode === mode ? colors.chipTextActive : colors.chipTextInactive}
                  />
                  <Text
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 12,
                      color: settings.darkMode === mode ? colors.chipTextActive : colors.chipTextInactive,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Manage Positions Section */}
        <View>
          <Text style={sectionTitle(colors)}>MANAGE POSITIONS</Text>
          <View style={sectionCard(colors)}>
            <Pressable
              onPress={() => setShowPositions(!showPositions)}
              style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
            >
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text }}>
                Positions ({settings.customPositions.length})
              </Text>
              <Ionicons
                name={showPositions ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>

            {showPositions && (
              <View style={{ marginTop: 12 }}>
                <View style={{ gap: 4 }}>
                  {settings.customPositions.map((pos) => (
                    <View
                      key={pos}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.separator,
                      }}
                    >
                      <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: colors.text }}>
                        {pos}
                      </Text>
                      <Pressable onPress={() => handleRemovePosition(pos)} hitSlop={8}>
                        <Ionicons name="close-circle" size={20} color={colors.destructive} />
                      </Pressable>
                    </View>
                  ))}
                </View>

                {showAddPosition ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 }}>
                    <TextInput
                      style={{
                        flex: 1,
                        fontFamily: Fonts.regular,
                        fontSize: 14,
                        color: colors.text,
                        borderWidth: 1,
                        borderColor: colors.inputBorder,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        backgroundColor: colors.inputBg,
                      }}
                      value={newPosition}
                      onChangeText={setNewPosition}
                      placeholder="New position name"
                      placeholderTextColor={colors.textSecondary}
                      autoFocus
                      onSubmitEditing={handleAddPosition}
                    />
                    <Pressable
                      onPress={handleAddPosition}
                      style={{
                        backgroundColor: colors.accent,
                        borderRadius: 8,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                      }}
                    >
                      <Text style={{ fontFamily: Fonts.semiBold, fontSize: 13, color: "#FFFFFF" }}>Add</Text>
                    </Pressable>
                    <Pressable onPress={() => { setShowAddPosition(false); setNewPosition(""); }}>
                      <Ionicons name="close" size={22} color={colors.textSecondary} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setShowAddPosition(true)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 12,
                      paddingVertical: 10,
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
                    <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.accent }}>
                      Add New Position
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Backup & Export Section */}
        <View>
          <Text style={sectionTitle(colors)}>BACKUP & EXPORT</Text>
          <View style={sectionCard(colors)}>
            <SettingsRow
              icon="cloud-upload-outline"
              title="Backup (JSON)"
              subtitle="Export all data as JSON"
              colors={colors}
              onPress={handleExportJSON}
            />
            <View style={{ height: 1, backgroundColor: colors.separator }} />
            <SettingsRow
              icon="cloud-download-outline"
              title="Restore (JSON)"
              subtitle="Import data from JSON backup"
              colors={colors}
              onPress={handleImportJSON}
            />
            <View style={{ height: 1, backgroundColor: colors.separator }} />
            <SettingsRow
              icon="download-outline"
              title="Export CSV"
              subtitle="Export sessions as CSV file"
              colors={colors}
              onPress={handleExportCSV}
            />
            <View style={{ height: 1, backgroundColor: colors.separator }} />
            <SettingsRow
              icon="push-outline"
              title="Import CSV"
              subtitle="Import sessions from CSV file"
              colors={colors}
              onPress={handleImportCSV}
              last
            />
          </View>
        </View>

        {/* Archive Management Section */}
        <View>
          <Text style={sectionTitle(colors)}>ARCHIVE MANAGEMENT</Text>
          <View style={sectionCard(colors)}>
            <Pressable
              onPress={() => setShowArchives(!showArchives)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 4,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="archive-outline" size={20} color={colors.accent} />
                <View>
                  <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.text }}>
                    Archived Sessions
                  </Text>
                  <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>
                    {archivedSessions.length} session{archivedSessions.length !== 1 ? "s" : ""} archived
                  </Text>
                </View>
              </View>
              <Ionicons
                name={showArchives ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>

            {showArchives && archivedSessions.length > 0 && (
              <View style={{ marginTop: 12, gap: 8 }}>
                {archivedSessions.map((session) => (
                  <View
                    key={session.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 10,
                      borderTopWidth: 1,
                      borderTopColor: colors.separator,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: colors.text }}>
                        {session.date} · {session.durationMinutes}min
                      </Text>
                      <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: colors.textSecondary }}>
                        {session.archiveDuration === "3months" ? "3 month" : session.archiveDuration === "6months" ? "6 month" : "1 year"} archive
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      <Pressable
                        onPress={() => handleRestoreArchived(session.id)}
                        hitSlop={6}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          backgroundColor: colors.chipInactive,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ fontFamily: Fonts.medium, fontSize: 11, color: colors.accent }}>
                          Restore
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeleteArchived(session.id)}
                        hitSlop={6}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          backgroundColor: colors.chipInactive,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ fontFamily: Fonts.medium, fontSize: 11, color: colors.destructive }}>
                          Delete
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {showArchives && archivedSessions.length === 0 && (
              <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 12, textAlign: "center" }}>
                No archived sessions
              </Text>
            )}
          </View>
        </View>

        {/* About Section */}
        <View>
          <Text style={sectionTitle(colors)}>ABOUT</Text>
          <View style={sectionCard(colors)}>
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  borderCurve: "continuous",
                  overflow: "hidden",
                  marginBottom: 10,
                }}
              >
                <Image
                  source={require("@/assets/app_icon.png")}
                  style={{ width: 56, height: 56 }}
                  contentFit="cover"
                />
              </View>
              <Text style={{ fontFamily: Fonts.heading, fontSize: 20, color: colors.text }}>DutyMeter</Text>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
                Version 1.0.0
              </Text>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 8, textAlign: "center" }}>
                A private activity tracker.{"\n"}All data stays on your device.
              </Text>
            </View>
          </View>
        </View>

        {/* Data Info */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderCurve: "continuous",
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} />
          <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: colors.textSecondary, flex: 1 }}>
            {sessions.length} active + {archivedSessions.length} archived sessions stored locally. No data leaves your device.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  colors,
  onPress,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  colors: ReturnType<typeof useTheme>["colors"];
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.chipInactive, justifyContent: "center", alignItems: "center" }}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.text }}>{title}</Text>
        <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

function sectionTitle(colors: ReturnType<typeof useTheme>["colors"]) {
  return {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  } as const;
}

function sectionCard(colors: ReturnType<typeof useTheme>["colors"]) {
  return {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderCurve: "continuous" as const,
    padding: 16,
    boxShadow: `0 2px 10px ${colors.shadow}`,
  } as const;
}
