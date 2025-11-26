import Navbar from "@/app/components/Navbar";
import MangaCardSkeleton from "@/app/components/skeletons/MangaCardSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans overflow-hidden">
      <Navbar />

      {/* 1. HERO / SLIDER SKELETON */}
      {/* Sayfanın üst kısmındaki büyük banner için yer tutucu */}
      <div className="w-full h-[350px] md:h-[500px] bg-[#1a1a1a] animate-pulse border-b border-white/5 relative">
         <div className="container mx-auto px-6 h-full flex flex-col justify-end pb-12">
             {/* Etiket */}
             <div className="w-24 h-6 bg-white/10 rounded-sm mb-4"></div>
             {/* Başlık */}
             <div className="w-3/4 md:w-1/2 h-10 md:h-16 bg-white/10 rounded-sm mb-4"></div>
             {/* Açıklama */}
             <div className="w-full md:w-1/3 h-4 bg-white/5 rounded-sm mb-2"></div>
             <div className="w-2/3 md:w-1/4 h-4 bg-white/5 rounded-sm mb-8"></div>
             {/* Buton */}
             <div className="w-40 h-12 bg-white/10 rounded-sm"></div>
         </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        
        {/* 2. WEEKLY POPULAR SKELETON */}
        {/* Yatay kaydırılabilir alanın iskeleti */}
        <div className="mb-12">
            {/* Başlık Çizgisi */}
            <div className="h-8 w-64 bg-white/10 rounded-sm animate-pulse mb-6 border-l-4 border-white/20 pl-4"></div>
            
            {/* Yatay Kartlar */}
            <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="shrink-0 w-[160px] md:w-[190px] h-[280px] bg-[#1a1a1a] rounded-sm animate-pulse border border-white/5 flex flex-col p-2 gap-2">
                        {/* Resim */}
                        <div className="flex-1 bg-white/5 w-full rounded-sm"></div>
                        {/* Yazı */}
                        <div className="h-4 w-3/4 bg-white/10 rounded-sm"></div>
                        <div className="h-3 w-1/2 bg-white/5 rounded-sm"></div>
                    </div>
                ))}
            </div>
        </div>

        {/* 3. ANA GRID YAPISI SKELETON (Left Content + Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* SOL TARAF (9/12) */}
           <div className="lg:col-span-9 space-y-12">
               
               {/* Continue Reading Skeleton */}
               <div className="w-full h-24 bg-[#1a1a1a] rounded-sm animate-pulse border border-white/5 p-4 flex gap-4">
                   <div className="w-16 h-full bg-white/5 rounded-sm"></div>
                   <div className="flex-1 space-y-2 py-2">
                        <div className="h-4 w-1/3 bg-white/10 rounded-sm"></div>
                        <div className="h-3 w-1/4 bg-white/5 rounded-sm"></div>
                   </div>
               </div>

               {/* Latest Updates Grid */}
               <div className="space-y-8">
                   {/* Başlık */}
                   <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <div className="h-8 w-48 bg-white/10 rounded-sm animate-pulse"></div>
                   </div>
                   
                   {/* Grid Kartları */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                          <MangaCardSkeleton key={i} />
                      ))}
                   </div>
               </div>
           </div>

           {/* SAĞ TARAF - SIDEBAR (3/12) */}
           <div className="lg:col-span-3 hidden lg:block">
               <div className="h-full border-l border-white/5 pl-4 space-y-6">
                   {/* Sidebar Başlık */}
                   <div className="h-6 w-32 bg-white/10 rounded-sm animate-pulse mb-6"></div>
                   
                   {/* Sidebar Liste Öğeleri */}
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-3 mb-4 opacity-70">
                            {/* Küçük Resim */}
                            <div className="w-16 h-24 bg-[#1a1a1a] rounded-sm animate-pulse shrink-0 border border-white/5"></div>
                            {/* Yazılar */}
                            <div className="flex-1 space-y-2 py-2">
                                <div className="h-3 w-full bg-white/10 rounded-sm"></div>
                                <div className="h-3 w-2/3 bg-white/5 rounded-sm"></div>
                            </div>
                        </div>
                    ))}
               </div>
           </div>

        </div>
      </div>
    </div>
  );
}
