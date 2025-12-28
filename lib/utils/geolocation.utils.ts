// lib/utils/geolocation.utils.ts
// Browser Geolocation API and Reverse Geocoding utilities

import {
  GeolocationCoordinates,
  ReverseGeocodeResult,
} from "@/types/businessOnboarding/business-onboarding.types";

// ==================== GEOLOCATION ====================

export interface GeolocationError {
  code: number;
  message: string;
  userMessage: string;
}

/**
 * Get current location using browser's Geolocation API
 * @returns Promise with coordinates or error
 */
export const getCurrentLocation = (): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: "Geolocation is not supported by this browser",
        userMessage:
          "Your browser does not support location services. Please enter your address manually.",
      } as GeolocationError);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 0, // Don't use cached position
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: GeolocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        console.log("[Geolocation] ✅ Location obtained:", coords);
        resolve(coords);
      },
      (error) => {
        const geoError = handleGeolocationError(error);
        console.error("[Geolocation] ❌ Error:", geoError);
        reject(geoError);
      },
      options
    );
  });
};

/**
 * Handle geolocation errors with user-friendly messages
 */
const handleGeolocationError = (
  error: GeolocationPositionError
): GeolocationError => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        code: 1,
        message: "User denied the request for Geolocation",
        userMessage:
          "Location permission denied. Please enable location access in your browser settings or enter your address manually.",
      };

    case error.POSITION_UNAVAILABLE:
      return {
        code: 2,
        message: "Location information is unavailable",
        userMessage:
          "Unable to determine your location. Please check your internet connection or enter your address manually.",
      };

    case error.TIMEOUT:
      return {
        code: 3,
        message: "The request to get user location timed out",
        userMessage:
          "Location request timed out. Please try again or enter your address manually.",
      };

    default:
      return {
        code: -1,
        message: "An unknown error occurred",
        userMessage:
          "An unexpected error occurred while getting your location. Please enter your address manually.",
      };
  }
};

// ==================== REVERSE GEOCODING ====================

/**
 * Convert coordinates to address using Nominatim (OpenStreetMap) API
 * Free, no API key required, suitable for production
 *
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise with address components or error
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> => {
  try {
    // Nominatim API - Free reverse geocoding service
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "CHWK-Business-Platform", // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.error) {
      throw new Error(data.error || "Unable to get address from coordinates");
    }

    // Extract address components
    const address = data.address || {};

    // Build address line 1
    const houseNumber = address.house_number || "";
    const road = address.road || address.street || "";
    const addressLine1 =
      [houseNumber, road].filter(Boolean).join(", ") || "Address not found";

    // Extract area/locality
    const area =
      address.suburb ||
      address.neighbourhood ||
      address.locality ||
      address.quarter ||
      "";

    // Extract city
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      "";

    // Extract state
    const state = address.state || address.region || "";

    // Extract pincode/postal code
    const pincode = address.postcode || "";

    // Extract district
    const district = address.county || address.state_district || "";

    const result: ReverseGeocodeResult = {
      addressLine1,
      area,
      city,
      district,
      state,
      pincode,
      country: address.country || "India",
    };

    console.log("[Reverse Geocoding] ✅ Address obtained:", result);
    return result;
  } catch (error) {
    console.error("[Reverse Geocoding] ❌ Error:", error);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to get address from location. Please enter manually."
    );
  }
};

// ==================== VALIDATION HELPERS ====================

/**
 * Validate if coordinates are within India's approximate bounds
 */
export const isWithinIndiaBounds = (
  latitude: number,
  longitude: number
): boolean => {
  // Approximate bounds of India
  const INDIA_BOUNDS = {
    north: 35.5,
    south: 6.5,
    east: 97.5,
    west: 68.0,
  };

  return (
    latitude >= INDIA_BOUNDS.south &&
    latitude <= INDIA_BOUNDS.north &&
    longitude >= INDIA_BOUNDS.west &&
    longitude <= INDIA_BOUNDS.east
  );
};

/**
 * Validate pincode format (6 digits for India)
 */
export const isValidIndianPincode = (pincode: string): boolean => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Format coordinates to display string
 */
export const formatCoordinates = (
  latitude: number,
  longitude: number
): string => {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};
