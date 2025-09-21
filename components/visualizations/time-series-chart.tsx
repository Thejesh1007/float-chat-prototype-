"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Calendar, TrendingUp, Download } from "lucide-react"
import { useState } from "react"

interface TimeSeriesData {
  date: string
  temperature?: number
  salinity?: number
  oxygen?: number
  profiles?: number
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[]
  title?: string
  parameter: "temperature" | "salinity" | "oxygen" | "profiles"
  floatId?: string
  location?: string
}

export function TimeSeriesChart({ data, title, parameter, floatId, location }: TimeSeriesChartProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")

  const getParameterConfig = () => {
    switch (parameter) {
      case "temperature":
        return {
          color: "#ef4444",
          unit: "°C",
          label: "Temperature",
          icon: "🌡️",
        }
      case "salinity":
        return {
          color: "#3b82f6",
          unit: "PSU",
          label: "Salinity",
          icon: "💧",
        }
      case "oxygen":
        return {
          color: "#10b981",
          unit: "μmol/kg",
          label: "Oxygen",
          icon: "🫧",
        }
      case "profiles":
        return {
          color: "#8b5cf6",
          unit: "count",
          label: "Profiles",
          icon: "📊",
        }
    }
  }

  const config = getParameterConfig()

  const formatTooltip = (value: any, name: string) => {
    return [`${value?.toFixed(2)} ${config.unit}`, config.label]
  }

  const getFilteredData = () => {
    const now = new Date()
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    return data.filter((d) => new Date(d.date) >= cutoff)
  }

  const filteredData = getFilteredData()

  const getStats = () => {
    const values = filteredData.map((d) => d[parameter]).filter((v) => v !== undefined) as number[]
    if (values.length === 0) return { min: 0, max: 0, avg: 0, trend: 0 }

    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((a, b) => a + b, 0) / values.length

    // Simple trend calculation (last value vs first value)
    const trend = values.length > 1 ? ((values[values.length - 1] - values[0]) / values[0]) * 100 : 0

    return { min, max, avg, trend }
  }

  const stats = getStats()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {title || `${config.label} Time Series`}
          </CardTitle>
          <div className="flex gap-2">
            {floatId && (
              <Badge variant="outline" className="text-xs">
                Float {floatId}
              </Badge>
            )}
            {location && (
              <Badge variant="secondary" className="text-xs">
                {location}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(["7d", "30d", "90d", "1y"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs"
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: config.color }}>
              {stats.min.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Min {config.unit}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: config.color }}>
              {stats.max.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Max {config.unit}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: config.color }}>
              {stats.avg.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Avg {config.unit}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className={`h-4 w-4 ${stats.trend >= 0 ? "text-green-500" : "text-red-500"}`} />
              <div className="text-2xl font-bold" style={{ color: stats.trend >= 0 ? "#10b981" : "#ef4444" }}>
                {Math.abs(stats.trend).toFixed(1)}%
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Trend</div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
            <YAxis />
            <Tooltip formatter={formatTooltip} labelFormatter={(value) => new Date(value).toLocaleDateString()} />
            <Legend />
            <Line
              type="monotone"
              dataKey={parameter}
              stroke={config.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              name={`${config.label} (${config.unit})`}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
