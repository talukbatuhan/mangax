import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // 1. Eğer kullanıcı "/admin" sayfasına girmeye çalışıyorsa:
  if (req.nextUrl.pathname.startsWith('/admin')) {
    
    // Tarayıcıdan gönderilen şifre başlığını al
    const authHeader = req.headers.get('authorization');

    if (authHeader) {
      // Şifre "Basic base64kod..." şeklinde gelir. Onu çözüyoruz.
      const authValue = authHeader.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // 2. Şifre doğru mu kontrol et (.env dosyasından bakarak)
      if (user === process.env.ADMIN_USER && pwd === process.env.ADMIN_PASSWORD) {
        return NextResponse.next(); // Kapıyı aç, içeri girsin
      }
    }

    // 3. Şifre yoksa veya yanlışsa: 401 Hatası (Giriş Yap) gönder
    // Bu, tarayıcının o küçük giriş penceresini açmasını sağlar.
    return new NextResponse('Giriş Yetkiniz Yok!', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  // Diğer tüm sayfalar (Anasayfa, Manga Detay vb.) serbest
  return NextResponse.next();
}

// Hangi yollarda çalışacağını belirtiyoruz
export const config = {
  matcher: '/admin/:path*', // Sadece admin ve alt sayfalarında çalış
};