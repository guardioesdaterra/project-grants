"use client"

import { useEffect, useRef, useState } from "react"
import { useMap } from "react-leaflet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ProjectData } from "@/lib/types";

// Updated color function based on INDIRECT beneficiaries and user's tiers
const getBeneficiaryColor = (indirect_beneficiaries: number): string => {
  if (indirect_beneficiaries <= 100) return "#FF00FF"; // 
  if (indirect_beneficiaries <= 500) return "#0074D9"; // Blue
  if (indirect_beneficiaries >= 1000) return "#FF4136"; // red
  return "#FFDC00"; // Gold/Yellow for > 1000
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

  useEffect(() => {
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
    
    // Detect map interactions to pause animations
    const handleZoomStart = () => setIsZooming(true);
    const handleZoomEnd = () => {
      setTimeout(() => setIsZooming(false), 300); // Delay to ensure map has settled
    };
    
    const handleMoveStart = () => setIsPanning(true);
    const handleMoveEnd = () => {
      setTimeout(() => setIsPanning(false), 300); // Delay to ensure map has settled
    };
    
    map.on('zoomstart', handleZoomStart);
    map.on('zoomend', handleZoomEnd);
    map.on('movestart', handleMoveStart);
    map.on('moveend', handleMoveEnd);

    const createParticles = () => {
      // Skip creating particles during zooming/panning for better performance
      if (isZooming || isPanning) return;
      
      // Limit max particles
      const maxParticles = isMobile ? 50 : 100;
      if (particles.length > maxParticles) return;
            
      // Process only a subset of connections each frame
      const connectionsToProcess = isMobile ? 3 : 5;
      const selectedConnections = connections.slice(0, Math.min(connectionsToProcess, connections.length));
      
      selectedConnections.forEach((connection) => {
        try {
          const fromPoint = map.latLngToContainerPoint(connection.from);
          const toPoint = map.latLngToContainerPoint(connection.to);

          // Even more aggressive reduction in particle frequency
          const particleFrequency = isMobile ? 0.002 : 0.003; 
          if (Math.random() < particleFrequency) {
            // Get color based on the source project's beneficiaries
            const particleColor = getBeneficiaryColor(connection.from_project_indirect_beneficiaries);
            
            particles.push({
              x: fromPoint.x,
              y: fromPoint.y,
              targetX: toPoint.x,
              targetY: toPoint.y,
              speed: 0.5 + Math.random() * (isMobile ? 0.5 : 1),
              size: isMobile ? 1 + Math.random() * 1 : 1.5 + Math.random() * 1.5,
              color: particleColor, 
              alpha: 0.4 + Math.random() * 0.4, 
              trail: [],
              trailLength: Math.floor(isMobile ? 2 + Math.random() * 2 : 3 + Math.random() * 3),
            });
          }
        } catch (error) {
          // Fail silently if points cannot be calculated
        }
      });
    };

    let lastFrameTime = 0;
    // Further reduced frame rate
    const targetFPS = isMobile ? 20 : 30;
    const frameInterval = 1000 / targetFPS;
    
    let frameSkipCounter = 0;
    const frameSkipThreshold = isMobile ? 2 : 1;

    const animate = (timestamp: number) => {
      // Request next animation frame first
      animationRef.current = requestAnimationFrame(animate);

      // Skip frames for performance
      if (timestamp - lastFrameTime < frameInterval) {
        return;
      }
      
      // Additional frame skipping
      frameSkipCounter++;
      if (frameSkipCounter < frameSkipThreshold) {
        return;
      }
      frameSkipCounter = 0;
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
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Resize canvas if needed
      if (canvasRef.current.width !== mapContainer.clientWidth || canvasRef.current.height !== mapContainer.clientHeight) {
        canvasRef.current.width = mapContainer.clientWidth;
        canvasRef.current.height = mapContainer.clientHeight;
      }

      // Only create particles if below max count
      if (particles.length < (isMobile ? 50 : 100)) {
        createParticles();
      }

      // Process particles in batches for better performance
      const batchSize = isMobile ? 20 : 50;
      const particlesToProcess = particles.slice(0, Math.min(batchSize, particles.length));
      
      for (let i = particlesToProcess.length - 1; i >= 0; i--) {
        const p = particlesToProcess[i];
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

          // Draw trail only if it has enough points
          if (p.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (let j = 1; j < p.trail.length; j++) {
              ctx.lineTo(p.trail[j].x, p.trail[j].y);
            }
            ctx.strokeStyle = p.color.startsWith("#") 
              ? `${p.color}${Math.round(p.alpha * 0.5 * 255).toString(16).padStart(2, '0')}` 
              : p.color.replace(")", `, ${p.alpha * 0.5})`);
            ctx.lineWidth = p.size * 0.5;
            ctx.stroke();
          }

          // Draw particle
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
          particles.splice(particles.indexOf(p), 1);
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    const updateParticlesOnMapEvent = () => {
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

    map.on("moveend", updateParticlesOnMapEvent);
    map.on("zoomend", updateParticlesOnMapEvent);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (canvasRef.current && mapContainer && canvasRef.current.parentNode === mapContainer) {
         mapContainer.removeChild(canvasRef.current);
      }
      canvasRef.current = null; 
      map.off("moveend", updateParticlesOnMapEvent);
      map.off("zoomend", updateParticlesOnMapEvent);
      map.off('zoomstart', handleZoomStart);
      map.off('zoomend', handleZoomEnd);
      map.off('movestart', handleMoveStart);
      map.off('moveend', handleMoveEnd);
    };
  }, [map, connections, projects, isMobile, isZooming, isPanning]);

  return null;
}
