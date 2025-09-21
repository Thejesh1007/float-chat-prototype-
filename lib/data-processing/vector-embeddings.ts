/**
 * Vector Embeddings Generator for RAG Pipeline
 * Creates embeddings for oceanographic data to enable semantic search
 */

export interface EmbeddingData {
  contentType: "profile" | "measurement" | "metadata" | "float_info"
  contentId: string
  contentText: string
  metadata: Record<string, any>
}

export class VectorEmbeddingsGenerator {
  private supabase: any

  constructor() {
    this.initializeSupabase()
  }

  private async initializeSupabase() {
    const { createClient } = await import("@/lib/supabase/server")
    this.supabase = await createClient()
  }

  /**
   * Generate embeddings for ocean profile data
   * In a real implementation, this would use OpenAI's embedding API
   */
  async generateProfileEmbeddings(profileId: string): Promise<void> {
    if (!this.supabase) {
      await this.initializeSupabase()
    }

    console.log(`[v0] Generating embeddings for profile ${profileId}`)

    try {
      // Fetch profile data with measurements
      const { data: profile, error: profileError } = await this.supabase
        .from("ocean_profiles")
        .select(`
          *,
          argo_floats(*),
          depth_measurements(*),
          bgc_measurements(*)
        `)
        .eq("id", profileId)
        .single()

      if (profileError) throw profileError

      // Generate profile summary text
      const profileText = this.generateProfileText(profile)

      // Generate measurement summaries
      const measurementTexts = this.generateMeasurementTexts(profile)

      // Create embeddings (simulated for prototype)
      const embeddings = [
        {
          contentType: "profile" as const,
          contentId: profileId,
          contentText: profileText,
          metadata: {
            float_id: profile.float_id,
            latitude: profile.latitude,
            longitude: profile.longitude,
            profile_date: profile.profile_date,
            cycle_number: profile.cycle_number,
          },
        },
        ...measurementTexts.map((text) => ({
          contentType: "measurement" as const,
          contentId: profileId,
          contentText: text.content,
          metadata: {
            ...text.metadata,
            profile_id: profileId,
            float_id: profile.float_id,
          },
        })),
      ]

      // Store embeddings in database
      await this.storeEmbeddings(embeddings)

      console.log(`[v0] Generated ${embeddings.length} embeddings for profile ${profileId}`)
    } catch (error) {
      console.error(`[v0] Error generating embeddings:`, error)
      throw error
    }
  }

  /**
   * Generate descriptive text for ocean profile
   */
  private generateProfileText(profile: any): string {
    const date = new Date(profile.profile_date).toLocaleDateString()
    const location = `${profile.latitude.toFixed(2)}°N, ${profile.longitude.toFixed(2)}°E`

    let text = `ARGO float ${profile.float_id} profile from ${date} at location ${location}. `
    text += `This is cycle ${profile.cycle_number} data from the ${this.getOceanRegion(profile.latitude, profile.longitude)}. `

    if (profile.depth_measurements && profile.depth_measurements.length > 0) {
      const maxDepth = Math.max(...profile.depth_measurements.map((m: any) => m.depth_meters))
      const surfaceTemp = profile.depth_measurements.find((m: any) => m.depth_meters <= 10)?.temperature_celsius
      const deepTemp = profile.depth_measurements[profile.depth_measurements.length - 1]?.temperature_celsius

      text += `Profile extends to ${maxDepth}m depth. `
      if (surfaceTemp) text += `Surface temperature: ${surfaceTemp.toFixed(1)}°C. `
      if (deepTemp) text += `Deep temperature: ${deepTemp.toFixed(1)}°C. `
    }

    if (profile.bgc_measurements && profile.bgc_measurements.length > 0) {
      text += `Biogeochemical data available including oxygen, nitrate, pH, and chlorophyll measurements. `
    }

    return text
  }

