import { useRef, useState } from "react";
import { type LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import * as Location from "expo-location";
import {
  NaverMapMarkerOverlay,
  NaverMapView,
  type NaverMapViewRef,
} from "@mj-studio/react-native-naver-map";
import { Icon, Preview, Text, colors, radius, spacing, stroke } from "@repo/ui";

// NCP Style Editor로 만든 커스텀 지도 스타일 id (optional — 없으면 기본 스타일)
const NAVER_MAP_STYLE_ID = Constants.expoConfig?.extra?.naverMapStyleId as string | undefined;

export type RecommendMapMarkerSource = "good_price" | "tour_api";

export interface RecommendMapMarker {
  id: string;
  source: RecommendMapMarkerSource;
  name: string;
  category: string;
  distance: string;
  /** good_price 업소만 값이 있음 (착한가격업소만 가격 정보 보장, docs/schema-design.md §12 참고) */
  price?: string;
  /** tour_api 업소만 값이 있음 — 착한가격업소 API는 사진을 제공하지 않아 항상 없음 */
  imageUrl?: string;
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
 * @param currentLocation 초기 카메라 중심 좌표
 * @param selectedMarkerId 현재 선택된 마커 id (optional, 없으면 하단 프리뷰 미표시)
 * @param onSelectMarker 마커를 누르면 해당 id, 지도 빈 영역을 누르면 undefined를 전달하는
 * event 명시(선택 해제)
 * @param onPressDetail 하단 프리뷰의 "상세 보기" 버튼을 클릭할 때 발생하는 event 명시 (optional)
 */
export interface RecommendMapViewProps {
  markers: RecommendMapMarker[];
  currentLocation: { latitude: number; longitude: number };
  selectedMarkerId?: string;
  onSelectMarker: (id: string | undefined) => void;
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
  // Figma에서 Preview가 뜨면 지도 영역은 그대로 두고 범례·현재위치 버튼만 그 위로
  // 밀려 올라간다 — Preview 실측 높이만큼 오프셋을 준다 (하드코딩 대신 onLayout으로 측정).
  const [previewHeight, setPreviewHeight] = useState(0);
  const controlsBottomOffset = spacing[10] + (selectedMarker ? previewHeight : 0);

  const handlePressLocate = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) return;
    mapRef.current?.setLocationTrackingMode("Follow");
  };

  const handlePreviewLayout = (event: LayoutChangeEvent) => {
    setPreviewHeight(event.nativeEvent.layout.height);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        <NaverMapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          isUseTextureViewAndroid
          mapType="Basic"
          customStyleId={NAVER_MAP_STYLE_ID}
          initialCamera={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            zoom: 15,
          }}
          logoAlign="TopRight"
          isShowZoomControls={false}
          isShowScaleBar={false}
          isShowLocationButton={false}
          onTapMap={() => onSelectMarker(undefined)}
        >
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
                  <View
                    collapsable={false}
                    style={[
                      styles.selectedMarker,
                      {
                        backgroundColor:
                          marker.source === "good_price"
                            ? colors.surface.primary.bold
                            : colors.surface.primary.default,
                      },
                    ]}
                  >
                    <Icon
                      name="restaurant"
                      size="medium"
                      color={
                        marker.source === "good_price"
                          ? colors.content.neutral.inverse
                          : colors.content.neutral.default
                      }
                    />
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
        <View style={[styles.legend, { bottom: controlsBottomOffset }]}>
          <LegendItem color={colors.surface.primary.bold} label="착한가격업소" />
          <LegendItem color={colors.surface.primary.default} label="일반 업소" />
        </View>
        <Pressable
          style={[styles.locateButton, { bottom: controlsBottomOffset }]}
          onPress={handlePressLocate}
        >
          <Icon name="locate" size="medium" color={colors.content.neutral.default} />
        </Pressable>
      </View>
      {selectedMarker ? (
        <View style={styles.previewOverlay} onLayout={handlePreviewLayout}>
          <Preview
            name={selectedMarker.name}
            category={selectedMarker.category}
            distance={selectedMarker.distance}
            price={selectedMarker.price ?? ""}
            imageUrl={selectedMarker.imageUrl}
            showPrice={selectedMarker.source === "good_price"}
            onPressDetail={onPressDetail}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapArea: {
    // Preview가 뜨더라도 지도 영역 자체는 줄어들지 않는다(Figma 참고) — Preview는
    // 지도 위에 겹쳐지는 오버레이로 별도 렌더링.
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
  previewOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  legend: {
    position: "absolute",
    left: spacing[10],
    bottom: spacing[10],
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
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    borderWidth: stroke.hairline,
    borderColor: colors.border.neutral.subtle,
    backgroundColor: colors.surface.neutral.default,
    // Figma "drop-shadow(0px 0px 2px rgba(24,24,24,0.3))" — shadow*/elevation는
    // 안드로이드에서 offsetY 0을 무시하고 항상 아래로 그림자가 지길래 boxShadow로 대체
    boxShadow: [
      { offsetX: 0, offsetY: 0, blurRadius: 2, color: colors.surface.neutral.alpha["inverse-alpha-30"] },
    ],
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
  },
});
