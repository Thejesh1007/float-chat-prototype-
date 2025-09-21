import { type NextRequest, NextResponse } from "next/server"
import { ChatProcessor } from "@/lib/ai/chat-processor"

/**
 * API endpoint for processing chat queries
 * Handles natural language queries about oceanographic data
 */
export async function POST(request: NextRequest) {
  try {
    const { query, sessionId } = await request.json()

    if (!query || !sessionId) {
      return NextResponse.json({ error: "Query and session ID are required" }, { status: 400 })
    }

    console.log(`[v0] Processing chat query: ${query}`)

    const chatProcessor = new ChatProcessor()
    const result = await chatProcessor.processQuery(query, sessionId)

    return NextResponse.json({
      success: true,
      response: result.response,
      queryType: result.queryType,
      executionTime: result.executionTime,
      dataUsed: result.dataUsed.length,
      visualizations: result.visualizations,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error processing chat query:", error)

    return NextResponse.json(
      {
        error: "Failed to process chat query",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

/**
 * GET endpoint to retrieve chat history
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID parameter is required" }, { status: 400 })
  }

  try {
    const chatProcessor = new ChatProcessor()
    const history = await chatProcessor.getChatHistory(sessionId)

    return NextResponse.json({
      success: true,
      messages: history,
      count: history.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching chat history:", error)

    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 })
  }
}
