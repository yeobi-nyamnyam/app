import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, stroke, typography, getFontFamily } from "@repo/ui";

/**
 * @param title 이벤트 제목 (예: "예산 수정")
 * @param description 이벤트 상세 설명 (예: "유동비용 32,400원 → 24,400원")
 * @param date 날짜 텍스트 (예: "08.13")
 * @param time 시각 텍스트 (예: "19:20")
 * @param isLatest 목록의 가장 최근 항목인지: true | false (optional, 기본값 false).
 * true면 점 표시가 밝은 색(primary default), false면 어두운 색(primary bold)
 */
export interface HistoryRowProps {
  title: string;
  description: string;
  date: string;
  time: string;
  isLatest?: boolean;
}

export const HistoryRow = ({ title, description, date, time, isLatest = false }: HistoryRowProps) => (
  <View style={styles.container}>
    <View style={styles.dotWrap}>
      <View style={[styles.dot, isLatest ? styles.dotLatest : styles.dotPast]} />
    </View>
    <View style={styles.textBlock}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.description}>{description}</Text>
    </View>
    <View style={styles.dateTimeRow}>
      <Text style={styles.dateTime}>{date}</Text>
      <Text style={styles.dateTime}>{time}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[4],
    paddingVertical: spacing[16],
    paddingHorizontal: spacing[8],
    borderBottomWidth: stroke.default,
    borderBottomColor: colors.border.neutral.subtle,
  },
  dotWrap: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotLatest: {
    backgroundColor: colors.content.primary.default,
  },
  dotPast: {
    backgroundColor: colors.content.primary.bold,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontFamily: getFontFamily(typography.headlineEmphasized.fontWeight),
    fontSize: typography.headlineEmphasized.fontSize,
    lineHeight: typography.headlineEmphasized.lineHeight,
    letterSpacing: typography.headlineEmphasized.letterSpacing,
    fontWeight: typography.headlineEmphasized.fontWeight,
    color: colors.content.neutral.default,
  },
  description: {
    fontFamily: getFontFamily(typography.bodyRegular.fontWeight),
    fontSize: typography.bodyRegular.fontSize,
    lineHeight: typography.bodyRegular.lineHeight,
    letterSpacing: typography.bodyRegular.letterSpacing,
    fontWeight: typography.bodyRegular.fontWeight,
    color: colors.content.neutral.default,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: spacing[4],
    flexShrink: 0,
  },
  dateTime: {
    fontFamily: getFontFamily(typography.footnoteRegular.fontWeight),
    fontSize: typography.footnoteRegular.fontSize,
    lineHeight: typography.footnoteRegular.lineHeight,
    letterSpacing: typography.footnoteRegular.letterSpacing,
    fontWeight: typography.footnoteRegular.fontWeight,
    color: colors.content.neutral.default,
  },
});
