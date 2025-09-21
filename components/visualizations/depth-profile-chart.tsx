"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Thermometer, Droplets, Wind } from "lucide-react"

interface DepthProfileData {
  depth: number
  temperature?: number
  salinity?: number
  oxygen?: number
  pressure?: number
}

interface DepthProfileChartProps {
  data: DepthProfileData[]
  floatId?: string
  profileDate?: string
  title?: string
  showTemperature?: boolean
  showSalinity?: boolean
  showOxygen?: boolean
}

export function DepthProfileChart({
  data,
  floatId,
  profileDate,
  title = "Ocean Depth Profile",
  showTemperature = true,
  showSalinity = false,
  showOxygen = false,
}: DepthProfileChartProps) {
  const formatTooltip = (value: any, name: string) => {
    switch (name) {
      case "temperature":
        return [`${value?.toFixed(2)}°C`, "Temperature"]
      case "salinity":
        return [`${value?.toFixed(2)} PSU`, "Salinity"]
      case "oxygen":
        return [`${value?.toFixed(1)} μmol/kg`, "Oxygen"]
      default:
        return [value, name]
    }
  }

  const getMaxDepth = () => {
    return Math.max(...data.map((d) => d.depth))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-red-500" />
            {title}
          </CardTitle>
          <div className="flex gap-2">
            {floatId && (
              <Badge variant="outline" className="text-xs">
                Float {floatId}
              </Badge>
            )}
            {profileDate && (
              <Badge variant="secondary" className="text-xs">
                {new Date(profileDate).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Max Depth: {getMaxDepth()}m</span>
          <span>Data Points: {data.length}</span>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey={showTemperature ? "temperature" : showSalinity ? "salinity" : "oxygen"}
              domain={["dataMin", "dataMax"]}
            />
            <YAxis
              type="number"
              dataKey="depth"
              reversed
              domain={[0, "dataMax"]}
              label={{ value: "Depth (m)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip formatter={formatTooltip} />
            <Legend />

            {showTemperature && (
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 2 }}
                name="Temperature (°C)"
              />
            )}

            {showSalinity && (
              <Line
                type="monotone"
                dataKey="salinity"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 2 }}
                name="Salinity (PSU)"
              />
            )}

            {showOxygen && (
              <Line
                type="monotone"
                dataKey="oxygen"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 2 }}
                name="Oxygen (μmol/kg)"
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          {showTemperature && (
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
              <Thermometer className="h-4 w-4 text-red-500" />
              <div>
                <div className="font-medium">Temperature</div>
                <div className="text-xs text-muted-foreground">
                  {data[0]?.temperature?.toFixed(1)}°C - {data[data.length - 1]?.temperature?.toFixed(1)}°C
                </div>
              </div>
            </div>
          )}

          {showSalinity && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div>
                <div className="font-medium">Salinity</div>
                <div className="text-xs text-muted-foreground">
                  {data[0]?.salinity?.toFixed(2)} - {data[data.length - 1]?.salinity?.toFixed(2)} PSU
                </div>
              </div>
            </div>
          )}

          {showOxygen && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
              <Wind className="h-4 w-4 text-green-500" />
              <div>
                <div className="font-medium">Oxygen</div>
                <div className="text-xs text-muted-foreground">
                  {Math.min(...data.map((d) => d.oxygen || 0)).toFixed(1)} -{" "}
                  {Math.max(...data.map((d) => d.oxygen || 0)).toFixed(1)} μmol/kg
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
