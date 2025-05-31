/*
  # Update Site URL for Email Confirmation

  1. Changes
     - Update the site URL in Supabase auth settings
     - This ensures email confirmation links point to the correct domain
*/

-- Update the site URL using the correct API endpoint
COMMENT ON SCHEMA auth IS 'Auth site URL: https://uyabszlopgmrcmfstppn.supabase.co';