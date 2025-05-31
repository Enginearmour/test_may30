/*
  # Fix Authentication Credentials - Revised

  1. Purpose
    - Fix the login credentials for dan@morempg.ca
    - Ensure password is properly hashed in the format Supabase expects
  
  2. Details
    - Email: dan@morempg.ca
    - Password: Jdm159753!
*/

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the user ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'dan@morempg.ca';
  
  IF v_user_id IS NOT NULL THEN
    -- Update the user's password directly with proper hashing
    UPDATE auth.users
    SET 
      encrypted_password = crypt('Jdm159753!', gen_salt('bf')),
      email_confirmed_at = now(),
      updated_at = now(),
      raw_app_meta_data = raw_app_meta_data || '{"provider":"email","providers":["email"]}'::jsonb
    WHERE id = v_user_id;
    
    -- Ensure identity exists and is properly configured
    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_user_id) THEN
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
    ELSE
      -- Update existing identity
      UPDATE auth.identities
      SET 
        identity_data = jsonb_build_object('sub', v_user_id, 'email', 'dan@morempg.ca'),
        updated_at = now()
      WHERE user_id = v_user_id;
    END IF;
  END IF;
END $$;