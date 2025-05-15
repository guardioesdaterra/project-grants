"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Globe, Users, Leaf, BarChart2 } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ProjectData } from "@/lib/types"

interface GlobalStatsProps {
  projects: ProjectData[]
}

export function GlobalStats({ projects }: GlobalStatsProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const activeInitiatives = projects.length
  
  const uniqueCountries = new Set(projects.map(p => p.country_province))
  const countriesCount = uniqueCountries.size

  const totalDirectBeneficiaries = projects.reduce((sum, p) => sum + p.direct_beneficiaries, 0)
  const totalIndirectBeneficiaries = projects.reduce((sum, p) => sum + p.indirect_beneficiaries, 0)


  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(".0", "") + "M"
    if (num >= 1000) return (num / 1000).toFixed(1).replace(".0", "") + "K"
    return num.toString()
  }

  return (
    <div
      className={`bg-black/90 backdrop-blur-md rounded-md border border-cyan-900/50 z-[500] shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 ${
        isExpanded ? "px-2 py-3" : "p-2"
      }`}
    >
      <div className="flex justify-between items-center">
        <h2
          className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 ${
            isExpanded ? "text-lg" : "text-sm"
          }`}
        >
          Global Impact
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-cyan-400 hover:text-cyan-300"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-500/20 to-green-700/20 border border-green-500/30 mb-0.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <Leaf className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-lg font-bold text-green-400">{formatNumber(activeInitiatives)}</span>
              <span className="text-[11px] leading-tight text-gray-400 text-center whitespace-nowrap">Project Grantees</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-700/20 border border-cyan-500/30 mb-0.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <Globe className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-lg font-bold text-cyan-400">28</span>
              <span className="text-[11px] leading-tight text-gray-400 text-center whitespace-nowrap">Countries</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/30 mb-0.5 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-lg font-bold text-purple-400">{formatNumber(totalDirectBeneficiaries)}</span>
              <span className="text-[11px] leading-tight text-gray-400 text-center whitespace-nowrap">Direct Benef.</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-700/20 border border-orange-500/30 mb-0.5 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                <BarChart2 className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-lg font-bold text-orange-400">{formatNumber(totalIndirectBeneficiaries)}</span>
              <span className="text-[11px] leading-tight text-gray-400 text-center whitespace-nowrap">Indirect Benef.</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

