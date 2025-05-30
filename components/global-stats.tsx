"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Globe, Users, Zap, BarChart2 } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ProjectData } from "@/lib/types"

interface GlobalStatsProps {
  projects: ProjectData[]
}

export function GlobalStats({ projects }: GlobalStatsProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const { activeInitiatives, countriesCount, totalDirectBeneficiaries, totalIndirectBeneficiaries } = useMemo(() => {
    const activeInitiatives = projects.length
    const countriesCount = 31 
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
      className={`bg-gradient-to-br from-black via-gray-900/95 to-black backdrop-blur-md rounded-lg border-2 border-pink-500/70 z-[500] shadow-[0_0_35px_5px_rgba(219,39,119,0.35)] transition-all duration-300 font-['Consolas','Monaco','monospace'] ${ 
        isExpanded ? "p-3.5 md:p-5" : "p-2.5"
      }`}
    >
      <div className="flex justify-center items-center mb-1">
        <h2
          className={`whitespace-nowrap font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-300 uppercase tracking-wider [text-shadow:_0_0_8px_theme(colors.purple.500),_0_0_12px_theme(colors.pink.500)] ${
            isExpanded ? (isMobile ? "text-base" : "text-lg") : "text-sm"
          }`}
        >
          &gt;&gt; 2024 Project Grants Impact &lt;&lt;
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className={`${isMobile ? "h-8 w-8" : "h-7 w-7"} text-pink-400 hover:text-pink-300 hover:bg-pink-500/20 rounded-md transition-colors duration-150`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
        >
          {isExpanded ? <ChevronDown className={isMobile ? "h-5 w-5" : "h-4 w-4"} /> : <ChevronUp className={isMobile ? "h-5 w-5" : "h-4 w-4"} />}
        </Button>
      </div>

      {isExpanded && (
        <div className={`grid ${isMobile ? "grid-cols-2 gap-3.5" : "grid-cols-4 gap-3"} mt-3`}>
          <StatCard 
            icon={<Zap className="w-4 h-4" />}
            value={formatNumber(activeInitiatives)}
            label="Project Gratees"
            accentColor="text-green-400"
            glowColorRGB="74,222,128"
            isMobile={isMobile}
          />
          
          <StatCard 
            icon={<Globe className="w-4 h-4" />}
            value={formatNumber(countriesCount)}
            label="Countries"
            accentColor="text-cyan-300"
            glowColorRGB="56,189,248"
            isMobile={isMobile}
          />
          
          <StatCard 
            icon={<Users className="w-4 h-4" />}
            value={formatNumber(totalDirectBeneficiaries)}
            label="Direct Beneficiaries"
            accentColor="text-purple-400"
            glowColorRGB="192,132,252"
            isMobile={isMobile}
          />
          
          <StatCard 
            icon={<BarChart2 className="w-4 h-4" />}
            value={formatNumber(totalIndirectBeneficiaries)}
            label="Indirect Beneficiaries"
            accentColor="text-orange-400"
            glowColorRGB="251,146,60"
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
  accentColor: string;
  glowColorRGB: string;
  isMobile: boolean;
}

function StatCard({ 
  icon, 
  value, 
  label, 
  accentColor,
  glowColorRGB,
  isMobile
}: StatCardProps) {
  const iconContainerSize = isMobile ? "w-10 h-10" : "w-9 h-9";
  const valueTextSize = isMobile ? "text-lg" : "text-xl";
  const labelTextSize = isMobile ? "text-xs" : "text-[11px]";

  return (
    <div className="flex flex-col items-center p-2 bg-gray-900/60 rounded-lg hover:bg-gray-800/70 transition-all duration-200 group shadow-[inset_0_0_10px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
      <div 
        className={`flex items-center justify-center ${iconContainerSize} rounded-lg bg-gray-800/75 border border-gray-600/60 mb-1.5 shadow-[0_0_12px_2px_rgba(${glowColorRGB},0.4)] group-hover:shadow-[0_0_18px_3px_rgba(${glowColorRGB},0.55)] transition-all duration-200`}
      >
        <span className={`${accentColor} group-hover:scale-110 transition-transform duration-200 [filter:drop-shadow(0_0_3px_rgba(${glowColorRGB},0.6))]`}>{icon}</span>
      </div>
      <span className={`${valueTextSize} font-bold ${accentColor} [text-shadow:_0_0_6px_rgba(${glowColorRGB},0.6),_0_0_9px_rgba(${glowColorRGB},0.4)]`}>{value}</span>
      <span className={`${labelTextSize} leading-tight text-gray-300/90 uppercase tracking-tighter text-center whitespace-nowrap group-hover:text-gray-200 transition-colors duration-200 [text-shadow:_0_0_2px_rgba(0,0,0,0.5)]`}>{label}</span>
    </div>
  )
}

