// app/business_service/[slug]/_components/map/business-map.tsx

"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import type { Map } from "leaflet";

interface BusinessMapProps {
  latitude: number;
  longitude: number;
  businessName: string;
  address: string;
  serviceRadius?: number | null;
}

export function BusinessMap({
  latitude,
  longitude,
  businessName,
  address,
  serviceRadius,
}: BusinessMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  useEffect(() => {
    // Load Leaflet dynamically
    const loadMap = async () => {
      if (typeof window === "undefined" || !mapRef.current) return;

      try {
        // Dynamically import Leaflet
        const L = (await import("leaflet")).default;

        // Import CSS
        await import("leaflet/dist/leaflet.css");

        // Fix marker icon issue with webpack
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        // Clear existing map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Create map
        const map = L.map(mapRef.current).setView([latitude, longitude], 15);

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add marker
        const marker = L.marker([latitude, longitude]).addTo(map);
        marker.bindPopup(`
          <div style="text-align: center; padding: 8px;">
            <strong style="font-size: 14px;">${businessName}</strong><br/>
            <span style="font-size: 12px; color: #666;">${address}</span>
          </div>
        `).openPopup();

        // Add service radius circle if provided
        if (serviceRadius && serviceRadius > 0) {
          L.circle([latitude, longitude], {
            color: "hsl(var(--primary))",
            fillColor: "hsl(var(--primary))",
            fillOpacity: 0.1,
            radius: serviceRadius * 1000, // Convert km to meters
          }).addTo(map);
        }

        mapInstanceRef.current = map;
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    loadMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, businessName, address, serviceRadius]);

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-lg overflow-hidden border border-border relative"
      >
        {/* Loading State */}
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </div>

      {/* Map Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>Interactive map powered by OpenStreetMap</span>
        </div>
        {serviceRadius && (
          <span>Service radius: {serviceRadius}km</span>
        )}
      </div>
    </div>
  );
}
