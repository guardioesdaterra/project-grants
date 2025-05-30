"use client"

import { useEffect, useState, ReactNode } from "react"

interface ViewportFitProps {
  children: ReactNode
  className?: string
}

/**
 * ViewportFit component ensures content always fits the screen on mobile devices
 * It dynamically adjusts sizing based on the real viewport height
 */
export function ViewportFit({ children, className = "" }: ViewportFitProps) {
  const [viewportHeight, setViewportHeight] = useState<number | undefined>(undefined)
  
  useEffect(() => {
    // Set initial viewport height
    setViewportHeight(window.innerHeight)
    
    // Update viewport height on resize and orientation change
    const handleResize = () => {
      setViewportHeight(window.innerHeight)
    }
    
    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)
    
    // Handle iOS safari address bar showing/hiding
    let timeout: NodeJS.Timeout
    const checkHeight = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        const newHeight = window.innerHeight
        if (newHeight !== viewportHeight) {
          setViewportHeight(newHeight)
        }
      }, 100)
    }
    
    window.addEventListener("scroll", checkHeight)
    
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
      window.removeEventListener("scroll", checkHeight)
      clearTimeout(timeout)
    }
  }, [viewportHeight])
  
  // Only render when we have a viewport height
  if (viewportHeight === undefined) {
    return null
  }
  
  return (
    <div 
      className={`mobile-fill-screen has-safe-area ${className}`}
      style={{ 
        height: `${viewportHeight}px`,
        maxHeight: `${viewportHeight}px`,
        display: "flex", 
        flexDirection: "column" 
      }}
    >
      {children}
    </div>
  )
}

/**
 * Use this component to ensure map elements fit properly on mobile screens
 */
export function MapViewportFit({ children, className = "" }: ViewportFitProps) {
  return (
    <ViewportFit className={`relative overflow-hidden ${className}`}>
      {children}
    </ViewportFit>
  )
} 