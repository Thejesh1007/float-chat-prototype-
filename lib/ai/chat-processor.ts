/**
 * AI Chat Processor for Float Chat
 * Handles natural language queries about oceanographic data using RAG
 */

import { createClient } from "@/lib/supabase/server"
import { VectorEmbeddingsGenerator } from "@/lib/data-processing/vector-embeddings"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  queryType?: string
  executionTime?: number
}

export interface QueryResult {
  response: string
  queryType: string
  executionTime: number
  dataUsed: any[]
  visualizations?: string[]
}

export class ChatProcessor {
  private supabase: any
  private embeddingsGenerator: VectorEmbeddingsGenerator

  constructor() {
    this.initializeSupabase()
    this.embeddingsGenerator = new VectorEmbeddingsGenerator()
  }

  private async initializeSupabase() {
    this.supabase = await createClient()
  }

  /**
   * Process user query and generate AI response
   */
  async processQuery(query: string, sessionId: string): Promise<QueryResult> {
    const startTime = Date.now()
    console.log(`[v0] Processing query: ${query}`)

    if (!this.supabase) {
      await this.initializeSupabase()
    }

    try {
      // Analyze query type and intent
      const queryAnalysis = this.analyzeQuery(query)

      // Retrieve relevant data based on query
      const relevantData = await this.retrieveRelevantData(query, queryAnalysis)

      // Generate AI response using RAG
      const response = await this.generateResponse(query, queryAnalysis, relevantData)

      const executionTime = Date.now() - startTime

      // Store chat session
      await this.storeChatSession(sessionId, query, response, queryAnalysis.type, executionTime)

      console.log(`[v0] Query processed in ${executionTime}ms`)

      return {
        response,
        queryType: queryAnalysis.type,
        executionTime,
        dataUsed: relevantData,
        visualizations: queryAnalysis.visualizations,
      }
    } catch (error) {
      console.error(`[v0] Error processing query:`, error)
      throw error
    }
  }

  /**
   * Analyze user query to determine intent and data requirements
   */
  private analyzeQuery(query: string): {
    type: string
    parameters: any
    visualizations: string[]
    dataNeeded: string[]
  } {
    const lowerQuery = query.toLowerCase()

    // Temperature queries
    if (lowerQuery.includes("temperature") || lowerQuery.includes("temp")) {
      return {
        type: "temperature_query",
        parameters: this.extractParameters(query),
        visualizations: ["temperature_profile", "depth_chart"],
        dataNeeded: ["depth_measurements"],
      }
    }

    // Salinity queries
    if (lowerQuery.includes("salinity") || lowerQuery.includes("salt")) {
      return {
        type: "salinity_query",
        parameters: this.extractParameters(query),
        visualizations: ["salinity_profile", "depth_chart"],
        dataNeeded: ["depth_measurements"],
      }
    }

    // BGC queries
    if (
      lowerQuery.includes("oxygen") ||
      lowerQuery.includes("nitrate") ||
      lowerQuery.includes("ph") ||
      lowerQuery.includes("chlorophyll")
    ) {
      return {
        type: "bgc_query",
        parameters: this.extractParameters(query),
        visualizations: ["bgc_profile", "oxygen_chart"],
        dataNeeded: ["bgc_measurements"],
      }
    }

    // Float information queries
    if (lowerQuery.includes("float") && (lowerQuery.includes("location") || lowerQuery.includes("position"))) {
      return {
        type: "float_location_query",
        parameters: this.extractParameters(query),
        visualizations: ["map", "trajectory"],
        dataNeeded: ["argo_floats", "ocean_profiles"],
      }
    }

    // Comparison queries
    if (lowerQuery.includes("compare") || lowerQuery.includes("difference") || lowerQuery.includes("vs")) {
      return {
        type: "comparison_query",
        parameters: this.extractParameters(query),
        visualizations: ["comparison_chart", "overlay_plot"],
        dataNeeded: ["depth_measurements", "bgc_measurements"],
      }
    }

    // General data queries
    return {
      type: "general_query",
      parameters: this.extractParameters(query),
      visualizations: ["summary_chart"],
      dataNeeded: ["ocean_profiles", "depth_measurements"],
    }
  }

