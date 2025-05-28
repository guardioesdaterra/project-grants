"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { ProjectData } from "@/lib/types"
import { ConnectionLines } from "@/components/connection-lines"
import { useMediaQuery } from "@/hooks/use-media-query"

interface Connection {
  from: [number, number]
  to: [number, number]
  from_project_indirect_beneficiaries: number
}

interface ConnectionGeneratorProps {
  projects: ProjectData[]
}

export function ConnectionGenerator({ projects }: ConnectionGeneratorProps) {
  const [connections, setConnections] = useState<Connection[]>([])
  const isMobile = useMediaQuery("(max-width: 768px)")
  const processedRef = useRef(false)

  // Função para calcular distância entre dois pontos (fórmula de Haversine)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Distância em km
  }, [])

  // Memoize the connection generation function
  const generateConnections = useCallback(() => {
    if (!projects || projects.length <= 1) {
      return []
    }
    
    // Limit connections count on mobile
    const maxConnectionsPerProject = isMobile ? 2 : 3
    const newConnections: Connection[] = []
    
    // Process fewer projects on mobile to improve performance
    const projectsToProcess = isMobile 
      ? projects.slice(0, Math.min(15, projects.length)) 
      : projects
    
    // Set para rastrear projetos já usados como destino
    const usedAsTarget = new Set<string>()
    
    projectsToProcess.forEach(project => {
      if (!project.latitude || !project.longitude) return
      
      // Filter out the current project and select targets by distance
      const availableTargets = projectsToProcess.filter(
        p => p.project_title !== project.project_title && 
             p.latitude && 
             p.longitude &&
             !usedAsTarget.has(p.project_title) // Evita usar projetos já conectados
      )
      
      if (availableTargets.length === 0) return
      
      // Calcular distâncias e ordenar por distância (maior para menor)
      const targetsWithDistance = availableTargets.map(target => ({
        project: target,
        distance: calculateDistance(
          project.latitude!, 
          project.longitude!, 
          target.latitude!, 
          target.longitude!
        )
      })).sort((a, b) => b.distance - a.distance) // Ordenar por distância decrescente
      
      // Limit connections per project
      const connectionsToMake = Math.min(
        maxConnectionsPerProject, 
        targetsWithDistance.length
      )

      // Conectar aos projetos mais distantes primeiro
      for (let i = 0; i < connectionsToMake; i++) {
        const targetData = targetsWithDistance[i]
        if (targetData && !usedAsTarget.has(targetData.project.project_title)) {
          newConnections.push({
            from: [project.latitude, project.longitude],
            to: [targetData.project.latitude!, targetData.project.longitude!],
            from_project_indirect_beneficiaries: project.indirect_beneficiaries || 1000,
          })
          
          // Marcar como usado para evitar múltiplas conexões para o mesmo destino
          usedAsTarget.add(targetData.project.project_title)
        }
      }
    })
    
    return newConnections
  }, [projects, isMobile, calculateDistance])

  // Generate connections only when dependencies change
  useEffect(() => {
    // Skip initial render in development strict mode double-render
    if (process.env.NODE_ENV === 'development' && !processedRef.current) {
      processedRef.current = true
      return
    }
    
    const newConnections = generateConnections()
    setConnections(newConnections)
  }, [generateConnections])

  if (!connections.length) {
    return null
  }

  return <ConnectionLines connections={connections} />
}