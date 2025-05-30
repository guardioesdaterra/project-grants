"use client"

import { useEffect, useCallback, useRef } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import { useMediaQuery } from "@/hooks/use-media-query"

export function MapController() {
  const map = useMap()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const initializedRef = useRef(false)
  
  // Setup map bounds and constraints
  const setupMapConstraints = useCallback(() => {
    if (!map) return
    
    // Add smooth zoom with reduced precision for better performance
    map.options.zoomSnap = isMobile ? 0.5 : 0.1
    map.options.zoomDelta = isMobile ? 0.5 : 0.5

    // Set map bounds to prevent dragging too far
    const southWest = L.latLng(-85, -180)
    const northEast = L.latLng(75, 180) 
    const bounds = L.latLngBounds(southWest, northEast)
    
    map.setMaxBounds(bounds)
    
    // Set initial view based on screen size if not already initialized
    if (!initializedRef.current) {
      map.setView([0, 0], 2) // Set a default zoom level of 2
      initializedRef.current = true
    }
    
    return bounds;
  }, [map, isMobile]);

  useEffect(() => {
    // Skip initialization in the first render in development mode's double rendering
    if (process.env.NODE_ENV === 'development' && !initializedRef.current) {
      initializedRef.current = true;
      return () => {};
    }
    
    const bounds = setupMapConstraints();
    if (!bounds || !map) return () => {};
    
    // Use a more efficient, debounced approach to enforce bounds
    let boundsCheckTimeout: number | null = null
    const checkBounds = () => {
      if (boundsCheckTimeout) clearTimeout(boundsCheckTimeout)
      boundsCheckTimeout = window.setTimeout(() => {
        map.panInsideBounds(bounds, { animate: false })
      }, 100)
    }
    map.on('drag', checkBounds)

    // Handle resize events with debounce
    let resizeTimeout: number | null = null
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = window.setTimeout(() => {
        try {
          const currentCenter = map.getCenter()
          const currentZoom = map.getZoom() || 2 // Provide a fallback zoom level
          
          if (window.innerWidth <= 768) {
            map.setView(currentCenter, Math.min(currentZoom, 2))
          } else {
            map.setView(currentCenter, currentZoom)
          }
        } catch {
          // If the map isn't ready yet, set default view
          console.warn("Map not ready, setting default view")
          map.setView([0, 0], 2)
        }
      }, 200)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      map.off('drag', checkBounds)
      if (boundsCheckTimeout) clearTimeout(boundsCheckTimeout)
      if (resizeTimeout) clearTimeout(resizeTimeout)
    }
  }, [map, setupMapConstraints])

  return null
} 