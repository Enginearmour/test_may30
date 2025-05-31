-- Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS maintenance_records;
DROP TABLE IF EXISTS trucks;
DROP TABLE IF EXISTS companies;

-- Create companies table
CREATE TABLE companies (
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
CREATE TABLE trucks (
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
CREATE TABLE maintenance_records (
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
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_trucks_company_id ON trucks(company_id);
CREATE INDEX idx_maintenance_records_truck_id ON maintenance_records(truck_id);
CREATE INDEX idx_maintenance_records_company_id ON maintenance_records(company_id);
CREATE INDEX idx_trucks_vin ON trucks(vin);
CREATE INDEX idx_maintenance_records_performed_at ON maintenance_records(performed_at);
CREATE INDEX idx_maintenance_records_maintenance_type ON maintenance_records(maintenance_type);
