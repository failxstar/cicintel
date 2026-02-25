/**
 * LiveLocationMap Component
 * Enhanced map with real-time GPS tracking, location tagging, and smart UX
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Target, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { useGeolocation } from '../hooks/useGeolocation';
import {
    createUserLocationMarker,
    updateUserLocationMarker,
    removeUserLocationMarker,
} from './UserLocationMarker';
import './UserLocationMarker.css';
import { LocationPermissionBanner } from './LocationPermissionAlert';
import { formatDistance, calculateDistanceBetween, formatCoordinates } from '../utils/locationUtils';
import { Coordinates } from '../utils/geoUtils';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface TaggedLocation {
    latitude: number;
    longitude: number;
    address?: string;
}

export interface LiveLocationMapProps {
    defaultCenter?: [number, number];
    defaultZoom?: number;
    onLocationTagged?: (location: TaggedLocation) => void;
    showTagging?: boolean;
    className?: string;
}

export function LiveLocationMap({
    defaultCenter = [26.7271, 88.3953], // Siliguri fallback
    defaultZoom = 13,
    onLocationTagged,
    showTagging = true,
    className = '',
}: LiveLocationMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<L.Map | null>(null);
    const taggedMarkerRef = useRef<L.Marker | null>(null);

    const [isFollowingUser, setIsFollowingUser] = useState(true);
    const [tagMode, setTagMode] = useState(false);
    const [taggedLocation, setTaggedLocation] = useState<TaggedLocation | null>(null);
    const [showPermissionBanner, setShowPermissionBanner] = useState(false);

    // Use geolocation hook
    const {
        position,
        error,
        loading,
        permissionStatus,
        refresh,
        isWatching,
    } = useGeolocation({
        enableHighAccuracy: true,
        watch: true,
    });

    const userLocation = useMemo(() => {
        if (!position) return null;
        return {
            lat: position.latitude,
            lng: position.longitude,
        };
    }, [position]);

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || leafletMapRef.current) return;

        const map = L.map(mapRef.current, {
            zoomControl: true,
            attributionControl: true,
        }).setView(defaultCenter, defaultZoom);

        leafletMapRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        // Force map to resize after a short delay (fixes initialization issues)
        setTimeout(() => {
            map.invalidateSize();
        }, 100);

        // Cleanup
        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
        };
    }, [defaultCenter, defaultZoom]);

    // Update user location marker
    useEffect(() => {
        if (!leafletMapRef.current || !position) return;

        updateUserLocationMarker({
            map: leafletMapRef.current,
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy,
            heading: position.heading,
            showAccuracy: true,
        });

        // Auto-recenter if following user
        if (isFollowingUser) {
            leafletMapRef.current.setView(
                [position.latitude, position.longitude],
                leafletMapRef.current.getZoom(),
                { animate: true }
            );
        }
    }, [position, isFollowingUser]);

    // Handle location tagging
    useEffect(() => {
        if (!leafletMapRef.current) return;

        const map = leafletMapRef.current;

        if (tagMode) {
            // Enable tag mode - cursor changes, click to tag
            map.getContainer().style.cursor = 'crosshair';

            const handleMapClick = (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;

                // Remove previous tagged marker
                if (taggedMarkerRef.current) {
                    map.removeLayer(taggedMarkerRef.current);
                }

                // Create tagged marker
                const taggedIcon = L.divIcon({
                    className: 'tagged-location-marker',
                    html: `
            <div style="
              background: #ef4444;
              width: 36px;
              height: 36px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="
                transform: rotate(45deg);
                color: white;
                font-size: 16px;
              ">📌</span>
            </div>
          `,
                    iconSize: [36, 36],
                    iconAnchor: [18, 36],
                });

                const marker = L.marker([lat, lng], { icon: taggedIcon }).addTo(map);
                taggedMarkerRef.current = marker;

                // Calculate distance from user location if available
                let distanceText = '';
                if (userLocation) {
                    const distance = calculateDistanceBetween(userLocation, { lat, lng });
                    distanceText = `<div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
            ${formatDistance(distance)} from your location
          </div>`;
                }

                // Show confirmation popup
                marker
                    .bindPopup(
                        `
          <div style="text-align: center; font-family: system-ui; min-width: 180px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">
              📌 Report issue here?
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
              ${formatCoordinates({ lat, lng })}
            </div>
            ${distanceText}
            <div style="display: flex; gap: 4px; margin-top: 12px;">
              <button 
                onclick="window.confirmTaggedLocation()"
                style="
                  flex: 1;
                  background: #10b981;
                  color: white;
                  border: none;
                  padding: 6px 12px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 12px;
                  font-weight: 600;
                "
              >
                ✓ Confirm
              </button>
              <button 
                onclick="window.cancelTaggedLocation()"
                style="
                  flex: 1;
                  background: #6b7280;
                  color: white;
                  border: none;
                  padding: 6px 12px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 12px;
                  font-weight: 600;
                "
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        `,
                        {
                            closeButton: false,
                            autoClose: false,
                        }
                    )
                    .openPopup();

                // Store tagged location
                setTaggedLocation({
                    latitude: lat,
                    longitude: lng,
                });
            };

            map.on('click', handleMapClick);

            return () => {
                map.off('click', handleMapClick);
                map.getContainer().style.cursor = '';
            };
        } else {
            map.getContainer().style.cursor = '';
        }
    }, [tagMode, userLocation]);

    // Global functions for tagged location confirmation
    useEffect(() => {
        (window as any).confirmTaggedLocation = () => {
            if (taggedLocation && onLocationTagged) {
                onLocationTagged(taggedLocation);
                setTagMode(false);
                setTaggedLocation(null);
            }
        };

        (window as any).cancelTaggedLocation = () => {
            if (taggedMarkerRef.current && leafletMapRef.current) {
                leafletMapRef.current.removeLayer(taggedMarkerRef.current);
                taggedMarkerRef.current = null;
            }
            setTaggedLocation(null);
        };
    }, [taggedLocation, onLocationTagged]);

    // Recenter to user location
    const recenterToUser = useCallback(() => {
        if (leafletMapRef.current && position) {
            leafletMapRef.current.setView(
                [position.latitude, position.longitude],
                leafletMapRef.current.getZoom() || 15,
                { animate: true }
            );
            setIsFollowingUser(true);
        }
    }, [position]);

    // Use current location (for report form)
    const useCurrentLocation = useCallback(() => {
        if (position && onLocationTagged) {
            onLocationTagged({
                latitude: position.latitude,
                longitude: position.longitude,
            });
        }
    }, [position, onLocationTagged]);

    // Show permission banner
    useEffect(() => {
        if (error && error.type === 'PERMISSION_DENIED') {
            setShowPermissionBanner(true);
        }
    }, [error]);

    return (
        <div className={`relative w-full h-full ${className}`}>
            {/* Permission Banner */}
            <AnimatePresence>
                {showPermissionBanner && error && (
                    <LocationPermissionBanner
                        type={error.type === 'PERMISSION_DENIED' ? 'denied' : 'unavailable'}
                        onDismiss={() => setShowPermissionBanner(false)}
                        onRetry={refresh}
                    />
                )}
            </AnimatePresence>

            {/* Map Container */}
            <div ref={mapRef} className="w-full h-full" style={{ minHeight: '300px' }} />

            {/* Floating Controls */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                {/* Recenter to User Button */}
                {position && (
                    <Button
                        size="icon"
                        onClick={recenterToUser}
                        className={`bg-white text-gray-700 hover:bg-gray-100 shadow-lg ${isFollowingUser ? 'ring-2 ring-blue-500' : ''
                            }`}
                        title="Recenter to my location"
                    >
                        <Target className="w-5 h-5" />
                    </Button>
                )}

                {/* Location Accuracy Badge */}
                {position && (
                    <Badge
                        variant="secondary"
                        className="bg-white shadow-lg text-xs font-mono"
                    >
                        ±{Math.round(position.accuracy)}m
                    </Badge>
                )}
            </div>

            {/* Location Actions (Bottom) */}
            {showTagging && (
                <div className="absolute bottom-4 left-0 right-0 z-[1000] flex justify-center gap-3 px-4">
                    {/* Use Current Location */}
                    {position && !tagMode && (
                        <Button
                            onClick={useCurrentLocation}
                            className="bg-blue-500 hover:bg-blue-600 shadow-lg"
                        >
                            <Navigation className="w-4 h-4 mr-2" />
                            Use My Current Location
                        </Button>
                    )}

                    {/* Tag Location Manually */}
                    {!tagMode ? (
                        <Button
                            onClick={() => setTagMode(true)}
                            variant="outline"
                            className="bg-white shadow-lg"
                        >
                            <MapPin className="w-4 h-4 mr-2" />
                            Tag Location Manually
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                setTagMode(false);
                                if (taggedMarkerRef.current && leafletMapRef.current) {
                                    leafletMapRef.current.removeLayer(taggedMarkerRef.current);
                                    taggedMarkerRef.current = null;
                                }
                            }}
                            variant="outline"
                            className="bg-white shadow-lg border-red-500 text-red-600 hover:bg-red-50"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel Tagging
                        </Button>
                    )}
                </div>
            )}

            {/* Tag Mode Helper */}
            <AnimatePresence>
                {tagMode && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-4 left-4 right-4 z-[1000] mx-auto max-w-md"
                    >
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg shadow-xl">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <div className="font-semibold">Tap on the map</div>
                                    <div className="text-xs opacity-90">
                                        Click anywhere to mark the issue location
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Indicator */}
            {loading && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
                    <div className="bg-white rounded-lg shadow-xl px-6 py-4 flex items-center gap-3">
                        <div className="w-5 h-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium text-gray-700">
                            Getting your location...
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
