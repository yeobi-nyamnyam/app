export interface Coordinates {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * @param from 기준 좌표 (예: 사용자 현재 위치)
 * @param to 대상 좌표 (예: 음식점 좌표)
 */
export const calculateDistanceKm = (from: Coordinates, to: Coordinates): number => {
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const sinHalfLat = Math.sin(deltaLat / 2);
  const sinHalfLng = Math.sin(deltaLng / 2);
  const a = sinHalfLat * sinHalfLat + Math.cos(lat1) * Math.cos(lat2) * sinHalfLng * sinHalfLng;
  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * centralAngle;
};

/**
 * @param distanceKm calculateDistanceKm 결과 (km 단위)
 */
export const formatDistanceKm = (distanceKm: number): string => `${distanceKm.toFixed(1)}km`;
