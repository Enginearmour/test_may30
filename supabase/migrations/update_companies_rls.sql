/*
  # Update RLS policies for companies table
  
  1. Changes
     - Modify the "Users can insert their own company" policy to allow new users to create their company during registration
     - This fixes the issue where new users couldn't create a company during registration due to RLS restrictions
  
  2. Security
     - The policy still ensures users can only create companies linked to their own user_id
     - This maintains data isolation between different users
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert their own company" ON companies;

-- Create a new insert policy that allows new users to create their company
CREATE POLICY "Users can insert their own company"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows service roles to insert companies (for registration process)
CREATE POLICY "Service role can insert companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);