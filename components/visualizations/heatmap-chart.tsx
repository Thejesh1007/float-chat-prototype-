"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Thermometer } from "lucide-react"
import { useState } from "react"

interface HeatmapData {
  date: string
  depth: number
  value: number
  floatId?: string
}

interface HeatmapChartProps {
  data: HeatmapData[]
  parameter: "temperature" | "salinity" | "oxygen"
  title?: string
  floatId?: string
}

export function HeatmapChart({ data, parameter, title, floatId }: HeatmapChartProps) {
  const [selectedDepth, setSelectedDepth] = useState<number | null>(null)

  const getParameterConfig = () => {
    switch (parameter) {
      case "temperature":
        return {
          unit: "°C",
          label: "Temperature",
          colorScale: ["#1e3a8a", "#3b82f6", "#60a5fa", "#fbbf24", "#f59e0b", "#dc2626"],
        }
      case "salinity":
        return {
          unit: "PSU",
          label: "Salinity",
          colorScale: ["#0f172a", "#1e293b", "#334155", "#64748b", "#94a3b8", "#cbd5e1"],
        }
      case "oxygen":
        return {
          unit: "μmol/kg",
          label: "Oxygen",
          colorScale: ["#7f1d1d", "#dc2626", "#f87171", "#86efac", "#22c55e", "#15803d"],
        }
    }
  }

  const config = getParameterConfig()

  // Group data by date and depth
  const groupedData = data.reduce(
    (acc, item) => {
      const key = `${item.date}-${item.depth}`
      acc[key] = item
      return acc
    },
    {} as Record<string, HeatmapData>,
  )

  // Get unique dates and depths
  const uniqueDates = [...new Set(data.map((d) => d.date))].sort()
  const uniqueDepths = [...new Set(data.map((d) => d.depth))].sort((a, b) => a - b)

  // Calculate value range for color scaling
  const values = data.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  const getColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue)
    const colorIndex = Math.floor(normalized * (config.colorScale.length - 1))
    return config.colorScale[Math.min(colorIndex, config.colorScale.length - 1)]
  }

  const getCellData = (date: string, depth: number) => {
    return groupedData[`${date}-${depth}`]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-orange-500" />
            {title || `${config.label} Heatmap`}
          </CardTitle>
          {floatId && (
            <Badge variant="outline" className="text-xs">
              Float {floatId}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Range: {minValue.toFixed(1)} - {maxValue.toFixed(1)} {config.unit}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Color Scale:</span>
            <div className="flex">
              {config.colorScale.map((color, index) => (
                <div key={index} className="w-4 h-4" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid gap-1" style={{ gridTemplateColumns: `60px repeat(${uniqueDates.length}, 1fr)` }}>
                {/* Header row */}
                <div className="text-xs font-medium text-muted-foreground p-2">Depth</div>
                {uniqueDates.map((date) => (
                  <div key={date} className="text-xs font-medium text-muted-foreground p-2 text-center">
                    {new Date(date).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </div>
                ))}

                {/* Data rows */}
                {uniqueDepths.map((depth) => (
                  <>
                    <div
                      key={`depth-${depth}`}
                      className={`text-xs font-medium p-2 cursor-pointer rounded ${
                        selectedDepth === depth ? "bg-blue-100 text-blue-900" : "text-muted-foreground"
                      }`}
                      onClick={() => setSelectedDepth(selectedDepth === depth ? null : depth)}
                    >
                      {depth}m
                    </div>
                    {uniqueDates.map((date) => {
                      const cellData = getCellData(date, depth)
                      return (
                        <div
                          key={`${date}-${depth}`}
                          className="aspect-square rounded cursor-pointer border border-gray-200 flex items-center justify-center text-xs font-medium"
                          style={{
                            backgroundColor: cellData ? getColor(cellData.value) : "#f3f4f6",
                            color: cellData && cellData.value > (minValue + maxValue) / 2 ? "white" : "black",
                          }}
                          title={
                            cellData ? `${date}, ${depth}m: ${cellData.value.toFixed(2)} ${config.unit}` : "No data"
                          }
                        >
                          {cellData ? cellData.value.toFixed(1) : "-"}
                        </div>
                      )
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>

          {/* Selected depth details */}
          {selectedDepth && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Depth {selectedDepth}m Analysis</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Average:</span>{" "}
                  {(
                    data.filter((d) => d.depth === selectedDepth).reduce((sum, d) => sum + d.value, 0) /
                    data.filter((d) => d.depth === selectedDepth).length
                  ).toFixed(2)}{" "}
                  {config.unit}
                </div>
                <div>
                  <span className="font-medium">Min:</span>{" "}
                  {Math.min(...data.filter((d) => d.depth === selectedDepth).map((d) => d.value)).toFixed(2)}{" "}
                  {config.unit}
                </div>
                <div>
                  <span className="font-medium">Max:</span>{" "}
                  {Math.max(...data.filter((d) => d.depth === selectedDepth).map((d) => d.value)).toFixed(2)}{" "}
                  {config.unit}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
