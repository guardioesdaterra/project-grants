"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import { useMap } from "react-leaflet"

interface OptimizedTileLayerProps {
  url: string
  attribution: string
  crossOrigin?: boolean | 'anonymous' | 'use-credentials'
  maxZoom?: number
  subdomains?: string
}

export function OptimizedTileLayer({ 
  url, 
  attribution, 
  crossOrigin = 'anonymous',
  maxZoom = 18,
  subdomains = "abc"
}: OptimizedTileLayerProps) {
  const map = useMap()
  const tileLayerRef = useRef<L.TileLayer | null>(null)

  useEffect(() => {
    if (!map || !url) return

    // Create custom tile layer with optimized options
    const tileLayer = L.tileLayer(url, {
      attribution,
      crossOrigin,
      maxZoom,
      subdomains,
      // Add optimizations
      updateWhenIdle: true,     // Only load tiles when panning stops
      updateWhenZooming: false, // Don't load tiles during zoom
      keepBuffer: 2,            // Keep more tiles in memory
      maxNativeZoom: 19,        // Limit max zoom to prevent too many tile requests
      className: "optimized-tile",
    })

    // Add to map
    tileLayer.addTo(map)
    tileLayerRef.current = tileLayer

    // Prefetch adjacent tiles when viewport is idle
    const prefetchAdjacentTiles = () => {
      if (!tileLayer || !map) return
      
      const bounds = map.getBounds()
      
      // Slightly expand bounds to prefetch adjacent tiles
      const expandedBounds = bounds.pad(0.2)
      tileLayer.options.bounds = expandedBounds
    }

    // Set up event listeners for prefetching
    map.on('moveend', prefetchAdjacentTiles)
    map.on('zoomend', prefetchAdjacentTiles)

    // Add CSS for progressive loading effect
    const style = document.createElement('style')
    style.innerHTML = `
      .optimized-tile {
        will-change: transform;
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
        transition: opacity 0.2s ease-out;
      }
      .leaflet-tile-loaded {
        opacity: 1;
      }
      .leaflet-tile-loading {
        opacity: 0;
      }
    `
    document.head.appendChild(style)

    return () => {
      if (map && tileLayer) {
        map.removeLayer(tileLayer)
        map.off('moveend', prefetchAdjacentTiles)
        map.off('zoomend', prefetchAdjacentTiles)
      }
      document.head.removeChild(style)
    }
  }, [url, attribution, crossOrigin, maxZoom, subdomains, map])

  return null
} 