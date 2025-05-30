"use client"

import { useState } from "react"
import ClientGlobeWrapper from "@/components/client-globe-wrapper"
import { allProjectsData } from "@/lib/project-data"
import { MapControls } from "@/components/map-controls"

export default function GlobePage() {
  // State for hex grid toggle
  const [showHexGrid, setShowHexGrid] = useState(true)
  
  // Toggle function for hex grid
  const toggleHexGrid = () => setShowHexGrid(!showHexGrid)
  
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <div className="flex-1 relative">
        <ClientGlobeWrapper 
          projects={allProjectsData} 
          showHexGrid={showHexGrid}
          onToggleHexGrid={toggleHexGrid}
        />
        <MapControls 
          isGlobeView={true}
          showHexGrid={showHexGrid}
          onToggleHexGrid={toggleHexGrid}
        />
      </div>
    </main>
  )
} 