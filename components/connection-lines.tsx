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
const MAX_CONNECTIONS = 20; // Maximum connections to render
const CURVE_STEPS = 8;     // Lower for better performance
const ANIMATION_INTERVAL = 100; // Slower animation for better performance

// Function to generate a curved path between two points
function generateCurvedPath(from: [number, number], to: [number, number]): LatLngExpression[] {
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
    const curveFactor = Math.min(distance * 0.3, 20); // Limit curve size
    
    // Add displacement to midpoint to create control point
    const controlPointX = midX + normalizedPerpX * curveFactor;
    const controlPointY = midY + normalizedPerpY * curveFactor;
    
    // Generate path points (with reduced number of steps for performance)
    const path: LatLngExpression[] = [];
    const steps = CURVE_STEPS;
    
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

export function ConnectionLines({ connections }: ConnectionLinesProps) {
  // If there are no connections, render nothing.
  if (!connections || connections.length === 0) {
    return null;
  }

  const [animationPhase, setAnimationPhase] = useState(0);
  const animationIntervalRef = useRef<number | null>(null);
  
  // Limit the number of connections to render for performance
  const limitedConnections = useMemo(() => {
    // Filter out invalid connections first
    const validConnections = connections.filter(
      conn => Array.isArray(conn.from) && Array.isArray(conn.to) && 
              conn.from.length === 2 && conn.to.length === 2 &&
              !isNaN(conn.from[0]) && !isNaN(conn.from[1]) && 
              !isNaN(conn.to[0]) && !isNaN(conn.to[1])
    );
    
    // Return at most MAX_CONNECTIONS
    return validConnections.slice(0, MAX_CONNECTIONS);
  }, [connections]);
  
  // Animation effect for pulsing/tracing with improved cleanup
  useEffect(() => {
    // Clear any existing intervals first
    if (animationIntervalRef.current !== null) {
      window.clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }
    
    // Set new interval with slower timing for better performance
    animationIntervalRef.current = window.setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100);
    }, ANIMATION_INTERVAL);
    
    // Cleanup function
    return () => {
      if (animationIntervalRef.current !== null) {
        window.clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, []);
  
  // Pre-calculate curved paths for performance
  const connectionPaths = useMemo(() => {
    return limitedConnections.map(connection => 
      generateCurvedPath(connection.from, connection.to)
    );
  }, [limitedConnections]);
  
  return (
    <>
      {limitedConnections.map((connection, index) => {
        // Get the pre-calculated path
        const positions = connectionPaths[index];
        if (!positions || positions.length < 2) return null;
        
        // Calculate opacity and gradient based on animation phase
        const baseOpacity = 0.6;
        const pulseOpacity = 0.2 * Math.sin(animationPhase / 15) + baseOpacity;
        
        // Calculate intensity based on beneficiaries if available
        const beneficiaries = connection.from_project_indirect_beneficiaries || 0;
        const intensity = beneficiaries > 1000 ? 1 : 
                          beneficiaries > 500 ? 0.8 : 
                          beneficiaries > 100 ? 0.6 : 0.4;
        
        // Select a color for the line based on its index
        const color = lineColors[index % lineColors.length];
        
        // Create segments with a reduced number for better performance
        const segments = [];
        const segmentCount = 3; // Just 3 segments per connection for performance
        
        for (let i = 0; i < segmentCount; i++) {
          const startIdx = Math.floor(i * (positions.length - 1) / segmentCount);
          const endIdx = Math.floor((i + 1) * (positions.length - 1) / segmentCount);
          
          if (endIdx > startIdx) {
            // Calculate this segment's opacity based on animation phase
            const segmentPhase = (animationPhase + i * 33) % 100;
            const segmentOpacity = 0.2 * Math.sin(segmentPhase / 15) + baseOpacity;
            
            segments.push(
              <Polyline
                key={`connection-${index}-segment-${i}`}
                positions={positions.slice(startIdx, endIdx + 1)}
                pathOptions={{
                  color: color,
                  opacity: segmentOpacity * intensity,
                  weight: 2 * intensity,
                  lineJoin: 'round',
                  dashArray: i % 2 === 0 ? undefined : '3, 6', // Alternate between solid and dashed
                }}
              />
            );
          }
        }
        
        // Return segments with a proper key for the fragment
        return <React.Fragment key={`connection-group-${index}`}>{segments}</React.Fragment>;
      })}
    </>
  );
} 