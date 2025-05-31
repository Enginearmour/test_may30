/*
  # Create initial schema for fleet maintenance app

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `address` (text)
      - `phone` (text)
      - `email` (text)
      - `website` (text)
      - `description` (text)
      - `created_at` (timestamptz)
    - `trucks`
      - `id` (uuid, primary key)
      - `company_id` (uuid, references companies)
      - `vin` (text)
      - `year` (integer)
      - `make` (text)
      - `model` (text)
      - `license_plate` (text)
      - `current_mileage` (integer)
      - `notes` (text)
      - `created_at` (timestamptz)
    - `maintenance_records`
      - `id` (uuid, primary key)
      - `truck_id` (uuid, references trucks)
      - `company_id` (uuid, references companies)
      - `maintenance_type` (text)
      - `performed_at` (timestamptz)
      - `mileage` (integer)
      - `part_make_model` (text)
      - `description` (text)
      - `next_due_mileage` (integer)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text,
  website text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create trucks table
CREATE TABLE IF NOT EXISTS trucks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies NOT NULL,
  vin text NOT NULL,
  year integer NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  license_plate text NOT NULL,
  current_mileage integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id uuid REFERENCES trucks NOT NULL,
  company_id uuid REFERENCES companies NOT NULL,
  maintenance_type text NOT NULL,
  performed_at timestamptz NOT NULL DEFAULT now(),
  mileage integer NOT NULL,
  part_make_model text,
  description text,
  next_due_mileage integer,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Create policies for companies
CREATE POLICY "Users can view their own company"
  ON companies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own company"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for trucks
CREATE POLICY "Users can view their company's trucks"
  ON trucks
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert trucks for their company"
  ON trucks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their company's trucks"
  ON trucks
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their company's trucks"
  ON trucks
  FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- Create policies for maintenance_records
CREATE POLICY "Users can view their company's maintenance records"
  ON maintenance_records
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert maintenance records for their company"
  ON maintenance_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their company's maintenance records"
  ON maintenance_records
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their company's maintenance records"
  ON maintenance_records
  FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_trucks_company_id ON trucks(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_truck_id ON maintenance_records(truck_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_company_id ON maintenance_records(company_id);