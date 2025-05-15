"use client"

import { useEffect, useRef, useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

export function HexGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const canvas = document.createElement("canvas")
    canvas.style.position = "absolute"
    canvas.style.top = "0"
    canvas.style.left = "0"
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.pointerEvents = "none"
    canvas.style.zIndex = "99999999"
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const container = document.querySelector(".leaflet-container")
    if (container) {
      container.appendChild(canvas)
      canvasRef.current = canvas
    }

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) {
      console.error("Failed to get 2D context from canvas")
      if (container && canvas.parentNode === container) {
        container.removeChild(canvas)
      }
      return
    }

    // More aggressive optimization for mobile
    const hexSize = isMobile ? 35 : 50
    const hexHeight = hexSize * Math.sqrt(3)
    const hexWidth = hexSize * 2
    const hexVerticalOffset = hexHeight * 0.75
    const hexHorizontalOffset = hexWidth * 0.5

    // Calculate grid dimensions
    const columns = Math.ceil(window.innerWidth / hexHorizontalOffset) + 1
    const rows = Math.ceil(window.innerHeight / hexVerticalOffset) + 1

    // Precompute hex vertices to avoid recalculation during animation
    const hexVertices = []
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
    // Further reduced frame rate on mobile
    const targetFPS = isMobile ? 15 : 24
    const frameInterval = 1000 / targetFPS
    let frameSkipCounter = 0
    const frameSkipThreshold = isMobile ? 3 : 1 // Skip more frames on mobile

    // Keep track of window size
    let currentWidth = window.innerWidth
    let currentHeight = window.innerHeight

    // Throttled resize handler
    let resizeTimeout: number | null = null
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = window.setTimeout(() => {
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
          canvas.width = window.innerWidth
          canvas.height = window.innerHeight
          currentWidth = window.innerWidth
          currentHeight = window.innerHeight
        }
      }, 200) // 200ms debounce
    }
    window.addEventListener("resize", handleResize)

    const animate = (timestamp: number) => {
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

          // Pulse effect with higher contrast
          const pulse = Math.sin(time + normalizedDistance * 5) * 0.5 + 0.5
          const opacity = 0.05 + pulse * 0.15 * (1 - normalizedDistance)

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
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
      if (container && canvas.parentNode === container) {
        container.removeChild(canvas)
      }
      if (resizeTimeout) clearTimeout(resizeTimeout)
      window.removeEventListener("resize", handleResize)
    }
  }, [isMobile, isVisible])

  // Only render if visible
  if (!isVisible) return null
  
  return null
}
