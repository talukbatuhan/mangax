import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Supabase Client Oluştur (Çerezleri okuyabilen)
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

  // 2. Kullanıcıyı Kontrol Et
  const { data: { user } } = await supabase.auth.getUser()

  // --- KURAL 1: ADMIN KORUMASI ---
  // Eğer kullanıcı '/admin' sayfasına girmeye çalışıyorsa
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Giriş yapmamışsa -> Login sayfasına at
    if (!user) {
      return NextResponse.redirect(new URL('/login?returnUrl=/admin', request.url))
    }

    // Giriş yapmış ama SEN DEĞİLSEN -> Anasayfaya at (Yetkisiz)
    if (user.email !== process.env.ADMIN_EMAIL ) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // --- KURAL 2: OTURUM YENİLEME ---
  // Supabase çerezlerini güncellemek için gereklidir
  return response
}

export const config = {
  // Middleware hangi sayfalarda çalışsın?
  matcher: [
    '/admin/:path*', // Admin sayfaları
    '/favorites',    // Favoriler sayfası (İsteğe bağlı)
    // Diğer korumalı sayfalar...
  ],
}