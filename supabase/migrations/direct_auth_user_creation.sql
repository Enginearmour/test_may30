/*
  # Direct Auth User Creation
  
  1. Purpose
    - Create a user directly using Supabase auth functions
    - Ensure proper authentication setup
    - Link to company record
  
  2. Details
    - Email: dan@morempg.ca
    - Password: Jdm159753!
*/

DO $$
DECLARE
  v_user_id uuid;
  v_existing_user_id uuid;
  v_company_id uuid;
  v_temp_user_id uuid;
BEGIN
  -- First, clean up any existing user with this email
  SELECT id INTO v_existing_user_id FROM auth.users WHERE email = 'dan@morempg.ca';
  
  IF v_existing_user_id IS NOT NULL THEN
    -- Check if there's a company record
    SELECT id INTO v_company_id FROM public.companies WHERE user_id = v_existing_user_id;
    
    IF v_company_id IS NOT NULL THEN
      -- Create a temporary user
      v_temp_user_id := gen_random_uuid();
      
      -- Insert temporary user
      INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      ) VALUES (
        v_temp_user_id,
        '00000000-0000-0000-0000-000000000000',
        'temp_' || v_temp_user_id || '@example.com',
        crypt('temppassword', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        now(),
        now()
      );
      
      -- Update company to use temporary user
      UPDATE public.companies 
      SET user_id = v_temp_user_id
      WHERE user_id = v_existing_user_id;
    END IF;
    
    -- Delete existing user
    DELETE FROM auth.sessions WHERE user_id = v_existing_user_id;
    DELETE FROM auth.refresh_tokens WHERE user_id = v_existing_user_id;
    DELETE FROM auth.identities WHERE user_id = v_existing_user_id;
    DELETE FROM auth.users WHERE id = v_existing_user_id;
  END IF;
  
  -- Create new user using auth.users() function
  v_user_id := gen_random_uuid();
  
  -- Insert the user with proper metadata
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
    last_sign_in_at,
    confirmation_token,
    recovery_token,
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
    now(),
    '',
    '',
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
    updated_at,
    last_sign_in_at
  ) VALUES (
    v_user_id,
    v_user_id,
    jsonb_build_object('sub', v_user_id, 'email', 'dan@morempg.ca'),
    'email',
    'dan@morempg.ca',
    now(),
    now(),
    now()
  );
  
  -- Handle company record
  IF v_company_id IS NOT NULL THEN
    -- Update existing company to use new user
    UPDATE public.companies 
    SET user_id = v_user_id
    WHERE user_id = v_temp_user_id;
    
    -- Delete temporary user if it exists
    IF v_temp_user_id IS NOT NULL THEN
      DELETE FROM auth.users WHERE id = v_temp_user_id;
    END IF;
  ELSE
    -- Create new company record
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