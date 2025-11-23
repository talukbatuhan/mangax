"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Yönlendirme için

interface ReaderViewerProps {
  images: string[];
  prevChapter: { chapter_number: number } | null;
  nextChapter: { chapter_number: number } | null;
  mangaTitle: string;
  chapterNum: number;
  slug: string;
}

export default function ReaderViewer({ 
  images, 
  prevChapter, 
  nextChapter, 
  mangaTitle, 
  chapterNum,
  slug 
}: ReaderViewerProps) {
  
  const [showUI, setShowUI] = useState(true); // Menü görünürlüğü
  const [progress, setProgress] = useState(0); // Yeşil çizgi
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null); // Zamanlayıcı
  const router = useRouter(); // Son sayfada otomatik geçiş için (Opsiyonel)

  useEffect(() => {
    const handleScroll = () => {
      // 1. İlerleme Çubuğu Hesabı
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const percentage = (currentScroll / totalHeight) * 100;
      setProgress(percentage);

      // 2. SCROLL BAŞLADI: Menüyü Gizle
      setShowUI(false);

      // 3. SCROLL DURDU MU? Zamanlayıcıyı sıfırla
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // 4. HİÇBİR ŞEY YAPMAZSA 1.5 SANİYE SONRA MENÜYÜ AÇ
      scrollTimeout.current = setTimeout(() => {
        setShowUI(true);
      }, 1500); // 1.5 Saniye bekleme süresi
    };

    window.addEventListener("scroll", handleScroll);
    
    // Temizlik
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  // Ekrana tıklayınca manuel aç/kapa (İsteğe bağlı, scroll mantığıyla çakışmaz)
  const toggleUI = () => {
    setShowUI((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      
      {/* --- İLERLEME ÇUBUĞU (Her zaman en üstte sabit ve görünür) --- */}
      <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-gray-800">
        <div 
          className="h-full bg-green-500 transition-all duration-100 ease-out shadow-[0_0_10px_#22c55e]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* --- ÜST MENÜ (Akıllı Gizlenme) --- */}
      <div className={`fixed top-0 left-0 w-full z-50 transition-transform duration-500 ease-in-out ${showUI ? "translate-y-0" : "-translate-y-full"}`}>
        {/* Arka planı gradient yaparak daha sinematik durmasını sağladık */}
        <div className="bg-gradient-to-b from-black/90 to-transparent p-4 pb-12 flex justify-between items-start">
            
            {/* SOL: Geri Dön */}
            <div className="flex flex-col">
                <Link href={`/manga/${slug}`} className="text-white font-bold hover:text-green-400 flex items-center gap-2 drop-shadow-md transition">
                    <span className="text-2xl">&larr;</span> 
                    <div>
                        <span className="block text-sm opacity-70 font-normal">Mangaya Dön</span>
                        <span className="text-lg leading-none">{mangaTitle}</span>
                    </div>
                </Link>
                <span className="text-xs text-green-400 mt-1 font-mono pl-6">Bölüm {chapterNum}</span>
            </div>
            
            {/* SAĞ: Sonraki Bölüm Butonu (Sadece Varsa Göster) */}
            {nextChapter && (
                 <Link 
                   href={`/manga/${slug}/${nextChapter.chapter_number}`} 
                   className="group flex items-center gap-2 bg-white/10 hover:bg-green-600 backdrop-blur-md px-4 py-2 rounded-full transition-all border border-white/10"
                 >
                   <span className="text-sm font-bold">Sonraki</span>
                   {/* Sağ Ok İkonu */}
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                   </svg>
                 </Link>
            )}
        </div>
      </div>

      {/* --- RESİM ALANI --- */}
      {/* padding kaldırdık, tam ekran deneyimi */}
      <div onClick={toggleUI} className="w-full max-w-4xl mx-auto cursor-pointer min-h-screen">
        {images.map((imgUrl, index) => (
          <img 
            key={index}
            src={imgUrl} 
            alt={`Sayfa ${index + 1}`} 
            className="w-full h-auto block"
            loading="lazy"
          />
        ))}

        {/* --- SONRAKİ BÖLÜM BUTONU (EN SONDA) --- */}
        {/* Okuma bitince en altta dev bir buton çıksın ki kullanıcı kaybolmasın */}
        <div className="py-20 px-6 flex flex-col items-center justify-center gap-4 text-center bg-gray-900 mt-2">
            <h3 className="text-xl text-gray-400">Bölüm Sonu</h3>
            {nextChapter ? (
                <Link 
                    href={`/manga/${slug}/${nextChapter.chapter_number}`}
                    className="w-full max-w-md bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl text-lg transition shadow-lg shadow-green-900/40 flex items-center justify-center gap-2"
                >
                    Sonraki Bölüme Geç
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                </Link>
            ) : (
                <div className="text-gray-500">
                    <p>Günceldesiniz!</p>
                    <Link href="/" className="text-green-500 hover:underline mt-2 block">Başka Manga Oku</Link>
                </div>
            )}
        </div>
      </div>

    </div>
  );
}