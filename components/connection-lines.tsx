"use client";

import { useEffect, useState, useRef, useMemo, memo } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import React from 'react';

// This defines the structure of a single connection,
// which consists of 'from' and 'to' coordinates.
interface Connection {
  from: [number, number];
  to: [number, number];
  from_project_indirect_beneficiaries?: number;
  id?: string; // Optional unique identifier
}

// This defines the props for the ConnectionLines component.
// It expects an array of Connection objects.
interface ConnectionLinesProps {
  connections: Connection[];
  maxConnections?: number; // Optional limit override
  animationSpeed?: number; // Optional animation speed control
  colorScheme?: 'cyberpunk' | 'monochrome' | 'warm' | 'cool'; // Visual theme option
}

// Enhanced color palettes with different themes
const colorPalettes = {
  cyberpunk: [
    { start: '#00FFFF', end: '#0088FF' }, // Cyan to blue
    { start: '#FF00FF', end: '#FF0088' }, // Magenta to pink
    { start: '#39FF14', end: '#00FF88' }, // Neon green to teal
    { start: '#FF69B4', end: '#FF00AA' }, // Hot pink to purple
    { start: '#F0F', end: '#80F' },       // Bright purple to deep purple
  ],
  monochrome: [
    { start: '#FFFFFF', end: '#AAAAFF' }, // White to light blue
    { start: '#EEEEFF', end: '#8888FF' }, // Light blue to medium blue
    { start: '#CCCCFF', end: '#6666FF' }, // Light blue to blue
    { start: '#AAAAFF', end: '#4444FF' }, // Light blue to deeper blue
    { start: '#8888FF', end: '#2222FF' }, // Medium blue to deep blue
  ],
  warm: [
    { start: '#FFFF00', end: '#FF8800' }, // Yellow to orange
    { start: '#FFAA00', end: '#FF5500' }, // Orange to red-orange
    { start: '#FF7700', end: '#FF2200' }, // Orange to red
    { start: '#FF5500', end: '#FF0066' }, // Red-orange to pink
    { start: '#FF2200', end: '#FF00AA' }, // Red to magenta
  ],
  cool: [
    { start: '#00FFFF', end: '#0088FF' }, // Cyan to blue
    { start: '#00CCFF', end: '#0044FF' }, // Light blue to deep blue
    { start: '#0088FF', end: '#0000FF' }, // Blue to deeper blue
    { start: '#0044FF', end: '#4400FF' }, // Deep blue to violet
    { start: '#0000FF', end: '#8800FF' }, // Deep blue to purple
  ]
};

// Default performance configuration
const DEFAULT_MAX_CONNECTIONS = 33;
const DEFAULT_CURVE_STEPS = 21;
const DEFAULT_ANIMATION_INTERVAL = 60;

