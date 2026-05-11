import { useState, useMemo, useCallback } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { Fonts } from "@/constants/Typography";
import { useTheme } from "@/components/theme-provider";
import { Ionicons } from "@expo/vector-icons";

interface CalendarPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  selectedDate?: string;
  title?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function CalendarPicker({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
  title = "Select Date",
}: CalendarPickerProps) {
  const { colors } = useTheme();

  const initialDate = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      days.push({ day: daysInPrevMonth - i, month: prevMonth, year: prevYear, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month: viewMonth, year: viewYear, isCurrentMonth: true });
    }

    // Next month leading days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      days.push({ day: i, month: nextMonth, year: nextYear, isCurrentMonth: false });
    }

    return days;
  }, [viewYear, viewMonth]);

  const goToPrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }, [viewMonth, viewYear]);

  const goToNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }, [viewMonth, viewYear]);

  const handleDayPress = useCallback((day: { day: number; month: number; year: number }) => {
    const dateStr = `${day.year}-${String(day.month + 1).padStart(2, "0")}-${String(day.day).padStart(2, "0")}`;
    onSelectDate(dateStr);
    onClose();
  }, [onSelectDate, onClose]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
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
            maxWidth: 360,
            padding: 20,
            boxShadow: `0 16px 48px ${colors.shadow}`,
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontFamily: Fonts.heading,
              fontSize: 18,
              color: colors.text,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {title}
          </Text>

          {/* Month Navigation */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Pressable
              onPress={goToPrevMonth}
              hitSlop={12}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.chipInactive,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="chevron-back" size={18} color={colors.text} />
            </Pressable>
            <Text
              style={{
                fontFamily: Fonts.semiBold,
                fontSize: 16,
                color: colors.text,
              }}
            >
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <Pressable
              onPress={goToNextMonth}
              hitSlop={12}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.chipInactive,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.text} />
            </Pressable>
          </View>

          {/* Day headers */}
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            {DAYS.map((day) => (
              <View key={day} style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 11,
                    color: colors.textSecondary,
                    textTransform: "uppercase",
                  }}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {calendarDays.map((dayObj, index) => {
              const dateStr = `${dayObj.year}-${String(dayObj.month + 1).padStart(2, "0")}-${String(dayObj.day).padStart(2, "0")}`;
              const isSelected = selectedDate === dateStr;
              const isToday = todayStr === dateStr;
              const isFuture = dateStr > todayStr;

              return (
                <Pressable
                  key={index}
                  onPress={() => !isFuture && handleDayPress(dayObj)}
                  style={{
                    width: "14.28%",
                    aspectRatio: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: isSelected
                        ? colors.accent
                        : isToday
                        ? colors.chipInactive
                        : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: isSelected || isToday ? Fonts.semiBold : Fonts.regular,
                        fontSize: 14,
                        color: isSelected
                          ? "#FFFFFF"
                          : !dayObj.isCurrentMonth || isFuture
                          ? colors.textSecondary + "60"
                          : isToday
                          ? colors.accent
                          : colors.text,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {dayObj.day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Today button and Done */}
          <View style={{ flexDirection: "row", marginTop: 16, gap: 10 }}>
            <Pressable
              onPress={() => {
                setViewMonth(today.getMonth());
                setViewYear(today.getFullYear());
                handleDayPress({ day: today.getDate(), month: today.getMonth(), year: today.getFullYear() });
              }}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                borderCurve: "continuous",
                backgroundColor: colors.chipInactive,
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.text }}>
                Today
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                borderCurve: "continuous",
                backgroundColor: colors.accent,
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: "#FFFFFF" }}>
                Done
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

interface TimePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectTime: (time: string) => void;
  selectedTime?: string;
}

export function TimePicker({
  visible,
  onClose,
  onSelectTime,
  selectedTime = "12:00",
}: TimePickerProps) {
  const { colors } = useTheme();
  const [hours, minutes] = selectedTime.split(":").map(Number);
  const [selectedHour, setSelectedHour] = useState(hours);
  const [selectedMinute, setSelectedMinute] = useState(minutes);

  const handleConfirm = useCallback(() => {
    const timeStr = `${String(selectedHour).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")}`;
    onSelectTime(timeStr);
    onClose();
  }, [selectedHour, selectedMinute, onSelectTime, onClose]);

  const displayHour = selectedHour === 0 ? 12 : selectedHour > 12 ? selectedHour - 12 : selectedHour;
  const period = selectedHour >= 12 ? "PM" : "AM";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
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
            maxWidth: 320,
            padding: 24,
            boxShadow: `0 16px 48px ${colors.shadow}`,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.heading,
              fontSize: 18,
              color: colors.text,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Select Time
          </Text>

          {/* Time display */}
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: 42,
                color: colors.accent,
                fontVariant: ["tabular-nums"],
              }}
            >
              {String(displayHour).padStart(2, "0")}
            </Text>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 42, color: colors.textSecondary }}>:</Text>
            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: 42,
                color: colors.accent,
                fontVariant: ["tabular-nums"],
              }}
            >
              {String(selectedMinute).padStart(2, "0")}
            </Text>
            <Text style={{ fontFamily: Fonts.semiBold, fontSize: 18, color: colors.textSecondary, marginLeft: 4 }}>
              {period}
            </Text>
          </View>

          {/* Hour control */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontFamily: Fonts.medium, fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}>
              HOUR
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Pressable
                onPress={() => setSelectedHour(selectedHour === 0 ? 23 : selectedHour - 1)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.chipInactive,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="remove" size={20} color={colors.accent} />
              </Pressable>
              <View
                style={{
                  flex: 1,
                  height: 44,
                  backgroundColor: colors.chipInactive,
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 16, color: colors.text, fontVariant: ["tabular-nums"] }}>
                  {displayHour} {period}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedHour(selectedHour === 23 ? 0 : selectedHour + 1)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.chipInactive,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="add" size={20} color={colors.accent} />
              </Pressable>
            </View>
          </View>

          {/* Minute control */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontFamily: Fonts.medium, fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}>
              MINUTE
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Pressable
                onPress={() => setSelectedMinute(selectedMinute === 0 ? 55 : selectedMinute - 5)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.chipInactive,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="remove" size={20} color={colors.accent} />
              </Pressable>
              <View
                style={{
                  flex: 1,
                  height: 44,
                  backgroundColor: colors.chipInactive,
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 16, color: colors.text, fontVariant: ["tabular-nums"] }}>
                  {String(selectedMinute).padStart(2, "0")}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedMinute(selectedMinute === 55 ? 0 : selectedMinute + 5)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.chipInactive,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="add" size={20} color={colors.accent} />
              </Pressable>
            </View>
          </View>

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
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
            <Pressable
              onPress={handleConfirm}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                borderCurve: "continuous",
                backgroundColor: colors.accent,
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: Fonts.medium, fontSize: 15, color: "#FFFFFF" }}>
                Confirm
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
