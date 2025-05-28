"use client"

import { ActivityNode } from "@/components/activity-node"
import { ProjectData } from "@/lib/types"

interface ProjectLayerProps {
  projects: ProjectData[]
}

export function ProjectLayer({ projects }: ProjectLayerProps) {
  if (!projects || projects.length === 0) {
    return null
  }

  return (
    <>
      {projects.map((project, index) => (
        <ActivityNode
          key={`${project.project_title}-${index}`}
          latitude={project.latitude}
          longitude={project.longitude}
          project_title={project.project_title}
          country_province={project.country_province}
          direct_beneficiaries={project.direct_beneficiaries}
          indirect_beneficiaries={project.indirect_beneficiaries}
        />
      ))}
    </>
  )
} 