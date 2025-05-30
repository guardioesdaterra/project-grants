"use client";

import { useEffect, useState, useRef, useMemo, memo } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import React from 'react';
import { getProjectColorByBeneficiaries } from "@/lib/colors"; // Import the centralized color function

// This defines the structure of a single connection,
// which consists of 'from' and 'to' coordinates.
interface Connection {
  from: [number, number];
  to: [number, number];
  from_project_indirect_beneficiaries?: number;
  from_project_direct_beneficiaries?: number;
  id?: string; // Optional unique identifier
}

// This defines the props for the ConnectionLines component.
// It expects an array of Connection objects.
interface ConnectionLinesProps {
  connections: Connection[];
  maxConnections?: number; // Optional limit override
  animationSpeed?: number; // Optional animation speed control
}

// Default performance configuration
const DEFAULT_MAX_CONNECTIONS = 60;
const DEFAULT_CURVE_STEPS = 21;
const DEFAULT_ANIMATION_INTERVAL = 80;

// Memoized helper component for individual connection group
const ConnectionGroup = memo(({ 
  connection, 
  paths, 
  index, 
  animationPhase, 
  pulsePhase
}: { 
  connection: Connection, 
  paths: LatLngExpression[], 
  index: number, 
  animationPhase: number, 
  pulsePhase: number
}) => {
  const positions = paths;
  if (!positions || positions.length < 2) return null;
  
  const directBeneficiaries = connection.from_project_direct_beneficiaries || 0;
  const indirectBeneficiaries = connection.from_project_indirect_beneficiaries || 0;
  const totalBeneficiaries = directBeneficiaries + indirectBeneficiaries;
  
  const intensity = totalBeneficiaries > 1000 ? 0.9 : 
                    totalBeneficiaries > 500 ? 0.7 : 
                    totalBeneficiaries > 100 ? 0.5 : 0.3;
  
  // Select a color for the line based on project beneficiaries
  const lineColor = getProjectColorByBeneficiaries(directBeneficiaries, indirectBeneficiaries);
  
  const pulseEffect = Math.sin(pulsePhase / 16) * 0.1 + 0.9;
  const baseOpacity = 0.6 * pulseEffect * intensity;
  
  const segments = [];
  // Simplified to one segment as the color is uniform now
  const dashPattern = '8, 35'; 
  
  segments.push(
    <Polyline
      key={`connection-${index}-segment-main`}
      positions={positions}
      pathOptions={{
        color: lineColor, // Use derived lineColor
        opacity: baseOpacity,
        weight: 2.5 * intensity,
        lineJoin: 'round',
        lineCap: 'round',
        dashArray: dashPattern,
        className: 'connection-line-glow',
      }}
    />
  );
  
  const glowLine = (
    <Polyline
      key={`connection-${index}-glow`}
      positions={positions}
      pathOptions={{
        color: lineColor, // Glow with the same lineColor
        opacity: baseOpacity * 0.4, 
        weight: 10 * intensity, 
        lineJoin: 'round',
        lineCap: 'round',
        dashArray: dashPattern,
        className: 'connection-line-base',
      }}
    />
  );
  
  return (
    <React.Fragment key={`connection-group-${index}`}>
      {glowLine}
      {segments}
    </React.Fragment>
  );
});

// Function to generate a curved path between two points with enhanced curve control
function generateCurvedPath(from: [number, number], to: [number, number], steps: number = DEFAULT_CURVE_STEPS): LatLngExpression[] {
  try {
    // Calculate midpoint
    const midX = (from[0] + to[0]) / 2;
    const midY = (from[1] + to[1]) / 2;
    
    // Calculate the perpendicular displacement for the control point
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    
    // Create a perpendicular vector
    const perpX = -dy;
    const perpY = dx;
    
    // Normalize and scale (with safety check to prevent division by zero)
    const length = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
    const normalizedPerpX = perpX / length;
    const normalizedPerpY = perpY / length;
    
    // Calculate the distance between points to scale the curve appropriately
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Randomize curve shape with enhanced algorithm
    // Use deterministic randomization based on coordinates to maintain consistency
    const seed = (from[0] * 1000 + from[1] + to[0] * 100 + to[1]) % 1000 / 1000;
    const randomFactor = 0.1 + seed * 0.1; // Between 0.1 and 0.2 (more uniform and flatter curves)
    
    // Add some variation to curve size based on distance
    const distanceFactor = Math.min(1, distance / 50);
    const curveFactor = Math.min(distance * randomFactor * distanceFactor, 25);
    
    // Add displacement to midpoint to create control point
    const controlPointX = midX + normalizedPerpX * curveFactor;
    const controlPointY = midY + normalizedPerpY * curveFactor;
    
    // Generate path points 
    const path: LatLngExpression[] = [];
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      
      // Quadratic Bezier curve formula
      const x = (1 - t) * (1 - t) * from[0] + 
                2 * (1 - t) * t * controlPointX + 
                t * t * to[0];
      
      const y = (1 - t) * (1 - t) * from[1] + 
                2 * (1 - t) * t * controlPointY + 
                t * t * to[1];
      
      // Only add valid coordinates
      if (!isNaN(x) && !isNaN(y)) {
        path.push([x, y]);
      }
    }
    
    // Ensure we have at least 2 points to form a line
    if (path.length < 2) {
      return [from, to]; // Fall back to a straight line
    }
    
    return path;
  } catch (error) {
    console.error("Error generating curved path:", error);
    return [from, to]; // Fall back to a straight line in case of error
  }
}

