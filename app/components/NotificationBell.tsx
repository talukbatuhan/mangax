"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Tip Tanımı
interface Notification {
  id: number;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  // Supabase istemcisini burada oluşturuyoruz
  const supabase = createClient();

  // --- 1. VERİ ÇEKME VE REALTIME DİNLEME (TEK useEffect İÇİNDE) ---
  useEffect(() => {
    if (!userId) return;

    // A. Verileri Çeken Fonksiyon (useEffect'in içinde tanımladık)
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    };

    // İlk yüklemede çalıştır
    fetchNotifications();

    // B. Realtime (Canlı) Dinleme
    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${userId}` 
        }, 
        (payload) => {
          // Yeni bildirim gelince listeye ekle ve sayacı arttır
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    // C. Temizlik (Component kapanırken aboneliği bitir)
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]); // Sadece userId veya supabase değişirse çalışır

  // --- DIŞARI TIKLAYINCA KAPATMA ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- OKUNDU İŞARETLEME ---
  const handleRead = async (notifId: number, link: string) => {
    // Önce UI'ı güncelle (Hız için)
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setNotifications((prev) => 
      prev.map((n) => n.id === notifId ? { ...n, is_read: true } : n)
    );
    setIsOpen(false);
    
    // Sonra veritabanını güncelle ve yönlendir
    await supabase.from("notifications").update({ is_read: true }).eq("id", notifId);
    router.push(link);
  };

  // --- TÜMÜNÜ OKUNDU YAP ---
  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-white/10"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-black animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-white/10 flex justify-between items-center bg-black/20">
            <h4 className="font-bold text-sm text-white">Bildirimler</h4>
            {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-green-500 hover:text-green-400 font-medium">
                    Tümünü Oku
                </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {notifications.length > 0 ? (
                notifications.map((notif) => (
                <div 
                    key={notif.id} 
                    onClick={() => handleRead(notif.id, notif.link)}
                    className={`p-4 cursor-pointer hover:bg-white/5 transition flex gap-3 ${notif.is_read ? 'opacity-50' : 'bg-white/[0.02]'}`}
                >
                    <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${notif.is_read ? 'bg-transparent' : 'bg-green-500 shadow-[0_0_5px_#22c55e]'}`} />
                    <div>
                        <p className="text-sm font-bold text-gray-200 line-clamp-1">{notif.title}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-gray-600 mt-2 block">
                            {new Date(notif.created_at).toLocaleTimeString("tr-TR", {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                </div>
                ))
            ) : (
                <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                    <Bell size={24} className="opacity-20" />
                    <p>Henüz bildirim yok.</p>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}