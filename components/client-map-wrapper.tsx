"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ProjectData } from '@/lib/types'; // Assuming ProjectData is in lib/types.ts

// Dynamically import MapComponent with error handling
const MapComponentWithNoSSR = dynamic(
  () => import('@/components/map-component')
    .then(mod => mod.MapComponent)
    .catch(err => {
      console.error("Error loading MapComponent:", err);
      // Return a simple fallback component in case of error
      return () => (
        <div className="w-full h-screen bg-black flex items-center justify-center text-white text-xl flex-col">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-red-500 to-orange-600 animate-pulse mb-4"></div>
          <p>Error loading map. Please refresh the page.</p>
        </div>
      );
    }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white text-xl">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse mr-4"></div>
        Loading Map...
      </div>
    ),
  }
);

interface ClientMapWrapperProps {
  projects: ProjectData[];
}

export default function ClientMapWrapper({ projects }: ClientMapWrapperProps) {
  const [isClientReady, setIsClientReady] = useState(false);

  // Only render map when client is fully ready
  useEffect(() => {
    // Small delay to ensure browser is ready
    const timer = setTimeout(() => {
      setIsClientReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isClientReady) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white text-xl">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse mr-4"></div>
        Preparing Map...
      </div>
    );
  }

  return <MapComponentWithNoSSR projects={projects} />;
} 