export function ConnectionLines({ 
  connections, 
  maxConnections = DEFAULT_MAX_CONNECTIONS,
  animationSpeed = 1
}: ConnectionLinesProps) {
  // If there are no connections, render nothing.
  if (!connections || connections.length === 0) {
    return null;
  }

  // Get the map instance
  const map = useMap();

  // Animation states with timing adjustment based on speed
  const [animationPhase, setAnimationPhase] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);
  const animationIntervalRef = useRef<number | null>(null);
  const pulseIntervalRef = useRef<number | null>(null);
  
  // State to track if connections are within view
  const [isVisible, setIsVisible] = useState(true);
  
  // Filter and memoize connections to render
  const connectionsToRender = useMemo(() => {
    return connections.slice(0, maxConnections);
  }, [connections, maxConnections]);

  // Generate paths for visible connections
  const generatedPaths = useMemo(() => {
    return connectionsToRender.map(conn => generateCurvedPath(conn.from, conn.to));
  }, [connectionsToRender]);
  
  // Check if connections are within the current map view
  useEffect(() => {
    if (!map) return;
    
    const checkVisibility = () => {
      const bounds = map.getBounds();
      // Consider connections visible if at least one endpoint is in view
      const anyVisible = connectionsToRender.some(conn => {
        return bounds.contains([conn.from[0], conn.from[1]]) || 
               bounds.contains([conn.to[0], conn.to[1]]);
      });
      setIsVisible(anyVisible);
    };
    
    // Initial check
    checkVisibility();
    
    // Add event listeners for map movements
    map.on('moveend', checkVisibility);
    map.on('zoomend', checkVisibility);
    
    return () => {
      map.off('moveend', checkVisibility);
      map.off('zoomend', checkVisibility);
    };
  }, [map, connectionsToRender]);
  
  // Animation effect for line tracing with adjusted timing
  useEffect(() => {
    // Only run animation when connections are in view
    if (!isVisible) {
      if (animationIntervalRef.current) {
        window.clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      if (pulseIntervalRef.current) {
        window.clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }
      return;
    }
    
    // Calculate intervals based on animation speed
    const traceInterval = Math.max(30, Math.round(DEFAULT_ANIMATION_INTERVAL / animationSpeed));
    const pulseInterval = Math.max(75, Math.round(DEFAULT_ANIMATION_INTERVAL * 2.5 / animationSpeed));
    
    // Clear any existing intervals first
    if (animationIntervalRef.current !== null) {
      window.clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }
    
    // Set new interval for line animation
    animationIntervalRef.current = window.setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100);
    }, traceInterval);
    
    // Set new interval for pulse effect with different timing
    if (pulseIntervalRef.current !== null) {
      window.clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }
    
    pulseIntervalRef.current = window.setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 100);
    }, pulseInterval);
    
    // Cleanup function
    return () => {
      if (animationIntervalRef.current !== null) {
        window.clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      if (pulseIntervalRef.current !== null) {
        window.clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }
    };
  }, [isVisible, animationSpeed]);
  
  // Don't render if not visible
  if (!isVisible) return null;
  
  return (
    <>
      {connectionsToRender.map((connection, index) => (
        <ConnectionGroup
          key={connection.id || `connection-${index}`}
          connection={connection}
          paths={generatedPaths[index]}
          index={index}
          animationPhase={animationPhase}
          pulsePhase={pulsePhase}
        />
      ))}
      
      {/* Add CSS for glow effect */}
      <style jsx global>{`
        .leaflet-pane path.connection-line-glow {
          transition: opacity 0.3s ease-in-out, filter 0.3s ease-in-out;
        }
        .leaflet-pane path.connection-line-base {
          transition: opacity 0.3s ease-in-out, filter 0.3s ease-in-out;
        }
        
        /* Create a subtle pulsing effect for the glow */
        /* @keyframes pulse-glow {
          0% { filter: drop-shadow(0 0 3px rgba(0, 220, 255, 0.4)) drop-shadow(0 0 6px rgba(0,220,255,0.2)); }
          50% { filter: drop-shadow(0 0 6px rgba(0, 220, 255, 0.6)) drop-shadow(0 0 12px rgba(0,220,255,0.4)); }
          100% { filter: drop-shadow(0 0 3px rgba(0, 220, 255, 0.4)) drop-shadow(0 0 6px rgba(0,220,255,0.2)); }
        } */
        
        .leaflet-pane path.connection-line-glow:hover {
          /* animation: pulse-glow 1.5s infinite; */
          opacity: 0.7 !important; /* Reduced from 0.9 to 0.7 for more transparency on hover */
        }
      `}</style>
    </>
  );
} 