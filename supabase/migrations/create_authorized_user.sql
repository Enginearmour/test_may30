/*
  # Create Authorized User Directly
  
  1. Purpose
    - Create a pre-authorized user account directly in auth tables
    - Skip email verification process
    - Create associated company record
  
  2. Details
    - Email: dan@morempg.ca
    - Password: Jdm159753!
    - Company: Engine Armour
*/

DO $$
DECLARE
  v_user_id uuid;
  v_existing_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_existing_user_id FROM auth.users WHERE email = 'dan@morempg.ca';
  
  -- If user exists, remove it first (and any associated company records)
  IF v_existing_user_id IS NOT NULL THEN
    -- Delete any company records first to avoid foreign key constraints
    DELETE FROM public.companies WHERE user_id = v_existing_user_id;
    
    -- Then delete the user auth records
    DELETE FROM auth.identities WHERE user_id = v_existing_user_id;
    DELETE FROM auth.users WHERE id = v_existing_user_id;
  END IF;
  
  -- Create a new user ID
  v_user_id := gen_random_uuid();
  
  -- Insert directly into auth.users with pre-confirmed email
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'dan@morempg.ca',
    crypt('Jdm159753!', gen_salt('bf')),
    now(),  -- Email already confirmed
    now(),  -- Last sign in time set to now
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );
  
  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    v_user_id,
    jsonb_build_object('sub', v_user_id, 'email', 'dan@morempg.ca'),
    'email',
    'dan@morempg.ca',
    now(),
    now()
  );
  
  -- Create the company record
  INSERT INTO public.companies (
    user_id,
    name,
    address,
    phone
  ) VALUES (
    v_user_id,
    'Engine Armour',
    '106 Rue Portage Caraquet NB',
    '506-720-0650'
  );
END $$;