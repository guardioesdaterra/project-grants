"use client"

import { useEffect, useRef } from "react"
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
  from_project_indirect_beneficiaries: number; // UPDATED field name
}

interface ParticleEffectProps {
  projects: ProjectData[]; 
  connections: Connection[];
}

export function ParticleEffect({ projects, connections }: ParticleEffectProps) {
  const map = useMap()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<any[]>([]) 
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
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

    const ctx = canvas.getContext("2d")
    if (!ctx) return; 

    const particles = particlesRef.current;

    const createParticles = () => {
      connections.forEach((connection) => {
        const fromPoint = map.latLngToContainerPoint(connection.from);
        const toPoint = map.latLngToContainerPoint(connection.to);

        // Reduced particle frequency
        const particleFrequency = isMobile ? 0.001 : 0.001; // REDUCED from 0.02 : 0.05
        if (Math.random() < particleFrequency) {
          // Get color based on the source project's INDIRECT beneficiaries for this connection
          const particleColor = getBeneficiaryColor(connection.from_project_indirect_beneficiaries);
          
          particles.push({
            x: fromPoint.x,
            y: fromPoint.y,
            targetX: toPoint.x,
            targetY: toPoint.y,
            speed: 1 + Math.random() * (isMobile ? 1 : 2),
            size: isMobile ? 1.5 + Math.random() * 1.5 : 2 + Math.random() * 2,
            color: particleColor, 
            alpha: 0.5 + Math.random() * 0.5, 
            trail: [],
            trailLength: Math.floor(isMobile ? 3 + Math.random() * 3 : 5 + Math.random() * 5),
          });
        }
      });
    };

    let lastFrameTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      animationRef.current = requestAnimationFrame(animate);

      if (timestamp - lastFrameTime < frameInterval) {
        return;
      }
      lastFrameTime = timestamp;

      if (!canvasRef.current) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (canvasRef.current.width !== mapContainer.clientWidth || canvasRef.current.height !== mapContainer.clientHeight) {
        canvasRef.current.width = mapContainer.clientWidth;
        canvasRef.current.height = mapContainer.clientHeight;
      }

      createParticles();

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

          if (p.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (let j = 1; j < p.trail.length; j++) {
              ctx.lineTo(p.trail[j].x, p.trail[j].y);
            }
            ctx.strokeStyle = p.color.startsWith("#") ? `${p.color}${Math.round(p.alpha * 0.5 * 255).toString(16).padStart(2, '0')}` : p.color.replace(")", `, ${p.alpha * 0.5})`);
            ctx.lineWidth = p.size * 0.5;
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color.startsWith("#") ? `${p.color}${Math.round(p.alpha * 255).toString(16).padStart(2, '0')}` : p.color.replace(")", `, ${p.alpha})`);
          ctx.fill();

          if (!isMobile) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
            const baseColorForGradient = p.color.startsWith("#") ? p.color : p.color.substring(0, p.color.lastIndexOf(","));
            gradient.addColorStop(0, p.color.startsWith("#") ? `${baseColorForGradient}${Math.round(p.alpha * 0.7 * 255).toString(16).padStart(2, '0')}` : `${baseColorForGradient}, ${p.alpha * 0.7})`);
            gradient.addColorStop(1, p.color.startsWith("#") ? `${baseColorForGradient}00` : `${baseColorForGradient}, 0)`);
            ctx.fillStyle = gradient;
            ctx.fill();
          }
        } else {
          particles.splice(i, 1);
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
    };
  }, [map, connections, projects, isMobile]);

  return null;
}
