import { Suspense } from "react"
import { OceanMap } from "@/components/maps/ocean-map"
import { TrajectoryMap } from "@/components/maps/trajectory-map"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/server"

async function getMapData() {
  const supabase = await createClient()

  // Get float locations
  const { data: floats } = await supabase
    .from("argo_floats")
    .select("*")
    .order("last_transmission", { ascending: false })

  // Generate sample float locations for the map
  const floatLocations = [
    {
      id: "1",
      floatId: "5906468",
      latitude: 15.52,
      longitude: 68.18,
      status: "active" as const,
      lastTransmission: "2024-12-20T10:30:00Z",
      temperature: 28.5,
      salinity: 34.8,
      depth: 2000,
    },
    {
      id: "2",
      floatId: "5906469",
      latitude: 12.85,
      longitude: 70.52,
      status: "active" as const,
      lastTransmission: "2024-12-19T14:15:00Z",
      temperature: 29.1,
      salinity: 34.9,
      depth: 1800,
    },
    {
      id: "3",
      floatId: "5906470",
      latitude: 18.25,
      longitude: 65.82,
      status: "active" as const,
      lastTransmission: "2024-12-18T09:45:00Z",
      temperature: 27.8,
      salinity: 35.1,
      depth: 2000,
    },
    {
      id: "4",
      floatId: "5906471",
      latitude: 20.08,
      longitude: 72.35,
      status: "inactive" as const,
      lastTransmission: "2024-11-15T16:20:00Z",
      temperature: 26.5,
      salinity: 35.0,
      depth: 1500,
    },
  ]

  // Generate sample trajectory data
  const trajectoryData = Array.from({ length: 30 }, (_, i) => {
    const baseDate = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
    const drift = i * 0.01
    return {
      date: baseDate.toISOString(),
      latitude: 15.5 + drift + Math.sin(i * 0.1) * 0.5,
      longitude: 68.2 + drift * 1.5 + Math.cos(i * 0.1) * 0.3,
      temperature: 28.5 + Math.sin(i * 0.2) * 2 + Math.random() * 0.5,
      salinity: 34.8 + Math.sin(i * 0.15) * 0.3 + Math.random() * 0.1,
      depth: 2000 + Math.sin(i * 0.3) * 200,
    }
  })

  return {
    floatLocations,
    trajectoryData,
  }
}

function MapSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[500px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default async function MapsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ocean Data Maps</h1>
          <p className="text-muted-foreground">Interactive maps showing ARGO float locations and trajectories</p>
        </div>
      </div>

      <Suspense fallback={<MapSkeleton />}>
        <MapContent />
      </Suspense>
    </div>
  )
}

async function MapContent() {
  const data = await getMapData()

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <OceanMap floats={data.floatLocations} center={[15.5, 68.2]} zoom={6} showTrajectories={false} />

        <TrajectoryMap floatId="5906468" trajectory={data.trajectoryData} title="30-Day Float Trajectory" />
      </div>

      <div className="grid gap-6">
        <OceanMap
          floats={data.floatLocations}
          center={[16.0, 69.0]}
          zoom={5}
          showTrajectories={true}
          selectedFloat="5906468"
        />
      </div>
    </div>
  )
}
