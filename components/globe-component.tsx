"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ProjectData } from "@/lib/types"
import { getProjectColor, getProjectColorByBeneficiaries } from "@/lib/colors"
import { GlobalStats } from '@/components/global-stats'
import 'maplibre-gl/dist/maplibre-gl.css'
import type maplibregl from 'maplibre-gl'
import Link from "next/link"

const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

// Define Connection type consistent with the rest of the app
interface Connection {
  from: [number, number]
  to: [number, number]
  from_project_indirect_beneficiaries: number
  from_project_direct_beneficiaries: number
}

// Define specific types for particles and markers
interface Particle {
  element: HTMLDivElement;
  currentPoint: [number, number];
  targetPoint: [number, number];
  speed: number;
}

interface ConnectionRef {
  id: string;
}

interface GlobeComponentProps {
  projects?: ProjectData[]
  showHexGrid?: boolean
}

export function GlobeComponent({ projects = [], showHexGrid = true }: GlobeComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const connectionsRef = useRef<ConnectionRef[]>([])
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<HTMLDivElement[]>([])
  // We do need markersLayerRef for future use, silencing the linter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const markersLayerRef = useRef<maplibregl.LayerSpecification | null>(null)
  
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [dynamicConnections, setDynamicConnections] = useState<Connection[]>([])
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [hasError, setHasError] = useState(false)

  // Clean up function to prevent memory leaks
  const cleanupResources = useCallback(() => {
    // Clean up markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
    
    // Clean up connections
    connectionsRef.current.forEach(connection => {
      if (mapRef.current && connection.id) {
        if (mapRef.current.getLayer(connection.id)) {
          mapRef.current.removeLayer(connection.id)
        }
        if (mapRef.current.getSource(connection.id)) {
          mapRef.current.removeSource(connection.id)
        }
      }
    })
    connectionsRef.current = []
    
    // Cancel animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    // Clean up particles
    particlesRef.current.forEach(p => {
      if (p && p.parentNode) {
        p.parentNode.removeChild(p)
      }
    })
    particlesRef.current = []
  }, [])
  
  // Initialize map when component mounts
  useEffect(() => {
    // Prevent memory leaks
    let isMounted = true
    
    const initializeMap = async () => {
      // Early return if running on server side
      if (typeof window === 'undefined') return
      
      try {
        // Import maplibre only on client side - with better error handling
        let maplibreglPackage;
        try {
          maplibreglPackage = (await import('maplibre-gl')).default
        } catch (err) {
          console.error("Failed to load maplibre-gl:", err)
          if (isMounted) setHasError(true)
          return
        }
        
        // Safety check before continuing
        if (!isMounted || !containerRef.current) return
        
        // Add CSS
        const existingLink = document.querySelector('link[href*="maplibre-gl"]')
        if (!existingLink) {
          const maplibreStyles = document.createElement('link')
          maplibreStyles.rel = 'stylesheet'
          maplibreStyles.href = 'https://unpkg.com/maplibre-gl@5.5.0/dist/maplibre-gl.css'
          document.head.appendChild(maplibreStyles)
        }
        
        // Create the map with error handling
        let map;
        try {
          map = new maplibreglPackage.Map({
            container: containerRef.current,
            style: `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_API_KEY}`,
            zoom: isMobile ? 1.8 : 3,
            center: [0, 0],
            attributionControl: false,
            renderWorldCopies: false,
          })
        } catch (err) {
          console.error("Error creating MapLibre map:", err)
          if (isMounted) setHasError(true)
          return
        }
        
        // Store the map reference
        if (isMounted) {
          mapRef.current = map
        } else {
          // Immediately clean up if component unmounted during async operations
          map.remove()
          return
        }
        
        // Add attribution control in a better position
        try {
          map.addControl(
            new maplibreglPackage.AttributionControl({
              customAttribution: 'EARTH GUARDIANS @ 2025'
            }),
          )
        } catch (err) {
          console.error("Error adding attribution control:", err)
        }
        
        // Set projection to globe AFTER style loads
        map.on('style.load', () => {
          if (!isMounted || !mapRef.current) return
          
          try {
            mapRef.current.setProjection({
              type: 'globe'
            })
          } catch (err) {
            console.error("Error setting globe projection:", err)
          }
        })
        
        // Wait for the map to load
        map.on('load', () => {
          if (isMounted) {
            setIsMapLoaded(true)
          }
        })
        
        // Error handler
        map.on('error', (err) => {
          console.error("MapLibre map error:", err)
        })
      } catch (err) {
        console.error("Error initializing MapLibre GL JS map:", err)
        if (isMounted) setHasError(true)
      }
    }
    
    // Small delay before map initialization to ensure DOM is fully ready
    const timer = setTimeout(() => {
      initializeMap()
    }, 100)
    
    // Clean up on unmount
    return () => {
      clearTimeout(timer)
      isMounted = false
      cleanupResources()
      
      // Dispose map
      if (mapRef.current) {
        try {
          mapRef.current.remove()
        } catch (err) {
          console.error("Error removing map:", err)
        }
        mapRef.current = null
      }
    }
  }, [isMobile, cleanupResources])
  
  // Generate connections between projects
  const generateConnections = useCallback(() => {
    if (!projects || projects.length <= 1) return []
    
    // Limit connections count on mobile
    const maxConnectionsPerProject = isMobile ? 2 : 3
    const newConnections: Connection[] = []
    
    // Process fewer projects on mobile for performance
    const projectsToProcess = isMobile 
      ? projects.slice(0, Math.min(15, projects.length)) 
      : projects
    
    // Calculate distance between two points (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371 // Earth radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c
    }
    
    // Set to track projects already used as targets
    const usedAsTarget = new Set<string>()
    
    projectsToProcess.forEach(project => {
      if (!project.latitude || !project.longitude) return
      
      // Filter out current project and already used targets
      const availableTargets = projectsToProcess.filter(
        p => p.project_title !== project.project_title && 
            p.latitude && 
            p.longitude &&
            !usedAsTarget.has(p.project_title)
      )
      
      if (availableTargets.length === 0) return
      
      // Calculate distances and sort by distance (larger to smaller)
      const targetsWithDistance = availableTargets.map(target => ({
        project: target,
        distance: calculateDistance(
          project.latitude!, 
          project.longitude!, 
          target.latitude!, 
          target.longitude!
        )
      })).sort((a, b) => b.distance - a.distance)
      
      // Limit connections per project
      const connectionsToMake = Math.min(
        maxConnectionsPerProject, 
        targetsWithDistance.length
      )
      
      // Connect to the most distant projects first
      for (let i = 0; i < connectionsToMake; i++) {
        const targetData = targetsWithDistance[i]
        if (targetData && !usedAsTarget.has(targetData.project.project_title)) {
          newConnections.push({
            from: [project.longitude, project.latitude], // Note: MapLibre uses [lng, lat]
            to: [targetData.project.longitude!, targetData.project.latitude!],
            from_project_indirect_beneficiaries: project.indirect_beneficiaries || 1000,
            from_project_direct_beneficiaries: project.direct_beneficiaries || 1000,
          })
          
          // Mark as used to avoid multiple connections to the same target
          usedAsTarget.add(targetData.project.project_title)
        }
      }
    })
    
    return newConnections
  }, [projects, isMobile])
  
  // Update connections when projects change
  useEffect(() => {
    setDynamicConnections(generateConnections())
  }, [generateConnections])
  
  // Create popup HTML for a project
  const createPopupHTML = useCallback((project: ProjectData) => {
    return `
      <div class="p-4 min-w-[200px] relative bg-black bg-opacity-90 border border-cyan-500/50 rounded-sm">
        <div class="border-b border-cyan-500/30 pb-2 mb-3">
          <h3 class="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            ${project.project_title}
          </h3>
          <div class="mt-2 uppercase text-xs tracking-wider text-white px-2 py-1 rounded-sm" style="background-color: ${getProjectColor(project)}">
            PROJECT GRANTEE
          </div>
        </div>
        
        <div class="mt-3 space-y-2 text-sm text-gray-300">
          <div class="flex items-center gap-2">
            <span>📍</span>
            <span>${project.country_province || "Unknown location"}</span>
          </div>
          <div class="flex items-center gap-2">
            <span>👥</span>
            <span>Direct Beneficiaries: ${project.direct_beneficiaries.toLocaleString()}</span>
          </div>
          <div class="flex items-center gap-2">
            <span>👥</span>
            <span>Indirect Beneficiaries: ${project.indirect_beneficiaries.toLocaleString()}</span>
          </div>
        </div>
        
        <!-- Corners for cyberpunk effect -->
        <div class="absolute -top-1 -left-1 w-4 h-4 bg-cyan-500 animate-pulse" style="clip-path: polygon(0 0, 100% 0, 0 100%)"></div>
        <div class="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 animate-pulse" style="clip-path: polygon(100% 0, 0 0, 100% 100%)"></div>
        <div class="absolute -bottom-1 -left-1 w-4 h-4 bg-pink-500 animate-pulse" style="clip-path: polygon(0 100%, 100% 100%, 0 0)"></div>
        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 animate-pulse" style="clip-path: polygon(100% 100%, 0 100%, 100% 0)"></div>
      </div>
    `
  }, [])
  
  // Create a marker element
  const createMarkerElement = useCallback((project: ProjectData) => {
    // Calculate marker size based on beneficiaries
    const beneficiaryFactor = Math.min(Math.max(project.indirect_beneficiaries / 10000, 0.5), 5)
    const markerSize = (15 + beneficiaryFactor * 10) * (isMobile ? 0.7 : 1)
    
    // Create main marker element (positioned by MapLibre)
    const el = document.createElement('div')
    el.className = 'project-marker' // Keep class for global styles if any
    el.style.width = `${markerSize}px`
    el.style.height = `${markerSize}px`
    el.style.display = 'flex' // To center the innerWrapper
    el.style.justifyContent = 'center'
    el.style.alignItems = 'center'
    el.style.cursor = 'pointer'
    el.setAttribute('aria-label', project.project_title)
    // Important: Do not apply transforms directly to 'el'

    // Create an inner wrapper for visual content and scaling
    const innerWrapper = document.createElement('div');
    innerWrapper.style.width = '100%';
    innerWrapper.style.height = '100%';
    innerWrapper.style.borderRadius = '50%';
    innerWrapper.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    innerWrapper.style.border = `2px solid ${getProjectColor(project)}`;
    innerWrapper.style.boxShadow = `0 0 ${beneficiaryFactor * 15}px ${getProjectColor(project)}, 0 0 ${beneficiaryFactor * 3}px #fff`;
    innerWrapper.style.display = 'flex';
    innerWrapper.style.justifyContent = 'center';
    innerWrapper.style.alignItems = 'center';
    innerWrapper.style.position = 'relative'; // For positioning pulseWrapper
    innerWrapper.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease'; // Transition for inner wrapper
    el.appendChild(innerWrapper);
    
    // Pulse effect wrapper (inside innerWrapper)
    const pulseWrapper = document.createElement('div')
    pulseWrapper.className = 'pulse-wrapper' // Keep class if styles depend on it
    pulseWrapper.style.position = 'absolute' 
    pulseWrapper.style.width = `${markerSize * 1.5}px`
    pulseWrapper.style.height = `${markerSize * 1.5}px`
    pulseWrapper.style.borderRadius = '50%'
    pulseWrapper.style.opacity = '0'
    pulseWrapper.style.backgroundColor = getProjectColor(project)
    pulseWrapper.style.animation = 'pulse 2s infinite'
    pulseWrapper.style.zIndex = '-1'; // Behind the centerDot
    innerWrapper.appendChild(pulseWrapper)
    
    // Center dot (inside innerWrapper)
    const centerDot = document.createElement('div')
    centerDot.style.width = `${markerSize * 0.5}px`
    centerDot.style.height = `${markerSize * 0.5}px`
    centerDot.style.backgroundColor = getProjectColor(project)
    centerDot.style.borderRadius = '50%'
    centerDot.style.boxShadow = `0 0 ${beneficiaryFactor * 3}px ${getProjectColor(project)}`
    innerWrapper.appendChild(centerDot)
    
    // Hover effects - apply scale to innerWrapper, shadow to innerWrapper
    el.addEventListener('mouseenter', () => {
      innerWrapper.style.transform = 'scale(1.2)'
      innerWrapper.style.boxShadow = `0 0 ${beneficiaryFactor * 30}px ${getProjectColor(project)}, 0 0 ${beneficiaryFactor * 6}px #fff`
      pulseWrapper.style.opacity = '0.5'
      el.style.zIndex = '10' // Elevate the main marker element for stacking context
    })
    
    el.addEventListener('mouseleave', () => {
      innerWrapper.style.transform = 'scale(1)'
      innerWrapper.style.boxShadow = `0 0 ${beneficiaryFactor * 15}px ${getProjectColor(project)}, 0 0 ${beneficiaryFactor * 3}px #fff`
      pulseWrapper.style.opacity = '0'
      el.style.zIndex = '1' // Reset z-index
    })
    
    return el
  }, [isMobile])
  
  // Add markers for projects
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded || !projects || projects.length === 0) return
    
    // Import maplibre only on client side
    const initializeMarkers = async () => {
      try {
        const maplibreglPackage = (await import('maplibre-gl')).default
        
        // Clean up old markers
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = []
        
        // Create new markers for each project
        projects.forEach(project => {
          if (!project.latitude || !project.longitude || !mapRef.current) return
          
          // Create marker element
          const el = createMarkerElement(project)
          
          // Create and add popup
          const popup = new maplibreglPackage.Popup({
            closeButton: true,
            closeOnClick: true,
            maxWidth: isMobile ? '280px' : '320px',
            className: 'cyberpunk-popup'
          }).setHTML(createPopupHTML(project))
          
          // Create and add marker
          const marker = new maplibreglPackage.Marker({
            element: el,
            scale: 1,
          })
            .setLngLat([project.longitude, project.latitude])
            .setPopup(popup)
            .addTo(mapRef.current)
          
          // Store marker reference
          markersRef.current.push(marker)
        })
      } catch (err) {
        console.error("Error adding markers:", err)
      }
    }
    
    initializeMarkers()
  }, [isMapLoaded, projects, isMobile, createMarkerElement, createPopupHTML])
  
  // Generate a curved path control point between two points
  const generateCurvedPath = useCallback((from: [number, number], to: [number, number]): [number, number] => {
    // Calculate midpoint
    const midX = (from[0] + to[0]) / 2
    const midY = (from[1] + to[1]) / 2
    
    // Calculate the perpendicular displacement for the control point
    const dx = to[0] - from[0]
    const dy = to[1] - from[1]
    
    // Create a perpendicular vector
    const perpX = -dy
    const perpY = dx
    
    // Normalize and scale
    const length = Math.sqrt(perpX * perpX + perpY * perpY) || 1
    const normalizedPerpX = perpX / length
    const normalizedPerpY = perpY / length
    
    // Calculate distance for appropriate curve size
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Randomize curve shape with deterministic randomization
    const seed = (from[0] * 1000 + from[1] + to[0] * 100 + to[1]) % 1000 / 1000
    const randomFactor = 0.1 + seed * 0.1
    
    // Add some variation to curve size based on distance
    const distanceFactor = Math.min(1, distance / 50)
    const curveFactor = Math.min(distance * randomFactor * distanceFactor, 25)
    
    // Add displacement to midpoint to create control point
    const controlPointX = midX + normalizedPerpX * curveFactor
    const controlPointY = midY + normalizedPerpY * curveFactor
    
    return [controlPointX, controlPointY]
  }, [])
  
  // Add connection lines
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded || !dynamicConnections || dynamicConnections.length === 0) return
    
    // Import maplibre only on client side
    const initializeConnections = async () => {
      try {
        // We need this import for the API types but we're using the map instance directly
        await import('maplibre-gl')
        
        // Clean up old connections
        connectionsRef.current.forEach(connection => {
          if (mapRef.current && connection.id) {
            if (mapRef.current.getLayer(connection.id)) {
              mapRef.current.removeLayer(connection.id)
            }
            if (mapRef.current.getSource(connection.id)) {
              mapRef.current.removeSource(connection.id)
            }
          }
        })
        connectionsRef.current = []
        
        // Add new connections
        dynamicConnections.forEach((connection, index) => {
          if (!mapRef.current) return
          
          // Generate a unique ID for this connection
          const connectionId = `connection-${index}`
          
          // Create a curved path for the connection
          const controlPoint = generateCurvedPath(connection.from, connection.to)
          
          // Create GeoJSON source with the curved path
          mapRef.current.addSource(connectionId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [connection.from, controlPoint, connection.to]
              }
            }
          })
          
          // Add line layer
          mapRef.current.addLayer({
            id: connectionId,
            type: 'line',
            source: connectionId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': getProjectColorByBeneficiaries(connection.from_project_direct_beneficiaries, connection.from_project_indirect_beneficiaries),
              'line-width': 2.5,
              'line-opacity': 0.2,
              'line-dasharray': [0.5, 2]
            }
          })
          
          // Store connection reference
          connectionsRef.current.push({ id: connectionId })
        })
      } catch (err) {
        console.error("Error adding connections:", err)
      }
    }
    
    initializeConnections()
  }, [isMapLoaded, dynamicConnections, generateCurvedPath])
  
  // Add particle effects - optimized version
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded || !dynamicConnections || dynamicConnections.length === 0) return
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    // Skip particle effects on mobile for better performance
    
    // Initialize particles pool - reuse particle DOM elements
    const particlePoolSize = 50
    const particles: Particle[] = []
    const particleElements: HTMLDivElement[] = []
    
    // Create particle pool
    if (containerRef.current) {
      for (let i = 0; i < particlePoolSize; i++) {
        const element = document.createElement('div')
        element.className = 'particle'
        element.style.position = 'absolute'
        element.style.width = '4px'
        element.style.height = '4px'
        element.style.borderRadius = '50%'
        element.style.backgroundColor = '#ffffff'
        element.style.pointerEvents = 'none'
        element.style.zIndex = '1000'
        element.style.opacity = '0'
        element.style.transition = 'opacity 0.3s ease'
        containerRef.current.appendChild(element)
        particleElements.push(element)
      }
    }
    
    // Animate particles
    const animate = () => {
      if (!mapRef.current) return
      
      // Process existing particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        const dx = p.targetPoint[0] - p.currentPoint[0]
        const dy = p.targetPoint[1] - p.currentPoint[1]
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance > p.speed) {
          // Move particle along path
          p.currentPoint[0] += (dx / distance) * p.speed
          p.currentPoint[1] += (dy / distance) * p.speed
          
          // Update particle position
          const pixelCoords = mapRef.current.project(p.currentPoint)
          if (p.element) {
            p.element.style.left = `${pixelCoords.x}px`
            p.element.style.top = `${pixelCoords.y}px`
          }
        } else {
          // Particle reached target, recycle it
          if (p.element) {
            p.element.style.opacity = '0'
          }
          particles.splice(i, 1)
        }
      }
      
      // Randomly create new particles if we have available elements
      if (particles.length < particlePoolSize * 0.7 && Math.random() < 0.1) {
        // Find an available element
        const unusedElement = particleElements.find(el => 
          !particles.some(p => p.element === el)
        )
        
        if (unusedElement) {
          const connectionIndex = Math.floor(Math.random() * dynamicConnections.length)
          const connection = dynamicConnections[connectionIndex]
          
          if (connection) {
            createParticle(connection, unusedElement)
          }
        }
      }
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animate)
    }
    
    // Create a particle for a connection
    const createParticle = (connection: Connection, element: HTMLDivElement) => {
      if (!mapRef.current || !containerRef.current) return
      
      // Generate control point for curved path
      const controlPoint = generateCurvedPath(connection.from, connection.to)
      
      // Update particle element
      // Use getProjectColorByBeneficiaries as we only have beneficiary counts from the connection
      const particleColor = getProjectColorByBeneficiaries(connection.from_project_direct_beneficiaries, connection.from_project_indirect_beneficiaries);
      element.style.backgroundColor = particleColor;
      element.style.boxShadow = `0 0 6px ${particleColor}`;
      element.style.opacity = '1'
      
      // Initial position at start point
      const pixelCoords = mapRef.current.project(connection.from)
      element.style.left = `${pixelCoords.x}px`
      element.style.top = `${pixelCoords.y}px`
      
      // Decide target point - either control point or end point
      const targetPoint = Math.random() < 0.5 ? controlPoint : connection.to
      
      // Add particle to array
      particles.push({
        element,
        currentPoint: [...connection.from] as [number, number],
        targetPoint,
        speed: 0.1 + Math.random() * 0.3,
      })
    }
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate)
    particlesRef.current = particleElements
    
    // Clean up on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      
      // Remove all particle elements
      particleElements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        }
      })
    }
  }, [isMapLoaded, dynamicConnections, isMobile, generateCurvedPath])
  
  // Check for errors first
  if (hasError) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-red-500 to-orange-600 animate-pulse mb-6"></div>
        <h2 className="text-xl font-bold mb-2">Unable to Load Globe Visualization</h2>
        <p className="text-gray-300 mb-4">The globe component could not be loaded.</p>
        <div className="flex space-x-4">
          <Link 
            href="/"
            className="px-4 py-2 bg-black bg-opacity-70 rounded border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/30 transition-colors"
            aria-label="Return to 2D Map"
          >
            Return to 2D Map
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black bg-opacity-70 rounded border border-purple-500/50 text-purple-400 hover:bg-purple-900/30 transition-colors"
            aria-label="Try Again"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* GlobalStats Component */}
      <div className="absolute right-0 bottom-0 z-[1000] w-full max-w-xl px-4 sm:px-0">
        <GlobalStats projects={projects} />
      </div>

      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b opacity-[1.5] from-purple-900/20 to-cyan-900/20 pointer-events-none z-10"></div>
      <div className="absolute inset-0 bg-gradient-radial opacity-[1.5] from-transparent via-transparent to-purple-900/20 pointer-events-none z-10"></div>
      <div className="absolute inset-0 pointer-events-none z-20" style={{ boxShadow: 'inset 0 0 150px 20px rgba(0,0,0,0.7)' }}></div>
      
      {/* Hex grid overlay */}
      {showHexGrid && !isMobile && (
        <div 
          className="absolute inset-0 pointer-events-none z-[450] opacity-5"
          style={{
            backgroundImage: 'url(/grid-overlay.png)',
          }}
        ></div>
      )}
      
      {/* Noise overlay */}
      {!isMobile && (
        <div 
          className="absolute inset-0 pointer-events-none z-30 opacity-[0.02] animate-noise-bg"
          style={{
            backgroundImage: 'url(/noise.png)',
            backgroundRepeat: 'repeat',
          }}
        ></div>
      )}
      
      {/* Scanline overlay */}
      {!isMobile && <div className="absolute inset-0 bg-[url('/scanline.gif')] opacity-[0.02] pointer-events-none z-40"></div>}
      
      {/* Map container */}
      <div ref={containerRef} className="w-full h-full" />
      
      {/* White Banner - Position differently on mobile vs desktop */}
      {isMobile ? (
        <div className="opacity-50 absolute top-3 left-1/2 -translate-x-1/2 z-[999990] pointer-events-none">
          <img 
            src="/white-banner.png" 
            alt="Earth Guardians" 
            className="h-auto w-auto max-h-[12vh] object-contain"
          />
        </div>
      ) : (
        <div className="opacity-50 absolute left-[-15vh] top-1/2 -translate-y-1/2 z-[999] pointer-events-none">
          <img 
            src="/white-banner.png" 
            alt="Earth Guardians" 
            className="h-auto w-auto max-h-[15vh] object-contain rotate-[-90deg]"
          />
        </div>
      )}
      
      {/* Add CSS for popup styling */}
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0; }
          50% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        
        .maplibregl-popup-content {
          background: rgba(0, 0, 0, 0.9) !important;
          border-radius: 4px;
          border: 1px solid rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.3), inset 0 0 10px rgba(6, 182, 212, 0.1);
          padding: 0;
        }
        
        .maplibregl-popup-tip {
          border-top-color: rgba(6, 182, 212, 0.8);
          border-bottom-color: rgba(6, 182, 212, 0.8);
        }
        
        .maplibregl-popup-close-button {
          color: rgba(6, 182, 212, 0.8);
          font-size: 20px;
          padding: 0 6px;
          background: transparent;
          border: none;
          
        }
        
        .maplibregl-popup-close-button:hover {
          background-color: rgba(6, 182, 212, 0.2);
          color: rgba(6, 182, 212, 1);
        }
        
        .cyberpunk-popup {
          z-index: 1000;
        }
        
        .project-marker {
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 1;
        }
        
        .particle {
          transition: transform 0.1s linear;
        }
        
        .maplibregl-ctrl-bottom-right {
          margin-bottom: 5px;
          margin-right: 5px;
        }
        
        .maplibregl-ctrl-attrib-inner {
          color: rgba(255, 255, 255, 0.7);
          font-size: 10px;
          background-color: rgba(0, 0, 0, 0.5); !important
        }
        
        .maplibregl-ctrl-attrib-inner a {
          color: rgba(6, 182, 212, 0.8);
          text-decoration: none;
        }

        /* Make MapLibre background transparent */
        .maplibregl-map {
          background-color: transparent !important;
        }
      `}</style>
    </div>
  )
}