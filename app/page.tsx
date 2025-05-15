import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, BarChart2 } from "lucide-react"
import { allProjectsData } from "@/lib/project-data"
import ClientMapWrapper from "@/components/client-map-wrapper"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">

      <div className="flex-1 relative">
        <ClientMapWrapper projects={allProjectsData} />
      </div>
    </main>
  )
}
