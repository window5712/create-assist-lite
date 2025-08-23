-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create a new organization for the user
  INSERT INTO public.organizations (name, slug)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Organization',
    lower(replace(COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), ' ', '-')) || '-' || substring(NEW.id::text, 1, 8)
  )
  RETURNING id INTO new_org_id;

  -- Create profile for the new user as organization owner
  INSERT INTO public.profiles (
    user_id,
    organization_id,
    email,
    first_name,
    last_name,
    role
  )
  VALUES (
    NEW.id,
    new_org_id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    'owner'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;