"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Layers, Grid, Info, X, Maximize, Minimize, Compass, Search, ArrowRight, MapPin, List } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"
import L from "leaflet"
import { ProjectData } from "@/lib/types"
import { allProjectsData } from "@/lib/project-data"

// Define Props interface
interface MapControlsProps {
  onToggleHexGrid: () => void;
  showHexGrid: boolean;
}

// Apply Props interface to the component signature
export function MapControls({ onToggleHexGrid, showHexGrid }: MapControlsProps) {
  const [showInfo, setShowInfo] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ProjectData[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Focus search input when search panel opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  // Search logic
  useEffect(() => {
    if (searchQuery.length > 1) {
      const query = searchQuery.toLowerCase().trim()
      const results = allProjectsData.filter(project => 
        project.project_title.toLowerCase().includes(query) || 
        project.country_province.toLowerCase().includes(query)
      )
      setSearchResults(results)
      setShowAllProjects(false)
    } else if (showAllProjects) {
      // When showing all projects, sort them alphabetically by title
      setSearchResults([...allProjectsData].sort((a, b) => 
        a.project_title.localeCompare(b.project_title)
      ))
    } else {
      setSearchResults([])
    }
  }, [searchQuery, showAllProjects])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setFullscreen(true)
        })
        .catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
    } else {
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => {
            setFullscreen(false)
          })
          .catch((err) => {
            console.error(`Error attempting to exit fullscreen: ${err.message}`)
          })
      }
    }
  }

  const resetMapView = () => {
    // Type assertion to handle __leaflet_instance_
    const map = (document.querySelector(".leaflet-container") as any)?.__leaflet_instance_ as L.Map;
    if (map) {
      map.setView([20, 0], isMobile ? 1.5 : 2.5, { animate: true })
    }
  }

  // Navigate to a specific location on the map
  const navigateToLocation = (lat: number, lng: number) => {
    const map = (document.querySelector(".leaflet-container") as any)?.__leaflet_instance_ as L.Map;
    if (map) {
      map.setView([lat, lng], 6, { animate: true });
      // Close the search panel after navigation
      setShowSearch(false);
      setSearchQuery("");
      setShowAllProjects(false);
    }
  }
  
  // Toggle the view of all projects
  const toggleAllProjects = () => {
    setShowAllProjects(!showAllProjects);
    if (!showAllProjects) {
      setSearchQuery("");
    }
  }

  return (
    <>
      <div className={`absolute ${isMobile ? "top-20 left-4" : "top-20 right-4"} z-[500] flex flex-col gap-2`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-md bg-black/70 border border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isMobile ? "right" : "left"}>
              <p>Search Map</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-md bg-black/70 border border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                onClick={() => onToggleHexGrid()}
              >
                {showHexGrid ? <Grid className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isMobile ? "right" : "left"}>
              <p>{showHexGrid ? "Hide Hex Grid" : "Show Hex Grid"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-md bg-black/70 border border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                onClick={toggleFullscreen}
              >
                {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isMobile ? "right" : "left"}>
              <p>{fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>


      </div>

      {/* Search Panel */}
      {showSearch && (
        <div 
          className={`absolute ${isMobile ? "top-36 left-4 right-4" : "top-20 right-16 w-80"} z-[500] bg-black/90 backdrop-blur-md p-4 rounded-md border border-cyan-900/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]`}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-cyan-400">Search Projects</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white"
              onClick={() => {
                setShowSearch(false)
                setSearchQuery("")
                setShowAllProjects(false)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-900/50 border-cyan-900/50 focus:border-cyan-500 text-white pr-9"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <Button
              variant="outline"
              size="icon"
              className={`h-9 w-9 border-cyan-900/50 ${showAllProjects ? 'bg-cyan-900/30 text-cyan-300' : 'text-cyan-400 bg-black/70'} hover:bg-cyan-950/30 hover:text-cyan-300`}
              onClick={toggleAllProjects}
              title="Show All Projects"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-0.5 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-900 pr-1">
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <div 
                  key={`search-result-${index}`}
                  className="group flex items-start p-2 hover:bg-cyan-950/20 rounded cursor-pointer transition-colors duration-150"
                  onClick={() => navigateToLocation(result.latitude, result.longitude)}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-cyan-400 truncate">{result.project_title}</h4>
                    <div className="flex justify-between">
                      <p className="text-xs text-gray-400 flex items-center">
                        <MapPin className="h-3 w-3 inline mr-1 flex-shrink-0" /> 
                        {result.country_province}
                      </p>
                      <p className="text-xs text-gray-500">
                        {result.direct_beneficiaries.toLocaleString()} beneficiaries
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0 mt-1" />
                </div>
              ))
            ) : searchQuery.length > 1 ? (
              <div className="text-xs text-gray-400 text-center py-2">No results found</div>
            ) : !showAllProjects ? (
              <div className="flex flex-col space-y-2 items-center justify-center py-4">
                <Search className="h-8 w-8 text-cyan-900/50" />
                <p className="text-xs text-gray-400 text-center">Enter search term or click "List" to view all projects</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/30"
                  onClick={toggleAllProjects}
                >
                  <List className="h-3 w-3 mr-1" />
                  Show All Projects
                </Button>
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center py-2">Loading projects...</div>
            )}
          </div>
          
          <div className="mt-3 pt-2 border-t border-cyan-900/30 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {showAllProjects ? "All Projects" : "Search Results"}: {searchResults.length}
            </p>
            {searchResults.length > 0 && (
              <p className="text-xs text-cyan-400">Click to navigate</p>
            )}
          </div>
        </div>
      )}

      {showInfo && (
        <div
          className={`absolute ${isMobile ? "bottom-24 left-4 right-4" : "bottom-24 right-4 w-64"} z-[500] bg-black/90 backdrop-blur-md p-4 rounded-md border border-cyan-900/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]`}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-cyan-400">Map Information</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white"
              onClick={() => setShowInfo(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2 text-xs text-gray-300">
            <p>• Click on markers to view activity details</p>
            <p>• Glowing lines represent connections between initiatives</p>
            <p>• Use zoom controls to navigate the map</p>
            <p>• Toggle the hex grid for different visualization</p>
            <p>• Search for projects by name or location</p>
            <p>• View all projects using the list button in search</p>
            <p>• Tap the compass to reset the map view</p>
          </div>
          <div className="mt-3 pt-3 border-t border-cyan-900/30 text-xs text-gray-400">
            <p>EcoTrack Global v1.0</p>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </>
  )
}
