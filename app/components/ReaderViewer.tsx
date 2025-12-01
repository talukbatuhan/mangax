"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
import { updateReadingProgress, incrementView } from "@/app/actions";
import BottomNav from "@/app/components/BottomNav";
import { 
  Loader2, BookOpen, ScrollText, ArrowLeft, ArrowRight, 
  Play, Pause, Gauge 
} from "lucide-react";

interface ReaderViewerProps {
  images: string[];
  prevChapter: { chapter_number: number } | null;
  nextChapter: { chapter_number: number } | null;
  mangaTitle: string;
  chapterNum: number;
  slug: string;
  mangaId: string;
  chapterId: string;
}

// --- 1. MANGAPAGE BİLEŞENİ ---
const MangaPage = ({ src, index, mode }: { src: string, index: number, mode: 'vertical' | 'single' }) => {
  const [isLoading, setIsLoading] = useState(true);

  const containerClass = mode === 'vertical' 
    ? "relative w-full flex justify-center min-h-[50vh] bg-black/20 mb-1"
    : "relative w-full flex justify-center min-h-[50vh] bg-black";

  return (
    <div className={containerClass}>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 space-y-4">
          <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
          <span className="text-xs text-gray-500 font-mono animate-pulse">Sayfa {index + 1} Yükleniyor...</span>
        </div>
      )}
      <Image
        src={src}
        alt={`Sayfa ${index + 1}`}
        width={0}
        height={0}
        sizes="100vw"
        className={`
            w-auto h-auto max-w-full block mx-auto 
            transition-opacity duration-500 ease-in-out
            ${isLoading ? 'opacity-0' : 'opacity-100'} 
        `}
        quality={100}
        unoptimized={true}
        priority={index < 2}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

// --- 2. BÖLÜM SONU KARTI ---
interface EndCardProps {
  nextChapter: { chapter_number: number } | null;
  slug: string;
}

const EndOfChapterCard = ({ nextChapter, slug }: EndCardProps) => (
  <div className="py-20 px-6 flex flex-col items-center justify-center gap-4 text-center bg-gray-900 mt-8 w-full max-w-4xl rounded-xl border border-white/5 mx-auto">
      <h3 className="text-xl text-gray-400 font-bold">Bölüm Sonu</h3>
      {nextChapter ? (
          <Link 
              href={`/manga/${slug}/${nextChapter.chapter_number}`}
              className="group relative w-full max-w-md bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg shadow-green-900/40 flex items-center justify-center gap-2 overflow-hidden"
          >
              <span className="relative z-10 flex items-center gap-2">
                  Sonraki Bölüme Geç
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 group-hover:translate-x-1 transition-transform">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
              </span>
          </Link>
      ) : (
          <div className="text-gray-500 space-y-2">
              <p>🎉 Tebrikler! Günceldesiniz.</p>
              <Link href="/" className="text-green-500 hover:underline block text-sm">Başka Manga Keşfet</Link>
          </div>
      )}
  </div>
);

