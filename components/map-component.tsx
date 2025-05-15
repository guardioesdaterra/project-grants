"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { ActivityNode } from "@/components/activity-node"
import { ParticleEffect } from "@/components/particle-effect"
import { useMediaQuery } from "@/hooks/use-media-query"
import { HexGrid } from "@/components/hex-grid"
import { MapControls } from "@/components/map-controls"
import { GlobalStats } from "@/components/global-stats"
import { ProjectData } from "@/lib/types"
import { ConnectionLines } from "@/components/connection-lines"
import { allProjectsData } from "@/lib/project-data"

// Fix Leaflet icon issues in Next.js
const markerIcon = L.icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function MapController() {
  const map = useMap()
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    // Add smooth zoom with reduced precision for better performance
    map.options.zoomSnap = isMobile ? 0.5 : 0.1
    map.options.zoomDelta = isMobile ? 0.5 : 0.5

    // Set map bounds to prevent dragging too far
    const southWest = L.latLng(-85, -180)
    const northEast = L.latLng(75, 180) 
    const bounds = L.latLngBounds(southWest, northEast)
    
    map.setMaxBounds(bounds)
    
    // Use a more efficient, debounced approach to enforce bounds
    let boundsCheckTimeout: number | null = null;
    const checkBounds = () => {
      if (boundsCheckTimeout) clearTimeout(boundsCheckTimeout);
      boundsCheckTimeout = window.setTimeout(() => {
        map.panInsideBounds(bounds, { animate: false });
      }, 100);
    };
    map.on('drag', checkBounds);

    // Set initial view based on screen size
    if (isMobile) {
      map.setView([0, 0], 2)
    } else {
      map.setView([0, 0], 3)
    }

    // Handle resize events with debounce
    let resizeTimeout: number | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        if (window.innerWidth <= 768) {
          map.setView(map.getCenter(), 2)
        } else {
          // Keep current center but adjust zoom
          map.setView(map.getCenter(), map.getZoom() || 3)
        }
      }, 200);
    };

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      map.off('drag', checkBounds);
      if (boundsCheckTimeout) clearTimeout(boundsCheckTimeout);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    }
  }, [map, isMobile])

  return null
}

interface MapComponentProps {
  projects?: ProjectData[]
}

interface Connection {
  from: [number, number];
  to: [number, number];
  from_project_indirect_beneficiaries: number;
}

