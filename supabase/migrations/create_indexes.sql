/*
  # Create additional indexes for performance optimization

  1. Changes
    - Add index on trucks.vin for faster lookups
    - Add index on maintenance_records.performed_at for date-based queries
    - Add index on maintenance_records.maintenance_type for filtering by type
*/

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_trucks_vin ON trucks(vin);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_performed_at ON maintenance_records(performed_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_maintenance_type ON maintenance_records(maintenance_type);