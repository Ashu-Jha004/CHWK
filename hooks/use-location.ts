    // hooks/use-location.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Location data structure
 */
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
  state?: string;
  country?: string;
  source: 'geolocation' | 'ip' | 'cache';
  timestamp: number;
}

/**
 * Hook state interface
 */
interface UseLocationReturn {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  permissionDenied: boolean;
  refetch: () => void;
  clearError: () => void;
}

/**
 * Cache location in localStorage with expiry (1 hour)
 */
const CACHE_KEY = 'chwk_user_location';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in ms

const getCachedLocation = (): LocationData | null => {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached) as LocationData;

    // Check if cache is expired
    if (Date.now() - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    console.log('[useLocation] ✅ Using cached location:', data.source);
    return data;
  } catch (error) {
    console.error('[useLocation] ❌ Cache read error:', error);
    return null;
  }
};

const setCachedLocation = (location: LocationData): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(location));
    console.log('[useLocation] ✅ Location cached');
  } catch (error) {
    console.error('[useLocation] ❌ Cache write error:', error);
  }
};

/**
 * Fetch location from IP-based service
 */
const getLocationFromIP = async (): Promise<LocationData> => {
  try {
    console.log('[useLocation] 📍 Fetching location from IP...');

    // Using ipapi.co (free, no API key needed)
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`IP API failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.latitude || !data.longitude) {
      throw new Error('Invalid IP location data');
    }

    const location: LocationData = {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city || undefined,
      state: data.region || undefined,
      country: data.country_name || undefined,
      source: 'ip',
      timestamp: Date.now(),
    };

    console.log('[useLocation] ✅ IP location fetched:', {
      city: location.city,
      state: location.state,
    });

    return location;
  } catch (error) {
    console.error('[useLocation] ❌ IP location error:', error);
    throw new Error('Failed to get location from IP address');
  }
};

/**
 * Get location from browser Geolocation API
 */
const getGeolocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    console.log('[useLocation] 📍 Requesting browser geolocation...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: 'geolocation',
          timestamp: Date.now(),
        };

        console.log('[useLocation] ✅ Geolocation success:', {
          accuracy: `${Math.round(location.accuracy || 0)}m`,
        });

        resolve(location);
      },
      (error) => {
        console.warn('[useLocation] ⚠️ Geolocation denied:', error.message);
        reject(error);
      },
      {
        enableHighAccuracy: false, // Faster, good enough for 20km radius
        timeout: 10000, // 10 seconds
        maximumAge: 300000, // Accept 5-minute-old position
      }
    );
  });
};

/**
 * Custom hook to get user's location
 * Tries geolocation first, falls back to IP
 */
export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const isMounted = useRef(true);

  /**
   * Fetch location with fallback strategy
   */
  const fetchLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPermissionDenied(false);

    try {
      // 1. Check cache first
      const cached = getCachedLocation();
      if (cached) {
        setLocation(cached);
        setIsLoading(false);
        return;
      }

      // 2. Try browser geolocation
      try {
        const geoLocation = await getGeolocation();

        if (isMounted.current) {
          setLocation(geoLocation);
          setCachedLocation(geoLocation);
          setIsLoading(false);
        }
        return;
      } catch (geoError) {
        // Check if permission was denied
        if (
          geoError instanceof GeolocationPositionError &&
          geoError.code === 1
        ) {
          console.log('[useLocation] 🔄 Permission denied, trying IP fallback...');
          setPermissionDenied(true);
        }
      }

      // 3. Fallback to IP-based location
      const ipLocation = await getLocationFromIP();

      if (isMounted.current) {
        setLocation(ipLocation);
        setCachedLocation(ipLocation);
        setIsLoading(false);
      }

    } catch (err) {
      console.error('[useLocation] ❌ All location methods failed:', err);

      if (isMounted.current) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to determine your location'
        );
        setIsLoading(false);
      }
    }
  }, []);

  /**
   * Clear error and retry
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Manual refetch
   */
  const refetch = useCallback(() => {
    // Clear cache to force fresh fetch
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
    }
    fetchLocation();
  }, [fetchLocation]);

  /**
   * Fetch location on mount
   */
  useEffect(() => {
    isMounted.current = true;
    fetchLocation();

    return () => {
      isMounted.current = false;
    };
  }, [fetchLocation]);

  return {
    location,
    isLoading,
    error,
    permissionDenied,
    refetch,
    clearError,
  };
}
