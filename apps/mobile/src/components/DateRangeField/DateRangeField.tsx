import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import type { MarkedDates } from "react-native-calendars/src/types";
import {
  Button,
  Text,
  colors,
  getFontFamily,
  radius,
  spacing,
  stroke,
  typography,
} from "@repo/ui";

import { CalendarIcon } from "@/components/TripFieldIcons";

const WEEKDAY_LABEL = ["일", "월", "화", "수", "목", "금", "토"];

const toISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseISODate = (value: string): Date => {
  const parts = value.split("-").map(Number);
  const [year, month, day] = [parts[0] ?? 1970, parts[1] ?? 1, parts[2] ?? 1];
  return new Date(year, month - 1, day);
};

const formatDisplayDate = (value: string): string => {
  const date = parseISODate(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day} (${WEEKDAY_LABEL[date.getDay()]})`;
};

const buildMarkedDates = (
  start: string | null,
  end: string | null,
): MarkedDates => {
  if (!start) {
    return {};
  }
  if (!end) {
    return {
      [start]: {
        startingDay: true,
        endingDay: true,
        color: colors.surface.primary.default,
      },
    };
  }

  const marked: MarkedDates = {};
  const cursor = parseISODate(start);
  const endDate = parseISODate(end);
  while (cursor <= endDate) {
    const iso = toISODate(cursor);
    marked[iso] = {
      color: colors.surface.primary.default,
      textColor: colors.content.neutral.inverse,
      startingDay: iso === start,
      endingDay: iso === end,
    };
    cursor.setDate(cursor.getDate() + 1);
  }
  return marked;
};

/**
 * @param startDate 시작일(ISO, YYYY-MM-DD), 아직 선택 안 했으면 null
 * @param endDate 종료일(ISO, YYYY-MM-DD), 아직 선택 안 했으면 null
 * @param onChange 시작일·종료일을 모두 선택하고 확인을 눌렀을 때 발생하는 event, ISO 문자열 두 개를 전달
 */
export interface DateRangeFieldProps {
  startDate: string | null;
  endDate: string | null;
  onChange: (startDate: string, endDate: string) => void;
}

export const DateRangeField = ({
  startDate,
  endDate,
  onChange,
}: DateRangeFieldProps) => {
  const [visible, setVisible] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  const open = () => {
    setRangeStart(startDate);
    setRangeEnd(endDate);
    setVisible(true);
  };

  const handleDayPress = (day: DateData) => {
    if (!rangeStart || rangeEnd) {
      setRangeStart(day.dateString);
      setRangeEnd(null);
      return;
    }
    if (day.dateString < rangeStart) {
      setRangeStart(day.dateString);
      return;
    }
    setRangeEnd(day.dateString);
  };

  const confirm = () => {
    if (!rangeStart || !rangeEnd) {
      return;
    }
    onChange(rangeStart, rangeEnd);
    setVisible(false);
  };

  const label =
    startDate && endDate
      ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
      : "여행 기간을 선택해주세요";

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.field} onPress={open}>
        <Text
          variant="bodyRegular"
          color={startDate && endDate ? "default" : "subtlest"}
        >
          {label}
        </Text>
        <CalendarIcon color={colors.content.neutral.default} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={styles.modalSheet}
            onPress={(event) => event.stopPropagation()}
          >
            <Text variant="headlineEmphasized" align="center">
              여행 기간 선택
            </Text>
            <Calendar
              markingType="period"
              markedDates={buildMarkedDates(rangeStart, rangeEnd)}
              onDayPress={handleDayPress}
              minDate={toISODate(new Date())}
              theme={{
                todayTextColor: colors.content.primary.bold,
                arrowColor: colors.content.neutral.default,
                monthTextColor: colors.content.neutral.default,
                textSectionTitleColor: colors.content.neutral.subtle,
                dayTextColor: colors.content.neutral.default,
                textDisabledColor: colors.content.neutral.disabled,
                selectedDayBackgroundColor: colors.surface.primary.default,
                selectedDayTextColor: colors.content.neutral.inverse,
                textDayFontFamily: getFontFamily(
                  typography.bodyRegular.fontWeight,
                ),
                textMonthFontFamily: getFontFamily(
                  typography.headlineEmphasized.fontWeight,
                ),
                textDayHeaderFontFamily: getFontFamily(
                  typography.footnoteRegular.fontWeight,
                ),
              }}
            />
            <Button
              label="확인"
              disabled={!rangeStart || !rangeEnd}
              onPress={confirm}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  field: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[8],
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius[10],
    borderWidth: stroke.default,
    borderColor: colors.border.neutral.default,
    backgroundColor: colors.surface.neutral.default,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.surface.neutral.alpha["inverse-alpha-50"],
  },
  modalSheet: {
    backgroundColor: colors.surface.neutral.default,
    borderTopLeftRadius: radius[23],
    borderTopRightRadius: radius[23],
    padding: spacing[20],
    gap: spacing[16],
  },
});
