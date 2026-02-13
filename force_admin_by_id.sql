-- Force Admin Role for specific User ID
-- This bypasses any ambiguity with emails.

UPDATE public.users 
SET role = 'admin' 
WHERE id = '101e6a6c-57c9-4e95-a9ba-78aee3266034';

-- Verify the change
SELECT id, email, role FROM public.users WHERE id = '101e6a6c-57c9-4e95-a9ba-78aee3266034';
