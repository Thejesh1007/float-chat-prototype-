import { Suspense } from "react"
import { DepthProfileChart } from "@/components/visualizations/depth-profile-chart"
import { TimeSeriesChart } from "@/components/visualizations/time-series-chart"
import { ComparisonChart } from "@/components/visualizations/comparison-chart"
import { HeatmapChart } from "@/components/visualizations/heatmap-chart"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/server"

async function getVisualizationData() {
  const supabase = await createClient()

  // Get sample depth profile data
  const { data: profileData } = await supabase
    .from("depth_measurements")
    .select(`
      *,
      ocean_profiles(*, argo_floats(*))
    `)
    .limit(50)

  // Generate sample data for visualizations
  const depthProfileData = Array.from({ length: 20 }, (_, i) => ({
    depth: i * 100,
    temperature: 28.5 - i * 100 * 0.012 + Math.random() * 0.5,
    salinity: 34.8 + i * 100 * 0.0002 + Math.random() * 0.1,
    oxygen: 220 - i * 100 * 0.3 + Math.random() * 10,
  }))

  const timeSeriesData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    temperature: 28.5 + Math.sin(i * 0.2) * 2 + Math.random() * 0.5,
    salinity: 34.8 + Math.sin(i * 0.15) * 0.3 + Math.random() * 0.1,
    oxygen: 220 + Math.sin(i * 0.1) * 20 + Math.random() * 5,
    profiles: Math.floor(Math.random() * 10) + 5,
  }))

  const comparisonData = Array.from({ length: 15 }, (_, i) => ({
    depth: i * 100,
    float1_temperature: 28.5 - i * 100 * 0.012 + Math.random() * 0.3,
    float1_salinity: 34.8 + i * 100 * 0.0002 + Math.random() * 0.05,
    float1_oxygen: 220 - i * 100 * 0.3 + Math.random() * 8,
    float2_temperature: 28.2 - i * 100 * 0.011 + Math.random() * 0.3,
    float2_salinity: 34.9 + i * 100 * 0.0001 + Math.random() * 0.05,
    float2_oxygen: 215 - i * 100 * 0.28 + Math.random() * 8,
  }))

  const heatmapData = []
  const dates = Array.from(
    { length: 14 },
    (_, i) => new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  )
  const depths = [0, 50, 100, 200, 500, 1000, 1500, 2000]

  for (const date of dates) {
    for (const depth of depths) {
      heatmapData.push({
        date,
        depth,
        value: 28.5 - depth * 0.012 + Math.sin(dates.indexOf(date) * 0.3) * 1.5 + Math.random() * 0.5,
        floatId: "5906468",
      })
    }
  }

  return {
    depthProfileData,
    timeSeriesData,
    comparisonData,
    heatmapData,
  }
}

function VisualizationSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default async function VisualizationsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Visualizations</h1>
          <p className="text-muted-foreground">Interactive charts and analysis of oceanographic data</p>
        </div>
      </div>

      <Suspense fallback={<VisualizationSkeleton />}>
        <VisualizationContent />
      </Suspense>
    </div>
  )
}

async function VisualizationContent() {
  const data = await getVisualizationData()

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <DepthProfileChart
          data={data.depthProfileData}
          floatId="5906468"
          profileDate="2024-12-20"
          title="Temperature Depth Profile"
          showTemperature={true}
        />

        <TimeSeriesChart
          data={data.timeSeriesData}
          parameter="temperature"
          floatId="5906468"
          location="Arabian Sea"
          title="Temperature Time Series"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ComparisonChart
          data={data.comparisonData}
          float1Id="5906468"
          float2Id="5906469"
          parameter="temperature"
          title="Float Temperature Comparison"
        />

        <HeatmapChart
          data={data.heatmapData}
          parameter="temperature"
          floatId="5906468"
          title="Temperature Heatmap (14 days)"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <DepthProfileChart
          data={data.depthProfileData}
          floatId="5906468"
          title="Salinity Profile"
          showSalinity={true}
        />

        <DepthProfileChart data={data.depthProfileData} floatId="5906468" title="Oxygen Profile" showOxygen={true} />

        <TimeSeriesChart data={data.timeSeriesData} parameter="profiles" title="Data Collection Activity" />
      </div>
    </div>
  )
}
