import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Response ve Supabase Client Hazırlığı
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 2. Kullanıcıyı Çek
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.email === process.env.ADMIN_EMAIL

  // --- BAKIM MODU KODLARI TAMAMEN SİLİNDİ ---

  // 3. --- ADMIN SAYFASI KORUMASI ---
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Giriş yapmamışsa -> Login sayfasına at
    if (!user) {
      return NextResponse.redirect(new URL('/login?returnUrl=/admin', request.url))
    }

    // Giriş yapmış ama SEN DEĞİLSEN -> Anasayfaya at
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  // Matcher: Sadece admin sayfalarını korumak yeterli olabilir artık, 
  // ama auth işlemlerinin sağlıklı çalışması için geniş kapsamlı tutuyoruz.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}