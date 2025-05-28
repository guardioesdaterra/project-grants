"use client"

import { useEffect, useState, useCallback } from "react"

export function useMediaQuery(query: string): boolean {
  // Initialize state with null to differentiate between server and client
  const [matches, setMatches] = useState<boolean>(false)
  
  // Memoize the handler to avoid recreating it on every render
  const updateMatches = useCallback((e?: MediaQueryListEvent | MediaQueryList) => {
    const target = e || window.matchMedia(query);
    const mediaMatches = target instanceof MediaQueryList 
      ? target.matches 
      : (target as MediaQueryListEvent).matches;
    
    setMatches(mediaMatches);
  }, [query]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      // This check is mostly for safety, as useEffect runs client-side.
      // It ensures that if this hook were ever (mis)used in a non-client context,
      // it wouldn't try to access window.
      return
    }

    const media = window.matchMedia(query)
    
    // Set initial value
    updateMatches(media)

    // Add listener for subsequent changes
    media.addEventListener("change", updateMatches)

    // Cleanup listener on unmount or when query changes
    return () => media.removeEventListener("change", updateMatches)
  }, [query, updateMatches]) // Include updateMatches in dependencies

  return matches
}
