"use client";

import { toggleSlider } from "@/app/admin/actions";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddSliderButton({ mangaId, isAdded }: { mangaId: string, isAdded: boolean }) {
  const [added, setAdded] = useState(isAdded);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    const res = await toggleSlider(mangaId);
    setAdded(res.status === "added");
    setLoading(false);
    router.refresh(); // Listeyi güncelle
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
        added
          ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
          : "bg-blue-600 hover:bg-blue-500 text-white"
      }`}
    >
      {loading ? "..." : added ? (
        <> <Check size={14} /> Eklendi </>
      ) : (
        <> <Plus size={14} /> Ekle </>
      )}
    </button>
  );
}