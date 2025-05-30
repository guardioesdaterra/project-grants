"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { allProjectsData } from "@/lib/project-data";
import { ProjectData } from "@/lib/types";
import { MapControls } from "@/components/map-controls";

// Dynamic import with no SSR
const ClientGlobeWrapper = dynamic(
  () => import("@/components/client-globe-wrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white text-xl">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse mr-4"></div>
        Loading Globe...
      </div>
    ),
  }
);

export function ClientGlobeLoader() {
  const [isClient, setIsClient] = useState(false);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [showHexGrid, setShowHexGrid] = useState(true);
  
  // Garantir que o componente só renderize no cliente
  useEffect(() => {
    setIsClient(true);
    
    // Processar dados do projeto
    try {
      const validProjects = allProjectsData.filter(project => 
        project && 
        typeof project.latitude === 'number' && 
        typeof project.longitude === 'number'
      );
      
      console.log(`Globe page: Found ${validProjects.length} valid projects out of ${allProjectsData.length}`);
      setProjects(validProjects);
    } catch (error) {
      console.error("Error processing project data:", error);
    }
  }, []);
  
  // Toggle hex grid visibility
  const handleToggleHexGrid = () => {
    setShowHexGrid(prev => !prev);
  };
  
  if (!isClient) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white text-xl">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse mr-4"></div>
        Initializing Globe...
      </div>
    );
  }
  
  return (
    <>
      <ClientGlobeWrapper 
        projects={projects}
        showHexGrid={showHexGrid}
      />
      
      <MapControls 
        isGlobeView={true}
        showHexGrid={showHexGrid}
        onToggleHexGrid={handleToggleHexGrid}
      />
    </>
  );
} 