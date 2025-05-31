/*
  # Simplify RLS policies for companies table
  
  1. Changes
     - Drop all existing policies for the companies table
     - Create simplified policies that focus on authenticated users:
       - Users can view their own company
       - Users can update their own company
       - Users can insert companies linked to their user_id
  
  2. Security
     - Maintains data isolation between users
     - Ensures proper access control for all operations
     - Simplifies the security model to avoid conflicts
*/

-- Drop all existing policies for companies table
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can update their own company" ON companies;
DROP POLICY IF EXISTS "Users can insert their own company" ON companies;
DROP POLICY IF EXISTS "Service role can insert companies" ON companies;
DROP POLICY IF EXISTS "Allow public company creation during registration" ON companies;

-- Create simplified policies
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