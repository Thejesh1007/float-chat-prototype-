"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Database, MapPin, Waves } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    totalFloats: number
    activeFloats: number
    totalProfiles: number
    recentProfiles: number
    dataPoints: number
    regions: string[]
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ARGO Floats</CardTitle>
          <Activity className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFloats}</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">{stats.activeFloats} active</span> •{" "}
            {stats.totalFloats - stats.activeFloats} inactive
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ocean Profiles</CardTitle>
          <Waves className="h-4 w-4 text-cyan-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProfiles.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+{stats.recentProfiles}</span> this week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Data Points</CardTitle>
          <Database className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(stats.dataPoints / 1000).toFixed(1)}K</div>
          <p className="text-xs text-muted-foreground">Temperature, salinity & BGC</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Coverage Areas</CardTitle>
          <MapPin className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.regions.length}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {stats.regions.slice(0, 2).map((region) => (
              <Badge key={region} variant="secondary" className="text-xs">
                {region}
              </Badge>
            ))}
            {stats.regions.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{stats.regions.length - 2}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
