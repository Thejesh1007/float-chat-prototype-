"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts"
import { GitCompare } from "lucide-react"

interface ComparisonData {
  depth: number
  float1_temperature?: number
  float1_salinity?: number
  float1_oxygen?: number
  float2_temperature?: number
  float2_salinity?: number
  float2_oxygen?: number
  location1?: string
  location2?: string
}

interface ComparisonChartProps {
  data: ComparisonData[]
  float1Id: string
  float2Id: string
  parameter: "temperature" | "salinity" | "oxygen"
  title?: string
}

export function ComparisonChart({ data, float1Id, float2Id, parameter, title }: ComparisonChartProps) {
  const getParameterConfig = () => {
    switch (parameter) {
      case "temperature":
        return {
          color1: "#ef4444",
          color2: "#f97316",
          unit: "°C",
          label: "Temperature",
        }
      case "salinity":
        return {
          color1: "#3b82f6",
          color2: "#06b6d4",
          unit: "PSU",
          label: "Salinity",
        }
      case "oxygen":
        return {
          color1: "#10b981",
          color2: "#84cc16",
          unit: "μmol/kg",
          label: "Oxygen",
        }
    }
  }

  const config = getParameterConfig()

  const formatTooltip = (value: any, name: string) => {
    const floatId = name.includes("float1") ? float1Id : float2Id
    return [`${value?.toFixed(2)} ${config.unit}`, `Float ${floatId}`]
  }

  // Prepare scatter plot data for correlation analysis
  const scatterData = data
    .filter((d) => d[`float1_${parameter}`] && d[`float2_${parameter}`])
    .map((d) => ({
      x: d[`float1_${parameter}` as keyof ComparisonData] as number,
      y: d[`float2_${parameter}` as keyof ComparisonData] as number,
      depth: d.depth,
    }))

  const calculateCorrelation = () => {
    if (scatterData.length < 2) return 0

    const n = scatterData.length
    const sumX = scatterData.reduce((sum, d) => sum + d.x, 0)
    const sumY = scatterData.reduce((sum, d) => sum + d.y, 0)
    const sumXY = scatterData.reduce((sum, d) => sum + d.x * d.y, 0)
    const sumX2 = scatterData.reduce((sum, d) => sum + d.x * d.x, 0)
    const sumY2 = scatterData.reduce((sum, d) => sum + d.y * d.y, 0)

    const correlation = (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    return isNaN(correlation) ? 0 : correlation
  }

  const correlation = calculateCorrelation()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-purple-600" />
            {title || `${config.label} Comparison`}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              Float {float1Id}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Float {float2Id}
            </Badge>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Correlation coefficient: {correlation.toFixed(3)} (
          {Math.abs(correlation) > 0.7 ? "Strong" : Math.abs(correlation) > 0.3 ? "Moderate" : "Weak"})
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="profiles" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profiles">Depth Profiles</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="mt-4">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey={`float1_${parameter}`}
                  domain={["dataMin", "dataMax"]}
                  label={{ value: `${config.label} (${config.unit})`, position: "insideBottom", offset: -5 }}
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

                <Line
                  type="monotone"
                  dataKey={`float1_${parameter}`}
                  stroke={config.color1}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  name={`Float ${float1Id}`}
                />

                <Line
                  type="monotone"
                  dataKey={`float2_${parameter}`}
                  stroke={config.color2}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  name={`Float ${float2Id}`}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="correlation" className="mt-4">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart data={scatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis
                  type="number"
                  dataKey="x"
                  name={`Float ${float1Id}`}
                  label={{
                    value: `Float ${float1Id} ${config.label} (${config.unit})`,
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name={`Float ${float2Id}`}
                  label={{
                    value: `Float ${float2Id} ${config.label} (${config.unit})`,
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value, name) => [
                    `${(value as number).toFixed(2)} ${config.unit}`,
                    name === "x" ? `Float ${float1Id}` : `Float ${float2Id}`,
                  ]}
                />
                <Scatter dataKey="y" fill={config.color1} />
              </ScatterChart>
            </ResponsiveContainer>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Statistical Analysis</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Correlation:</span> {correlation.toFixed(3)}
                </div>
                <div>
                  <span className="font-medium">Data Points:</span> {scatterData.length}
                </div>
                <div>
                  <span className="font-medium">Relationship:</span>{" "}
                  {Math.abs(correlation) > 0.7 ? "Strong" : Math.abs(correlation) > 0.3 ? "Moderate" : "Weak"}
                </div>
                <div>
                  <span className="font-medium">Direction:</span> {correlation > 0 ? "Positive" : "Negative"}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
