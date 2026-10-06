import type { Coordinates } from '../storage/types';

export class GeoLocationTracker {
  private static cachedCoordinates: Coordinates | null = null;
  private static watchId: number | null = null;

  /**
   * Starts tracking GPS position with high accuracy.
   */
  static startTracking(): void {
    if (!('geolocation' in navigator)) return;

    if (this.watchId !== null) return;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.cachedCoordinates = {
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          altitude: pos.coords.altitude ? Number(pos.coords.altitude.toFixed(1)) : null,
          accuracy: Math.round(pos.coords.accuracy),
          heading: pos.coords.heading,
          speed: pos.coords.speed
        };
      },
      (err) => {
        console.warn('Geolocation sensor notice:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000
      }
    );
  }

  /**
   * Retrieves current or cached GPS coordinates.
   */
  static async getCurrentPosition(): Promise<Coordinates> {
    if (this.cachedCoordinates) {
      return this.cachedCoordinates;
    }

    if (!('geolocation' in navigator)) {
      return { latitude: 47.6062, longitude: -122.3321, accuracy: 50 }; // Default Pacific Northwest trail coordinates
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: Coordinates = {
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            altitude: pos.coords.altitude ? Number(pos.coords.altitude.toFixed(1)) : null,
            accuracy: Math.round(pos.coords.accuracy)
          };
          this.cachedCoordinates = coords;
          resolve(coords);
        },
        () => {
          // If user denies or sensor unavailable, return synthetic trail coordinates
          resolve({ latitude: 47.6062, longitude: -122.3321, accuracy: 100 });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }

  static stopTracking(): void {
    if (this.watchId !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}

export interface MapBoundingBox {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export interface CanvasPosition {
  xPercent: number;
  yPercent: number;
}

/**
 * Computes a spatial bounding box for a set of GPS coordinates with a defensive buffer.
 */
export function computeBoundingBox(points: Coordinates[]): MapBoundingBox {
  if (points.length === 0) {
    return { minLat: 18.8, maxLat: 19.3, minLon: 72.7, maxLon: 73.3 };
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  for (const pt of points) {
    if (pt.latitude < minLat) minLat = pt.latitude;
    if (pt.latitude > maxLat) maxLat = pt.latitude;
    if (pt.longitude < minLon) minLon = pt.longitude;
    if (pt.longitude > maxLon) maxLon = pt.longitude;
  }

  // Ensure minimum spread buffer so points aren't squished to edges or NaN on single points
  const latSpan = maxLat - minLat;
  const lonSpan = maxLon - minLon;
  const latBuffer = Math.max(0.04, latSpan * 0.2);
  const lonBuffer = Math.max(0.04, lonSpan * 0.2);

  return {
    minLat: minLat - latBuffer,
    maxLat: maxLat + latBuffer,
    minLon: minLon - lonBuffer,
    maxLon: maxLon + lonBuffer
  };
}

/**
 * Projects a GPS coordinate into canvas percentage coordinates (xPercent, yPercent)
 * keeping them safely inside the viewfinder HUD padding.
 */
export function projectToCanvas(
  point: Coordinates,
  bounds: MapBoundingBox,
  margins = { xMin: 14, xMax: 84, yMin: 22, yMax: 76 }
): CanvasPosition {
  const lonRange = bounds.maxLon - bounds.minLon || 0.08;
  const latRange = bounds.maxLat - bounds.minLat || 0.08;

  // Normalize 0..1
  const normX = Math.max(0, Math.min(1, (point.longitude - bounds.minLon) / lonRange));
  // Latitude goes up towards North; screen Y goes down towards bottom
  const normY = Math.max(0, Math.min(1, 1 - (point.latitude - bounds.minLat) / latRange));

  const xPercent = margins.xMin + normX * (margins.xMax - margins.xMin);
  const yPercent = margins.yMin + normY * (margins.yMax - margins.yMin);

  return {
    xPercent: Number(xPercent.toFixed(2)),
    yPercent: Number(yPercent.toFixed(2))
  };
}

