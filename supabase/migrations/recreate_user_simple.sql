/*
  # Recreate User with Simple Approach
  
  1. Purpose
    - Create a fresh user with proper authentication credentials
    - Ensure proper linkage to company record
  
  2. Details
    - Email: dan@morempg.ca
    - Password: Jdm159753!
*/

DO $$
DECLARE
  v_user_id uuid;
  v_existing_user_id uuid;
  v_company_id uuid;
BEGIN
  -- Check for existing user
  SELECT id INTO v_existing_user_id FROM auth.users WHERE email = 'dan@morempg.ca';
  
  -- Check for existing company
  IF v_existing_user_id IS NOT NULL THEN
    SELECT id INTO v_company_id FROM public.companies WHERE user_id = v_existing_user_id;
  END IF;
  
  -- Clean up existing user if found
  IF v_existing_user_id IS NOT NULL THEN
    -- Delete auth records
    DELETE FROM auth.sessions WHERE user_id = v_existing_user_id;
    DELETE FROM auth.refresh_tokens WHERE user_id = v_existing_user_id;
    DELETE FROM auth.identities WHERE user_id = v_existing_user_id;
    
    -- If company exists, temporarily set user_id to NULL to avoid FK constraint
    IF v_company_id IS NOT NULL THEN
      ALTER TABLE public.companies DISABLE TRIGGER ALL;
      UPDATE public.companies SET user_id = NULL WHERE user_id = v_existing_user_id;
      ALTER TABLE public.companies ENABLE TRIGGER ALL;
    END IF;
    
    -- Delete user
    DELETE FROM auth.users WHERE id = v_existing_user_id;
  END IF;
  
  -- Create new user
  v_user_id := gen_random_uuid();
  
  -- Insert user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'dan@morempg.ca',
    crypt('Jdm159753!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    'authenticated'
  );
  
  -- Insert identity
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
  
  -- Update existing company or create new one
  IF v_company_id IS NOT NULL THEN
    -- Update existing company
    UPDATE public.companies SET user_id = v_user_id WHERE id = v_company_id;
  ELSE
    -- Create new company
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
  END IF;
END $$;