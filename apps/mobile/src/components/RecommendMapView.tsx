import { useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import * as Location from "expo-location";
import {
  NaverMapMarkerOverlay,
  NaverMapView,
  type NaverMapViewRef,
} from "@mj-studio/react-native-naver-map";
import { Icon, Preview, Text, colors, radius, spacing } from "@repo/ui";

// Figma "color/info"(#2A8ADF)와 그 테두리(#E0F3FF)는 아직 packages/tokens에 없는
// 값이라 로컬 상수로 둔다 (현재 위치를 나타내는 지도 마커 전용, 반경 검색 등 다른
// 화면에서도 쓰이면 그때 packages/tokens에 편입 검토).
const CURRENT_LOCATION_FILL = "#2A8ADF";
const CURRENT_LOCATION_BORDER = "#E0F3FF";

export type RecommendMapMarkerSource = "good_price" | "tour_api";

export interface RecommendMapMarker {
  id: string;
  source: RecommendMapMarkerSource;
  name: string;
  category: string;
  distance: string;
  /** good_price 업소만 값이 있음 (착한가격업소만 가격 정보 보장, docs/schema-design.md §12 참고) */
  price?: string;
  latitude: number;
  longitude: number;
}

/**
 * 지도 마커를 눌렀을 때 뜨는 범례 항목.
 *
 * @param color 범례 점 색상
 * @param label 범례 라벨 텍스트
 */
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    {/* Figma 범례 텍스트는 10px Medium인데 packages/tokens에 아직 그 스케일이
        없어 가장 작은 footnoteRegular(12px)로 대체 — 스케일 추가되면 교체 */}
    <Text variant="footnoteRegular">{label}</Text>
  </View>
);

/**
 * 추천 탭 "지도보기" 화면의 지도 영역 (Figma "recommand-map", node 733:15646 /
 * 733:15879). 네이버 지도 클라이언트 SDK(`@mj-studio/react-native-naver-map`)로
 * 렌더링하고, 마커는 커스텀 뷰 오버레이로 얹는다.
 *
 * @param markers 지도에 표시할 마커 목록
 * @param currentLocation 현재 위치 마커 + 초기 카메라 중심 좌표
 * @param selectedMarkerId 현재 선택된 마커 id (optional, 없으면 하단 프리뷰 미표시)
 * @param onSelectMarker 마커를 누를 때 발생하는 event 명시, 선택한 마커 id 전달
 * @param onPressDetail 하단 프리뷰의 "상세 보기" 버튼을 클릭할 때 발생하는 event 명시 (optional)
 */
export interface RecommendMapViewProps {
  markers: RecommendMapMarker[];
  currentLocation: { latitude: number; longitude: number };
  selectedMarkerId?: string;
  onSelectMarker: (id: string) => void;
  onPressDetail?: () => void;
}

export const RecommendMapView = ({
  markers,
  currentLocation,
  selectedMarkerId,
  onSelectMarker,
  onPressDetail,
}: RecommendMapViewProps) => {
  const selectedMarker = markers.find((marker) => marker.id === selectedMarkerId);
  const mapRef = useRef<NaverMapViewRef>(null);

  const handlePressLocate = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) return;
    mapRef.current?.setLocationTrackingMode("Follow");
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        <NaverMapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          isUseTextureViewAndroid
          mapType="Basic"
          initialCamera={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            zoom: 15,
          }}
          logoAlign="TopRight"
          isShowZoomControls={false}
          isShowScaleBar={false}
          isShowLocationButton={false}
        >
          <NaverMapMarkerOverlay
            latitude={currentLocation.latitude}
            longitude={currentLocation.longitude}
            width={16}
            height={16}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View collapsable={false} style={styles.currentLocationMarker} />
          </NaverMapMarkerOverlay>
          {markers.map((marker) => {
            const isSelected = marker.id === selectedMarkerId;
            return (
              <NaverMapMarkerOverlay
                key={marker.id}
                latitude={marker.latitude}
                longitude={marker.longitude}
                width={isSelected ? 24 : 8}
                height={isSelected ? 24 : 8}
                anchor={{ x: 0.5, y: 0.5 }}
                onTap={() => onSelectMarker(marker.id)}
              >
                {isSelected ? (
                  <View collapsable={false} style={styles.selectedMarker}>
                    <Icon name="restaurant" size="medium" color={colors.content.neutral.inverse} />
                  </View>
                ) : (
                  <View
                    collapsable={false}
                    style={[
                      styles.dotMarker,
                      {
                        backgroundColor:
                          marker.source === "good_price"
                            ? colors.surface.primary.bold
                            : colors.surface.primary.default,
                      },
                    ]}
                  />
                )}
              </NaverMapMarkerOverlay>
            );
          })}
        </NaverMapView>
        <View style={styles.legend}>
          <LegendItem color={colors.surface.primary.bold} label="착한가격업소" />
          <LegendItem color={colors.surface.primary.default} label="일반 업소" />
        </View>
        <Pressable style={styles.locateButton} onPress={handlePressLocate}>
          <Icon name="locate" size="medium" color={colors.content.neutral.default} />
        </Pressable>
      </View>
      {selectedMarker ? (
        <Preview
          name={selectedMarker.name}
          category={selectedMarker.category}
          distance={selectedMarker.distance}
          price={selectedMarker.price ?? ""}
          showPrice={selectedMarker.source === "good_price"}
          onPressDetail={onPressDetail}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapArea: {
    flex: 1,
    overflow: "hidden",
  },
  legend: {
    position: "absolute",
    left: spacing[10],
    top: spacing[10],
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
  locateButton: {
    position: "absolute",
    right: spacing[10],
    bottom: spacing[10],
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius[10],
    backgroundColor: colors.surface.neutral.default,
    shadowColor: colors.surface.neutral.inverse,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentLocationMarker: {
    width: 16,
    height: 16,
    borderRadius: radius.full,
    borderWidth: 2.5,
    borderColor: CURRENT_LOCATION_BORDER,
    backgroundColor: CURRENT_LOCATION_FILL,
    shadowColor: CURRENT_LOCATION_FILL,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  dotMarker: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  selectedMarker: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.primary.bold,
  },
});
