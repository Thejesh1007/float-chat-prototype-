-- Insert sample ARGO float data for demonstration
-- This provides realistic oceanographic data for testing the platform

-- Sample ARGO floats
INSERT INTO argo_floats (float_id, platform_number, deployment_date, deployment_latitude, deployment_longitude, status, last_transmission) VALUES
('5906468', '5906468', '2023-01-15', 15.5, 68.2, 'active', '2024-12-20 10:30:00'),
('5906469', '5906469', '2023-02-20', 12.8, 70.5, 'active', '2024-12-19 14:15:00'),
('5906470', '5906470', '2023-03-10', 18.2, 65.8, 'active', '2024-12-18 09:45:00'),
('5906471', '5906471', '2023-04-05', 20.1, 72.3, 'inactive', '2024-11-15 16:20:00');

-- Sample ocean profiles
INSERT INTO ocean_profiles (float_id, profile_date, latitude, longitude, cycle_number, profile_type) VALUES
('5906468', '2024-12-20 10:30:00', 15.52, 68.18, 245, 'primary'),
('5906468', '2024-12-10 11:15:00', 15.48, 68.25, 244, 'primary'),
('5906469', '2024-12-19 14:15:00', 12.85, 70.52, 189, 'primary'),
('5906469', '2024-12-09 13:30:00', 12.82, 70.48, 188, 'primary'),
('5906470', '2024-12-18 09:45:00', 18.25, 65.82, 156, 'primary'),
('5906471', '2024-11-15 16:20:00', 20.08, 72.35, 98, 'primary');

-- Sample depth measurements for the first profile
WITH first_profile AS (
  SELECT id FROM ocean_profiles WHERE float_id = '5906468' AND cycle_number = 245 LIMIT 1
)
INSERT INTO depth_measurements (profile_id, depth_meters, pressure_dbar, temperature_celsius, salinity_psu)
SELECT 
  fp.id,
  depth,
  depth * 1.02, -- approximate pressure conversion
  CASE 
    WHEN depth < 100 THEN 28.5 - (depth * 0.02)
    WHEN depth < 500 THEN 26.5 - (depth * 0.01)
    ELSE 4.2 - (depth * 0.001)
  END,
  CASE 
    WHEN depth < 100 THEN 34.8 + (depth * 0.001)
    WHEN depth < 500 THEN 35.2 + (depth * 0.0005)
    ELSE 34.9 + (depth * 0.0001)
  END
FROM first_profile fp,
UNNEST(ARRAY[5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1250, 1500, 1750, 2000]) AS depth;

-- Sample BGC measurements for the same profile
WITH first_profile AS (
  SELECT id FROM ocean_profiles WHERE float_id = '5906468' AND cycle_number = 245 LIMIT 1
)
INSERT INTO bgc_measurements (profile_id, depth_meters, oxygen_umol_kg, nitrate_umol_kg, ph_total, chlorophyll_mg_m3, backscatter_m1)
SELECT 
  fp.id,
  depth,
  CASE 
    WHEN depth < 100 THEN 220 - (depth * 0.5)
    WHEN depth < 500 THEN 180 - (depth * 0.2)
    ELSE 150 - (depth * 0.05)
  END,
  CASE 
    WHEN depth < 100 THEN 2.5 + (depth * 0.02)
    WHEN depth < 500 THEN 8.5 + (depth * 0.01)
    ELSE 25.2 + (depth * 0.005)
  END,
  CASE 
    WHEN depth < 100 THEN 8.1 - (depth * 0.001)
    WHEN depth < 500 THEN 7.9 - (depth * 0.0005)
    ELSE 7.8 - (depth * 0.0001)
  END,
  CASE 
    WHEN depth < 100 THEN 0.8 - (depth * 0.005)
    WHEN depth < 200 THEN 0.3 - (depth * 0.001)
    ELSE 0.05
  END,
  CASE 
    WHEN depth < 100 THEN 0.001 + (depth * 0.00001)
    ELSE 0.002 + (depth * 0.000001)
  END
FROM first_profile fp,
UNNEST(ARRAY[5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000]) AS depth;

-- Sample NetCDF file records
INSERT INTO netcdf_files (filename, file_path, file_size_bytes, processing_status, processed_at) VALUES
('R5906468_245.nc', '/data/argo/indian_ocean/R5906468_245.nc', 2048576, 'completed', '2024-12-20 11:00:00'),
('R5906469_189.nc', '/data/argo/indian_ocean/R5906469_189.nc', 1876543, 'completed', '2024-12-19 15:00:00'),
('R5906470_156.nc', '/data/argo/indian_ocean/R5906470_156.nc', 2234567, 'completed', '2024-12-18 10:30:00'),
('R5906471_098.nc', '/data/argo/indian_ocean/R5906471_098.nc', 1987654, 'completed', '2024-11-15 17:00:00');

-- Sample chat sessions
INSERT INTO chat_sessions (session_id, user_query, ai_response, query_type, execution_time_ms) VALUES
('session_001', 'Show me temperature profiles for float 5906468', 'Here are the temperature profiles for ARGO float 5906468. The data shows typical tropical Indian Ocean characteristics with warm surface waters around 28°C decreasing to about 4°C at 2000m depth.', 'data_query', 1250),
('session_002', 'What is the salinity range in the Arabian Sea?', 'Based on the available ARGO data, salinity in the Arabian Sea region ranges from 34.8 PSU at the surface to about 35.2 PSU at intermediate depths, showing the influence of high evaporation rates.', 'analysis_query', 2100),
('session_003', 'Compare oxygen levels between different depths', 'Oxygen concentrations show a typical profile with highest levels (220 μmol/kg) near the surface due to atmospheric exchange and photosynthesis, decreasing to minimum values around 500m depth in the oxygen minimum zone.', 'comparison_query', 1800);
