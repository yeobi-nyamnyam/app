import { useEffect, useState } from "react";
import * as Location from "expo-location";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * 마운트 시 위치 권한을 요청하고, 허용되면 기기의 현재 위치를 가져온다.
 * 권한 거부/실패 시 null을 유지한다 (호출부에서 폴백 좌표 처리).
 */
export function useCurrentLocation(): Coordinates | null {
  const [location, setLocation] = useState<Coordinates | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) return;

      try {
        // 마지막으로 캐시된 위치가 있으면 그걸로 먼저 빠르게 보여주고, 없으면
        // 실시간 측위(getCurrentPositionAsync)를 기다린다.
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown && !cancelled) {
          setLocation({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          });
        }

        const current = await Location.getCurrentPositionAsync();
        if (!cancelled) {
          setLocation({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          });
        }
      } catch {
        // 위치 서비스가 꺼져있는 등 측위 자체가 실패하면 null 유지 (호출부 폴백 좌표 처리)
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return location;
}
