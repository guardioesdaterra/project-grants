import ClientMapWrapper from "@/components/client-map-wrapper"
import { allProjectsData } from "@/lib/project-data"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <div className="flex-1 relative">
        <ClientMapWrapper projects={allProjectsData} />
      </div>
    </main>
  )
}
