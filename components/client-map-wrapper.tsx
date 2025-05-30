"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ProjectData } from '@/lib/types';
import { allProjectsData } from '@/lib/project-data';

// Dynamically import MapComponent with error handling
const MapComponentWithNoSSR = dynamic(
  () => import('@/components/map-component')
    .then(mod => mod.MapComponent)
    .catch(err => {
      console.error("Error loading MapComponent:", err);
      // Return a simple fallback component in case of error
      const ErrorComponent = () => (
        <div className="w-full h-screen bg-black flex items-center justify-center text-white text-xl flex-col">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-red-500 to-orange-600 animate-pulse mb-4"></div>
          <p>Error loading map. Please refresh the page.</p>
        </div>
      );
      ErrorComponent.displayName = "MapErrorFallback";
      return ErrorComponent;
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
  projects?: ProjectData[];
}

function ClientMapWrapper({ projects }: ClientMapWrapperProps) {
  const [isClientReady, setIsClientReady] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const projectsData = projects || allProjectsData;

  // Only render map when client is fully ready
  useEffect(() => {
    // Small delay to ensure browser is ready
    const timer = setTimeout(() => {
      setIsClientReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Fix Leaflet default icon missing in production build
  useEffect(() => {
    const setupLeaflet = async () => {
      try {
        // Importar Leaflet dinamicamente apenas no cliente
        const L = (await import('leaflet')).default;
        
        // @ts-expect-error - Known issue with Leaflet typings
        delete L.Icon.Default.prototype._getIconUrl;
        
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/marker-icon-2x.png',
          iconUrl: '/marker-icon.png',
          shadowUrl: '/marker-shadow.png',
        });
        
        setLeafletReady(true);
      } catch (error) {
        console.error("Error setting up Leaflet icons:", error);
      }
    };
    
    setupLeaflet();
  }, []);

  if (!isClientReady || !leafletReady) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white text-xl">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse mr-4"></div>
        Preparing Map...
      </div>
    );
  }

  return <MapComponentWithNoSSR projects={projectsData} />;
}

ClientMapWrapper.displayName = "ClientMapWrapper";
export default ClientMapWrapper; 