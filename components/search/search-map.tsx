"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import type { Map, Marker } from "leaflet";
import { BusinessSearchResult } from "@/types/search/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BusinessCard } from "./business-card";

interface SearchMapProps {
  businesses: BusinessSearchResult[];
  userLocation?: { latitude: number; longitude: number };
  className?: string;
}

export function SearchMap({
  businesses,
  userLocation,
  className,
}: SearchMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessSearchResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initMap = async () => {
      if (typeof window === "undefined" || !mapRef.current) return;

      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        // Clear existing map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          markersRef.current = [];
        }

        // Determine initial center
        let center: [number, number] = [20.5937, 78.9629]; // Default to India center
        let zoom = 5;

        if (userLocation) {
          center = [userLocation.latitude, userLocation.longitude];
          zoom = 13;
        } else if (businesses.length > 0) {
          center = [businesses[0].latitude, businesses[0].longitude];
          zoom = 12;
        }

        const map = L.map(mapRef.current).setView(center, zoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Custom Icons
        const greenIcon = new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const redIcon = new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        // Add User Location Marker
        if (userLocation) {
          L.marker([userLocation.latitude, userLocation.longitude], {
            icon: redIcon,
            zIndexOffset: 1000,
          })
            .addTo(map)
            .bindPopup("Your Location");
        }

        // Add Business Markers
        const markers: Marker[] = [];
        businesses.forEach((business) => {
          if (business.latitude && business.longitude) {
            const marker = L.marker([business.latitude, business.longitude], {
              icon: greenIcon,
            })
              .addTo(map)
              .on("click", () => {
                setSelectedBusiness(business);
              });
            markers.push(marker);
          }
        });

        markersRef.current = markers;

        // Fit bounds if we have markers
        if (markers.length > 0) {
          const group = L.featureGroup(markers);
          const bounds = group.getBounds();

          if (userLocation) {
            bounds.extend([userLocation.latitude, userLocation.longitude]);
          }

          map.fitBounds(bounds.pad(0.1));
        } else if (userLocation) {
          map.setView([userLocation.latitude, userLocation.longitude], 13);
        }

        mapInstanceRef.current = map;
        setLoading(false);
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [businesses, userLocation]);

  return (
    <div className={className}>
      <div
        ref={mapRef}
        className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-border relative z-0"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Initializing Map...</p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedBusiness} onOpenChange={(open) => !open && setSelectedBusiness(null)}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none bg-transparent shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedBusiness?.name || "Business Preview"}</DialogTitle>
          </DialogHeader>
          {selectedBusiness && (
            <div className="relative group">
              <BusinessCard business={selectedBusiness} />
              <div className="absolute top-4 right-12 z-10">
                 <div className="bg-primary text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <ExternalLink className="h-4 w-4" />
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
