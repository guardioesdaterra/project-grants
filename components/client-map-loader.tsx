"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { allProjectsData } from "@/lib/project-data";

// Dynamic import with no SSR
const ClientMapWrapper = dynamic(
  () => import("@/components/client-map-wrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white text-xl">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse mr-4"></div>
        Loading Map...
      </div>
    ),
  }
);

export function ClientMapLoader() {
  const [isClient, setIsClient] = useState(false);
  
  // Garantir que o componente só renderize no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white text-xl">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse mr-4"></div>
        Initializing Map...
      </div>
    );
  }
  
  return <ClientMapWrapper projects={allProjectsData} />;
} 