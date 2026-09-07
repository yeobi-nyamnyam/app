import { useMemo } from "react";
import Supercluster from "supercluster";

// Naver 지도 zoom(0~21)은 표준 웹 메르카토르 슬리피맵 줌 레벨과 동일한 스케일이라
// supercluster(줌 기반 그리드 클러스터링 라이브러리)를 그대로 적용할 수 있다.
const CLUSTER_RADIUS = 60;
const CLUSTER_MAX_ZOOM = 16;
// 화면 밖 데이터까지 전부 오버레이로 마운트하면(특히 시/도 전체 단위라 수천 건인
// 경우) 네이티브 뷰 개수가 그대로 불어나 탭/핀치줌 반응이 느려진다. 뷰포트
// bbox로 걸러서 화면 근처만 렌더링한다. panning 여유를 위해 뷰포트보다 약간
// 넓게(PADDING배) 잡는다.
const VIEWPORT_BBOX_PADDING = 1.5;
export type ViewportRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

interface ClusterableMarker {
  id: string;
  latitude: number;
  longitude: number;
}

// supercluster의 네임스페이스 타입(Supercluster.ClusterProperties)은 default import와
// 함께 타입 위치에서 참조할 수 없어(export = 모듈의 esModuleInterop 제약) 필요한
// 필드만 직접 선언해서 쓴다.
interface ClusterFeatureProperties {
  cluster: true;
  cluster_id: number;
  point_count: number;
}

export interface MarkerClusterPoint<T> {
  type: "point";
  latitude: number;
  longitude: number;
  data: T;
}

export interface MarkerClusterGroup {
  type: "cluster";
  id: number;
  latitude: number;
  longitude: number;
  count: number;
  /** 이 클러스터를 눌렀을 때 확대해야 하는 줌 레벨 */
  expansionZoom: number;
}

export type MarkerClusterResult<T> = MarkerClusterPoint<T> | MarkerClusterGroup;

const regionToBBox = (region: ViewportRegion | undefined): [number, number, number, number] => {
  if (!region) return [-180, -85, 180, 85];
  const halfLat = (region.latitudeDelta * VIEWPORT_BBOX_PADDING) / 2;
  const halfLng = (region.longitudeDelta * VIEWPORT_BBOX_PADDING) / 2;
  return [
    region.longitude - halfLng,
    Math.max(region.latitude - halfLat, -85),
    region.longitude + halfLng,
    Math.min(region.latitude + halfLat, 85),
  ];
};

/**
 * 좌표를 가진 마커 목록을 현재 지도 줌 레벨/뷰포트 기준으로 클러스터링한다. 근접한
 * 마커가 많을 때 전부 개별로 그리면 성능/시인성이 떨어지는 문제를 해결한다.
 *
 * @param items 클러스터링할 마커 목록 (id, latitude, longitude 필수)
 * @param zoom 현재 지도 카메라 줌 레벨
 * @param region 현재 지도 카메라가 보여주는 영역 (optional, 아직 모르면 전체를 대상으로 계산)
 */
export function useMarkerClusters<T extends ClusterableMarker>(
  items: T[],
  zoom: number,
  region?: ViewportRegion,
): MarkerClusterResult<T>[] {
  const index = useMemo(() => {
    const cluster = new Supercluster<T>({
      radius: CLUSTER_RADIUS,
      maxZoom: CLUSTER_MAX_ZOOM,
    });
    cluster.load(
      items.map((item) => ({
        type: "Feature",
        properties: item,
        geometry: { type: "Point", coordinates: [item.longitude, item.latitude] },
      })),
    );
    return cluster;
  }, [items]);

  return useMemo(() => {
    // supercluster는 maxZoom을 넘는 줌(정확히는 maxZoom+1)을 요청하면 더 이상 묶지
    // 않고 완전히 펼쳐진 원본 포인트를 돌려주도록 내부적으로 이미 클램프한다
    // (Supercluster.prototype._limitZoom: min~maxZoom+1). 여기서 CLUSTER_MAX_ZOOM으로
    // 한 번 더 clamp하면 그 maxZoom+1 구간에 절대 도달하지 못해서, 클러스터를 눌러
    // expansionZoom까지 카메라를 이동시켜도(그 값이 maxZoom+1일 수 있음) 여전히
    // 같은 클러스터가 남아있는 버그가 생긴다 — 그대로 넘긴다.
    const bbox = regionToBBox(region);
    return index.getClusters(bbox, zoom).map((feature): MarkerClusterResult<T> => {
      const [longitude, latitude] = feature.geometry.coordinates as [number, number];
      const properties = feature.properties;
      if ("cluster" in properties && properties.cluster) {
        const clusterProperties = properties as ClusterFeatureProperties;
        return {
          type: "cluster",
          id: clusterProperties.cluster_id,
          latitude,
          longitude,
          count: clusterProperties.point_count,
          expansionZoom: index.getClusterExpansionZoom(clusterProperties.cluster_id),
        };
      }
      return {
        type: "point",
        latitude,
        longitude,
        data: properties as T,
      };
    });
  }, [index, zoom, region]);
}
