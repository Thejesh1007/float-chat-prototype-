-- Create tables for ARGO ocean data storage
-- This script sets up the core database schema for oceanographic data

-- Table for ARGO float metadata
CREATE TABLE IF NOT EXISTS argo_floats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  float_id VARCHAR(20) UNIQUE NOT NULL,
  platform_number VARCHAR(20),
  deployment_date DATE,
  deployment_latitude DECIMAL(10, 6),
  deployment_longitude DECIMAL(10, 6),
  status VARCHAR(20) DEFAULT 'active',
  last_transmission TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for temperature and salinity profiles
CREATE TABLE IF NOT EXISTS ocean_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  float_id VARCHAR(20) REFERENCES argo_floats(float_id),
  profile_date TIMESTAMP NOT NULL,
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  cycle_number INTEGER,
  profile_type VARCHAR(20) DEFAULT 'primary',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table for depth measurements (temperature, salinity, pressure)
CREATE TABLE IF NOT EXISTS depth_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES ocean_profiles(id) ON DELETE CASCADE,
  depth_meters DECIMAL(8, 2) NOT NULL,
  pressure_dbar DECIMAL(8, 2),
  temperature_celsius DECIMAL(6, 3),
  salinity_psu DECIMAL(6, 3),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table for BGC (Biogeochemical) data
CREATE TABLE IF NOT EXISTS bgc_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES ocean_profiles(id) ON DELETE CASCADE,
  depth_meters DECIMAL(8, 2) NOT NULL,
  oxygen_umol_kg DECIMAL(8, 3),
  nitrate_umol_kg DECIMAL(8, 3),
  ph_total DECIMAL(5, 3),
  chlorophyll_mg_m3 DECIMAL(8, 4),
  backscatter_m1 DECIMAL(10, 6),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table for storing processed NetCDF file metadata
CREATE TABLE IF NOT EXISTS netcdf_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  file_path TEXT,
  file_size_bytes BIGINT,
  processing_status VARCHAR(20) DEFAULT 'pending',
  processed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table for chat conversations and queries
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) UNIQUE NOT NULL,
  user_query TEXT NOT NULL,
  ai_response TEXT,
  query_type VARCHAR(50),
  execution_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table for storing vector embeddings for RAG
CREATE TABLE IF NOT EXISTS data_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50) NOT NULL, -- 'profile', 'measurement', 'metadata'
  content_id UUID NOT NULL, -- references to other table IDs
  embedding_vector VECTOR(1536), -- for OpenAI embeddings
  content_text TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_argo_floats_float_id ON argo_floats(float_id);
CREATE INDEX IF NOT EXISTS idx_ocean_profiles_float_id ON ocean_profiles(float_id);
CREATE INDEX IF NOT EXISTS idx_ocean_profiles_date ON ocean_profiles(profile_date);
CREATE INDEX IF NOT EXISTS idx_ocean_profiles_location ON ocean_profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_depth_measurements_profile_id ON depth_measurements(profile_id);
CREATE INDEX IF NOT EXISTS idx_depth_measurements_depth ON depth_measurements(depth_meters);
CREATE INDEX IF NOT EXISTS idx_bgc_measurements_profile_id ON bgc_measurements(profile_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_data_embeddings_content ON data_embeddings(content_type, content_id);

-- Enable Row Level Security (RLS) for data protection
ALTER TABLE argo_floats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocean_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE depth_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bgc_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE netcdf_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_embeddings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (research data should be accessible)
CREATE POLICY "Allow public read access to argo_floats" ON argo_floats FOR SELECT USING (true);
CREATE POLICY "Allow public read access to ocean_profiles" ON ocean_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read access to depth_measurements" ON depth_measurements FOR SELECT USING (true);
CREATE POLICY "Allow public read access to bgc_measurements" ON bgc_measurements FOR SELECT USING (true);
CREATE POLICY "Allow public read access to netcdf_files" ON netcdf_files FOR SELECT USING (true);
CREATE POLICY "Allow public read access to data_embeddings" ON data_embeddings FOR SELECT USING (true);

-- Chat sessions can be read/written by anyone (for demo purposes)
CREATE POLICY "Allow public access to chat_sessions" ON chat_sessions FOR ALL USING (true);
