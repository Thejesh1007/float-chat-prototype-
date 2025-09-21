"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Route, Play, Pause, RotateCcw } from "lucide-react"
import { useState, useEffect } from "react"

interface TrajectoryPoint {
  date: string
  latitude: number
  longitude: number
  temperature?: number
  salinity?: number
  depth?: number
}

interface TrajectoryMapProps {
  floatId: string
  trajectory: TrajectoryPoint[]
  title?: string
}

export function TrajectoryMap({ floatId, trajectory, title }: TrajectoryMapProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000)

  // Auto-play trajectory
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= trajectory.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, playbackSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, trajectory.length])

  const currentPoint = trajectory[currentIndex]
  const visibleTrajectory = trajectory.slice(0, currentIndex + 1)

  const getBounds = () => {
    const lats = trajectory.map((p) => p.latitude)
    const lons = trajectory.map((p) => p.longitude)
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
    }
  }

  const bounds = getBounds()
  const centerLat = (bounds.minLat + bounds.maxLat) / 2
  const centerLon = (bounds.minLon + bounds.maxLon) / 2

  const getPointPosition = (point: TrajectoryPoint) => {
    const x = ((point.longitude - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * 80 + 10
    const y = ((bounds.maxLat - point.latitude) / (bounds.maxLat - bounds.minLat)) * 80 + 10
    return { x, y }
  }

  const handlePlay = () => {
    if (currentIndex >= trajectory.length - 1) {
      setCurrentIndex(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setIsPlaying(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-purple-600" />
            {title || `Float ${floatId} Trajectory`}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {trajectory.length} positions
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Trajectory Map */}
          <div className="relative h-[400px] bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-lg overflow-hidden">
            {/* Ocean Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
              <defs>
                <pattern id="trajectory-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#trajectory-grid)" />
            </svg>

            {/* Trajectory Path */}
            <svg className="absolute inset-0 w-full h-full">
              {visibleTrajectory.length > 1 && (
                <path
                  d={`M ${visibleTrajectory
                    .map((point) => {
                      const pos = getPointPosition(point)
                      return `${pos.x},${pos.y}`
                    })
                    .join(" L ")}`}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>

            {/* Trajectory Points */}
            {visibleTrajectory.map((point, index) => {
              const pos = getPointPosition(point)
              const isCurrent = index === currentIndex
              const isStart = index === 0
              const isEnd = index === trajectory.length - 1

              return (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div
                    className={`rounded-full border-2 border-white shadow-lg transition-all duration-300 ${
                      isCurrent
                        ? "w-6 h-6 bg-red-500 animate-pulse"
                        : isStart
                          ? "w-4 h-4 bg-green-500"
                          : isEnd
                            ? "w-4 h-4 bg-red-600"
                            : "w-3 h-3 bg-yellow-400"
                    }`}
                  />

                  {(isCurrent || isStart || isEnd) && (
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap">
                      {isStart ? "Start" : isEnd ? "End" : new Date(point.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Current Position Info */}
            {currentPoint && (
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
                <div className="font-bold text-sm mb-2">
                  Position {currentIndex + 1} of {trajectory.length}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{new Date(currentPoint.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position:</span>
                    <span>
                      {currentPoint.latitude.toFixed(2)}°N, {currentPoint.longitude.toFixed(2)}°E
                    </span>
                  </div>
                  {currentPoint.temperature && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Temp:</span>
                      <span>{currentPoint.temperature.toFixed(1)}°C</span>
                    </div>
                  )}
                  {currentPoint.salinity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Salinity:</span>
                      <span>{currentPoint.salinity.toFixed(2)} PSU</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Playback Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handlePlay}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <Slider
                  value={[currentIndex]}
                  onValueChange={([value]) => setCurrentIndex(value)}
                  max={trajectory.length - 1}
                  step={1}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-muted-foreground min-w-0">
                {currentIndex + 1}/{trajectory.length}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Speed:</span>
              <Slider
                value={[2000 - playbackSpeed]}
                onValueChange={([value]) => setPlaybackSpeed(2000 - value)}
                min={100}
                max={1900}
                step={100}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                {playbackSpeed < 500 ? "Fast" : playbackSpeed < 1000 ? "Medium" : "Slow"}
              </span>
            </div>
          </div>

          {/* Trajectory Statistics */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  trajectory.reduce((total, point, index) => {
                    if (index === 0) return 0
                    const prev = trajectory[index - 1]
                    const distance = Math.sqrt(
                      Math.pow((point.latitude - prev.latitude) * 111, 2) +
                        Math.pow(
                          (point.longitude - prev.longitude) * 111 * Math.cos((point.latitude * Math.PI) / 180),
                          2,
                        ),
                    )
                    return total + distance
                  }, 0),
                )}
              </div>
              <div className="text-xs text-muted-foreground">Total Distance (km)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(
                  (new Date(trajectory[trajectory.length - 1].date).getTime() -
                    new Date(trajectory[0].date).getTime()) /
                    (1000 * 60 * 60 * 24),
                )}
              </div>
              <div className="text-xs text-muted-foreground">Duration (days)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(
                  trajectory.reduce((total, point, index) => {
                    if (index === 0) return 0
                    const prev = trajectory[index - 1]
                    const distance = Math.sqrt(
                      Math.pow((point.latitude - prev.latitude) * 111, 2) +
                        Math.pow(
                          (point.longitude - prev.longitude) * 111 * Math.cos((point.latitude * Math.PI) / 180),
                          2,
                        ),
                    )
                    const days =
                      (new Date(point.date).getTime() - new Date(prev.date).getTime()) / (1000 * 60 * 60 * 24)
                    return total + distance / days
                  }, 0) /
                  (trajectory.length - 1)
                ).toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Avg Speed (km/day)</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