export default function ReaderViewer({ 
  images, 
  prevChapter, 
  nextChapter, 
  mangaTitle, 
  chapterNum,
  slug,
  mangaId,
  chapterId
}: ReaderViewerProps) {
  
  const router = useRouter();
  const [showUI, setShowUI] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const [readingMode, setReadingMode] = useState<'vertical' | 'single'>('vertical'); 
  const [currentIndex, setCurrentIndex] = useState(0); 
  
  // Auto-scroll State
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); 
  
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const singleViewContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null); 

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const currentProgress = readingMode === 'single' 
    ? ((currentIndex + 1) / (images.length + 1)) * 100 
    : scrollProgress;

  useEffect(() => {
    if (mangaId && chapterId) {
        updateReadingProgress(mangaId, chapterId);
        incrementView(mangaId);
    }
  }, [mangaId, chapterId]);

  // --- AUTO SCROLL BAŞLATMA/DURDURMA (OPTIMIZED) ---
  const toggleAutoScroll = useCallback(() => {
    setIsAutoScrolling((prev) => {
      const newState = !prev;
      setShowUI(!newState); // Açılınca UI gizle, kapanınca göster
      return newState;
    });
  }, []);

  // --- OTOMATİK KAYDIRMA MANTIĞI ---
  useEffect(() => {
    const performScroll = () => {
      if (!isAutoScrolling) return;

      // HIZ AYARI (1x=1.0, 2x=2.0, 3x=3.5)
      let pixelPerFrame = 1.0;
      if (scrollSpeed === 2) pixelPerFrame = 2.0;
      if (scrollSpeed === 3) pixelPerFrame = 3.5;

      if (readingMode === 'vertical') {
        window.scrollBy(0, pixelPerFrame);
        
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
           setIsAutoScrolling(false);
           setShowUI(true);
        }
      } else {
        if (singleViewContainerRef.current) {
            singleViewContainerRef.current.scrollBy(0, pixelPerFrame);
            
            const { scrollTop, scrollHeight, clientHeight } = singleViewContainerRef.current;
            if (scrollTop + clientHeight >= scrollHeight) {
                setIsAutoScrolling(false);
                setShowUI(true);
            }
        }
      }
      autoScrollRef.current = requestAnimationFrame(performScroll);
    };

    if (isAutoScrolling) {
      autoScrollRef.current = requestAnimationFrame(performScroll);
    } else {
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
    }

    return () => {
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
    };
  }, [isAutoScrolling, readingMode, scrollSpeed]);

  // --- SCROLL TAKİBİ ---
  const handleUserScroll = useCallback(() => {
    if (!isAutoScrolling) {
        setShowUI(false); 
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => { setShowUI(true); }, 1000);
    }
    
    if (readingMode === 'vertical') {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const currentScroll = window.scrollY;
        setScrollProgress((currentScroll / totalHeight) * 100);
    }
  }, [isAutoScrolling, readingMode]);

  useEffect(() => {
    if (readingMode === 'single') return; 
    window.addEventListener("scroll", handleUserScroll);
    return () => window.removeEventListener("scroll", handleUserScroll);
  }, [readingMode, handleUserScroll]);

  // --- NAVİGASYON ---
  const changePage = useCallback((direction: 'next' | 'prev') => {
    setIsAutoScrolling(false);
    setShowUI(true);
    
    if (direction === 'next') {
        if (currentIndex < images.length) {
            setCurrentIndex(prev => prev + 1);
        } else if (nextChapter) {
            router.push(`/manga/${slug}/${nextChapter.chapter_number}`);
        }
    } else {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else if (prevChapter) {
            router.push(`/manga/${slug}/${prevChapter.chapter_number}`);
        }
    }
    window.scrollTo(0, 0);
    if (singleViewContainerRef.current) singleViewContainerRef.current.scrollTo(0, 0);
  }, [currentIndex, images.length, nextChapter, prevChapter, router, slug]);

  // Klavye Kontrolleri
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (readingMode === 'single') {
            switch (e.key) {
                case 'ArrowRight': changePage('next'); break;
                case 'ArrowLeft': changePage('prev'); break;
                case 'ArrowDown': 
                    if (singleViewContainerRef.current) singleViewContainerRef.current.scrollBy({ top: 100, behavior: 'smooth' });
                    break;
                case 'ArrowUp': 
                    if (singleViewContainerRef.current) singleViewContainerRef.current.scrollBy({ top: -100, behavior: 'smooth' });
                    break;
                case ' ':
                    e.preventDefault();
                    toggleAutoScroll();
                    break;
            }
        } else {
            switch (e.key) {
                case 'ArrowRight': if (nextChapter) router.push(`/manga/${slug}/${nextChapter.chapter_number}`); break;
                case 'ArrowLeft': if (prevChapter) router.push(`/manga/${slug}/${prevChapter.chapter_number}`); break;
                case 'ArrowDown': window.scrollBy({ top: 150, behavior: 'smooth' }); break;
                case 'ArrowUp': window.scrollBy({ top: -150, behavior: 'smooth' }); break;
                case ' ':
                    e.preventDefault();
                    toggleAutoScroll();
                    break;
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readingMode, changePage, nextChapter, prevChapter, router, slug, toggleAutoScroll]);

  // Akıllı Tıklama
  const handleSmartClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging.current) { isDragging.current = false; return; }
    const containerWidth = window.innerWidth;
    const clickX = e.clientX;
    if (clickX < containerWidth * 0.3) changePage('prev');
    else if (clickX > containerWidth * 0.7) changePage('next');
    else setShowUI(prev => !prev);
  };

  const handlePointerDown = (e: React.PointerEvent) => { isDragging.current = false; startX.current = e.clientX; startY.current = e.clientY; };
  const handlePointerMove = (e: React.PointerEvent) => { if (Math.abs(e.clientX - startX.current) > 10 || Math.abs(e.clientY - startY.current) > 10) isDragging.current = true; };

  const toggleSpeed = () => {
    setScrollSpeed(prev => prev >= 3 ? 1 : prev + 1);
  };

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-green-500 selection:text-black font-sans">
      
      {/* İlerleme Çubuğu */}
      <div className="fixed top-0 left-0 w-full h-1 z-[70] bg-gray-800">
        <div 
          className="h-full bg-green-500 transition-all duration-100 ease-out shadow-[0_0_10px_#22c55e]"
          style={{ width: `${currentProgress}%` }} 
        />
      </div>

      {/* --- HEADER --- */}
      <div className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ease-in-out ${showUI ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="bg-gradient-to-b from-black/95 to-transparent p-4 pb-12 flex justify-between items-start backdrop-blur-sm">
            <div className="flex flex-col">
                <Link href={`/manga/${slug}`} className="text-white font-bold hover:text-green-400 flex items-center gap-2 drop-shadow-md transition group">
                    <span className="text-2xl group-hover:-translate-x-1 transition-transform">&larr;</span> 
                    <div>
                        <span className="block text-sm opacity-70 font-normal">Mangaya Dön</span>
                        <span className="text-lg leading-none">{mangaTitle}</span>
                    </div>
                </Link>
                <span className="text-xs text-green-400 mt-1 font-mono pl-6">Bölüm {chapterNum}</span>
            </div>
            
            <div className="flex items-center gap-3">
                
                {/* --- AUTO SCROLL BUTONLARI --- */}
                <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1 border border-white/5 backdrop-blur-md">
                    <button 
                        onClick={toggleAutoScroll}
                        className={`p-1.5 rounded-full transition ${isAutoScrolling ? 'text-green-400 bg-white/10' : 'text-gray-300 hover:text-white'}`}
                        title={isAutoScrolling ? "Durdur" : "Otomatik Kaydır"}
                    >
                        {isAutoScrolling ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    
                    <button 
                        onClick={toggleSpeed}
                        className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-white px-2 py-1 rounded transition w-12 justify-center"
                        title={`Hız: ${scrollSpeed}x`}
                    >
                        <Gauge size={14} /> {scrollSpeed}x
                    </button>
                </div>

                <button
                    onClick={() => {
                        setReadingMode(mode => mode === 'vertical' ? 'single' : 'vertical');
                        setIsAutoScrolling(false);
                        setShowUI(true);
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition border border-white/5"
                    title={readingMode === 'vertical' ? "Tek Sayfa Moduna Geç" : "Dikey Akış Moduna Geç"}
                >
                    {readingMode === 'vertical' ? <BookOpen size={20} /> : <ScrollText size={20} />}
                </button>

                {nextChapter && (
                    <Link 
                    href={`/manga/${slug}/${nextChapter.chapter_number}`} 
                    className="hidden sm:flex group items-center gap-2 bg-white/10 hover:bg-green-600 backdrop-blur-md px-4 py-2 rounded-full transition-all border border-white/10"
                    >
                    <span className="text-sm font-bold">Sonraki</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                    </Link>
                )}
            </div>
        </div>
      </div>

      {/* --- İÇERİK ALANI --- */}
      
      {readingMode === 'vertical' ? (
        // ********** DİKEY MOD **********
        <div onClick={() => setShowUI(prev => !prev)} className="w-full min-h-screen pb-20 flex flex-col items-center pt-20">
            <div className="w-full max-w-4xl mx-auto">
            {images.map((imgUrl, index) => (
                <MangaPage key={index} src={imgUrl} index={index} mode="vertical" />
            ))}
            </div>
            <EndOfChapterCard nextChapter={nextChapter} slug={slug} />
        </div>
      ) : (
        // ********** TEK SAYFA MODU **********
        <div 
            ref={singleViewContainerRef}
            className="w-full h-screen fixed inset-0 bg-black overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col items-center outline-none"
            onScroll={handleUserScroll}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onClick={handleSmartClick}
        >
            <div className="h-16 shrink-0 w-full pointer-events-none" />
            <div className="w-full max-w-5xl px-0 md:px-4 flex-1 flex items-start justify-center min-h-0">
                {currentIndex < images.length ? (
                    <MangaPage src={images[currentIndex]} index={currentIndex} mode="single" />
                ) : (
                    <div className="mt-20 w-full px-4">
                        <EndOfChapterCard nextChapter={nextChapter} slug={slug} />
                    </div>
                )}
            </div>
            <div className="h-24 shrink-0 w-full pointer-events-none" />

            <div className={`fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-sm font-mono text-gray-300 transition-opacity duration-300 z-30 pointer-events-none ${showUI ? 'opacity-100' : 'opacity-0'}`}>
                {currentIndex < images.length ? `${currentIndex + 1} / ${images.length}` : "Bölüm Sonu"}
            </div>

            <button onClick={(e) => { e.stopPropagation(); changePage('prev'); }} className={`fixed left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-sm transition z-40 hidden md:flex ${!showUI && 'opacity-0 hover:opacity-100'}`}>
                <ArrowLeft className="text-white" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); changePage('next'); }} className={`fixed right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-sm transition z-40 hidden md:flex ${!showUI && 'opacity-0 hover:opacity-100'}`}>
                <ArrowRight className="text-white" />
            </button>
        </div>
      )}

      {/* --- ALT MENÜ --- */}
      <div className={`fixed bottom-0 left-0 w-full z-[60] md:hidden transition-transform duration-300 ease-in-out ${showUI ? "translate-y-0" : "translate-y-full"}`}>
         <BottomNav className="w-full bg-black/95 backdrop-blur-lg border-t border-white/10" />
      </div>

    </div>
  );
}