"use client";

import dynamic from 'next/dynamic';
import { ProjectData } from '@/lib/types'; // Assuming ProjectData is in lib/types.ts

// Dynamically import MapComponent
const MapComponentWithNoSSR = dynamic(
  () => import('@/components/map-component').then(mod => mod.MapComponent),
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
  return <MapComponentWithNoSSR projects={projects} />;
} 