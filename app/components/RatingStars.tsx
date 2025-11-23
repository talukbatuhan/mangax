"use client";

import { useState } from "react";
import { rateManga } from "@/app/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RatingProps {
  mangaId: string;
  initialRating?: number; // Kullanıcının daha önceki puanı
  average: number;        // Genel ortalama
  count: number;          // Kaç kişi oy verdi
  userId?: string;
}

export default function RatingStars({ mangaId, initialRating, average, count, userId }: RatingProps) {
  const [myRating, setMyRating] = useState(initialRating || 0);
  const [hover, setHover] = useState(0); // Mouse üzerindeyken kaçıncı yıldızda?
  const router = useRouter();

  const handleRate = async (score: number) => {
    if (!userId) {
      toast.error("Puan vermek için giriş yapmalısın.");
      router.push("/login");
      return;
    }

    // Hızlı UI güncellemesi
    setMyRating(score);
    
    try {
      await rateManga(mangaId, score * 2); // Biz 5 yıldız kullanıyoruz ama DB 10 puan üzerinden. O yüzden x2.
      toast.success(`Teşekkürler! ${score * 2} puan verdin.`);
    } catch (error) {
      toast.error("Hata oluştu.");
    }
  };

  // Veritabanındaki 10'luk puanı 5 yıldıza çeviriyoruz
  const displayAverage = (average / 2).toFixed(1); 

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={star <= (hover || myRating) ? "#fbbf24" : "none"} // Dolu mu Boş mu?
              stroke={star <= (hover || myRating) ? "#fbbf24" : "#4b5563"} // Kenarlık rengi
              strokeWidth="2"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.545.044.77.77.349 1.132l-4.25 3.638a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.25-3.638c-.42-.362-.196-1.088.349-1.132l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        ))}
        <span className="ml-2 text-xl font-bold text-yellow-400">{displayAverage}</span>
        <span className="text-xs text-gray-500">/ 5</span>
      </div>
      <span className="text-xs text-gray-500">
        {count} kişi oyladı {myRating > 0 && "(Senin Puanın: " + myRating * 2 + ")"}
      </span>
    </div>
  );
}