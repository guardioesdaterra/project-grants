"use client"

import { useEffect, useRef } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

export function HexGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

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

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      // Handle the case where context is not available, perhaps log an error or return
      console.error("Failed to get 2D context from canvas")
      if (container && canvas.parentNode === container) {
        container.removeChild(canvas)
      }
      return
    }

    // Hex grid parameters - smaller on mobile
    const hexSize = isMobile ? 30 : 50
    const hexHeight = hexSize * Math.sqrt(3)
    const hexWidth = hexSize * 2
    const hexVerticalOffset = hexHeight * 0.75
    const hexHorizontalOffset = hexWidth * 0.5

    // Calculate number of hexagons needed
    const columns = Math.ceil(window.innerWidth / hexHorizontalOffset) + 1
    const rows = Math.ceil(window.innerHeight / hexVerticalOffset) + 1

    // Animation parameters
    let time = 0
    let lastFrameTime = 0
    const targetFPS = isMobile ? 20 : 30
    const frameInterval = 1000 / targetFPS

    const animate = (timestamp: number) => {
      // Throttle frame rate for performance
      if (timestamp - lastFrameTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      lastFrameTime = timestamp

      time += 0.005
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update canvas size if window is resized
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }

      // Draw hex grid
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const x = col * hexHorizontalOffset
          const y = row * hexVerticalOffset + (col % 2 === 0 ? 0 : hexHeight / 2)

          // Skip hexagons outside the viewport
          if (x < -hexWidth || x > canvas.width + hexWidth || y < -hexHeight || y > canvas.height + hexHeight) {
            continue
          }

          // Calculate distance from center for glow effect
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          const dx = x - centerX
          const dy = y - centerY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
          const normalizedDistance = distance / maxDistance

          // Pulse effect with higher contrast
          const pulse = Math.sin(time + normalizedDistance * 5) * 0.5 + 0.5
          const opacity = 0.05 + pulse * 0.15 * (1 - normalizedDistance)

          // Draw hexagon
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i
            const hx = x + hexSize * Math.cos(angle)
            const hy = y + hexSize * Math.sin(angle)
            if (i === 0) {
              ctx.moveTo(hx, hy)
            } else {
              ctx.lineTo(hx, hy)
            }
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
    }
  }, [isMobile])

  return null
}
