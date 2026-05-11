import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Alert, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import { formatSessionDate, formatDuration } from "@/utils/date-helpers";
import { Ionicons } from "@expo/vector-icons";
import { Session } from "@/store/types";
import { useTheme } from "@/components/theme-provider";

type FilterType = "all" | "orgasm-yes" | "orgasm-no";
type SortType = "newest" | "oldest";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const sessions = useAppStore((s) => s.sessions);
  const archivedSessions = useAppStore((s) => s.archivedSessions);
  const deleteSession = useAppStore((s) => s.deleteSession);
  const deleteSessions = useAppStore((s) => s.deleteSessions);
  const archiveSession = useAppStore((s) => s.archiveSession);
  const bulkArchiveSessions = useAppStore((s) => s.bulkArchiveSessions);
  const restoreSession = useAppStore((s) => s.restoreSession);
  const deleteArchivedSession = useAppStore((s) => s.deleteArchivedSession);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");
  const [showFilter, setShowFilter] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showBulkArchive, setShowBulkArchive] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredSessions = sessions
    .filter((s) => {
      if (filter === "orgasm-yes") return s.orgasm;
      if (filter === "orgasm-no") return !s.orgasm;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return sort === "newest" ? dateB - dateA : dateA - dateB;
    });

  const handleDelete = useCallback(
    (session: Session) => {
      Alert.alert(
        "Delete Session",
        "Are you sure you want to delete this session?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteSession(session.id),
          },
        ]
      );
    },
    [deleteSession]
  );

  const handleLongPress = useCallback(
    (session: Session) => {
      if (!multiSelectMode) {
        setMultiSelectMode(true);
        setSelectedIds(new Set([session.id]));
      }
    },
    [multiSelectMode]
  );

  const toggleSelection = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        if (next.size === 0) {
          setMultiSelectMode(false);
        }
        return next;
      });
    },
    []
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      "Delete Selected",
      `Delete ${selectedIds.size} session${selectedIds.size > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSessions(Array.from(selectedIds));
            setSelectedIds(new Set());
            setMultiSelectMode(false);
          },
        },
      ]
    );
  }, [selectedIds, deleteSessions]);

  const handleArchiveFromCard = useCallback(
    (session: Session, duration: '3months' | '6months' | '1year') => {
      archiveSession(session.id, duration);
      setExpandedId(null);
    },
    [archiveSession]
  );

  const handleRestoreArchived = useCallback(
    (session: Session) => {
      restoreSession(session.id);
    },
    [restoreSession]
  );

  const handleDeleteArchived = useCallback(
    (session: Session) => {
      Alert.alert(
        "Delete Archived Session",
        "Permanently delete this archived session?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteArchivedSession(session.id),
          },
        ]
      );
    },
    [deleteArchivedSession]
  );

  const exitMultiSelect = () => {
    setMultiSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleBulkArchive = useCallback(
    (period: '3months' | '6months' | '1year') => {
      const periodLabel = period === '3months' ? '3 months' : period === '6months' ? '6 months' : '1 year';
      Alert.alert(
        "Bulk Archive",
        `Archive all sessions older than ${periodLabel}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Archive",
            onPress: () => {
              const count = bulkArchiveSessions(period);
              setShowBulkArchive(false);
              if (count > 0) {
                Alert.alert("Done", `${count} session${count > 1 ? "s" : ""} archived.`);
              } else {
                Alert.alert("No Sessions", `No sessions older than ${periodLabel} to archive.`);
              }
            },
          },
        ]
      );
    },
    [bulkArchiveSessions]
  );

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
          justifyContent: "center",
        }}
      >
        {multiSelectMode && (
          <Pressable
            onPress={exitMultiSelect}
            hitSlop={12}
            style={{
              position: "absolute",
              left: 20,
              bottom: 28,
            }}
          >
            <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.headerText }}>
              Cancel
            </Text>
          </Pressable>
        )}
        <Text
          style={{
            fontFamily: Fonts.heading,
            fontSize: 26,
            color: colors.headerText,
            textAlign: "center",
          }}
        >
          {multiSelectMode ? `${selectedIds.size} Selected` : "Activity History"}
        </Text>
        {multiSelectMode ? (
          <Pressable
            onPress={handleBulkDelete}
            hitSlop={12}
            style={{
              position: "absolute",
              right: 20,
              bottom: 28,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(229, 57, 53, 0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="trash" size={18} color="#EF5350" />
          </Pressable>
        ) : (
          <View style={{ position: "absolute", right: 20, bottom: 28, flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => setShowBulkArchive(true)}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.12)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="archive" size={16} color={colors.headerText} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/search")}
              hitSlop={8}
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
        )}
      </View>

      {/* Filter Bar */}
      <Pressable
        onPress={() => setShowFilter(!showFilter)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginHorizontal: 20,
          marginTop: 16,
          marginBottom: 8,
          backgroundColor: colors.surface,
          borderRadius: 10,
          borderCurve: "continuous",
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: colors.inputBorder,
        }}
      >
        <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: colors.text }}>
          Filter:{" "}
          <Text style={{ color: colors.textSecondary }}>
            {filter === "all" ? "All" : filter === "orgasm-yes" ? "Orgasm ✓" : "No Orgasm"}
            {" · "}
            {sort === "newest" ? "Newest First" : "Oldest First"}
          </Text>
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </Pressable>

      {showFilter && (
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 8,
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderCurve: "continuous",
            padding: 14,
            gap: 10,
            boxShadow: `0 4px 12px ${colors.shadow}`,
          }}
        >
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 12, color: colors.textSecondary }}>
            ORGASM FILTER
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {([["all", "All"], ["orgasm-yes", "Yes ✓"], ["orgasm-no", "No ✗"]] as const).map(
              ([val, label]) => (
                <Pressable
                  key={val}
                  onPress={() => setFilter(val)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    backgroundColor: filter === val ? colors.chipActive : colors.chipInactive,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 12,
                      color: filter === val ? colors.chipTextActive : colors.chipTextInactive,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              )
            )}
          </View>
          <Text
            style={{ fontFamily: Fonts.semiBold, fontSize: 12, color: colors.textSecondary, marginTop: 4 }}
          >
            SORT
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {([["newest", "Newest First"], ["oldest", "Oldest First"]] as const).map(([val, label]) => (
              <Pressable
                key={val}
                onPress={() => setSort(val)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  backgroundColor: sort === val ? colors.chipActive : colors.chipInactive,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 12,
                    color: sort === val ? colors.chipTextActive : colors.chipTextInactive,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Session List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 40 }}
      >
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
            <Ionicons name="document-text-outline" size={36} color={colors.accent} />
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 15,
                color: colors.textSecondary,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              {filter !== "all"
                ? "No sessions match this filter."
                : "No sessions logged yet."}
            </Text>
          </View>
        ) : (
          filteredSessions.map((session) => {
            const isSelected = selectedIds.has(session.id);
            const isExpanded = expandedId === session.id;

            return (
              <View key={session.id}>
                <Pressable
                  onPress={() => {
                    if (multiSelectMode) {
                      toggleSelection(session.id);
                    } else {
                      setExpandedId(isExpanded ? null : session.id);
                    }
                  }}
                  onLongPress={() => handleLongPress(session)}
                >
                  {({ pressed }) => (
                    <View
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        borderCurve: "continuous",
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        borderLeftWidth: 3,
                        borderLeftColor: isSelected ? colors.destructive : colors.accent,
                        opacity: pressed ? 0.9 : 1,
                        boxShadow: `0 2px 8px ${colors.shadow}`,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        {multiSelectMode && (
                          <View
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 11,
                              borderWidth: 2,
                              borderColor: isSelected ? colors.accent : colors.inputBorder,
                              backgroundColor: isSelected ? colors.accent : "transparent",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {isSelected && (
                              <Ionicons name="checkmark" size={14} color="#FFF" />
                            )}
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text
                              style={{
                                fontFamily: Fonts.semiBold,
                                fontSize: 14,
                                color: colors.text,
                                flex: 1,
                              }}
                              selectable
                            >
                              {formatSessionDate(session.date, session.time)} · {formatDuration(session.durationMinutes)}
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                              {session.rounds > 1 && (
                                <View style={{ backgroundColor: colors.chipInactive, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                                  <Text style={{ fontFamily: Fonts.medium, fontSize: 10, color: colors.textSecondary }}>
                                    ×{session.rounds}
                                  </Text>
                                </View>
                              )}
                              <Text
                                style={{
                                  fontFamily: Fonts.medium,
                                  fontSize: 13,
                                  color: session.orgasm ? colors.success : colors.error,
                                }}
                              >
                                {session.orgasm ? `✓ ${session.orgasmCount}` : "✗"}
                              </Text>
                            </View>
                          </View>
                          <Text
                            style={{
                              fontFamily: Fonts.regular,
                              fontSize: 13,
                              color: colors.textSecondary,
                              marginTop: 3,
                            }}
                            numberOfLines={1}
                          >
                            {session.positions.join(", ")} · {session.location}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </Pressable>

                {/* Expanded card actions */}
                {isExpanded && !multiSelectMode && (
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      marginTop: -4,
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      gap: 10,
                      boxShadow: `0 2px 8px ${colors.shadow}`,
                    }}
                  >
                    {/* View/Edit */}
                    <Pressable
                      onPress={() => router.push(`/session/${session.id}`)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        paddingVertical: 6,
                      }}
                    >
                      <Ionicons name="open-outline" size={16} color={colors.accent} />
                      <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: colors.accent }}>
                        View / Edit
                      </Text>
                    </Pressable>

                    {/* Archive buttons */}
                    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                      {(["3months", "6months", "1year"] as const).map((dur) => (
                        <Pressable
                          key={dur}
                          onPress={() => handleArchiveFromCard(session, dur)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 7,
                            backgroundColor: colors.chipInactive,
                            borderRadius: 16,
                          }}
                        >
                          <Text style={{ fontFamily: Fonts.medium, fontSize: 11, color: colors.textSecondary }}>
                            Archive {dur === "3months" ? "3mo" : dur === "6months" ? "6mo" : "1yr"}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    {/* Delete */}
                    <Pressable
                      onPress={() => handleDelete(session)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        paddingVertical: 6,
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                      <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: colors.destructive }}>
                        Delete
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* Archive Section */}
        {archivedSessions.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Pressable
              onPress={() => setShowArchive(!showArchive)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="archive-outline" size={18} color={colors.textSecondary} />
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: colors.textSecondary }}>
                  Archived ({archivedSessions.length})
                </Text>
              </View>
              <Ionicons
                name={showArchive ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textSecondary}
              />
            </Pressable>

            {showArchive && (
              <View style={{ gap: 10 }}>
                {archivedSessions.map((session) => (
                  <View
                    key={session.id}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      borderCurve: "continuous",
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderLeftWidth: 3,
                      borderLeftColor: colors.textSecondary,
                      opacity: 0.85,
                      boxShadow: `0 2px 8px ${colors.shadow}`,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: Fonts.semiBold,
                            fontSize: 14,
                            color: colors.text,
                          }}
                        >
                          {formatSessionDate(session.date, session.time)} · {formatDuration(session.durationMinutes)}
                        </Text>
                        <Text
                          style={{
                            fontFamily: Fonts.regular,
                            fontSize: 12,
                            color: colors.textSecondary,
                            marginTop: 2,
                          }}
                        >
                          Archived {session.archiveDuration === "3months" ? "3 months" : session.archiveDuration === "6months" ? "6 months" : "1 year"}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <Pressable
                          onPress={() => handleRestoreArchived(session)}
                          hitSlop={8}
                          style={{
                            width: 32, height: 32, borderRadius: 16,
                            backgroundColor: colors.chipInactive,
                            justifyContent: "center", alignItems: "center",
                          }}
                        >
                          <Ionicons name="refresh" size={16} color={colors.accent} />
                        </Pressable>
                        <Pressable
                          onPress={() => handleDeleteArchived(session)}
                          hitSlop={8}
                          style={{
                            width: 32, height: 32, borderRadius: 16,
                            backgroundColor: colors.chipInactive,
                            justifyContent: "center", alignItems: "center",
                          }}
                        >
                          <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bulk Archive Modal */}
      <Modal
        visible={showBulkArchive}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBulkArchive(false)}
      >
        <Pressable
          onPress={() => setShowBulkArchive(false)}
          style={{
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              borderCurve: "continuous",
              width: "100%",
              maxWidth: 340,
              padding: 24,
              boxShadow: `0 16px 48px ${colors.shadow}`,
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: colors.chipInactive,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Ionicons name="archive" size={24} color={colors.accent} />
              </View>
              <Text
                style={{
                  fontFamily: Fonts.heading,
                  fontSize: 18,
                  color: colors.text,
                  textAlign: "center",
                }}
              >
                Bulk Archive
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 13,
                  color: colors.textSecondary,
                  textAlign: "center",
                  marginTop: 6,
                }}
              >
                Archive all sessions older than:
              </Text>
            </View>

            <View style={{ gap: 10 }}>
              {([
                ["3months", "3 Months", "Archive sessions older than 3 months"],
                ["6months", "6 Months", "Archive sessions older than 6 months"],
                ["1year", "1 Year", "Archive sessions older than 1 year"],
              ] as const).map(([period, label, desc]) => (
                <Pressable
                  key={period}
                  onPress={() => handleBulkArchive(period)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 14,
                    backgroundColor: pressed ? colors.chipInactive : colors.background,
                    borderRadius: 12,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: colors.inputBorder,
                  })}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: colors.chipInactive,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="time-outline" size={18} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.text }}>
                      {label}
                    </Text>
                    <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary }}>
                      {desc}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => setShowBulkArchive(false)}
              style={{
                marginTop: 16,
                paddingVertical: 14,
                borderRadius: 12,
                borderCurve: "continuous",
                backgroundColor: colors.chipInactive,
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: Fonts.medium, fontSize: 15, color: colors.text }}>
                Cancel
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
