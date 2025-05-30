"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Layers, Grid, X, Maximize, Minimize, Search, ArrowRight, MapPin, List, Globe, Palette } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"
import L from "leaflet"
import { ProjectData } from "@/lib/types"
import { allProjectsData } from "@/lib/project-data"
import Link from "next/link"

// Define color constants
const COLOR_BLUE = "#3b82f6";
const COLOR_GREEN = "#22c55e";
const COLOR_YELLOW = "#eab308";
const COLOR_RED = "#ef4444";
const COLOR_DEFAULT = "#a855f7";

interface LegendItem {
  color: string;
  label: string;
  description: string;
}

const legendItems: LegendItem[] = [
  {
    color: COLOR_BLUE,
    label: "1 - 100",
    description: "Projects with 1 to 100 beneficiaries.",
  },
  {
    color: COLOR_GREEN,
    label: "101 - 500",
    description: "Projects with 101 to 500 beneficiaries.",
  },
  {
    color: COLOR_YELLOW,
    label: "501 - 1000",
    description: "Projects with 501 to 1000 beneficiaries.",
  },
  {
    color: COLOR_RED,
    label: "> 1000",
    description: "Projects with more than 1000 beneficiaries.",
  },
  {
    color: COLOR_DEFAULT,
    label: "0 or N/A",
    description: "Projects with no beneficiaries or data not available.",
  },
];

// Define Props interface
interface MapControlsProps {
  onToggleHexGrid?: () => void;
  showHexGrid?: boolean;
  isGlobeView?: boolean;
}

// Apply Props interface to the component signature
export function MapControls({ onToggleHexGrid, showHexGrid, isGlobeView = false }: MapControlsProps) {
  const [showInfo, setShowInfo] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ProjectData[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [lastUpdatedDate, setLastUpdatedDate] = useState("");
  const [showLegend, setShowLegend] = useState(false);

  // Use ref to prevent unnecessary re-renders in strict mode
  const dateInitializedRef = useRef(false);
  useEffect(() => {
    // Skip in development's first render of strict mode
    if (process.env.NODE_ENV === 'development' && dateInitializedRef.current) {
      return;
    }
    dateInitializedRef.current = true;
    
    // Set this only once
    setLastUpdatedDate(new Date().toLocaleDateString());
  }, []);

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

  // Navigate to a specific location on the map
  const navigateToLocation = (lat: number, lng: number) => {
    try {
      // Find the first Leaflet map instance
      const mapContainer = document.querySelector(".leaflet-container");
      if (!mapContainer) return;
      
      // Try accessing the map through the Leaflet internal structure
      // @ts-expect-error - Leaflet typings are complex, we know this works
      const map = L.DomUtil.getLeafletElement?.(mapContainer) || 
                  // @ts-expect-error - Fallback method to find map instance
                  mapContainer._leaflet_map ||
                  // @ts-expect-error - Another fallback
                  window.leafletMap;
      
      if (map && typeof map.setView === 'function') {
        map.setView([lat, lng], 6, { animate: true });
        // Close the search panel after navigation
        setShowSearch(false);
        setSearchQuery("");
        setShowAllProjects(false);
      } else {
        console.warn("Could not find Leaflet map instance");
      }
    } catch (error) {
      console.error("Error navigating to location:", error);
    }
  }
  
  // Toggle the view of all projects
  const toggleAllProjects = () => {
    setShowAllProjects(!showAllProjects);
    if (!showAllProjects) {
      setSearchQuery("");
    }
  }

  // Toggle the color legend
  const toggleLegend = () => {
    setShowLegend(!showLegend);
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

        {(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 rounded-md bg-black/70 border border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  onClick={() => onToggleHexGrid?.()}
                >
                  {showHexGrid ? <Grid className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isMobile ? "right" : "left"}>
                <p>{showHexGrid ? "Hide Hex Grid" : "Show Hex Grid"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-md bg-black/70 border border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                onClick={toggleLegend}
              >
                <Palette className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isMobile ? "right" : "left"}>
              <p>{showLegend ? "Hide Color Legend" : "Show Color Legend"}</p>
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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {isGlobeView ? (
                <Link href="/">
                  <Button
                    variant="outline"
                    size="default"
                    className="relative flex items-center gap-2 h-10 px-3 rounded-lg bg-gradient-to-r from-indigo-900/90 to-purple-900/90 border-2 border-cyan-400 text-white hover:from-indigo-800 hover:to-purple-800 hover:border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] transform transition-all duration-300 hover:scale-105 w-auto scale-110 animate-pulse-subtle"
                  >
                    <MapPin className="h-5 w-5 text-cyan-300" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
                    </span>
                  </Button>
                </Link>
              ) : (
                <Link href="/globe">
                  <Button
                    variant="outline"
                    size="default"
                    className="relative flex items-center gap-2 h-10 px-3 rounded-lg bg-gradient-to-r from-indigo-900/90 to-purple-900/90 border-2 border-cyan-400 text-white hover:from-indigo-800 hover:to-purple-800 hover:border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] transform transition-all duration-300 hover:scale-105 w-auto scale-110 animate-pulse-subtle"
                  >
                    <Globe className="h-5 w-5 text-cyan-300" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
                    </span>
                  </Button>
                </Link>
              )}
            </TooltipTrigger>
            <TooltipContent side={isMobile ? "right" : "left"} className="bg-purple-900/90 border-cyan-400 text-cyan-100">
              <p className="font-medium">{isGlobeView ? "Switch to Interactive 2D Map" : "Experience 3D Globe View"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Color Legend Panel */}
      {showLegend && (
        <div className="fixed top-32 right-16 z-40 bg-gray-900 text-white p-4 rounded-lg border-2 border-purple-400 shadow-xl w-64">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-center text-pink-400">
              COLOR LEGEND
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white"
              onClick={() => setShowLegend(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {legendItems.map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-2 bg-gray-800 rounded"
              >
                <div
                  className="w-4 h-4 rounded border border-gray-600"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">
                  {item.label} Beneficiaries
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
                        {result.indirect_beneficiaries.toLocaleString()} indirect benef.
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
                <p className="text-xs text-gray-400 text-center">Enter search term or click &quot;List&quot; to view all projects</p>
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
            <p>• {isGlobeView ? "Switch to 2D Map" : "Switch to 3D Globe"} view using the icon</p>
            <p>• Search for projects by name or location</p>
            <p>• View all projects using the list button in search</p>
            <p>• View the color legend to understand beneficiary markers</p>
          </div>
          <div className="mt-3 pt-3 border-t border-cyan-900/30 text-xs text-gray-400">
            <p>Project Grants v1.0</p>
            <p>Last updated: {lastUpdatedDate}</p>
          </div>
        </div>
      )}
    </>
  )
}