  /**
   * Generate measurement-specific texts for embeddings
   */
  private generateMeasurementTexts(profile: any): Array<{ content: string; metadata: any }> {
    const texts = []

    // Temperature profile text
    if (profile.depth_measurements && profile.depth_measurements.length > 0) {
      const tempData = profile.depth_measurements
        .filter((m: any) => m.temperature_celsius !== null)
        .sort((a: any, b: any) => a.depth_meters - b.depth_meters)

      if (tempData.length > 0) {
        const surfaceTemp = tempData[0].temperature_celsius
        const deepTemp = tempData[tempData.length - 1].temperature_celsius
        const maxDepth = tempData[tempData.length - 1].depth_meters

        texts.push({
          content: `Temperature profile for ARGO float ${profile.float_id}: Surface temperature ${surfaceTemp.toFixed(1)}°C decreasing to ${deepTemp.toFixed(1)}°C at ${maxDepth}m depth. Typical ${this.getOceanRegion(profile.latitude, profile.longitude)} thermal structure.`,
          metadata: {
            measurement_type: "temperature",
            surface_value: surfaceTemp,
            deep_value: deepTemp,
            max_depth: maxDepth,
          },
        })
      }

      // Salinity profile text
      const salData = profile.depth_measurements
        .filter((m: any) => m.salinity_psu !== null)
        .sort((a: any, b: any) => a.depth_meters - b.depth_meters)

      if (salData.length > 0) {
        const surfaceSal = salData[0].salinity_psu
        const deepSal = salData[salData.length - 1].salinity_psu

        texts.push({
          content: `Salinity profile for ARGO float ${profile.float_id}: Surface salinity ${surfaceSal.toFixed(2)} PSU varying to ${deepSal.toFixed(2)} PSU at depth. Shows ${this.getOceanRegion(profile.latitude, profile.longitude)} water mass characteristics.`,
          metadata: {
            measurement_type: "salinity",
            surface_value: surfaceSal,
            deep_value: deepSal,
          },
        })
      }
    }

    // BGC measurements text
    if (profile.bgc_measurements && profile.bgc_measurements.length > 0) {
      const oxygenData = profile.bgc_measurements
        .filter((m: any) => m.oxygen_umol_kg !== null)
        .sort((a: any, b: any) => a.depth_meters - b.depth_meters)

      if (oxygenData.length > 0) {
        const surfaceO2 = oxygenData[0].oxygen_umol_kg
        const minO2 = Math.min(...oxygenData.map((m: any) => m.oxygen_umol_kg))

        texts.push({
          content: `Oxygen profile for ARGO float ${profile.float_id}: Surface oxygen ${surfaceO2.toFixed(1)} μmol/kg with minimum of ${minO2.toFixed(1)} μmol/kg indicating oxygen minimum zone presence.`,
          metadata: {
            measurement_type: "oxygen",
            surface_value: surfaceO2,
            minimum_value: minO2,
          },
        })
      }
    }

    return texts
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
   * Store embeddings in database
   * In a real implementation, this would generate actual vector embeddings
   */
  private async storeEmbeddings(embeddings: EmbeddingData[]): Promise<void> {
    const embeddingRecords = embeddings.map((embedding) => ({
      content_type: embedding.contentType,
      content_id: embedding.contentId,
      embedding_vector: this.generateMockEmbedding(), // Mock 1536-dimensional vector
      content_text: embedding.contentText,
      metadata: embedding.metadata,
    }))

    const { error } = await this.supabase.from("data_embeddings").insert(embeddingRecords)

    if (error) {
      console.error(`[v0] Error storing embeddings:`, error)
      throw error
    }
  }

  /**
   * Generate mock embedding vector for prototype
   * In production, this would call OpenAI's embedding API
   */
  private generateMockEmbedding(): number[] {
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1)
  }

  /**
   * Search for similar content using embeddings
   */
  async searchSimilarContent(query: string, limit = 5): Promise<any[]> {
    if (!this.supabase) {
      await this.initializeSupabase()
    }

    // In a real implementation, this would:
    // 1. Generate embedding for the query
    // 2. Use vector similarity search (cosine similarity)
    // 3. Return most similar content

    // For prototype, return recent relevant content
    const { data, error } = await this.supabase
      .from("data_embeddings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error(`[v0] Error searching embeddings:`, error)
      return []
    }

    return data || []
  }
}
