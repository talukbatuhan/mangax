import { Skeleton } from "@/app/components/ui/Skeleton";

export default function MangaCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      {/* Resim Alanı */}
      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
      {/* Başlık Alanı */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}