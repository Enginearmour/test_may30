/*
  # Add service role policy for companies table
  
  1. Changes
     - Add a policy that allows the service role to insert into the companies table
     - This enables company creation during the registration process
  
  2. Security
     - Maintains existing user-level policies
     - Adds specific permission for the service role
*/

-- Add policy for service role to insert companies
CREATE POLICY "Service role can insert companies"
  ON companies
  FOR INSERT
  TO service_role
  WITH CHECK (true);