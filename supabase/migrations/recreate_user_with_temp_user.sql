/*
  # Recreate User Account with Temporary User Approach
  
  1. Purpose
    - Properly handle foreign key constraints when recreating user account
    - Create a temporary user to maintain referential integrity
    - Ensure all authentication data is properly set up
  
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
  -- Check if user already exists
  SELECT id INTO v_existing_user_id FROM auth.users WHERE email = 'dan@morempg.ca';
  
  -- If user exists, we need to handle the foreign key constraint
  IF v_existing_user_id IS NOT NULL THEN
    -- First, check if there's a company record linked to this user
    SELECT id INTO v_company_id FROM public.companies WHERE user_id = v_existing_user_id;
    
    -- Create a new user ID for the replacement user
    v_user_id := gen_random_uuid();
    
    -- If company exists, create a temporary user first
    IF v_company_id IS NOT NULL THEN
      -- Create a temporary user ID
      v_temp_user_id := gen_random_uuid();
      
      -- Create a temporary user to satisfy the foreign key constraint
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
      
      -- Update company to use the temporary user
      UPDATE public.companies 
      SET user_id = v_temp_user_id
      WHERE user_id = v_existing_user_id;
      
      -- Now we can safely delete the existing user
      DELETE FROM auth.identities WHERE user_id = v_existing_user_id;
      DELETE FROM auth.users WHERE id = v_existing_user_id;
      
      -- Insert the new user
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
        v_user_id,
        '00000000-0000-0000-0000-000000000000',
        'dan@morempg.ca',
        crypt('Jdm159753!', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        now(),
        now(),
        '',
        '',
        '',
        ''
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
      
      -- Update the company record to use the new user ID
      UPDATE public.companies 
      SET user_id = v_user_id 
      WHERE user_id = v_temp_user_id;
      
      -- Delete the temporary user
      DELETE FROM auth.users WHERE id = v_temp_user_id;
    ELSE
      -- No company record, so we can just delete and recreate the user
      DELETE FROM auth.identities WHERE user_id = v_existing_user_id;
      DELETE FROM auth.users WHERE id = v_existing_user_id;
      
      -- Insert the new user
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
        v_user_id,
        '00000000-0000-0000-0000-000000000000',
        'dan@morempg.ca',
        crypt('Jdm159753!', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        now(),
        now(),
        '',
        '',
        '',
        ''
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
      
      -- Create a new company record
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
  ELSE
    -- User doesn't exist, create a new one
    v_user_id := gen_random_uuid();
    
    -- Insert into auth.users with properly hashed password
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
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'dan@morempg.ca',
      crypt('Jdm159753!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
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
    
    -- Create a new company record
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