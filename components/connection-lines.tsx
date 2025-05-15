"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { Polyline } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import React from 'react';

// This defines the structure of a single connection,
// which consists of 'from' and 'to' coordinates.
interface Connection {
  from: [number, number];
  to: [number, number];
  from_project_indirect_beneficiaries?: number;
}

// This defines the props for the ConnectionLines component.
// It expects an array of Connection objects.
interface ConnectionLinesProps {
  connections: Connection[];
}

// Neon colors for the connection lines.
// The lines will cycle through these colors.
const lineColors = [
  '#00FFFF', // Cyan
  '#FF00FF', // Magenta
  '#39FF14', // Neon Green
  '#FF69B4', // Hot Pink
];

// Performance configuration
const MAX_CONNECTIONS = 25; // Maximum connections to render
const CURVE_STEPS = 10;     // Lower for better performance
const ANIMATION_INTERVAL = 80; // Slower animation for better performance

// Function to generate a curved path between two points
const generateCurvedPath = (from: [number, number], to: [number, number], curveFactor = 0.2): LatLngExpression[] => {
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
  const distance = Math.sqrt(perpX * perpX + perpY * perpY);
  const normalizedPerpX = distance > 0 ? perpX / distance : 0;
  const normalizedPerpY = distance > 0 ? perpY / distance : 0;
  
  // Calculate the distance between points to scale the curve appropriately
  const pointDistance = Math.sqrt(dx * dx + dy * dy);
  const controlPointDisplacement = pointDistance * curveFactor;
  
  // Add displacement to midpoint to create control point
  const controlX = midX + normalizedPerpX * controlPointDisplacement;
  const controlY = midY + normalizedPerpY * controlPointDisplacement;
  
  // Generate path points (with reduced number of steps for performance)
  const points: LatLngExpression[] = [];
  const steps = CURVE_STEPS; // Reduced for better performance
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    
    // Quadratic Bezier curve formula
    const x = Math.pow(1-t, 2) * from[0] + 
              2 * (1-t) * t * controlX + 
              Math.pow(t, 2) * to[0];
    
    const y = Math.pow(1-t, 2) * from[1] + 
              2 * (1-t) * t * controlY + 
              Math.pow(t, 2) * to[1];
    
    // Only add valid coordinates
    if (!isNaN(x) && !isNaN(y)) {
      points.push([x, y]);
    }
  }
  
  // Ensure we have at least 2 points to form a line
  if (points.length < 2) {
    return [from, to]; // Fall back to a straight line
  }
  
  return points;
};

export function ConnectionLines({ connections }: ConnectionLinesProps) {
  // If there are no connections, render nothing.
  if (!connections || connections.length === 0) {
    return null;
  }

  const [animationPhase, setAnimationPhase] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Limit the number of connections to render for performance
  const limitedConnections = useMemo(() => {
    // Filter out invalid connections first
    const validConnections = connections.filter(conn => 
      conn && conn.from && conn.to && 
      !conn.from.some(isNaN) && 
      !conn.to.some(isNaN)
    );
    
    // Return at most MAX_CONNECTIONS
    return validConnections.slice(0, MAX_CONNECTIONS);
  }, [connections]);
  
  // Animation effect for pulsing/tracing with improved cleanup
  useEffect(() => {
    // Clear any existing intervals first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set new interval with slower timing for better performance
    intervalRef.current = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100);
    }, ANIMATION_INTERVAL);
    
    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Pre-calculate curved paths for performance
  const pathsCache = useMemo(() => {
    return limitedConnections.map(connection => 
      generateCurvedPath(connection.from, connection.to)
    );
  }, [limitedConnections]);

  return (
    <>
      {limitedConnections.map((connection, index) => {
        // Get the pre-calculated path
        const positions = pathsCache[index];
        if (!positions || positions.length < 2) return null;
        
        // Calculate opacity and gradient based on animation phase
        const baseOpacity = 0.1;
        const pulseOpacity = 0.3;
        const currentPhase = (animationPhase + index * 10) % 100;
        
        // Calculate intensity based on beneficiaries if available
        const intensity = connection.from_project_indirect_beneficiaries 
          ? Math.min(Math.max(connection.from_project_indirect_beneficiaries / 5000, 0.5), 3)
          : 1;
        
        // Select a color for the line based on its index
        const color = lineColors[index % lineColors.length];
        
        // Create segments with a reduced number for better performance
        // Only create 3 segments instead of one per position
        const segments = [];
        const segmentCount = 3; // Just 3 segments per connection for performance
        const positionsPerSegment = Math.ceil(positions.length / segmentCount);
        
        for (let i = 0; i < segmentCount; i++) {
          const startIdx = i * positionsPerSegment;
          const endIdx = Math.min(startIdx + positionsPerSegment, positions.length - 1);
          
          if (startIdx >= positions.length - 1 || endIdx <= startIdx) continue;
          
          const segmentPositions = positions.slice(startIdx, endIdx + 1);
          if (segmentPositions.length < 2) continue;
          
          // Calculate this segment's opacity based on animation phase
          const distanceFromPulse = Math.abs(i - (currentPhase / 33));
          const segmentOpacity = baseOpacity + (pulseOpacity * Math.max(0, 1 - distanceFromPulse));
          
          segments.push(
            <Polyline
              key={`connection-${index}-segment-${i}`}
              positions={segmentPositions}
              pathOptions={{
                color: color,
                weight: 2 * intensity, // Thickness based on intensity
                opacity: segmentOpacity,
                dashArray: i % 2 === 0 ? undefined : '3, 6', // Alternate between solid and dashed
              }}
            />
          );
        }
        
        // Return segments with a proper key for the fragment
        return <React.Fragment key={`connection-${index}`}>{segments}</React.Fragment>;
      })}
    </>
  );
} 