"use client"

import { useEffect, useRef, useState } from "react"
import { useMap } from "react-leaflet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ProjectData } from "@/lib/types";

// Color function with better visibility
const getBeneficiaryColor = (indirect_beneficiaries: number): string => {
  if (indirect_beneficiaries <= 100) return "#FF00FF"; // Magenta for smallest tier
  if (indirect_beneficiaries <= 500) return "#0074D9"; // Blue for medium tier
  if (indirect_beneficiaries >= 1000) return "#FF4136"; // Red for largest tier
  return "#FFDC00"; // Gold/Yellow for intermediate tier
};

interface Connection {
  from: [number, number];
  to: [number, number];
  from_project_indirect_beneficiaries: number;
}

interface ParticleEffectProps {
  projects: ProjectData[]; 
  connections: Connection[];
}

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  size: number;
  color: string;
  alpha: number;
  trail: { x: number; y: number }[];
  trailLength: number;
}

export function ParticleEffect({ projects, connections }: ParticleEffectProps) {
  const map = useMap()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([]) 
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isZooming, setIsZooming] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const isUnmountingRef = useRef(false)

  useEffect(() => {
    // Set unmounting flag to false on mount
    isUnmountingRef.current = false;

    // Clear particles if no connections
    if (!connections || connections.length === 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      particlesRef.current = [];
      return; 
    }

    // Create canvas element for particles
    const canvas = document.createElement("canvas")
    canvas.style.position = "absolute"
    canvas.style.top = "0"
    canvas.style.left = "0"
    canvas.style.pointerEvents = "none"
    canvas.style.zIndex = "400" 
    
    const mapContainer = map.getContainer();
    canvas.width = mapContainer.clientWidth;
    canvas.height = mapContainer.clientHeight;

    mapContainer.appendChild(canvas)
    canvasRef.current = canvas

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return; 

    const particles = particlesRef.current;
    
    // Map event listeners for pause/resume animations
    const handleZoomStart = () => {
      if (isUnmountingRef.current) return;
      setIsZooming(true);
    }
    
    const handleZoomEnd = () => {
      if (isUnmountingRef.current) return;
      setTimeout(() => {
        if (!isUnmountingRef.current) {
          setIsZooming(false);
        }
      }, 300);
    }
    
    const handleMoveStart = () => {
      if (isUnmountingRef.current) return;
      setIsPanning(true);
    }
    
    const handleMoveEnd = () => {
      if (isUnmountingRef.current) return;
      setTimeout(() => {
        if (!isUnmountingRef.current) {
          setIsPanning(false);
        }
      }, 300);
    }
    
    // Use safer event binding with try-catch
    try {
      map.on('zoomstart', handleZoomStart);
      map.on('zoomend', handleZoomEnd);
      map.on('movestart', handleMoveStart);
      map.on('moveend', handleMoveEnd);
    } catch (error) {
      console.error("Error binding map events:", error);
    }

    // Function to create new particles
    const createParticles = () => {
      // Skip creating particles during zooming/panning or unmounting
      if (isZooming || isPanning || isUnmountingRef.current) return;
      
      // Adaptive particle limits
      const maxParticles = isMobile ? 30 : 40;
      if (particles.length > maxParticles) return;
      
      // Get all project origins by creating a map of from coordinates to connection arrays
      const projectConnectionMap = new Map();
      connections.forEach(conn => {
        const key = `${conn.from[0]},${conn.from[1]}`;
        if (!projectConnectionMap.has(key)) {
          projectConnectionMap.set(key, []);
        }
        projectConnectionMap.get(key).push(conn);
      });
      
      // Process connections from ALL origins - ensure we get at least one connection from each origin
      const allProjectOrigins = Array.from(projectConnectionMap.keys());
      
      // Select a random subset to process each frame
      const originsToProcess = Math.min(isMobile ? 5 : 10, allProjectOrigins.length);
      const originsToUse = [];
      
      // Add origins randomly without removing from the original array
      for (let i = 0; i < originsToProcess; i++) {
        const randomIndex = Math.floor(Math.random() * allProjectOrigins.length);
        originsToUse.push(allProjectOrigins[randomIndex]);
      }
      
      // Process one connection from each selected origin
      for (const originKey of originsToUse) {
        const connectionsFromOrigin = projectConnectionMap.get(originKey);
        if (connectionsFromOrigin && connectionsFromOrigin.length > 0) {
          // Pick a random connection from this origin
          const randomConnIndex = Math.floor(Math.random() * connectionsFromOrigin.length);
          const connection = connectionsFromOrigin[randomConnIndex];
          
          try {
            // Convert geo coordinates to screen coordinates
            const fromPoint = map.latLngToContainerPoint(connection.from);
            const toPoint = map.latLngToContainerPoint(connection.to);
            
            // Higher probability of particle creation to ensure visibility
            const particleFrequency = isMobile ? 0.2 : 0.3;
            if (Math.random() < particleFrequency) {
              // Get color based on the source project's beneficiaries
              const particleColor = getBeneficiaryColor(connection.from_project_indirect_beneficiaries);
              
              // Create a particle with better visibility
              particles.push({
                x: fromPoint.x,
                y: fromPoint.y,
                targetX: toPoint.x,
                targetY: toPoint.y,
                speed: 0.5 + Math.random() * (isMobile ? 0.5 : 1.0),
                size: isMobile ? 1.2 + Math.random() * 0.8 : 1.5 + Math.random() * 1.0,
                color: particleColor,
                alpha: 0.5 + Math.random() * 0.3, // Higher alpha for visibility
                trail: [],
                trailLength: Math.floor(isMobile ? 2 + Math.random() * 1 : 3 + Math.random() * 2)
              });
            }
          } catch (error) {
            // Fail silently if points cannot be calculated
          }
        }
      }
    };

    let lastFrameTime = 0;
    const targetFPS = isMobile ? 20 : 30; // Back to higher FPS for smoother animation
    const frameInterval = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      // Skip if unmounting
      if (isUnmountingRef.current) return;
      
      // Request next animation frame first
      try {
        animationRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.error("Error requesting animation frame:", error);
        return;
      }

      // Limit FPS
      if (timestamp - lastFrameTime < frameInterval) {
        return;
      }
      lastFrameTime = timestamp;

      // Skip rendering during zoom/pan
      if (isZooming || isPanning) {
        if (canvasRef.current) {
          const currentCtx = canvasRef.current.getContext("2d");
          if (currentCtx) {
            currentCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
        return;
      }

      if (!canvasRef.current) return;
      
      try {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Resize canvas if needed
        if (canvasRef.current.width !== mapContainer.clientWidth || canvasRef.current.height !== mapContainer.clientHeight) {
          canvasRef.current.width = mapContainer.clientWidth;
          canvasRef.current.height = mapContainer.clientHeight;
        }

        // Always try to create particles if below max count
        if (particles.length < (isMobile ? 50 : 100)) {
          createParticles();
        }

        // Process all particles for immediate visibility
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > p.speed) {
            p.x += (dx / distance) * p.speed;
            p.y += (dy / distance) * p.speed;
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > p.trailLength) {
              p.trail.shift();
            }

            // Draw trail
            if (p.trail.length > 1) {
              ctx.beginPath();
              ctx.moveTo(p.trail[0].x, p.trail[0].y);
              for (let j = 1; j < p.trail.length; j++) {
                ctx.lineTo(p.trail[j].x, p.trail[j].y);
              }
              ctx.strokeStyle = p.color.startsWith("#") 
                ? `${p.color}${Math.round(p.alpha * 0.6 * 255).toString(16).padStart(2, '0')}` // More visible trails
                : p.color.replace(")", `, ${p.alpha * 0.6})`);
              ctx.lineWidth = p.size * 0.6;
              ctx.stroke();
            }

            // Draw particle - Make the main particle more visible
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color.startsWith("#") 
              ? `${p.color}${Math.round(p.alpha * 255).toString(16).padStart(2, '0')}`
              : p.color.replace(")", `, ${p.alpha})`);
            ctx.fill();

            // Only draw glow effect on desktop
            if (!isMobile) {
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
              const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.5);
              const baseColorForGradient = p.color.startsWith("#") 
                ? p.color 
                : p.color.substring(0, p.color.lastIndexOf(","));
              gradient.addColorStop(0, p.color.startsWith("#") 
                ? `${baseColorForGradient}${Math.round(p.alpha * 0.5 * 255).toString(16).padStart(2, '0')}`
                : `${baseColorForGradient}, ${p.alpha * 0.5})`);
              gradient.addColorStop(1, p.color.startsWith("#") 
                ? `${baseColorForGradient}00` 
                : `${baseColorForGradient}, 0)`);
              ctx.fillStyle = gradient;
              ctx.fill();
            }
          } else {
            // Remove particles that have reached their target
            particles.splice(i, 1);
          }
        }
      } catch (error) {
        console.error("Error in animation frame:", error);
      }
    };

    try {
      animationRef.current = requestAnimationFrame(animate);
    } catch (error) {
      console.error("Error starting animation:", error);
    }

    const updateParticlesOnMapEvent = () => {
      if (isUnmountingRef.current) return;
      
      if (canvasRef.current && mapContainer) { 
        canvasRef.current.width = mapContainer.clientWidth;
        canvasRef.current.height = mapContainer.clientHeight;
        const currentCtx = canvasRef.current.getContext("2d");
        if (currentCtx) {
          currentCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      // Clear particles entirely on map interaction
      particles.length = 0; 
    };

    // Update particles on map events
    try {
      map.on("moveend", updateParticlesOnMapEvent);
      map.on("zoomend", updateParticlesOnMapEvent);
    } catch (error) {
      console.error("Error binding map events for particles:", error);
    }

    // Cleanup on component unmount
    return () => {
      // Set unmounting flag to true before cleanup
      isUnmountingRef.current = true;
      
      // Cancel animation frame with try-catch
      if (animationRef.current) {
        try {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        } catch (error) {
          console.error("Error canceling animation frame:", error);
        }
      }

      // Clear particles array
      if (particlesRef.current) {
        particlesRef.current.length = 0;
      }
      
      // Clean up canvas
      if (canvasRef.current) {
        try {
          if (mapContainer && canvasRef.current.parentNode === mapContainer) {
            mapContainer.removeChild(canvasRef.current);
          }
          canvasRef.current = null;
        } catch (error) {
          console.error("Error removing canvas element:", error);
        }
      }
      
      // Remove event listeners with try-catch
      try {
        map.off("moveend", updateParticlesOnMapEvent);
        map.off("zoomend", updateParticlesOnMapEvent);
        map.off('zoomstart', handleZoomStart);
        map.off('zoomend', handleZoomEnd);
        map.off('movestart', handleMoveStart);
        map.off('moveend', handleMoveEnd);
      } catch (error) {
        console.error("Error removing map event listeners:", error);
      }
    };
  }, [map, connections, projects, isMobile, isZooming, isPanning]);

  return null;
}