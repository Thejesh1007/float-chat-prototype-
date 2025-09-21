"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, MapPin } from "lucide-react"

interface ActivityItem {
  id: string
  type: "profile" | "processing" | "query"
  floatId?: string
  location?: string
  timestamp: Date
  details: string
  status?: "completed" | "processing" | "error"
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "profile":
        return <Waves className="h-4 w-4 text-blue-600" />
      case "processing":
        return <Database className="h-4 w-4 text-purple-600" />
      case "query":
        return <MessageSquare className="h-4 w-4 text-green-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {activity.floatId && (
                      <Badge variant="outline" className="text-xs">
                        Float {activity.floatId}
                      </Badge>
                    )}
                    {activity.status && (
                      <Badge className={`text-xs ${getStatusColor(activity.status)}`}>{activity.status}</Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-900 mb-1">{activity.details}</p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(activity.timestamp)}
                    </span>
                    {activity.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {activity.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Import missing icons
import { Waves, Database, MessageSquare } from "lucide-react"
