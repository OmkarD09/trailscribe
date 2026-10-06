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
