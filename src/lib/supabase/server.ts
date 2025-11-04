import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = async (
  cookieStore: ReturnType<typeof cookies> | Promise<ReturnType<typeof cookies>>
) => {
  const cookieStoreResolved = await cookieStore;
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStoreResolved.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStoreResolved.set(name, value, options)
          );
        } catch {}
      },
    },
  });
};
