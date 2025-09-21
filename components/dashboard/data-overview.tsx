"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

interface DataOverviewProps {
  temperatureData: Array<{ depth: number; temperature: number }>
  salinityData: Array<{ depth: number; salinity: number }>
  oxygenData: Array<{ depth: number; oxygen: number }>
  timeSeriesData: Array<{ date: string; profiles: number; floats: number }>
}

export function DataOverview({ temperatureData, salinityData, oxygenData, timeSeriesData }: DataOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Data Collection Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="profiles" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="floats" stackId="2" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ocean Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="temperature" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="temperature">Temperature</TabsTrigger>
              <TabsTrigger value="salinity">Salinity</TabsTrigger>
              <TabsTrigger value="oxygen">Oxygen</TabsTrigger>
            </TabsList>

            <TabsContent value="temperature" className="mt-4">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="temperature" />
                  <YAxis dataKey="depth" reversed />
                  <Tooltip />
                  <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="salinity" className="mt-4">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={salinityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="salinity" />
                  <YAxis dataKey="depth" reversed />
                  <Tooltip />
                  <Line type="monotone" dataKey="salinity" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="oxygen" className="mt-4">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={oxygenData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="oxygen" />
                  <YAxis dataKey="depth" reversed />
                  <Tooltip />
                  <Line type="monotone" dataKey="oxygen" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">Temperature Range</h4>
              <p className="text-sm text-blue-700">Surface: 28.5°C • Deep: 4.2°C</p>
            </div>

            <div className="p-3 bg-cyan-50 rounded-lg">
              <h4 className="font-medium text-cyan-900 mb-1">Salinity Profile</h4>
              <p className="text-sm text-cyan-700">Typical Arabian Sea characteristics with subsurface maximum</p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-1">Oxygen Minimum Zone</h4>
              <p className="text-sm text-green-700">Present at 400-800m depth, typical for this region</p>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-1">Data Quality</h4>
              <p className="text-sm text-purple-700">98.5% of profiles pass quality control checks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
