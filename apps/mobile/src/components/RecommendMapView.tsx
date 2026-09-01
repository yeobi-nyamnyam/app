import { StyleSheet, View } from "react-native";
import { NaverMapView } from "@mj-studio/react-native-naver-map";

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
  // NCP 401(Unauthorized client) 원인 확인 중 — 마커/범례/현재위치 버튼/Preview를
  // 걷어내고 NaverMapView 자체가 뜨는지만 우선 확인한다 (이슈 #83 참고).
  // TODO(F3-1): 401 해결되면 마커·범례·현재위치·Preview 복원할 것.
  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        <NaverMapView
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
});