export function MapComponent({ projects = allProjectsData }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [showHexGrid, setShowHexGrid] = useState(true)
  const [dynamicConnections, setDynamicConnections] = useState<Connection[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isClientMounted, setIsClientMounted] = useState(false);

  // Memoize the marker icon setup to avoid redundant operations
  const setupMarkerIcon = useCallback(() => {
    L.Marker.prototype.options.icon = markerIcon;
  }, []);

  useEffect(() => {
    // Add custom marker icon to fix Next.js Leaflet icon issue
    setupMarkerIcon();
  }, [setupMarkerIcon]);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // Memoize connection generation to avoid recalculation
  useEffect(() => {
    if (projects && projects.length > 1) {
      // Limit connections count on mobile
      const maxConnectionsPerProject = isMobile ? 2 : 3;
      const newConnections: Connection[] = [];
      
      // Process fewer projects on mobile to improve performance
      const projectsToProcess = isMobile ? projects.slice(0, Math.min(15, projects.length)) : projects;
      
      projectsToProcess.forEach(project => {
        // Filter out the current project
        let availableTargets = projectsToProcess.filter(p => p.project_title !== project.project_title);
        
        // Limit connections per project
        const connectionsToMake = Math.min(maxConnectionsPerProject, availableTargets.length);

        for (let i = 0; i < connectionsToMake; i++) {
          if (availableTargets.length === 0) break;

          const randomIndex = Math.floor(Math.random() * availableTargets.length);
          const targetProject = availableTargets.splice(randomIndex, 1)[0];
          
          if (targetProject) {
            newConnections.push({
              from: [project.latitude, project.longitude],
              to: [targetProject.latitude, targetProject.longitude],
              from_project_indirect_beneficiaries: project.indirect_beneficiaries,
            });
          }
        }
      });
      setDynamicConnections(newConnections);
    } else {
      setDynamicConnections([]);
    }
  }, [projects, isMobile]);

  // Clean up map on unmount
  useEffect(() => {
    const map = mapRef.current;
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <style jsx global>{`
        .leaflet-container {
          background: #000;
          font-family: 'Inter', sans-serif;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(0, 0, 0, 0.9);
          color: #e0e0e0;
          border-radius: 0;
          border: 1px solid rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.3), inset 0 0 10px rgba(6, 182, 212, 0.1);
          overflow: visible !important;
        }
        .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid rgba(6, 182, 212, 0.5);
        }
        .leaflet-popup-close-button {
          color: rgba(6, 182, 212, 0.8) !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          margin-right: 15px !important;
          margin-bottom: 15px !important;
        }
        .leaflet-control-zoom a {
          background-color: rgba(0, 0, 0, 0.7) !important;
          color: rgba(6, 182, 212, 0.8) !important;
          border: 1px solid rgba(6, 182, 212, 0.5) !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
          font-weight: bold !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: rgba(6, 182, 212, 0.2) !important;
          color: rgba(6, 182, 212, 1) !important;
        }
        .cyberpunk-popup .leaflet-popup-content {
          margin: 0;
          overflow: visible !important;
          position: relative;
          z-index: 99999999;
        }
        .cyberpunk-popup {
          overflow: visible !important;
          z-index: 99999999;
        }
        
        /* Mobile-specific improvements */
        @media (max-width: 768px) {
          .leaflet-control-zoom a {
            width: 40px !important;
            height: 40px !important;
            line-height: 40px !important;
            font-size: 20px !important;
          }
          .leaflet-popup-content-wrapper {
            max-width: 90vw;
            font-size: 14px;
          }
        }
      `}</style>

      {/* Background gradients - reduced complexity on mobile */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-cyan-900/20 pointer-events-none z-[399]"></div>
      {!isMobile && <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-purple-900/20 pointer-events-none z-[399]"></div>}

      {/* Scanline overlay - disabled on mobile */}
      {!isMobile && <div className="absolute inset-0 bg-[url('/scanline.gif')] opacity-5 pointer-events-none z-[999999999]"></div>}

      {/* Animated background elements - simplified on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[398]">
        <div className={`absolute top-0 left-0 w-full h-full ${isMobile ? 'opacity-5' : 'opacity-10'}`}>
          <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-cyan-500/20 blur-3xl animate-pulse-slow"></div>
          {!isMobile && (
            <>
              <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-purple-500/20 blur-3xl animate-pulse-slow-delay"></div>
              <div className="absolute top-1/2 right-1/4 w-1/4 h-1/4 bg-pink-500/20 blur-3xl animate-pulse-slow-delay-2"></div>
            </>
          )}
        </div>
      </div>

      <MapContainer
        ref={mapRef}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
        worldCopyJump={true}
        minZoom={isMobile ? 2 : 3}
        maxZoom={isMobile ? 8 : 9}
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        tap={true}
        placeholder={<div style={{width: "100%", height: "100%", backgroundColor: "#000000", display: "flex", alignItems: "center", justifyContent: "center"}}><div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse mr-2"></div>Initializing Map...</div>}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <ZoomControl position="bottomleft" />
        <MapController />

        {/* Only show HexGrid on desktop or if explicitly enabled */}
        {(showHexGrid && (!isMobile || isClientMounted)) && <HexGrid />}
        <ConnectionLines connections={dynamicConnections} />

        {projects.map((project, index) => (
          <ActivityNode
            key={`${project.project_title}-${index}`}
            latitude={project.latitude}
            longitude={project.longitude}
            project_title={project.project_title}
            country_province={project.country_province}
            direct_beneficiaries={project.direct_beneficiaries}
            indirect_beneficiaries={project.indirect_beneficiaries}
          />
        ))}

        {/* Only show particles on desktop or newer mobile devices */}
        {(!isMobile || isClientMounted) && <ParticleEffect projects={projects} connections={dynamicConnections} />}
      </MapContainer>

      {/* Map controls */}
      <MapControls onToggleHexGrid={() => setShowHexGrid(!showHexGrid)} showHexGrid={showHexGrid} />

      {/* Global stats panel - improved responsive positioning */}
      <div className={`absolute z-[500] transition-all duration-300 ${
        isClientMounted && isMobile 
          ? "bottom-16 left-4 right-4 max-h-[40vh] overflow-auto rounded-lg" 
          : "bottom-4 right-4 w-96"
      }`}>
        <GlobalStats projects={projects} />
      </div>
    </div>
  )
}