  /**
   * Extract parameters from query (float IDs, depth ranges, etc.)
   */
  private extractParameters(query: string): any {
    const params: any = {}

    // Extract float IDs
    const floatMatch = query.match(/float\s+(\d+)/i) || query.match(/(\d{7})/)
    if (floatMatch) {
      params.floatId = floatMatch[1]
    }

    // Extract depth ranges
    const depthMatch = query.match(/(\d+)\s*(?:m|meter|metre)/i)
    if (depthMatch) {
      params.depth = Number.parseInt(depthMatch[1])
    }

    // Extract date ranges
    const dateMatch = query.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})/)
    if (dateMatch) {
      params.date = dateMatch[1]
    }

    return params
  }

  /**
   * Retrieve relevant data from database based on query analysis
   */
  private async retrieveRelevantData(query: string, analysis: any): Promise<any[]> {
    const data = []

    try {
      // Get float data if specific float requested
      if (analysis.parameters.floatId) {
        const { data: floatData, error: floatError } = await this.supabase
          .from("argo_floats")
          .select("*")
          .eq("float_id", analysis.parameters.floatId)

        if (!floatError && floatData) {
          data.push(...floatData)
        }
      }

      // Get recent profiles for general queries
      if (analysis.dataNeeded.includes("ocean_profiles")) {
        const { data: profileData, error: profileError } = await this.supabase
          .from("ocean_profiles")
          .select(`
            *,
            argo_floats(*),
            depth_measurements(*),
            bgc_measurements(*)
          `)
          .order("profile_date", { ascending: false })
          .limit(analysis.parameters.floatId ? 10 : 5)

        if (!profileError && profileData) {
          data.push(...profileData)
        }
      }

      // Get specific measurement data
      if (analysis.dataNeeded.includes("depth_measurements") && analysis.parameters.floatId) {
        const { data: measurementData, error: measurementError } = await this.supabase
          .from("depth_measurements")
          .select(`
            *,
            ocean_profiles(*, argo_floats(*))
          `)
          .eq("ocean_profiles.float_id", analysis.parameters.floatId)
          .order("depth_meters", { ascending: true })
          .limit(50)

        if (!measurementError && measurementData) {
          data.push(...measurementData)
        }
      }
    } catch (error) {
      console.error(`[v0] Error retrieving data:`, error)
    }

    return data
  }

  /**
   * Generate AI response using retrieved data and RAG
   */
  private async generateResponse(query: string, analysis: any, data: any[]): Promise<string> {
    // In a real implementation, this would use an LLM API (OpenAI, Anthropic, etc.)
    // For the prototype, we'll generate contextual responses based on query type

    switch (analysis.type) {
      case "temperature_query":
        return this.generateTemperatureResponse(query, analysis, data)

      case "salinity_query":
        return this.generateSalinityResponse(query, analysis, data)

      case "bgc_query":
        return this.generateBGCResponse(query, analysis, data)

      case "float_location_query":
        return this.generateLocationResponse(query, analysis, data)

      case "comparison_query":
        return this.generateComparisonResponse(query, analysis, data)

      default:
        return this.generateGeneralResponse(query, analysis, data)
    }
  }

  /**
   * Generate temperature-specific response
   */
  private generateTemperatureResponse(query: string, analysis: any, data: any[]): string {
    if (data.length === 0) {
      return "I don't have temperature data available for your query. Please try asking about a specific ARGO float ID or check if the data has been processed."
    }

    const floatId = analysis.parameters.floatId
    if (floatId) {
      const profileData = data.find((d) => d.float_id === floatId || d.argo_floats?.float_id === floatId)
      if (profileData && profileData.depth_measurements) {
        const measurements = profileData.depth_measurements
        const surfaceTemp = measurements.find((m: any) => m.depth_meters <= 10)?.temperature_celsius
        const deepTemp = measurements[measurements.length - 1]?.temperature_celsius
        const maxDepth = Math.max(...measurements.map((m: any) => m.depth_meters))

        return (
          `Temperature profile for ARGO float ${floatId}:\n\n` +
          `• Surface temperature: ${surfaceTemp?.toFixed(1)}°C\n` +
          `• Deep temperature: ${deepTemp?.toFixed(1)}°C at ${maxDepth}m\n` +
          `• Profile shows typical ${this.getOceanRegion(profileData.latitude, profileData.longitude)} thermal structure\n` +
          `• Data collected on ${new Date(profileData.profile_date).toLocaleDateString()}\n\n` +
          `The temperature decreases with depth, showing the typical thermocline structure of tropical waters.`
        )
      }
    }

    return "I found temperature data from recent ARGO profiles. The data shows typical tropical Indian Ocean characteristics with warm surface waters (28-29°C) decreasing to about 4°C at 2000m depth. Would you like me to show you a specific float's temperature profile?"
  }

  /**
   * Generate salinity-specific response
   */
  private generateSalinityResponse(query: string, analysis: any, data: any[]): string {
    if (data.length === 0) {
      return "I don't have salinity data available for your query. Please specify an ARGO float ID or check if the data has been processed."
    }

    return "Salinity data from ARGO floats shows typical Arabian Sea characteristics with surface values around 34.8-35.2 PSU. The salinity profile indicates the influence of high evaporation rates in this region, with a subsurface salinity maximum around 100-200m depth."
  }

  /**
   * Generate BGC-specific response
   */
  private generateBGCResponse(query: string, analysis: any, data: any[]): string {
    if (data.length === 0) {
      return "I don't have biogeochemical data available for your query. BGC data is available from select ARGO floats with biogeochemical sensors."
    }

    return (
      "Biogeochemical data shows interesting patterns:\n\n" +
      "• Oxygen: High surface concentrations (220+ μmol/kg) decreasing to minimum values around 500m depth\n" +
      "• Nitrate: Low surface values increasing with depth, typical of nutrient cycling\n" +
      "• pH: Surface values around 8.1 decreasing slightly with depth\n" +
      "• Chlorophyll: Maximum concentrations in the upper 100m where photosynthesis occurs\n\n" +
      "This data reveals the complex biogeochemical processes in the Indian Ocean."
    )
  }

  /**
   * Generate location-specific response
   */
  private generateLocationResponse(query: string, analysis: any, data: any[]): string {
    if (data.length === 0) {
      return "I don't have location data for the requested float. Please check the float ID or try a different query."
    }

    const floatData = data.find((d) => d.float_id || d.argo_floats)
    if (floatData) {
      const lat = floatData.latitude || floatData.deployment_latitude
      const lon = floatData.longitude || floatData.deployment_longitude
      const region = this.getOceanRegion(lat, lon)

      return (
        `ARGO float location information:\n\n` +
        `• Current/Last position: ${lat?.toFixed(2)}°N, ${lon?.toFixed(2)}°E\n` +
        `• Region: ${region}\n` +
        `• Status: ${floatData.status || "Active"}\n` +
        `• Last transmission: ${new Date(floatData.last_transmission || floatData.profile_date).toLocaleDateString()}\n\n` +
        `This float is operating in the ${region}, providing valuable oceanographic data for climate research.`
      )
    }

    return "I found location data for ARGO floats in the Indian Ocean region. These autonomous instruments drift with ocean currents while collecting temperature, salinity, and biogeochemical data."
  }

  /**
   * Generate comparison response
   */
  private generateComparisonResponse(query: string, analysis: any, data: any[]): string {
    return "Comparison analysis shows variations in oceanographic parameters across different locations and time periods. The data reveals spatial and temporal patterns that are important for understanding ocean dynamics and climate variability in the Indian Ocean region."
  }

  /**
   * Generate general response
   */
  private generateGeneralResponse(query: string, analysis: any, data: any[]): string {
    if (data.length === 0) {
      return (
        "I don't have specific data to answer your query. Try asking about:\n\n" +
        "• Temperature profiles for a specific float\n" +
        "• Salinity data in the Arabian Sea\n" +
        "• Oxygen levels at different depths\n" +
        "• Float locations and trajectories\n\n" +
        "You can reference specific ARGO float IDs (like 5906468) for detailed information."
      )
    }

    return `I found ${data.length} relevant records in the ARGO database. The data includes temperature, salinity, and biogeochemical measurements from autonomous floats in the Indian Ocean region. This information is valuable for understanding ocean conditions and climate patterns. Would you like me to provide more specific details about any particular aspect?`
  }

  /**
   * Determine ocean region based on coordinates
   */
  private getOceanRegion(lat: number, lon: number): string {
    if (lat >= 0 && lat <= 30 && lon >= 40 && lon <= 100) {
      return "Arabian Sea"
    } else if (lat >= -30 && lat <= 30 && lon >= 20 && lon <= 120) {
      return "Indian Ocean"
    } else if (lat >= -10 && lat <= 30 && lon >= 90 && lon <= 120) {
      return "Bay of Bengal"
    }
    return "Indian Ocean region"
  }

  /**
   * Store chat session in database
   */
  private async storeChatSession(
    sessionId: string,
    userQuery: string,
    aiResponse: string,
    queryType: string,
    executionTime: number,
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from("chat_sessions").insert({
        session_id: sessionId,
        user_query: userQuery,
        ai_response: aiResponse,
        query_type: queryType,
        execution_time_ms: executionTime,
      })

      if (error) {
        console.error(`[v0] Error storing chat session:`, error)
      }
    } catch (error) {
      console.error(`[v0] Error storing chat session:`, error)
    }
  }

  /**
   * Get chat history for a session
   */
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    if (!this.supabase) {
      await this.initializeSupabase()
    }

    try {
      const { data, error } = await this.supabase
        .from("chat_sessions")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error(`[v0] Error fetching chat history:`, error)
        return []
      }

      const messages: ChatMessage[] = []
      data?.forEach((session) => {
        messages.push({
          id: `${session.id}-user`,
          role: "user",
          content: session.user_query,
          timestamp: new Date(session.created_at),
          queryType: session.query_type,
          executionTime: session.execution_time_ms,
        })

        messages.push({
          id: `${session.id}-assistant`,
          role: "assistant",
          content: session.ai_response,
          timestamp: new Date(session.created_at),
          queryType: session.query_type,
          executionTime: session.execution_time_ms,
        })
      })

      return messages
    } catch (error) {
      console.error(`[v0] Error fetching chat history:`, error)
      return []
    }
  }
}
