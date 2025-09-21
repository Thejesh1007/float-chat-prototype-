import { Suspense } from "react"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { DataOverview } from "@/components/dashboard/data-overview"
import { ChatInterface } from "@/components/chat/chat-interface"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/server"

async function getDashboardData() {
  const supabase = await createClient()

  // Get float statistics
  const { data: floats } = await supabase.from("argo_floats").select("*")

  const { data: profiles } = await supabase
    .from("ocean_profiles")
    .select("*")
    .order("profile_date", { ascending: false })

  const { data: measurements } = await supabase.from("depth_measurements").select("*")

  const { data: recentProfiles } = await supabase
    .from("ocean_profiles")
    .select("*")
    .gte("profile_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  // Generate sample data for charts
  const temperatureData = Array.from({ length: 20 }, (_, i) => ({
    depth: i * 100,
    temperature: 28.5 - i * 100 * 0.012 + Math.random() * 0.5,
  }))

  const salinityData = Array.from({ length: 20 }, (_, i) => ({
    depth: i * 100,
    salinity: 34.8 + i * 100 * 0.0002 + Math.random() * 0.1,
  }))

  const oxygenData = Array.from({ length: 15 }, (_, i) => ({
    depth: i * 100,
    oxygen: 220 - i * 100 * 0.3 + Math.random() * 10,
  }))

  const timeSeriesData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    profiles: Math.floor(Math.random() * 20) + 10,
    floats: Math.floor(Math.random() * 5) + 3,
  }))

  const stats = {
    totalFloats: floats?.length || 0,
    activeFloats: floats?.filter((f) => f.status === "active").length || 0,
    totalProfiles: profiles?.length || 0,
    recentProfiles: recentProfiles?.length || 0,
    dataPoints: measurements?.length || 0,
    regions: ["Arabian Sea", "Bay of Bengal", "Indian Ocean"],
  }

  const activities = [
    {
      id: "1",
      type: "profile" as const,
      floatId: "5906468",
      location: "15.5°N, 68.2°E",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      details: "New temperature and salinity profile collected",
      status: "completed" as const,
    },
    {
      id: "2",
      type: "processing" as const,
      floatId: "5906469",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      details: "NetCDF file R5906469_189.nc processed successfully",
      status: "completed" as const,
    },
    {
      id: "3",
      type: "query" as const,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      details: "User queried oxygen levels in Arabian Sea",
      status: "completed" as const,
    },
    {
      id: "4",
      type: "profile" as const,
      floatId: "5906470",
      location: "18.2°N, 65.8°E",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      details: "BGC measurements including chlorophyll and pH",
      status: "completed" as const,
    },
  ]

  return {
    stats,
    activities,
    temperatureData,
    salinityData,
    oxygenData,
    timeSeriesData,
  }
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Skeleton className="h-[400px] w-full" />
        </div>
        <div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Float Chat Dashboard</h1>
          <p className="text-muted-foreground">AI-powered oceanographic data exploration and visualization</p>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

async function DashboardContent() {
  const data = await getDashboardData()

  return (
    <>
      <DashboardStats stats={data.stats} />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <DataOverview
            temperatureData={data.temperatureData}
            salinityData={data.salinityData}
            oxygenData={data.oxygenData}
            timeSeriesData={data.timeSeriesData}
          />
        </div>

        <div className="space-y-6">
          <RecentActivity activities={data.activities} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-1">
          <ChatInterface sessionId={`dashboard-${Date.now()}`} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Processing</span>
                <span className="text-sm text-green-600 font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Chat Service</span>
                <span className="text-sm text-green-600 font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Connection</span>
                <span className="text-sm text-green-600 font-medium">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Vector Search</span>
                <span className="text-sm text-green-600 font-medium">Ready</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
