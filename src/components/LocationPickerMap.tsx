/**
 * LocationPickerMap Component
 * Fullscreen map for selecting exact report location with click handler
 * Shows "You Are Here" marker and allows user to tap map to select complaint location
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, Check } from 'lucide-react';
import { Button } from './ui/button';
import { reverseGeocode } from '../services/geocodingService';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface LocationPickerMapProps {
    userLocation: { lat: number; lng: number };
    onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
    onCancel: () => void;
}

export function LocationPickerMap({ userLocation, onLocationSelect, onCancel }: LocationPickerMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<L.Map | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [tempMarker, setTempMarker] = useState<L.Marker | null>(null);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || leafletMapRef.current) return;

        const map = L.map(mapRef.current, {
            zoomControl: true,
            attributionControl: true,
        }).setView([userLocation.lat, userLocation.lng], 16);

        leafletMapRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        // Add "You Are Here" marker (blue pulsing circle)
        const userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
            radius: 10,
            fillColor: '#3b82f6',
            color: '#fff',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.8,
        }).addTo(map);

        userMarker.bindPopup(`
      <div style="text-align: center; min-width: 120px;">
        <p style="font-weight: bold; margin: 0; color: #1f2937;">📍 You are here</p>
        <p style="font-size: 10px; color: #6b7280; margin: 4px 0 0 0;">
          ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}
        </p>
      </div>
    `);

        // Add pulsing animation
        const pulsingCircle = L.circle([userLocation.lat, userLocation.lng], {
            radius: 50,
            fillColor: '#3b82f6',
            color: '#3b82f6',
            weight: 1,
            opacity: 0.4,
            fillOpacity: 0.1,
            className: 'user-location-pulse',
        }).addTo(map);

        // Map click handler
        map.on('click', (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;

            // Remove previous temporary marker
            if (tempMarker) {
                map.removeLayer(tempMarker);
            }

            // Create temporary red marker with pulse animation
            const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'temp-location-marker',
                    html: `
            <div style="
              position: relative;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                position: absolute;
                width: 40px;
                height: 40px;
                background: rgba(239, 68, 68, 0.3);
                border-radius: 50%;
                animation: pulse 2s infinite;
              "></div>
              <div style="
                width: 24px;
                height: 24px;
                background: #ef4444;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                z-index: 1;
              ">
                📍
              </div>
            </div>
            <style>
              @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.3); opacity: 0.2; }
              }
            </style>
          `,
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                }),
            }).addTo(map);

            setTempMarker(marker);
            setSelectedPosition({ lat, lng });
        });

        // Cleanup
        return () => {
            map.remove();
        };
    }, [userLocation]);

    // Handle confirm location
    const handleConfirmLocation = async () => {
        if (!selectedPosition) return;

        setIsLoadingAddress(true);

        try {
            // Try to reverse geocode for address
            const result = await reverseGeocode(selectedPosition.lat, selectedPosition.lng);
            onLocationSelect({
                ...selectedPosition,
                address: result.formattedAddress,
            });
        } catch (error) {
            // If geocoding fails, still return coordinates
            onLocationSelect(selectedPosition);
        } finally {
            setIsLoadingAddress(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
            {/* Header */}
            <div className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Select Location</h2>
                    <p className="text-sm text-gray-600">Tap on the map to mark complaint location</p>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Map */}
            <div ref={mapRef} className="flex-1" />

            {/* Bottom Action Bar */}
            <div className="bg-white border-t p-4 shadow-lg">
                {selectedPosition ? (
                    <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-900">Location Selected</span>
                            </div>
                            <p className="text-xs text-green-700">
                                📍 {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    if (tempMarker && leafletMapRef.current) {
                                        leafletMapRef.current.removeLayer(tempMarker);
                                    }
                                    setSelectedPosition(null);
                                    setTempMarker(null);
                                }}
                            >
                                Clear
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleConfirmLocation}
                                disabled={isLoadingAddress}
                            >
                                <Check className="w-4 h-4 mr-2" />
                                {isLoadingAddress ? 'Getting address...' : 'Confirm Location'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-900 text-center">
                            👆 Tap anywhere on the map to select complaint location
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
