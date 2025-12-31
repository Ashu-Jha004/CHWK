// lib/location/geolocation.ts
// GPS location detection utilities

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

/**
 * Get user's current GPS coordinates
 * @param timeout - Timeout in milliseconds (default: 10000)
 * @returns Promise with coordinates or error
 */
export async function getCurrentPosition(
  timeout: number = 10000
): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject({
        code: 0,
        message: "Geolocation is not supported by your browser",
      });
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout,
      maximumAge: 300000, // Cache for 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let message = "Failed to get location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }

        reject({
          code: error.code,
          message,
        });
      },
      options
    );
  });
}

/**
 * Check if geolocation permission is granted
 */
export async function checkGeolocationPermission(): Promise<PermissionState> {
  try {
    if (!("permissions" in navigator)) {
      return "prompt";
    }

    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state;
  } catch (error) {
    console.error("Error checking geolocation permission:", error);
    return "prompt";
  }
}

/**
 * Request geolocation permission with user-friendly prompt
 */
export async function requestGeolocationPermission(): Promise<boolean> {
  try {
    const position = await getCurrentPosition(5000);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Format coordinates for URL parameters
 */
export function formatCoordinates(coords: GeolocationResult): {
  lat: string;
  lon: string;
} {
  return {
    lat: coords.latitude.toFixed(6),
    lon: coords.longitude.toFixed(6),
  };
}
