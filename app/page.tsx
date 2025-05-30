import { Suspense } from "react";
import ClientMapWrapper from "@/components/client-map-wrapper";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <div className="flex-1 relative">
        <Suspense fallback={
          <div className="flex h-screen w-full items-center justify-center bg-black text-white">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse mr-4"></div>
            Loading Map...
          </div>
        }>
          <ClientMapWrapper />
        </Suspense>
      </div>
    </main>
  )
}
