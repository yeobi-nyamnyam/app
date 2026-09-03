import { createContext, useCallback, useContext, useState, type PropsWithChildren } from "react";
import { Modal as RNModal, Pressable, StyleSheet, View } from "react-native";
import { Modal, colors, spacing } from "@repo/ui";

interface AlertModalContextValue {
  showAlert: (title: string, content: string) => void;
}

const AlertModalContext = createContext<AlertModalContextValue | undefined>(undefined);

/**
 * 앱 전역에서 `Alert.alert` 대신 쓰는 확인 전용 모달. 안드로이드 기본 alert
 * 팝업 대신 디자인시스템 `Modal`을 쓰기 위한 공용 Provider — 루트 레이아웃에
 * 한 번만 두면, 어느 화면에서든 `useAlertModal()`의 `showAlert(제목, 내용)`
 * 하나로 뜨고 닫힌다.
 */
export function AlertModalProvider({ children }: PropsWithChildren) {
  const [alert, setAlert] = useState<{ title: string; content: string } | null>(null);

  const showAlert = useCallback((title: string, content: string) => {
    setAlert({ title, content });
  }, []);

  const dismiss = () => setAlert(null);

  return (
    <AlertModalContext.Provider value={{ showAlert }}>
      {children}
      <RNModal visible={alert != null} transparent animationType="fade" onRequestClose={dismiss}>
        <Pressable style={styles.backdrop} onPress={dismiss} />
        <View style={styles.center}>
          {alert ? <Modal title={alert.title} content={alert.content} onConfirm={dismiss} /> : null}
        </View>
      </RNModal>
    </AlertModalContext.Provider>
  );
}

export function useAlertModal(): AlertModalContextValue {
  const context = useContext(AlertModalContext);
  if (!context) {
    throw new Error("useAlertModal은 AlertModalProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface.neutral.alpha["inverse-alpha-30"],
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[24],
  },
});
