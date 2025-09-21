import { type NextRequest, NextResponse } from "next/server"
import { NetCDFProcessor } from "@/lib/data-processing/netcdf-processor"
import { VectorEmbeddingsGenerator } from "@/lib/data-processing/vector-embeddings"

/**
 * API endpoint for processing NetCDF files
 * Handles file upload, processing, and embedding generation
 */
export async function POST(request: NextRequest) {
  try {
    const { filename, filePath } = await request.json()

    if (!filename || !filePath) {
      return NextResponse.json({ error: "Filename and file path are required" }, { status: 400 })
    }

    console.log(`[v0] Processing NetCDF file: ${filename}`)

    // Initialize processors
    const netcdfProcessor = new NetCDFProcessor()
    const embeddingsGenerator = new VectorEmbeddingsGenerator()

    // Process the NetCDF file and store data
    await netcdfProcessor.processAndStore(filename, filePath)

    // Generate embeddings for the processed data
    // In a real implementation, you'd get the profile ID from the processor
    // For now, we'll simulate this step
    console.log(`[v0] NetCDF processing completed for ${filename}`)

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${filename}`,
      filename,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error processing NetCDF file:", error)

    return NextResponse.json(
      {
        error: "Failed to process NetCDF file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

/**
 * GET endpoint to check processing status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  if (!filename) {
    return NextResponse.json({ error: "Filename parameter is required" }, { status: 400 })
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase.from("netcdf_files").select("*").eq("filename", filename).single()

    if (error) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    return NextResponse.json({
      filename: data.filename,
      status: data.processing_status,
      processedAt: data.processed_at,
      errorMessage: data.error_message,
      fileSize: data.file_size_bytes,
    })
  } catch (error) {
    console.error("[v0] Error checking file status:", error)

    return NextResponse.json({ error: "Failed to check file status" }, { status: 500 })
  }
}
