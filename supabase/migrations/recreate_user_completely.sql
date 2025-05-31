/*
  # Recreate User Completely
  
  1. Purpose
    - Delete and recreate the user account for dan@morempg.ca
    - Ensure all authentication data is properly configured
  
  2. Details
    - Email: dan@morempg.ca
    - Password: Jdm159753!
    - Preserve company data by linking to the new user
*/

DO $$
DECLARE
  v_old_user_id uuid;
  v_new_user_id uuid := gen_random_uuid();
  v_company_id uuid;
BEGIN
  -- Store the old user ID
  SELECT id INTO v_old_user_id FROM auth.users WHERE email = 'dan@morempg.ca';
  
  -- Store company ID if it exists
  IF v_old_user_id IS NOT NULL THEN
    SELECT id INTO v_company_id FROM public.companies WHERE user_id = v_old_user_id;
  END IF;
  
  -- Delete existing user if exists (this will cascade to identities)
  IF v_old_user_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = v_old_user_id;
  END IF;
  
  -- Create new user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    v_new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'dan@morempg.ca',
    crypt('Jdm159753!', gen_salt('bf')),
    now(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );
  
  -- Create identity
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at
  ) VALUES (
    v_new_user_id,
    v_new_user_id,
    jsonb_build_object('sub', v_new_user_id, 'email', 'dan@morempg.ca'),
    'email',
    'dan@morempg.ca',
    now(),
    now()
  );
  
  -- Update company record if it exists
  IF v_company_id IS NOT NULL THEN
    UPDATE public.companies
    SET user_id = v_new_user_id
    WHERE id = v_company_id;
  END IF;
END $$;