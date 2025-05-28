"use client"

import { useEffect, useRef, useCallback } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

// Define interface for hex vertex
interface HexVertex {
  x: number;
  y: number;
}

export function HexGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const initializedRef = useRef(false)
  const strictModeFixRef = useRef(false)
  const retryAttemptsRef = useRef(0)

  // Create animation function outside useEffect to avoid recreating it
  const createHexGrid = useCallback(() => {
    console.log("HexGrid: Attempting to create hex grid");
    
    // Skip in development's first render of strict mode
    if (process.env.NODE_ENV === 'development' && !strictModeFixRef.current) {
      strictModeFixRef.current = true;
      console.log("HexGrid: Skipping strict mode first render");
      return () => {};
    }
    
    // Early exit if already initialized
    if (initializedRef.current) {
      console.log("HexGrid: Already initialized, skipping");
      return () => {}
    }
    
    // Force cleanup of any existing canvas with our class
    const existingCanvas = document.querySelector('.hex-grid-canvas');
    if (existingCanvas && existingCanvas.parentNode) {
      console.log("HexGrid: Removing existing canvas");
      existingCanvas.parentNode.removeChild(existingCanvas);
    }
    
    // Create canvas
    const canvas = document.createElement("canvas")
    canvas.setAttribute('id', 'hex-grid-canvas'); // Add ID for easier debugging
    canvas.setAttribute('data-created', new Date().toISOString()); // Add timestamp for tracking
    canvas.className = 'hex-grid-canvas'; // Add class for CSS targeting
    canvas.style.position = "absolute"
    canvas.style.top = "0"
    canvas.style.left = "0"
    canvas.style.right = "0"
    canvas.style.bottom = "0"
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.pointerEvents = "none"
    canvas.style.zIndex = "450" // Place between vignette and other elements
    canvas.style.opacity = "1"
    canvas.style.visibility = "visible"
    canvas.style.display = "block"
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Try different containers in order of preference
    const containers = [
      document.querySelector('.leaflet-overlay-pane'),
      document.querySelector('.leaflet-map-pane'),
      document.querySelector('.leaflet-container'),
      document.body
    ];
    
    // Find first available container
    let container = null;
    for (const potential of containers) {
      if (potential) {
        container = potential;
        console.log(`HexGrid: Found container ${potential.className}`);
        break;
      }
    }
    
    console.log("HexGrid: Container found:", !!container);
    
    // If no container found, append directly to body as fallback
    if (!container) {
      console.log("HexGrid: No specific container found, using document.body");
      container = document.body;
    }
    
    // Add canvas to container
    container.appendChild(canvas)
    console.log("HexGrid: Canvas appended to container:", container.className || 'body');
    
    // Store canvas reference and update state
    canvasRef.current = canvas
    initializedRef.current = true

    // Force layout calculation and show in DOM
    canvas.getBoundingClientRect();
    
    // Force re-flow to ensure it's in the DOM
    void canvas.offsetHeight;

    // Get rendering context
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) {
      console.log("HexGrid: Failed to get canvas context");
      if (container && canvas.parentNode === container) {
        container.removeChild(canvas)
        initializedRef.current = false
      }
      return () => {}
    }

    // Add a test rectangle to verify drawing works
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(0, 0, 50, 50);
    console.log("HexGrid: Drew test rectangle");

    // Make hex grid more visible on desktop
    const hexSize = isMobile ? 35 : 50
    const hexHeight = hexSize * Math.sqrt(3)
    const hexWidth = hexSize * 2
    const hexVerticalOffset = hexHeight * 0.75
    const hexHorizontalOffset = hexWidth * 0.5

    // Calculate grid dimensions
    const columns = Math.ceil(window.innerWidth / hexHorizontalOffset) + 1
    const rows = Math.ceil(window.innerHeight / hexVerticalOffset) + 1

    // Precompute hex vertices to avoid recalculation during animation
    const hexVertices: HexVertex[] = []
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i
      hexVertices.push({
        x: hexSize * Math.cos(angle),
        y: hexSize * Math.sin(angle)
      })
    }

    // Frame rate control
    let time = 0
    let lastFrameTime = 0
    // Optimized frame rate for different devices
    const targetFPS = isMobile ? 15 : 30
    const frameInterval = 1000 / targetFPS
    let frameSkipCounter = 0
    const frameSkipThreshold = isMobile ? 3 : 1 // Skip more frames on mobile

    // Keep track of window size
    let currentWidth = window.innerWidth
    let currentHeight = window.innerHeight

    // Throttled resize handler
    let resizeTimeout: number | null = null
    const handleResize = () => {
      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout)
        resizeTimeout = null
      }
      
      resizeTimeout = window.setTimeout(() => {
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
          canvas.width = window.innerWidth
          canvas.height = window.innerHeight
          currentWidth = window.innerWidth
          currentHeight = window.innerHeight
          console.log("HexGrid: Canvas resized", canvas.width, canvas.height);
        }
      }, 200) // 200ms debounce
    }
    window.addEventListener("resize", handleResize)

    const animate = (timestamp: number) => {
      // If animation was cancelled, don't continue
      if (!animationRef.current) return;
      
      // Skip this frame if we haven't reached the target interval yet
      if (timestamp - lastFrameTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      // Frame skipping for better performance
      frameSkipCounter++
      if (frameSkipCounter < frameSkipThreshold) {
        lastFrameTime = timestamp
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      frameSkipCounter = 0
      lastFrameTime = timestamp

      // Only increment time at the reduced rate
      time += 0.003
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Redraw test rectangle to ensure we're still drawing
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(0, 0, 50, 50);

      // Check if we need to resize
      if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
        canvas.width = currentWidth
        canvas.height = currentHeight
      }

      // Draw hex grid with culling
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
      
      // Draw hex grid
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const x = col * hexHorizontalOffset
          const y = row * hexVerticalOffset + (col % 2 === 0 ? 0 : hexHeight / 2)

          // Skip hexagons outside viewport with a wider margin to reduce calculations
          if (x < -hexWidth || x > canvas.width + hexWidth || y < -hexHeight || y > canvas.height + hexHeight) {
            continue
          }

          // Calculate distance from center for glow effect
          const dx = x - centerX
          const dy = y - centerY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const normalizedDistance = distance / maxDistance

          // Skip hexes that would be too dim to be visible
          if (normalizedDistance > 0.85) {
            continue
          }

          // Pulse effect with higher contrast and increased base opacity on desktop
          const pulse = Math.sin(time + normalizedDistance * 5) * 0.5 + 0.5
          const baseOpacity = isMobile ? 0.05 : 0.15
          const opacityMultiplier = isMobile ? 0.15 : 0.25
          const opacity = baseOpacity + pulse * opacityMultiplier * (1 - normalizedDistance)

          // Only draw hexagons with visible opacity
          if (opacity < 0.05) continue

          // Draw hexagon
          ctx.beginPath()
          ctx.moveTo(x + hexVertices[0].x, y + hexVertices[0].y)
          for (let i = 1; i < 6; i++) {
            ctx.lineTo(x + hexVertices[i].x, y + hexVertices[i].y)
          }
          ctx.closePath()
          ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`
          ctx.lineWidth = isMobile ? 1 : 1.5
          ctx.stroke()
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)
    console.log("HexGrid: Animation started");

    return () => {
      console.log("HexGrid: Cleaning up");
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      if (container && canvas.parentNode === container) {
        container.removeChild(canvas)
      }
      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout)
        resizeTimeout = null
      }
      window.removeEventListener("resize", handleResize)
      initializedRef.current = false
    }
  }, [isMobile]);

  // Store cleanup function to handle async retries
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    console.log("HexGrid: Component mounted");
    
    // Instead of waiting for Leaflet, create the grid immediately and fallback to body if needed
    const cleanup = createHexGrid();
    
    // Store cleanup function
    if (cleanup && typeof cleanup === 'function') {
      cleanupRef.current = cleanup;
    }
    
    // Always return cleanup function
    return () => {
      console.log("HexGrid: Component unmounting");
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [createHexGrid]);

  // Component doesn't render any visible elements
  return null;
}
