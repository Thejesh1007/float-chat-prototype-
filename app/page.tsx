import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChatInterface } from "@/components/chat/chat-interface"
import { Bot, Database, Map, BarChart3, Waves, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Waves className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Float Chat</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">AI-Powered Oceanographic Data Platform</p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore ARGO ocean data through natural language queries, interactive visualizations, and comprehensive
            analysis tools
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary">Ministry of Earth Sciences</Badge>
            <Badge variant="outline">Smart India Hackathon 2025</Badge>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Bot className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">AI Chat Interface</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ask questions about ocean data in natural language and get intelligent responses
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Data Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automated NetCDF processing with vector embeddings for semantic search
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Visualizations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Interactive charts for temperature, salinity, and biogeochemical data analysis
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Map className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Ocean Maps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Interactive maps showing float locations, trajectories, and regional data
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Chat Interface */}
          <div className="lg:col-span-1">
            <ChatInterface sessionId={`home-${Date.now()}`} />
          </div>

          {/* Quick Access & Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-between bg-transparent">
                    Dashboard Overview
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/visualizations">
                  <Button variant="outline" className="w-full justify-between bg-transparent">
                    Data Visualizations
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/maps">
                  <Button variant="outline" className="w-full justify-between bg-transparent">
                    Ocean Maps
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sample Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-blue-50 rounded text-blue-800">
                    "Show me temperature data for float 5906468"
                  </div>
                  <div className="p-2 bg-green-50 rounded text-green-800">
                    "What's the salinity range in the Arabian Sea?"
                  </div>
                  <div className="p-2 bg-purple-50 rounded text-purple-800">
                    "Compare oxygen levels between different depths"
                  </div>
                  <div className="p-2 bg-orange-50 rounded text-orange-800">
                    "Where are the active ARGO floats located?"
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Service</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Ready
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Processing</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
