import { createClient } from '@supabase/supabase-js'

// Bu istemci SADECE sunucu tarafında (Server Actions) kullanılmalı!
// Çünkü Service Role Key içeriyor.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)