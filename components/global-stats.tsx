"use client"

import { useState, useMemo } from "react"
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

  // Memoize stats calculations to avoid recalculating on every render
  const { activeInitiatives, countriesCount, totalDirectBeneficiaries, totalIndirectBeneficiaries } = useMemo(() => {
    const activeInitiatives = projects.length
    const uniqueCountries = new Set(projects.map(p => p.country_province))
    const countriesCount = uniqueCountries.size
    const totalDirectBeneficiaries = projects.reduce((sum, p) => sum + p.direct_beneficiaries, 0)
    const totalIndirectBeneficiaries = projects.reduce((sum, p) => sum + p.indirect_beneficiaries, 0)
    
    return {
      activeInitiatives,
      countriesCount,
      totalDirectBeneficiaries,
      totalIndirectBeneficiaries
    }
  }, [projects]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(".0", "") + "M"
    if (num >= 1000) return (num / 1000).toFixed(1).replace(".0", "") + "K"
    return num.toString()
  }

  return (
    <div
      className={`bg-black/90 backdrop-blur-md rounded-md border border-cyan-900/50 z-[500] shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 ${
        isExpanded ? "p-3" : "p-2"
      }`}
    >
      <div className="flex justify-between items-center">
        <h2
          className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 ${
            isExpanded ? (isMobile ? "text-base" : "text-lg") : "text-sm"
          }`}
        >
          Global Impact
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className={`${isMobile ? "h-8 w-8" : "h-6 w-6"} text-cyan-400 hover:text-cyan-300`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
        >
          {isExpanded ? <ChevronDown className={isMobile ? "h-5 w-5" : "h-4 w-4"} /> : <ChevronUp className={isMobile ? "h-5 w-5" : "h-4 w-4"} />}
        </Button>
      </div>

      {isExpanded && (
        <div className={`grid ${isMobile ? "grid-cols-2 gap-4" : "grid-cols-4 gap-2"} mt-3`}>
          <StatCard 
            icon={<Leaf className="w-4 h-4 text-green-400" />}
            value={formatNumber(activeInitiatives)}
            label="Project Grantees"
            bgFrom="green-500/20"
            bgTo="green-700/20"
            border="green-500/30"
            shadow="16,185,129,0.2"
            textColor="green-400"
            isMobile={isMobile}
          />
          
          <StatCard 
            icon={<Globe className="w-4 h-4 text-cyan-400" />}
            value={formatNumber(countriesCount)}
            label="Countries"
            bgFrom="cyan-500/20"
            bgTo="cyan-700/20"
            border="cyan-500/30"
            shadow="6,182,212,0.2"
            textColor="cyan-400"
            isMobile={isMobile}
          />
          
          <StatCard 
            icon={<Users className="w-4 h-4 text-purple-400" />}
            value={formatNumber(totalDirectBeneficiaries)}
            label="Direct Benef."
            bgFrom="purple-500/20"
            bgTo="purple-700/20"
            border="purple-500/30"
            shadow="139,92,246,0.2"
            textColor="purple-400"
            isMobile={isMobile}
          />
          
          <StatCard 
            icon={<BarChart2 className="w-4 h-4 text-orange-400" />}
            value={formatNumber(totalIndirectBeneficiaries)}
            label="Indirect Benef."
            bgFrom="orange-500/20"
            bgTo="orange-700/20"
            border="orange-500/30"
            shadow="249,115,22,0.2"
            textColor="orange-400"
            isMobile={isMobile}
          />
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  bgFrom: string;
  bgTo: string;
  border: string;
  shadow: string;
  textColor: string;
  isMobile: boolean;
}

// Extracted component for better readability and potential memoization
function StatCard({ 
  icon, 
  value, 
  label, 
  bgFrom, 
  bgTo, 
  border, 
  shadow,
  textColor,
  isMobile
}: StatCardProps) {
  return (
    <div className="flex flex-col items-center">
      <div className={`flex items-center justify-center ${isMobile ? "w-10 h-10" : "w-8 h-8"} rounded-full bg-gradient-to-br from-${bgFrom} to-${bgTo} border border-${border} mb-0.5 shadow-[0_0_10px_rgba(${shadow})]`}>
        {icon}
      </div>
      <span className={`${isMobile ? "text-xl" : "text-lg"} font-bold text-${textColor}`}>{value}</span>
      <span className={`${isMobile ? "text-xs" : "text-[11px]"} leading-tight text-gray-400 text-center whitespace-nowrap`}>{label}</span>
    </div>
  )
}

