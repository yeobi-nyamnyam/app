import { ScrollView, StyleSheet, Text as RNText, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client/react";
import { Header, NavBar, Text, colors, radius, spacing, typography, getFontFamily, type NavBarItemKey } from "@repo/ui";
import { TripBudgetHistoryDocument } from "@repo/types";

import { HistoryRow } from "@/components/HistoryRow";
import { formatWon } from "@/lib/format";
import { useAlertModal } from "@/hooks/useAlertModal";

interface TripBudgetSnapshot {
  total_budget: number;
  fixed_cost: number;
  floating_budget: number;
}

// budget_change_history.before_json/after_json은 jsonb라 스키마상 unknown으로 온다.
// event_type별로 실제 담기는 키가 다르다는 건 docs/schema-design.md §5에 문서화돼있다.
const describeEvent = (eventType: string, amountDelta: number, before: unknown, after: unknown) => {
  if (eventType === "budget_edit") {
    const b = before as Partial<TripBudgetSnapshot>;
    const a = after as Partial<TripBudgetSnapshot>;
    const parts: string[] = [];
    if (b.total_budget !== a.total_budget) {
      parts.push(`전체예산 ${formatWon(b.total_budget ?? 0)} → ${formatWon(a.total_budget ?? 0)}`);
    }
    if (b.fixed_cost !== a.fixed_cost) {
      parts.push(`고정비용 ${formatWon(b.fixed_cost ?? 0)} → ${formatWon(a.fixed_cost ?? 0)}`);
    }
    if (b.floating_budget !== a.floating_budget) {
      parts.push(`유동비용 ${formatWon(b.floating_budget ?? 0)} → ${formatWon(a.floating_budget ?? 0)}`);
    }
    return { title: "예산 수정", description: parts.join(", ") || "예산이 수정됐어요" };
  }
  if (eventType === "rebalance") {
    return { title: "예산 재분배", description: "남은 끼니의 예산이 다시 배분됐어요" };
  }
  if (eventType === "expense_input") {
    return { title: "끼니 소비 기록", description: `${formatWon(Math.abs(amountDelta))} 사용` };
  }
  if (eventType === "log_deleted") {
    return { title: "기록 삭제", description: `${formatWon(Math.abs(amountDelta))} 복원됨` };
  }
  if (eventType === "receipt_applied") {
    return { title: "영수증 반영", description: "OCR 결과로 금액이 갱신됐어요" };
  }
  return { title: eventType, description: "" };
};

const formatMonthDay = (isoDateTime: string) => {
  const date = new Date(isoDateTime);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};

const formatHourMinute = (isoDateTime: string) => {
  const date = new Date(isoDateTime);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/**
 * 예산 변동 히스토리 화면 (F6-7, Figma "budget-history"). record/history.tsx
 * 헤더의 "예산 변동 히스토리 보기"에서 진입한다. budget_change_history를
 * 시간순으로 보여주고, 상단 요약 카드에 현재 유동비용과 최초 산정 대비 변경
 * 횟수를 표시한다.
 */
export default function BudgetHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlertModal();
  const params = useLocalSearchParams<{ tripId: string }>();

  const { data, loading } = useQuery(TripBudgetHistoryDocument, {
    variables: { tripId: params.tripId },
    fetchPolicy: "cache-and-network",
  });
  const tripNode = data?.tripsCollection.edges[0]?.node;

  // 쿼리는 시간순(오래된 순)으로 오므로, 최초 산정값은 첫 budget_edit의 이전 값으로
  // 구한다(budget_edit이 한 번도 없으면 지금 값이 곧 최초 산정값).
  const events = (tripNode?.budget_change_historyCollection?.edges ?? []).map((edge) => edge.node);
  const budgetEditEvents = events.filter((event) => event.event_type === "budget_edit");
  const firstBudgetEdit = budgetEditEvents[0];
  const originalFloatingBudget = firstBudgetEdit
    ? ((firstBudgetEdit.before_json as Partial<TripBudgetSnapshot>).floating_budget ?? tripNode?.floating_budget ?? 0)
    : (tripNode?.floating_budget ?? 0);
  const changeCount = budgetEditEvents.length;

  const handleNavChange = (key: NavBarItemKey) => {
    if (key === "record") {
      router.push("/record");
      return;
    }
    if (key === "home") {
      router.push("/");
      return;
    }
    if (key === "recommend") {
      router.push("/recommend");
      return;
    }
    if (key === "chat") {
      router.push("/chat");
      return;
    }
    if (key === "profile") {
      router.push("/mypage");
      return;
    }
    showAlert("준비 중", "아직 구현되지 않은 탭이에요.");
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="예산 변동 히스토리" onBackPress={() => router.back()} />
      <View style={styles.body}>
        {loading && !data ? (
          <View style={styles.emptyState}>
            <Text color="subtlest">불러오는 중...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.summaryCard}>
              <RNText style={styles.summaryLabel}>전체 식비 예산</RNText>
              <Text variant="title1Bold">{formatWon(tripNode?.floating_budget ?? 0)}</Text>
              <Text variant="subheadlineRegular">
                {changeCount > 0
                  ? `최초 산정 ${formatWon(originalFloatingBudget)}에서 ${changeCount}회 변경됨`
                  : "아직 변경된 적 없어요"}
              </Text>
            </View>

            {events.length === 0 ? (
              <View style={styles.emptyState}>
                <Text color="subtlest">아직 변동 내역이 없어요.</Text>
              </View>
            ) : (
              // 화면엔 최신순으로 보여준다 (쿼리는 오래된 순으로 왔으므로 뒤집는다).
              [...events].reverse().map((event, index) => {
                const { title, description } = describeEvent(
                  event.event_type,
                  event.amount_delta,
                  event.before_json,
                  event.after_json,
                );
                return (
                  <HistoryRow
                    key={event.id}
                    title={title}
                    description={description}
                    date={formatMonthDay(event.created_at)}
                    time={formatHourMinute(event.created_at)}
                    isLatest={index === 0}
                  />
                );
              })
            )}
          </ScrollView>
        )}
      </View>
      <View style={{ paddingBottom: insets.bottom }}>
        <NavBar active="record" onChange={handleNavChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.neutral.default,
  },
  body: {
    flex: 1,
  },
  content: {
    padding: spacing[16],
    gap: spacing[8],
  },
  summaryCard: {
    backgroundColor: colors.surface.primary.subtlest,
    borderRadius: radius[23],
    padding: spacing[20],
    gap: spacing[8],
    marginBottom: spacing[8],
  },
  summaryLabel: {
    fontFamily: getFontFamily(typography.headlineEmphasized.fontWeight),
    fontSize: typography.headlineEmphasized.fontSize,
    lineHeight: typography.headlineEmphasized.lineHeight,
    letterSpacing: typography.headlineEmphasized.letterSpacing,
    fontWeight: typography.headlineEmphasized.fontWeight,
    color: colors.content.primary.bold,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[24],
  },
});
