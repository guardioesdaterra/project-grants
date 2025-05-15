"use client";

import { useEffect, useState, useRef, useMemo, memo } from 'react';
import { Polyline, useMap, SVGOverlay } from 'react-leaflet';
import { LatLngExpression, LatLngBounds } from 'leaflet';
import React from 'react';

// This defines the structure of a single connection,
// which consists of 'from' and 'to' coordinates.
interface Connection {
  from: [number, number];
  to: [number, number];
  from_project_indirect_beneficiaries?: number;
  id?: string; // Optional unique identifier
}

// Cyberpunk overlay effect component
const CyberpunkOverlay = memo(({ 
  connections, 
  pulsePhase,
  intensity = 'normal'
}: { 
  connections: Connection[],
  pulsePhase: number,
  intensity: 'normal' | 'high' | 'extreme'
}) => {
  const map = useMap();
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Use refs to persist particles between render cycles
  const linesRef = useRef<JSX.Element[]>([]);
  const scanLinesRef = useRef<JSX.Element[]>([]);
  
  // State for rendering
  const [lines, setLines] = useState<JSX.Element[]>([]);
  const [scanLines, setScanLines] = useState<JSX.Element[]>([]);
  
  // Calculate safe bounds - handle edge cases where map might not be fully initialized
  const bounds = useMemo(() => {
    try {
      // Check if map is properly initialized
      if (!map || !map.getCenter()) {
        // Fallback to a default bounds for the entire world
        return new LatLngBounds([-90, -180], [90, 180]);
      }
      return map.getBounds();
    } catch (e) {
      console.warn('Error getting map bounds:', e);
      // Fallback to a default bounds for the entire world
      return new LatLngBounds([-90, -180], [90, 180]);
    }
  }, [map]);
  
  // Update glitch elements
  useEffect(() => {
    if (!svgRef.current || !map.getCenter()) return;
    
    // Determine the intensity factor that affects frequency and strength of effects
    const intensityFactor = intensity === 'normal' ? 1 : 
                           intensity === 'high' ? 1.5 : 
                           2; // extreme
    
    // Generate scan lines that persist longer
    // Only recreate if we don't have any or rarely
    if (scanLinesRef.current.length === 0 || Math.random() > (0.97 / intensityFactor)) {
      const newScanLines: JSX.Element[] = [];
      const height = svgRef.current.clientHeight;
      
      // More scan lines for higher intensity
      const scanLineCount = intensity === 'normal' ? 20 : 
                          intensity === 'high' ? 30 : 
                          40; // extreme
      
      for (let i = 0; i < scanLineCount; i++) {
        const y = Math.floor(Math.random() * height);
        if (Math.random() > (0.5 / intensityFactor)) {
          newScanLines.push(
            <line 
              key={`scan-${i}-${Date.now()}`}
              x1="0" 
              y1={y} 
              x2="100%" 
              y2={y} 
              stroke={intensity === 'extreme' ? (Math.random() > 0.5 ? '#0ff' : '#f0f') : '#0ff'} 
              strokeWidth={intensity === 'extreme' ? "2" : "1"} 
              opacity={0.03 + Math.random() * (0.05 * intensityFactor)}
            />
          );
        }
      }
      
      // Keep some old lines for persistence
      scanLinesRef.current = [...scanLinesRef.current.slice(-5), ...newScanLines];
      setScanLines(scanLinesRef.current);
    }
    
    // Create glitchy connection highlights
    // Only update glitch lines occasionally
    if (linesRef.current.length === 0 || Math.random() > (0.95 / intensityFactor)) {
      try {
        const newLines = connections
          .filter(() => Math.random() > (0.5 / intensityFactor))
          .map((conn, i) => {
            try {
              const from = map.latLngToLayerPoint([conn.from[0], conn.from[1]]);
              const to = map.latLngToLayerPoint([conn.to[0], conn.to[1]]);
              
              // More extreme effects for higher intensity levels
              const strokeWidth = intensity === 'normal' ? "3" : 
                               intensity === 'high' ? "4" : 
                               "5"; // extreme
              
              const strokeOpacity = intensity === 'normal' ? "0.2" : 
                                 intensity === 'high' ? "0.3" : 
                                 "0.4"; // extreme
              
              return (
                <line 
                  key={`glitch-${i}-${Date.now()}`}
                  x1={from.x} 
                  y1={from.y} 
                  x2={to.x} 
                  y2={to.y} 
                  stroke={Math.random() > 0.5 ? '#0ff' : '#f0f'} 
                  strokeWidth={strokeWidth} 
                  opacity={strokeOpacity}
                  strokeDasharray={Math.random() > 0.5 ? "5,5" : undefined}
                />
              );
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean) as JSX.Element[];
          
        // Merge with some existing lines for persistence
        linesRef.current = [...linesRef.current.slice(-(5 * Math.ceil(intensityFactor))), ...newLines];
        setLines(linesRef.current);
      } catch (e) {
        console.warn('Error creating glitch lines:', e);
      }
    }
  }, [pulsePhase, map, connections, intensity]);
  
  // This effect updates our rendering state when map drag ends
  useEffect(() => {
    const onMoveEnd = () => {
      // Just update the state with our persistent refs
      setScanLines([...scanLinesRef.current]);
      setLines([...linesRef.current]);
    };
    
    map.on('moveend', onMoveEnd);
    map.on('dragend', onMoveEnd);
    map.on('zoomend', onMoveEnd);
    
    return () => {
      map.off('moveend', onMoveEnd);
      map.off('dragend', onMoveEnd);
      map.off('zoomend', onMoveEnd);
    };
  }, [map]);
  
  return (
    <SVGOverlay bounds={bounds} pane="popupPane">
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%" 
        style={{ 
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          mixBlendMode: intensity === 'extreme' ? 'lighten' : 'screen',
          zIndex: 9999 // Ensure high z-index
        }}
      >
        <defs>
          <filter id="cyberpunk-noise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency={intensity === 'normal' ? "0.5" : intensity === 'high' ? "0.7" : "0.9"} 
              numOctaves={intensity === 'extreme' ? "2" : "1"} 
              result="noise" 
              seed={pulsePhase} 
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={intensity === 'extreme' ? "8" : "5"} />
          </filter>
          <filter id="cyberpunk-glow">
            <feGaussianBlur stdDeviation={intensity === 'normal' ? "2.5" : intensity === 'high' ? "3.5" : "4.5"} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feFlood floodColor="#ff00ff" result="flood1" />
            <feFlood floodColor="#00ffff" result="flood2" />
            <feComposite in="flood1" in2="SourceGraphic" operator="in" result="comp1" />
            <feComposite in="flood2" in2="SourceGraphic" operator="in" result="comp2" />
            <feMorphology operator="dilate" radius={intensity === 'normal' ? "3" : intensity === 'high' ? "4" : "5"} in="comp1" result="morph1" />
            <feMorphology operator="dilate" radius={intensity === 'normal' ? "3" : intensity === 'high' ? "4" : "5"} in="comp2" result="morph2" />
            <feGaussianBlur in="morph1" stdDeviation={intensity === 'normal' ? "3" : intensity === 'high' ? "4" : "5"} result="blur1" />
            <feGaussianBlur in="morph2" stdDeviation={intensity === 'normal' ? "3" : intensity === 'high' ? "4" : "5"} result="blur2" />
            <feColorMatrix in="blur1" type="matrix" values="1 0 0 0 0  0 0.5 0 0 0  0 0 0.5 0 0  0 0 0 1 0" result="matrix1" />
            <feColorMatrix in="blur2" type="matrix" values="0.5 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="matrix2" />
            <feMerge>
              <feMergeNode in="matrix1" />
              <feMergeNode in="matrix2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Random scan lines */}
        <g>{scanLines}</g>
        
        {/* Connection highlights with enhanced glow */}
        <g filter="url(#neon-glow)">{lines}</g>
        
        {/* Digital noise overlay */}
        {Math.random() > (intensity === 'normal' ? 0.95 : intensity === 'high' ? 0.93 : 0.90) && (
          <rect 
            x="0" 
            y="0" 
            width="100%" 
            height="100%" 
            fill="url(#cyberpunk-noise)" 
            opacity={intensity === 'normal' ? "0.02" : intensity === 'high' ? "0.03" : "0.04"}
          />
        )}
        
        {/* Glitch effect - random colored shapes that appear occasionally */}
        {Math.random() > (intensity === 'normal' ? 0.97 : intensity === 'high' ? 0.95 : 0.92) && (
          <g>
            {Array.from({ length: intensity === 'normal' ? 3 : intensity === 'high' ? 5 : 8 }).map((_, i) => {
              const x = Math.random() * 100;
              const y = Math.random() * 100;
              const width = 5 + Math.random() * 20;
              const height = 2 + Math.random() * 5;
              const color = Math.random() > 0.5 ? '#ff00ff' : '#00ffff';
              
              return (
                <rect
                  key={`glitch-rect-${i}`}
                  x={`${x}%`}
                  y={`${y}%`}
                  width={`${width}%`}
                  height={`${height}%`}
                  fill={color}
                  opacity={intensity === 'normal' ? "0.05" : intensity === 'high' ? "0.07" : "0.1"}
                />
              );
            })}
          </g>
        )}
      </svg>
    </SVGOverlay>
  );
});

// This defines the props for the ConnectionLines component.
// It expects an array of Connection objects.
interface ConnectionLinesProps {
  connections: Connection[];
  maxConnections?: number; // Optional limit override
  animationSpeed?: number; // Optional animation speed control
  colorScheme?: 'cyberpunk' | 'monochrome' | 'warm' | 'cool'; // Visual theme option
  cyberpunkIntensity?: 'normal' | 'high' | 'extreme'; // Controls the intensity of cyberpunk effects
}

// Enhanced color palettes with different themes
const colorPalettes = {
  cyberpunk: [
    { start: '#0AFFFF', end: '#0088FF' },  // Electric cyan to blue
    { start: '#FF10F0', end: '#FF008B' },  // Hot magenta to pink 
    { start: '#FAFF00', end: '#FF9900' },  // Neon yellow to orange
    { start: '#39FF14', end: '#00FF88' },  // Toxic green to teal
    { start: '#FE53BB', end: '#9900FF' },  // Electric pink to purple
    { start: '#00FFA3', end: '#00C2FF' },  // Neon mint to blue
    { start: '#FF2A6D', end: '#D300C5' },  // Red to violet
    { start: '#01FFC3', end: '#01FFFF' },  // Aqua green to cyan
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
const DEFAULT_MAX_CONNECTIONS = 21;
const DEFAULT_CURVE_STEPS = 21;
const DEFAULT_ANIMATION_INTERVAL = 40; // Faster animation speed for cyberpunk feel

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
  const segmentCount = 6; // More segments for more detailed gradient transition
  
  for (let i = 0; i < segmentCount; i++) {
    const startIdx = Math.floor(i * (positions.length - 1) / segmentCount);
    const endIdx = Math.floor((i + 1) * (positions.length - 1) / segmentCount);
    
    if (endIdx > startIdx) {
      // Calculate this segment's animation phase with offset
      const segmentPhase = (animationPhase + i * 15) % 100;
      
      // Flowing animation effect with improved cyberpunk wave pattern
      const flowPosition = segmentPhase / 100;
      const flowEffect = Math.sin(Math.PI * (flowPosition + i/segmentCount) * 2);
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
      
      // Add slight color variation for cyberpunk glitch effect
      const glitchEffect = (Math.sin(pulsePhase / 8 + i) > 0.92) 
        ? Math.floor(Math.random() * 20) - 10 : 0;
      
      const segmentColor = `rgb(${Math.max(0, Math.min(255, r + glitchEffect))}, 
                               ${Math.max(0, Math.min(255, g + glitchEffect))}, 
                               ${Math.max(0, Math.min(255, b + glitchEffect))})`;
      
      segments.push(
        <Polyline
          key={`connection-${index}-segment-${i}`}
          positions={positions.slice(startIdx, endIdx + 1)}
          pathOptions={{
            color: segmentColor,
            opacity: segmentOpacity,
            weight: 2.5 * intensity * (1 + (i % 2 === 0 ? 0.2 : -0.1)), // Vary line thickness for digital look
            lineJoin: 'round',
            lineCap: 'round',
            className: 'connection-line-glow',
            // More sophisticated dash pattern for cyberpunk circuit-like appearance
            dashArray: (i % 2 === 0) ? undefined : 
                     `${3 + Math.sin(pulsePhase/10) * 2}, ${4 + Math.cos(animationPhase/15) * 2}`,
          }}
        />
      );
    }
  }
  
  // Add a more pronounced glow effect for cyberpunk style
  const glowLine = (
    <Polyline
      key={`connection-${index}-glow`}
      positions={positions}
      pathOptions={{
        color: colorPair.start,
        opacity: baseOpacity * 0.5,
        weight: 12 * intensity,
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
  colorScheme = 'cyberpunk',
  cyberpunkIntensity = 'normal'
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
  
  // Animation effect with modified timing for cyberpunk style
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
    
    // Calculate intervals based on animation speed for cyberpunk style
    const traceInterval = Math.max(20, Math.round(DEFAULT_ANIMATION_INTERVAL / animationSpeed));
    const pulseInterval = Math.max(50, Math.round(DEFAULT_ANIMATION_INTERVAL * 2 / animationSpeed));
    
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
      {/* Add cyberpunk overlay effect when using cyberpunk theme */}
      {colorScheme === 'cyberpunk' && (
        <CyberpunkOverlay 
          connections={limitedConnections} 
          pulsePhase={pulsePhase} 
          intensity={cyberpunkIntensity}
        />
      )}
      
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
      
      {/* Add CSS for cyberpunk effects */}
      <style jsx global>{`
        .leaflet-pane path.connection-line-glow {
          filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.8));
          transition: opacity 0.2s ease, filter 0.3s ease;
        }
        .leaflet-pane path.connection-line-base {
          filter: blur(6px);
          transition: opacity 0.3s ease-in-out, filter 0.3s ease-in-out;
        }
        
        /* Create more intense pulsing effect for the cyberpunk glow */
        @keyframes pulse-glow {
          0% { filter: drop-shadow(0 0 3px rgba(10, 255, 255, 0.6)); }
          25% { filter: drop-shadow(0 0 5px rgba(255, 16, 240, 0.7)); }
          50% { filter: drop-shadow(0 0 8px rgba(57, 255, 20, 0.9)); }
          75% { filter: drop-shadow(0 0 5px rgba(255, 42, 109, 0.7)); }
          100% { filter: drop-shadow(0 0 3px rgba(10, 255, 255, 0.6)); }
        }
        
        /* Add a digital data flow effect */
        @keyframes data-flow {
          0% { stroke-dashoffset: 100; opacity: 0.7; }
          50% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.7; }
        }
        
        /* Add a glitch effect animation */
        @keyframes glitch {
          0% { opacity: 1; transform: translate(0); }
          1% { opacity: 0.8; transform: translate(2px, 0); }
          2% { opacity: 1; transform: translate(0); }
          9% { opacity: 1; transform: translate(0); }
          10% { opacity: 0.9; transform: translate(-2px, 0); }
          11% { opacity: 1; transform: translate(0); }
          100% { opacity: 1; transform: translate(0); }
        }
        
        /* Matrix-style rain animation */
        @keyframes matrix-rain {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 0% 100%;
          }
        }
        
        /* Enhanced pulse effect for connections */
        @keyframes enhanced-pulse {
          0% { opacity: 0.6; stroke-width: 2px; }
          50% { opacity: 1; stroke-width: 4px; }
          100% { opacity: 0.6; stroke-width: 2px; }
        }
        
        /* Add a digital noise effect to enhance the cyberpunk feel */
        @keyframes digital-noise {
          0%, 100% { opacity: 1; }
          98% { opacity: 1; }
          99% { opacity: 0.8; }
        }
        
        .leaflet-pane path.connection-line-glow {
          animation: digital-noise 0.5s step-end infinite, glitch 15s step-end infinite;
          mix-blend-mode: screen;
        }
        
        /* Apply data flow animation to specific segments */
        .leaflet-pane path.connection-line-glow:nth-child(even) {
          stroke-dasharray: 5, 5;
          animation: data-flow 2s linear infinite, digital-noise 0.5s step-end infinite;
        }
        
        .leaflet-pane path.connection-line-glow:nth-child(3n) {
          animation: enhanced-pulse 4s infinite;
        }
        
        .leaflet-pane path.connection-line-glow:hover {
          animation: pulse-glow 1.2s infinite;
          opacity: 1 !important;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.9));
        }
        
        /* Apply cyberpunk text effect to any popups */
        .leaflet-popup-content {
          text-shadow: 0 0 5px #0ff;
          font-family: "Courier New", monospace;
        }
        
        /* Enhanced cyberpunk shadows for all Leaflet elements */
        .leaflet-container {
          --neon-shadow-color: rgba(0, 255, 255, 0.3);
        }
        
        .leaflet-marker-icon {
          filter: drop-shadow(0 0 10px var(--neon-shadow-color));
        }
        
        .leaflet-popup {
          filter: drop-shadow(0 0 15px rgba(255, 0, 255, 0.3));
        }
        
        /* Popup pane styling for cyberpunk effects */
        .leaflet-popup-pane {
          mix-blend-mode: screen;
        }
      `}</style>
    </>
  );
} 