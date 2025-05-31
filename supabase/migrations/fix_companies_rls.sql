/*
  # Fix RLS policies for companies table
  
  1. Changes
     - Drop all existing policies for the companies table
     - Create new, properly configured policies that allow:
       - Users to view their own company
       - Users to update their own company
       - Users to insert companies linked to their user_id
       - Public access for inserting companies during registration
  
  2. Security
     - Maintains data isolation between users
     - Allows the registration process to work correctly
     - Ensures proper access control for all operations
*/

-- Drop all existing policies for companies table
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can update their own company" ON companies;
DROP POLICY IF EXISTS "Users can insert their own company" ON companies;
DROP POLICY IF EXISTS "Service role can insert companies" ON companies;

-- Create new policies with proper configuration
-- Select policy: Users can only view their own company
CREATE POLICY "Users can view their own company"
  ON companies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Update policy: Users can only update their own company
CREATE POLICY "Users can update their own company"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert policy: Users can insert companies linked to their user_id
CREATE POLICY "Users can insert their own company"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Public insert policy: Allow public access for registration
CREATE POLICY "Allow public company creation during registration"
  ON companies
  FOR INSERT
  TO public
  WITH CHECK (true);