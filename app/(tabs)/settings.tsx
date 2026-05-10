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

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const settings = useAppStore((s) => s.settings);
  const sessions = useAppStore((s) => s.sessions);
  const archivedSessions = useAppStore((s) => s.archivedSessions);
  const setDarkMode = useAppStore((s) => s.setDarkMode);
  const addPosition = useAppStore((s) => s.addPosition);
  const removePosition = useAppStore((s) => s.removePosition);
  const importSessions = useAppStore((s) => s.importSessions);
  const restoreSession = useAppStore((s) => s.restoreSession);
  const deleteArchivedSession = useAppStore((s) => s.deleteArchivedSession);

  const [newPosition, setNewPosition] = useState("");
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [showArchives, setShowArchives] = useState(false);

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
    const data = JSON.stringify({ sessions, archivedSessions, settings }, null, 2);
    Alert.alert(
      "Backup Data",
      `Your backup contains ${sessions.length} active + ${archivedSessions.length} archived sessions.\n\nCopy the data below:\n\n${data.substring(0, 200)}...`,
      [{ text: "OK" }]
    );
  };

  const handleImportJSON = () => {
    Alert.prompt?.(
      "Import Backup",
      "Paste your JSON backup data:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: (text: string | undefined) => {
            if (!text) return;
            try {
              const data = JSON.parse(text);
              if (data.sessions && Array.isArray(data.sessions)) {
                importSessions(data.sessions);
                Alert.alert("Success", `Imported ${data.sessions.length} sessions.`);
              } else {
                Alert.alert("Error", "Invalid backup format.");
              }
            } catch {
              Alert.alert("Error", "Could not parse the backup data.");
            }
          },
        },
      ],
      "plain-text"
    ) ?? Alert.alert("Import", "JSON import is available on iOS. On other platforms, use the app's data sync feature.");
  };

  const handleExportCSV = () => {
    const header = "id,date,time,durationMinutes,rounds,location,positions,orgasm,orgasmCount,notes";
    const rows = sessions.map((s) => {
      const positions = s.positions ? s.positions.join(";") : (s as any).position || "";
      return `"${s.id}","${s.date}","${s.time}",${s.durationMinutes},${s.rounds ?? 1},"${s.location}","${positions}",${s.orgasm},${s.orgasmCount},"${(s.notes || "").replace(/"/g, '""')}"`;
    });
    const csv = [header, ...rows].join("\n");
    Alert.alert(
      "Export CSV",
      `Exported ${sessions.length} sessions as CSV.\n\n${csv.substring(0, 200)}...`,
      [{ text: "OK" }]
    );
  };

  const handleImportCSV = () => {
    Alert.prompt?.(
      "Import CSV",
      "Paste your CSV data (including header row):",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: (text: string | undefined) => {
            if (!text) return;
            try {
              const lines = text.trim().split("\n");
              if (lines.length < 2) {
                Alert.alert("Error", "CSV must have a header row and at least one data row.");
                return;
              }
              const imported = lines.slice(1).map((line) => {
                const cols = line.match(/(".*?"|[^,]*)/g) || [];
                const clean = cols.map((c) => c.replace(/^"|"$/g, "").replace(/""/g, '"'));
                return {
                  id: clean[0] || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  date: clean[1] || "",
                  time: clean[2] || "00:00",
                  durationMinutes: parseInt(clean[3]) || 30,
                  rounds: parseInt(clean[4]) || 1,
                  location: clean[5] || "",
                  positions: clean[6] ? clean[6].split(";") : ["Unknown"],
                  orgasm: clean[7] === "true",
                  orgasmCount: parseInt(clean[8]) || 0,
                  notes: clean[9] || "",
                  createdAt: new Date().toISOString(),
                  archivedAt: null,
                  archiveDuration: null,
                } as any;
              });
              importSessions(imported);
              Alert.alert("Success", `Imported ${imported.length} sessions from CSV.`);
            } catch {
              Alert.alert("Error", "Could not parse the CSV data.");
            }
          },
        },
      ],
      "plain-text"
    ) ?? Alert.alert("Import", "CSV import is available on iOS. On other platforms, use the JSON backup feature.");
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
            <View style={{ gap: 8 }}>
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
        </View>

        {/* Backup & Export Section */}
        <View>
          <Text style={sectionTitle(colors)}>BACKUP & EXPORT</Text>
          <View style={sectionCard(colors)}>
            <Pressable
              onPress={handleExportJSON}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.separator,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.chipInactive, justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="cloud-upload-outline" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.text }}>Backup (JSON)</Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>Export all data as JSON</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>

            <Pressable
              onPress={handleImportJSON}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.separator,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.chipInactive, justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="cloud-download-outline" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.text }}>Restore (JSON)</Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>Import data from JSON backup</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>

            <Pressable
              onPress={handleExportCSV}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.separator,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.chipInactive, justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="download-outline" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.text }}>Export CSV</Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>Export sessions as CSV file</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>

            <Pressable
              onPress={handleImportCSV}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 14,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.chipInactive, justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="push-outline" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.text }}>Import CSV</Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>Import sessions from CSV file</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
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
                        {session.archiveDuration === "6months" ? "6 month" : "1 year"} archive
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
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.chipInactive,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontFamily: Fonts.heading, fontSize: 24, color: colors.accent }}>D</Text>
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

        {/* Data info */}
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
