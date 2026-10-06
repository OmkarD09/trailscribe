import type { Coordinates } from '../storage/types';

export class GeoLocationTracker {
  private static cachedCoordinates: Coordinates | null = null;
  private static cachedTimestamp: number = 0;
  private static watchId: number | null = null;
  private static locationSource: 'gps' | 'network' | 'ip' | 'fallback' = 'fallback';
  private static readonly CACHE_TTL_MS = 20000; // 20 seconds TTL

  static getLocationSource(): 'gps' | 'network' | 'ip' | 'fallback' {
    return this.locationSource;
  }

  /**
   * Starts tracking GPS position with high accuracy.
   */
  static startTracking(): void {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return;

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
        this.cachedTimestamp = Date.now();
        this.locationSource = pos.coords.accuracy < 60 ? 'gps' : 'network';
      },
      (err) => {
        console.warn('Geolocation sensor notice:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  }

  /**
   * Retrieves current or cached GPS coordinates.
   * Cascades: High Accuracy GPS -> Standard Accuracy -> IP Location Fallback -> Regional Fallback
   */
  static async getCurrentPosition(forceRefresh: boolean = false): Promise<Coordinates> {
    const now = Date.now();
    if (!forceRefresh && this.cachedCoordinates && now - this.cachedTimestamp < this.CACHE_TTL_MS) {
      return this.cachedCoordinates;
    }

    // Attempt 1 & 2: Browser Geolocation
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        const highAccCoords = await this.queryBrowserPosition({
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: forceRefresh ? 0 : 10000
        });
        this.cachedCoordinates = highAccCoords;
        this.cachedTimestamp = Date.now();
        this.locationSource = highAccCoords.accuracy && highAccCoords.accuracy < 60 ? 'gps' : 'network';
        return highAccCoords;
      } catch (highErr) {
        console.warn('High accuracy GPS acquisition notice, trying standard accuracy:', highErr);

        try {
          const stdAccCoords = await this.queryBrowserPosition({
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: forceRefresh ? 0 : 30000
          });
          this.cachedCoordinates = stdAccCoords;
          this.cachedTimestamp = Date.now();
          this.locationSource = 'network';
          return stdAccCoords;
        } catch (stdErr) {
          console.warn('Browser geolocation standard accuracy notice:', stdErr);
        }
      }
    }

    // Attempt 3: IP Geolocation fallback (works over localtunnel and HTTP local network)
    try {
      const ipCoords = await this.queryIpPosition();
      if (ipCoords) {
        this.cachedCoordinates = ipCoords;
        this.cachedTimestamp = Date.now();
        this.locationSource = 'ip';
        return ipCoords;
      }
    } catch (ipErr) {
      console.warn('IP location fallback notice:', ipErr);
    }

    // Return previously cached coordinates if any exist
    if (this.cachedCoordinates) {
      return this.cachedCoordinates;
    }

    // Attempt 4: Fallback baseline
    const fallbackCoords: Coordinates = {
      latitude: 19.0728,
      longitude: 72.8826,
      accuracy: 2500
    };
    this.cachedCoordinates = fallbackCoords;
    this.cachedTimestamp = Date.now();
    this.locationSource = 'fallback';
    return fallbackCoords;
  }

  private static queryBrowserPosition(options: PositionOptions): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            altitude: pos.coords.altitude ? Number(pos.coords.altitude.toFixed(1)) : null,
            accuracy: Math.round(pos.coords.accuracy),
            heading: pos.coords.heading,
            speed: pos.coords.speed
          });
        },
        (err) => reject(err),
        options
      );
    });
  }

  private static async queryIpPosition(): Promise<Coordinates | null> {
    if (typeof fetch === 'undefined') return null;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

    try {
      const res = await fetch('https://ipwho.is/', {
        signal: controller?.signal
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return {
          latitude: Number(data.latitude.toFixed(6)),
          longitude: Number(data.longitude.toFixed(6)),
          accuracy: 1000
        };
      }
      return null;
    } catch {
      return null;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  static stopTracking(): void {
    if (this.watchId !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
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

