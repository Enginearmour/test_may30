/*
  # Register Engine Armour company

  1. New Data
    - Create user for dan@morempg.ca
    - Register Engine Armour company
  
  2. Details
    - Company Name: Engine Armour
    - Address: 106 Rue Portage Caraquet NB
    - Phone: 506-720-0650
    - Email: dan@morempg.ca
*/

-- First, create the user if it doesn't exist
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO user_id FROM auth.users WHERE email = 'dan@morempg.ca';
  
  -- If user doesn't exist, create it
  IF user_id IS NULL THEN
    -- Insert into auth.users
    user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmed_at
    ) VALUES (
      user_id,
      'dan@morempg.ca',
      -- This is a hashed version of 'Jdm159753!'
      crypt('Jdm159753!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      now()
    );
    
    -- Insert into auth.identities
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      user_id,
      jsonb_build_object('sub', user_id, 'email', 'dan@morempg.ca'),
      'email',
      now(),
      now()
    );
  ELSE
    -- User already exists, get the user_id
    SELECT id INTO user_id FROM auth.users WHERE email = 'dan@morempg.ca';
  END IF;
  
  -- Now insert the company if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM companies WHERE user_id = user_id) THEN
    INSERT INTO companies (
      user_id,
      name,
      address,
      phone,
      email
    ) VALUES (
      user_id,
      'Engine Armour',
      '106 Rue Portage Caraquet NB',
      '506-720-0650',
      'dan@morempg.ca'
    );
  END IF;
END $$;