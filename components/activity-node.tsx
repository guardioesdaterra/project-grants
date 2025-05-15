"use client"

import { useState } from "react"
import { Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Info, ArrowRight } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

// Updated color function based on INDIRECT beneficiaries and user's tiers
const getBeneficiaryColor = (indirect_beneficiaries: number): string => {
  if (indirect_beneficiaries <= 100) return "#FF00FF"; // 
  if (indirect_beneficiaries <= 500) return "#0074D9"; // Blue
  if (indirect_beneficiaries >= 1000) return "#FF4136"; // red
  return "#FFDC00"; // Gold/Yellow for > 1000
};

// getMarkerIcon now uses indirect_beneficiaries for color
const getMarkerIcon = (indirectBeneficiaries: number, isHovered: boolean, isMobile: boolean) => {
  const scaleFactor = isMobile ? 0.7 : 1;
  // Size can still be based on direct or indirect, let's use indirect for consistency with color
  const beneficiaryFactor = Math.min(Math.max(indirectBeneficiaries / 10000, 0.5), 5); 
  const baseSize = (15 + beneficiaryFactor * 10) * scaleFactor;
  const size = isHovered ? baseSize * 1.2 : baseSize;

  const markerColor = getBeneficiaryColor(indirectBeneficiaries);

  const pulseAnimation = isHovered
    ? `
      @keyframes pulse-marker-${markerColor.replace("#", "")}-${Math.random().toString(36).substring(7)} {
        0% { box-shadow: 0 0 ${beneficiaryFactor * 15}px ${markerColor}, 0 0 ${beneficiaryFactor * 3}px #fff; opacity: 0.9; transform: scale(1); }
        50% { box-shadow: 0 0 ${beneficiaryFactor * 30}px ${markerColor}, 0 0 ${beneficiaryFactor * 6}px #fff; opacity: 1; transform: scale(1.05); }
        100% { box-shadow: 0 0 ${beneficiaryFactor * 15}px ${markerColor}, 0 0 ${beneficiaryFactor * 3}px #fff; opacity: 0.9; transform: scale(1); }
      }
      animation: pulse-marker-${markerColor.replace("#", "")}-${Math.random().toString(36).substring(7)} 1.5s infinite ease-in-out;
    `
    : "";

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${markerColor};
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 0 ${beneficiaryFactor * (isHovered ? 20 : 15)}px ${markerColor}, 0 0 ${beneficiaryFactor * (isHovered ? 6 : 3)}px #fff;
        opacity: ${isHovered ? 1 : 0.9};
        transition: all 0.3s ease;
        ${pulseAnimation}
      ">
        <div style="
          width: ${size * 0.6}px;
          height: ${size * 0.6}px;
          background-color: rgba(0, 0, 0, 0.8);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 2px solid rgba(255, 255, 255, 0.8);
        ">
          <div style="
            width: ${size * 0.3}px;
            height: ${size * 0.3}px;
            background-color: ${markerColor};
            border-radius: 50%;
            box-shadow: 0 0 ${beneficiaryFactor * 3}px ${markerColor};
          "></div>
        </div>
      </div>
    `,
    className: "activity-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

interface ActivityNodeProps {
  latitude: number;
  longitude: number;
  project_title: string;
  country_province: string;
  direct_beneficiaries: number; // Keep direct for display
  indirect_beneficiaries: number; // Use indirect for color/sizing
}

export function ActivityNode({ 
  latitude, 
  longitude, 
  project_title, 
  country_province, 
  direct_beneficiaries, // direct is kept for display text
  indirect_beneficiaries // indirect is now used for color and icon sizing
}: ActivityNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Use indirect_beneficiaries for icon generation (color and size factor)
  const icon = getMarkerIcon(indirect_beneficiaries, isHovered, isMobile);
  // Use indirect_beneficiaries for badge color
  const badgeColor = getBeneficiaryColor(indirect_beneficiaries);

  return (
    <Marker
      position={[latitude, longitude]}
      icon={icon}
      eventHandlers={{
        mouseover: () => setIsHovered(true),
        mouseout: () => setIsHovered(false),
        click: () => setIsHovered(true),
      }}
    >
      <Popup className="cyberpunk-popup" closeButton={false} minWidth={isMobile ? 200 : 280}>
        <div className="relative p-4 min-w-[200px] overflow-visible">
          <div className="border-b border-cyan-500/30 pb-2 mb-3">
            <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              {project_title}
            </h3>
            <Badge 
              className="mt-2 uppercase text-xs tracking-wider text-white"
              style={{ backgroundColor: badgeColor, border: `1px solid ${badgeColor}` }}
            >
              PROJECT GRANTEE
            </Badge>
          </div>
          
          <div className="mt-3 space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>{country_province || "Unknown location"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Direct Beneficiaries: {direct_beneficiaries.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>Indirect Beneficiaries: {indirect_beneficiaries.toLocaleString()}</span>
            </div>
          </div>



          {/* Enlarged and more visible cyberpunk corner elements */}
          <div className="absolute -top-1 -left-1 w-6 h-6 bg-cyan-500 z-500 animate-pulse" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 z-500 animate-pulse" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-pink-500 z-500 animate-pulse" style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 0)' }}></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 z-500 animate-pulse" style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }}></div>
          
          {/* Additional horizontal and vertical lines for more cyber effect */}
          <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-cyan-500 via-transparent to-purple-500 z-500"></div>
          <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-purple-500 via-transparent to-cyan-500 z-500"></div>
          <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-cyan-500 via-transparent to-purple-500 z-500"></div>
          <div className="absolute right-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-purple-500 via-transparent to-cyan-500 z-500"></div>
        </div>
      </Popup>
    </Marker>
  );
}
