import { useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import * as Location from "expo-location";
import { NaverMapView, type NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import { Icon, colors, radius, spacing, stroke } from "@repo/ui";

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

export const RecommendMapView = ({ currentLocation }: RecommendMapViewProps) => {
  // TODO(F3-1): 마커·범례·Preview는 이슈 #83에서 순차 복원 예정.
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
        />
        <Pressable style={styles.locateButton} onPress={handlePressLocate}>
          <Icon name="locate" size="medium" color={colors.content.neutral.default} />
        </Pressable>
      </View>
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
});