// Memoized helper component for individual connection group
const ConnectionGroup = memo(({ 
  connection, 
  paths, 
  index, 
  animationPhase, 
  pulsePhase,
  colorPalette
}: { 
  connection: Connection, 
  paths: LatLngExpression[], 
  index: number, 
  animationPhase: number, 
  pulsePhase: number,
  colorPalette: { start: string, end: string }[]
}) => {
  const positions = paths;
  if (!positions || positions.length < 2) return null;
  
  // Calculate intensity based on beneficiaries if available
  const beneficiaries = connection.from_project_indirect_beneficiaries || 0;
  const intensity = beneficiaries > 1000 ? 1 : 
                    beneficiaries > 500 ? 0.8 : 
                    beneficiaries > 100 ? 0.6 : 0.4;
  
  // Select a color for the line based on its index
  const colorPair = colorPalette[index % colorPalette.length];
  
  // Calculate base animation properties
  const pulseEffect = Math.sin(pulsePhase / 16) * 0.2 + 0.8; // Varies from 0.6 to 1.0
  const baseOpacity = 0.4 * pulseEffect * intensity;
  
  // Create segments with enhanced visual effects
  const segments = [];
  const segmentCount = 4; // More segments for smoother gradient transition
  
  for (let i = 0; i < segmentCount; i++) {
    const startIdx = Math.floor(i * (positions.length - 1) / segmentCount);
    const endIdx = Math.floor((i + 1) * (positions.length - 1) / segmentCount);
    
    if (endIdx > startIdx) {
      // Calculate this segment's animation phase with offset
      const segmentPhase = (animationPhase + i * 25) % 100;
      
      // Flowing animation effect with improved wave pattern
      const flowPosition = segmentPhase / 100;
      const flowEffect = Math.sin(Math.PI * (flowPosition + i/segmentCount));
      const segmentOpacity = baseOpacity * (0.7 + flowEffect * 0.3);
      
      // Create color gradient based on segment position
      const segmentPosition = i / (segmentCount - 1);
      const r1 = parseInt(colorPair.start.slice(1, 3), 16);
      const g1 = parseInt(colorPair.start.slice(3, 5), 16);
      const b1 = parseInt(colorPair.start.slice(5, 7), 16);
      const r2 = parseInt(colorPair.end.slice(1, 3), 16);
      const g2 = parseInt(colorPair.end.slice(3, 5), 16);
      const b2 = parseInt(colorPair.end.slice(5, 7), 16);
      
      const r = Math.round(r1 + (r2 - r1) * segmentPosition);
      const g = Math.round(g1 + (g2 - g1) * segmentPosition);
      const b = Math.round(b1 + (b2 - b1) * segmentPosition);
      
      const segmentColor = `rgb(${r}, ${g}, ${b})`;
      
      segments.push(
        <Polyline
          key={`connection-${index}-segment-${i}`}
          positions={positions.slice(startIdx, endIdx + 1)}
          pathOptions={{
            color: segmentColor,
            opacity: segmentOpacity,
            weight: 2.5 * intensity,
            lineJoin: 'round',
            lineCap: 'round',
            className: 'connection-line-glow',
            // More sophisticated dash pattern based on both animation phases
            dashArray: (i % 2 === 0) ? undefined : 
                      `${4 + Math.sin(pulsePhase/15) * 2}, ${6 + Math.cos(animationPhase/20) * 2}`,
          }}
        />
      );
    }
  }
  
  // Add a subtle glow effect with a wider, more transparent line underneath
  const glowLine = (
    <Polyline
      key={`connection-${index}-glow`}
      positions={positions}
      pathOptions={{
        color: colorPair.start,
        opacity: baseOpacity * 0.4,
        weight: 10 * intensity,
        lineJoin: 'round',
        lineCap: 'round',
        className: 'connection-line-base',
      }}
    />
  );
  
  // Return segments with a proper key for the fragment
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
    const randomFactor = 0.15 + seed * 0.3; // Between 0.15 and 0.45
    
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
  animationSpeed = 1,
  colorScheme = 'cyberpunk'
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
  
  // Selected color palette based on the colorScheme prop
  const colorPalette = colorPalettes[colorScheme] || colorPalettes.cyberpunk;
  
  // State to track if connections are within view
  const [isVisible, setIsVisible] = useState(true);
  
  // Limit the number of connections to render for performance
  const { limitedConnections, connectionPaths } = useMemo(() => {
    // Filter out invalid connections first
    const validConnections = connections.filter(
      conn => Array.isArray(conn.from) && Array.isArray(conn.to) && 
              conn.from.length === 2 && conn.to.length === 2 &&
              !isNaN(conn.from[0]) && !isNaN(conn.from[1]) && 
              !isNaN(conn.to[0]) && !isNaN(conn.to[1])
    );
    
    // Group connections by their "from" coordinates (projects)
    const projectGroups = validConnections.reduce((groups, conn) => {
      // Generate a key for this project's location
      const key = `${conn.from[0].toFixed(4)}-${conn.from[1].toFixed(4)}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(conn);
      return groups;
    }, {} as Record<string, Connection[]>);
    
    // Ensure at least one connection from each project is selected
    let guaranteedConnections: Connection[] = [];
    Object.values(projectGroups).forEach(group => {
      if (group.length > 0) {
        // Sort by beneficiaries within group
        const sortedGroup = [...group].sort((a, b) => {
          const beneA = a.from_project_indirect_beneficiaries || 0;
          const beneB = b.from_project_indirect_beneficiaries || 0;
          return beneB - beneA;
        });
        
        // Add the most important connection from each project
        guaranteedConnections.push(sortedGroup[0]);
      }
    });
    
    // If we have space left for more connections
    let remainingSlots = maxConnections - guaranteedConnections.length;
    let additionalConnections: Connection[] = [];
    
    if (remainingSlots > 0) {
      // Get all connections that aren't already guaranteed
      const remainingConnections = validConnections.filter(conn => 
        !guaranteedConnections.some(gConn => 
          gConn.from[0] === conn.from[0] && 
          gConn.from[1] === conn.from[1] && 
          gConn.to[0] === conn.to[0] && 
          gConn.to[1] === conn.to[1]
        )
      );
      
      // Prioritize by beneficiaries
      const sortedRemaining = [...remainingConnections].sort((a, b) => {
        const beneA = a.from_project_indirect_beneficiaries || 0;
        const beneB = b.from_project_indirect_beneficiaries || 0;
        return beneB - beneA;
      });
      
      // Add some randomization for variety
      const topRemaining = sortedRemaining.slice(0, Math.min(remainingSlots * 2, sortedRemaining.length));
      const shuffledRemaining = [...topRemaining].sort(() => Math.random() - 0.5);
      
      // Add as many as we have space for
      additionalConnections = shuffledRemaining.slice(0, remainingSlots);
    }
    
    // Combine guaranteed and additional connections
    const selectedConnections = [...guaranteedConnections, ...additionalConnections];
    
    // Pre-calculate paths for better performance
    const paths = selectedConnections.map(connection => 
      generateCurvedPath(connection.from, connection.to, DEFAULT_CURVE_STEPS)
    );
    
    return { 
      limitedConnections: selectedConnections,
      connectionPaths: paths
    };
  }, [connections, maxConnections]);
  
  // Check if connections are within the current map view
  useEffect(() => {
    if (!map) return;
    
    const checkVisibility = () => {
      const bounds = map.getBounds();
      // Consider connections visible if at least one endpoint is in view
      const anyVisible = limitedConnections.some(conn => {
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
  }, [map, limitedConnections]);
  
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
      {limitedConnections.map((connection, index) => (
        <ConnectionGroup
          key={connection.id || `connection-${index}`}
          connection={connection}
          paths={connectionPaths[index]}
          index={index}
          animationPhase={animationPhase}
          pulsePhase={pulsePhase}
          colorPalette={colorPalette}
        />
      ))}
      
      {/* Add CSS for glow effect */}
      <style jsx global>{`
        .leaflet-pane path.connection-line-glow {
          filter: drop-shadow(0 0 3px rgba(0, 200, 255, 0.7));
          transition: opacity 0.3s ease-in-out;
        }
        .leaflet-pane path.connection-line-base {
          filter: blur(4px);
          transition: opacity 0.3s ease-in-out, filter 0.3s ease-in-out;
        }
        
        /* Create a subtle pulsing effect for the glow */
        @keyframes pulse-glow {
          0% { filter: drop-shadow(0 0 2px rgba(0, 200, 255, 0.5)); }
          50% { filter: drop-shadow(0 0 4px rgba(0, 200, 255, 0.8)); }
          100% { filter: drop-shadow(0 0 2px rgba(0, 200, 255, 0.5)); }
        }
        
        .leaflet-pane path.connection-line-glow:hover {
          animation: pulse-glow 1.5s infinite;
          opacity: 0.9 !important;
        }
      `}</style>
    </>
  );
} 