import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { NaverMapMarkerOverlay, NaverMapView, type NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import { Text, colors, radius, spacing } from "@repo/ui";

// Figma 범례 실측 색상(#1e2327, #7d99aa) — packages/tokens의 일반 text/surface
// 스케일과는 무관한, 방문/재방문 전용 시맨틱 색상이라 이 용도로 토큰이 따로 없다
// (mypage/index.tsx의 "별도 팔레트" 매핑과 달리, 이건 범례 자체가 정의하는 색이라
// 그대로 옮긴다).
export const VISIT_DOT_COLOR = "#1e2327";
export const REVISIT_DOT_COLOR = "#7d99aa";

const DEFAULT_CENTER = { latitude: 36.5, longitude: 127.8 };
const DEFAULT_ZOOM = 6;
const SINGLE_STORE_ZOOM = 15;
const MARKER_SIZE = 12;

export interface VisitedStoreMapMarker {
  id: string;
  latitude: number;
  longitude: number;
  /** true면 재방문(2회 이상) 매장 — 범례의 "재방문" 색으로 표시 */
  isRevisit: boolean;
}

/**
 * 마이페이지 M2 "방문 매장 지도"의 지도 영역 (Figma node 409:2265).
 *
 * @param stores 지도에 표시할 방문 매장 마커 목록 (`buildVisitedStoreGroups` 결과 기반)
 */
export interface VisitedStoreMapViewProps {
  stores: VisitedStoreMapMarker[];
}

export const VisitedStoreMapView = ({ stores }: VisitedStoreMapViewProps) => {
  const mapRef = useRef<NaverMapViewRef>(null);
  const initialCenter = stores[0] ?? DEFAULT_CENTER;

  useEffect(() => {
    if (stores.length < 2) return;
    const latitudes = stores.map((store) => store.latitude);
    const longitudes = stores.map((store) => store.longitude);
    mapRef.current?.animateCameraWithTwoCoords({
      coord1: { latitude: Math.min(...latitudes), longitude: Math.min(...longitudes) },
      coord2: { latitude: Math.max(...latitudes), longitude: Math.max(...longitudes) },
    });
  }, [stores]);

  return (
    <View style={styles.container}>
      <NaverMapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        isUseTextureViewAndroid
        mapType="Basic"
        initialCamera={{
          latitude: initialCenter.latitude,
          longitude: initialCenter.longitude,
          zoom: stores.length > 0 ? SINGLE_STORE_ZOOM : DEFAULT_ZOOM,
        }}
        logoAlign="TopRight"
        isShowZoomControls={false}
        isShowScaleBar={false}
        isShowLocationButton={false}
      >
        {stores.map((store) => (
          <NaverMapMarkerOverlay
            key={store.id}
            latitude={store.latitude}
            longitude={store.longitude}
            width={MARKER_SIZE}
            height={MARKER_SIZE}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View
              style={[
                styles.markerDot,
                { backgroundColor: store.isRevisit ? REVISIT_DOT_COLOR : VISIT_DOT_COLOR },
              ]}
            />
          </NaverMapMarkerOverlay>
        ))}
      </NaverMapView>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: VISIT_DOT_COLOR }]} />
          <Text variant="footnoteRegular">방문</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: REVISIT_DOT_COLOR }]} />
          <Text variant="footnoteRegular">재방문</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  markerDot: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.surface.neutral.default,
  },
  legend: {
    position: "absolute",
    left: spacing[16],
    top: spacing[16],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[12],
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius[10],
    backgroundColor: colors.surface.neutral.default,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
});
