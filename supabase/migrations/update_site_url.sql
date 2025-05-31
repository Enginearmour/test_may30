/*
  # Update Site URL for Email Confirmation

  1. Changes
     - Update the site URL in Supabase auth settings to use the correct deployment URL
     - This ensures email confirmation links point to the correct domain
*/

-- Update the site URL in auth.config
UPDATE auth.config
SET site_url = 'https://uyabszlopgmrcmfstppn.supabase.co'
WHERE site_url = 'http://localhost:3000' OR site_url = 'http://localhost:5173';