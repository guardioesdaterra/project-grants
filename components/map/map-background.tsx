"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import { OptimizedBackgroundImage } from "@/components/ui/optimized-background-image"

export function MapBackground() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  return (
    <>
      {/* Background gradients - reduced complexity on mobile */}
      <div className="absolute inset-0 bg-gradient-to-b opacity-[1.5] from-purple-900/20 to-cyan-900/20 pointer-events-none z-[9999999999]"></div>
      <div className="absolute inset-0 bg-gradient-radial opacity-[1.5] from-transparent via-transparent to-purple-900/20 pointer-events-none z-[999999999999]"></div>

      {/* Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none z-[400]" style={{ boxShadow: 'inset 0 0 150px 20px rgba(0,0,0,0.7)' }}></div>

      {/* Noise Overlay - ensure noise.png is in public folder */}
      {!isMobile && 
        <OptimizedBackgroundImage 
          src="/noise.png"
          alt="Noise Texture"
          width={512}
          height={512}
          className="absolute inset-0 pointer-events-none z-[401] animate-noise-bg"
          style={{ backgroundRepeat: 'repeat' }}
        />
      }

      {/* Scanline overlay - disabled on mobile */}
      {!isMobile && 
        <OptimizedBackgroundImage 
          src="/scanline.gif"
          alt="Scanline Effect"
          width={512}
          height={512}
          className="absolute inset-0 opacity-[0.05] pointer-events-none z-[999999999999]"
        />
      }

      {/* Animated background elements - simplified on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[398]">
        <div className={`absolute top-0 left-0 w-full h-full ${isMobile ? 'opacity-5' : 'opacity-10'}`}>
          <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-cyan-500/20 blur-3xl animate-pulse-slow"></div>
          {!isMobile && (
            <>
              <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-purple-500/20 blur-3xl animate-pulse-slow-delay"></div>
              <div className="absolute top-1/2 right-1/4 w-1/4 h-1/4 bg-pink-500/20 blur-3xl animate-pulse-slow-delay-2"></div>
            </>
          )}
        </div>
      </div>
    </>
  )
} 