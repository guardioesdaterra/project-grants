"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ProjectData } from '@/lib/types';
import Link from 'next/link';

// Improved error fallback component
const GlobeErrorFallback = () => (
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

// Improved loading component
const GlobeLoadingComponent = () => (
  <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-white">
    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse mb-6"></div>
    <h2 className="text-xl font-bold mb-2">Loading Globe Visualization</h2>
    <div className="flex items-center justify-center">
      <div className="h-1.5 w-48 bg-black border border-cyan-500/50 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 animate-progress"></div>
      </div>
    </div>
    <p className="text-gray-300 mt-4 text-sm">Please wait while we prepare the 3D globe...</p>
  </div>
);

// Dynamically import GlobeComponent with improved error handling
const GlobeComponentWithNoSSR = dynamic(
  () => import('@/components/globe-component')
    .then(mod => mod.GlobeComponent)
    .catch(err => {
      console.error("Error loading GlobeComponent:", err);
      return GlobeErrorFallback;
    }),
  {
    ssr: false,
    loading: () => <GlobeLoadingComponent />
  }
);

interface ClientGlobeWrapperProps {
  projects: ProjectData[];
  showHexGrid?: boolean;
  onToggleHexGrid?: () => void;
}

export default function ClientGlobeWrapper({ 
  projects, 
  showHexGrid = true,
  onToggleHexGrid 
}: ClientGlobeWrapperProps) {
  const [isClientReady, setIsClientReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  // Internal state for hex grid if no external control is provided
  const [internalShowHexGrid, setInternalShowHexGrid] = useState(true);
  
  // Use external control if provided, otherwise use internal state
  const hexGridVisible = showHexGrid !== undefined ? showHexGrid : internalShowHexGrid;
  const toggleHexGrid = onToggleHexGrid || (() => setInternalShowHexGrid(!internalShowHexGrid));

  // Only render globe when client is fully ready
  useEffect(() => {
    try {
      // Small delay to ensure browser is ready for 3D rendering
      const timer = setTimeout(() => {
        setIsClientReady(true);
      }, 200);
      
      // Check for WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        console.error("WebGL not supported");
        setHasError(true);
      }
      
      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Error initializing globe:", err);
      setHasError(true);
    }
  }, []);

  if (hasError) {
    return <GlobeErrorFallback />;
  }

  if (!isClientReady) {
    return <GlobeLoadingComponent />;
  }

  return (
    <GlobeComponentWithNoSSR 
      projects={projects} 
      showHexGrid={hexGridVisible}
    />
  );
} 
