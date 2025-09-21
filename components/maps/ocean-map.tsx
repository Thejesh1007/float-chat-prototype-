"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Navigation, ZoomIn, ZoomOut } from "lucide-react"
import { useState, useRef } from "react"

interface FloatLocation {
  id: string
  floatId: string
  latitude: number
  longitude: number
  status: "active" | "inactive"
  lastTransmission: string
  temperature?: number
  salinity?: number
  depth?: number
}

interface OceanMapProps {
  floats: FloatLocation[]
  center?: [number, number]
  zoom?: number
  showTrajectories?: boolean
  selectedFloat?: string
}

export function OceanMap({
  floats,
  center = [15.5, 68.2],
  zoom = 6,
  showTrajectories = false,
  selectedFloatProp,
}: OceanMapProps) {
  const [mapCenter, setMapCenter] = useState(center)
  const [mapZoom, setMapZoom] = useState(zoom)
  const [selectedFloatId, setSelectedFloatId] = useState<string | null>(selectedFloatProp || null)
  const [mapLayer, setMapLayer] = useState<"satellite" | "ocean" | "bathymetry">("ocean")
  const mapRef = useRef<HTMLDivElement>(null)

  const selectedFloat = floats.find((f) => f.floatId === selectedFloatId)

  // Simulate map interactions (in a real implementation, this would use Leaflet or similar)
  const handleFloatClick = (floatId: string) => {
    setSelectedFloatId(floatId)
    const float = floats.find((f) => f.floatId === floatId)
    if (float) {
      setMapCenter([float.latitude, float.longitude])
    }
  }

  const zoomIn = () => setMapZoom((prev) => Math.min(prev + 1, 18))
  const zoomOut = () => setMapZoom((prev) => Math.max(prev - 1, 2))

  const getFloatColor = (status: string) => {
    return status === "active" ? "#10b981" : "#ef4444"
  }

  const getMapStyle = () => {
    switch (mapLayer) {
      case "satellite":
        return "bg-gradient-to-br from-blue-900 via-blue-700 to-green-800"
      case "bathymetry":
        return "bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600"
      default:
        return "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            ARGO Float Locations
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {floats.filter((f) => f.status === "active").length} Active
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {floats.length} Total
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="map" className="w-full">
          <div className="px-6 pb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map">Interactive Map</TabsTrigger>
              <TabsTrigger value="list">Float List</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="map" className="mt-0">
            <div className="relative">
              {/* Map Controls */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="bg-white rounded-lg shadow-lg p-2">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant={mapLayer === "ocean" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMapLayer("ocean")}
                      className="text-xs"
                    >
                      Ocean
                    </Button>
                    <Button
                      variant={mapLayer === "satellite" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMapLayer("satellite")}
                      className="text-xs"
                    >
                      Satellite
                    </Button>
                    <Button
                      variant={mapLayer === "bathymetry" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMapLayer("bathymetry")}
                      className="text-xs"
                    >
                      Bathymetry
                    </Button>
                  </div>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
                <Button variant="outline" size="sm" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Map Container */}
              <div ref={mapRef} className={`relative h-[500px] ${getMapStyle()} rounded-lg overflow-hidden`}>
                {/* Ocean Grid Lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                  <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Float Markers */}
                {floats.map((float, index) => {
                  const x = ((float.longitude - (mapCenter[1] - 5)) / 10) * 100
                  const y = ((mapCenter[0] + 5 - float.latitude) / 10) * 100

                  if (x < 0 || x > 100 || y < 0 || y > 100) return null

                  return (
                    <div
                      key={float.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ left: `${x}%`, top: `${y}%` }}
                      onClick={() => handleFloatClick(float.floatId)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-200 ${
                          selectedFloatId === float.floatId ? "scale-150" : "hover:scale-125"
                        }`}
                        style={{ backgroundColor: getFloatColor(float.status) }}
                      />

                      {/* Float Label */}
                      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap">
                        {float.floatId}
                      </div>

                      {/* Trajectory Line (if enabled) */}
                      {showTrajectories && index > 0 && (
                        <svg className="absolute inset-0 pointer-events-none">
                          <line
                            x1="0"
                            y1="0"
                            x2={((floats[index - 1].longitude - float.longitude) / 10) * 500}
                            y2={((float.latitude - floats[index - 1].latitude) / 10) * 500}
                            stroke={getFloatColor(float.status)}
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.6"
                          />
                        </svg>
                      )}
                    </div>
                  )
                })}

                {/* Region Labels */}
                <div className="absolute top-8 left-8 text-white font-bold text-lg opacity-80">Arabian Sea</div>
                <div className="absolute bottom-8 right-8 text-white font-bold text-lg opacity-80">Indian Ocean</div>
              </div>

              {/* Selected Float Info Panel */}
              {selectedFloat && (
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getFloatColor(selectedFloat.status) }}
                    />
                    <h4 className="font-bold">Float {selectedFloat.floatId}</h4>
                    <Badge variant={selectedFloat.status === "active" ? "default" : "secondary"} className="text-xs">
                      {selectedFloat.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Position:</span>
                      <span>
                        {selectedFloat.latitude.toFixed(2)}°N, {selectedFloat.longitude.toFixed(2)}°E
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Update:</span>
                      <span>{new Date(selectedFloat.lastTransmission).toLocaleDateString()}</span>
                    </div>
                    {selectedFloat.temperature && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperature:</span>
                        <span>{selectedFloat.temperature.toFixed(1)}°C</span>
                      </div>
                    )}
                    {selectedFloat.salinity && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Salinity:</span>
                        <span>{selectedFloat.salinity.toFixed(2)} PSU</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-0 px-6">
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {floats.map((float) => (
                <div
                  key={float.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedFloatId === float.floatId
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                  onClick={() => handleFloatClick(float.floatId)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getFloatColor(float.status) }} />
                      <span className="font-medium">Float {float.floatId}</span>
                    </div>
                    <Badge variant={float.status === "active" ? "default" : "secondary"} className="text-xs">
                      {float.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <Navigation className="h-3 w-3 inline mr-1" />
                      {float.latitude.toFixed(2)}°N, {float.longitude.toFixed(2)}°E
                    </div>
                    <div>Last: {new Date(float.lastTransmission).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
