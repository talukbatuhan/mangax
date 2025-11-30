"use client";

import { useState } from "react";
import { Chapter } from "@/app/types";
import { 
  deletePageAction, 
  replacePageAction, 
  deleteChapterAction, 
  updateChapterTitleAction 
} from "@/app/admin/actions";
import { 
  Trash2, Edit2, ChevronDown, ChevronUp, FileImage, 
  Save, X, Loader2, Pencil 
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ChapterPageEditor({ chapters, mangaId }: { chapters: Chapter[], mangaId: string }) {
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<{ chapterId: string, index: number } | null>(null);
  
  // Başlık Düzenleme State'leri
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- BÖLÜM İŞLEMLERİ ---

  const handleDeleteChapter = async (id: string) => {
    if (!confirm("Bölümü ve tüm sayfalarını silmek istediğine emin misin?")) return;
    await deleteChapterAction(id);
    toast.success("Bölüm silindi.");
    router.refresh();
  };

  const handleUpdateTitle = async (chapterId: string) => {
    setLoading(true);
    const res = await updateChapterTitleAction(chapterId, tempTitle);
    if (res.success) {
      toast.success("Başlık güncellendi.");
      setEditingTitleId(null);
      router.refresh();
    } else {
      toast.error("Hata: " + res.error);
    }
    setLoading(false);
  };

  // --- SAYFA İŞLEMLERİ ---

  const handleDeletePage = async (chapterId: string, index: number) => {
    if (!confirm(`${index + 1}. sayfayı silmek istediğine emin misin?`)) return;
    setLoading(true);
    const res = await deletePageAction(chapterId, index);
    if (res.success) {
      toast.success("Sayfa silindi.");
      router.refresh();
    } else {
      toast.error("Hata: " + res.error);
    }
    setLoading(false);
  };

  const handleUpdatePage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await replacePageAction(formData);
    
    if (res.success) {
      toast.success("Sayfa güncellendi!");
      setEditingPage(null);
      router.refresh();
    } else {
      toast.error("Hata: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-white/10 bg-black/20">
        <h3 className="font-bold text-white">Bölüm ve Sayfa Yönetimi</h3>
      </div>
      
      <div className="divide-y divide-white/5">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="group transition bg-[#0f0f0f]">
            
            {/* --- BÖLÜM BAŞLIĞI SATIRI --- */}
            <div 
              className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer" 
              onClick={() => setExpandedChapterId(expandedChapterId === chapter.id ? null : chapter.id)}
            >
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-green-500 font-bold border border-white/5 shrink-0">
                        {chapter.chapter_number}
                    </div>
                    
                    {/* BAŞLIK ALANI (DÜZENLENEBİLİR) */}
                    <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                        {editingTitleId === chapter.id ? (
                            <div className="flex items-center gap-2 animate-in fade-in">
                                <input 
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    className="bg-black border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:border-green-500 outline-none w-full max-w-xs"
                                    placeholder="Bölüm Adı (Örn: Savaş Başlıyor)"
                                    autoFocus
                                />
                                <button 
                                    onClick={() => handleUpdateTitle(chapter.id)} 
                                    disabled={loading}
                                    className="p-1.5 bg-green-600 hover:bg-green-500 text-white rounded"
                                >
                                    <Save size={16} />
                                </button>
                                <button 
                                    onClick={() => setEditingTitleId(null)}
                                    className="p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="group/title flex items-center gap-2">
                                <div>
                                    <h4 className="text-white font-medium text-sm">
                                        {chapter.title || `Bölüm ${chapter.chapter_number}`}
                                    </h4>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <FileImage size={10} /> {chapter.images?.length || 0} Sayfa
                                    </span>
                                </div>
                                <button 
                                    onClick={() => {
                                        setEditingTitleId(chapter.id);
                                        setTempTitle(chapter.title || "");
                                    }}
                                    className="opacity-0 group-hover/title:opacity-100 p-1 text-gray-500 hover:text-blue-400 transition"
                                    title="Başlığı Düzenle"
                                >
                                    <Pencil size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter.id); }}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition"
                        title="Bölümü Komple Sil"
                    >
                        <Trash2 size={16} />
                    </button>
                    {expandedChapterId === chapter.id ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                </div>
            </div>

            {/* --- GENİŞLETİLMİŞ ALAN: SAYFALAR --- */}
            {expandedChapterId === chapter.id && (
                <div className="bg-black/40 border-t border-white/5 p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {chapter.images?.map((imgUrl, index) => (
                            <div key={index} className="relative group/page">
                                {/* Sayfa Numarası */}
                                <div className="absolute top-1 left-1 z-10 bg-black/70 text-white text-[10px] font-bold px-1.5 rounded">
                                    #{index + 1}
                                </div>

                                {/* Resim */}
                                <div className="relative aspect-[2/3] w-full rounded border border-white/10 overflow-hidden bg-gray-800">
                                    <Image src={imgUrl} alt="" fill className="object-cover" sizes="150px" />
                                    
                                    {/* Düzenleme Overlay'i */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/page:opacity-100 transition flex flex-col items-center justify-center gap-2">
                                        
                                        <button 
                                            onClick={() => handleDeletePage(chapter.id, index)}
                                            disabled={loading}
                                            className="bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-full"
                                            title="Sayfayı Sil"
                                        >
                                            <Trash2 size={14} />
                                        </button>

                                        <button 
                                            onClick={() => setEditingPage({ chapterId: chapter.id, index })}
                                            className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-full"
                                            title="Sayfayı Değiştir"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        ))}
        {chapters.length === 0 && <div className="p-8 text-center text-gray-500">Henüz bölüm yok.</div>}
      </div>

      {/* --- SAYFA GÜNCELLEME MODALI --- */}
      {editingPage && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border border-white/10 p-6 rounded-xl w-full max-w-sm shadow-2xl relative">
                <button 
                    onClick={() => setEditingPage(null)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </button>
                
                <h3 className="font-bold text-white mb-4">
                    Sayfa #{editingPage.index + 1} Güncelle
                </h3>
                
                <form onSubmit={handleUpdatePage} className="space-y-4">
                    <input type="hidden" name="chapterId" value={editingPage.chapterId} />
                    <input type="hidden" name="pageIndex" value={editingPage.index} />
                    <input type="hidden" name="mangaId" value={mangaId} />

                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-green-500 transition cursor-pointer relative bg-black/30">
                        <input type="file" name="newFile" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                        <span className="text-sm text-gray-400 pointer-events-none">Yeni Görseli Seç</span>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Güncelle
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}