-- 1. Backfill existing users ke profiles table
INSERT INTO
  public.profiles (id, email, full_name, avatar_url)
SELECT
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data - > > 'full_name', -- ✅ No spaces!
    u.raw_user_meta_data - > > 'name', -- ✅ No spaces!
    SPLIT_PART (u.email, '@', 1)
  ) AS full_name,
  COALESCE(
    u.raw_user_meta_data - > > 'avatar_url', -- ✅ No spaces!
    u.raw_user_meta_data - > > 'picture' -- ✅ No spaces!
  ) AS avatar_url
FROM
  auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
WHERE
  p.id IS NULL;

-- 2. Promote specific user to admin
UPDATE public.profiles
SET
  role = 'admin'
WHERE
  email = 'your.email@domain.com';
