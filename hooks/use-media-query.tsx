"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      // This check is mostly for safety, as useEffect runs client-side.
      // It ensures that if this hook were ever (mis)used in a non-client context,
      // it wouldn't try to access window.
      return
    }

    const media = window.matchMedia(query)

    const updateMatches = () => setMatches(media.matches)
    
    // Set the initial state correctly after mount
    updateMatches()

    // Listen for changes
    media.addEventListener("change", updateMatches)

    // Cleanup listener on unmount or when query changes
    return () => media.removeEventListener("change", updateMatches)
  }, [query]) // Effect now only depends on query

  return matches
}
