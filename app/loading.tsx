import Navbar from "@/app/components/Navbar";
import MangaCardSkeleton from "@/app/components/skeletons/MangaCardSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="container mx-auto px-6 py-24">
        {/* Hero Skeleton */}
        <div className="w-full h-[400px] bg-white/5 animate-pulse rounded-3xl mb-16"></div>
        
        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {/* 10 tane iskelet kart basalım */}
          {Array.from({ length: 10 }).map((_, i) => (
            <MangaCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}