"use client"; // useState kullandığımız için Client Component olmalı

import { useState } from "react";
import AdminSidebar from "@/app/components/admin/Sidebar";
import { Menu } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col md:flex-row">
      
      {/* --- MOBİL HEADER --- */}
      {/* Sadece mobilde görünür, menüyü açma butonu buradadır */}
      <div className="md:hidden bg-black border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-40">
        <span className="font-bold text-lg flex items-center gap-2">
            <span className="text-green-500">Taluc</span>Admin
        </span>
        <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg active:scale-95 transition"
        >
             <Menu size={24} />
        </button>
      </div>

      {/* --- SIDEBAR BİLEŞENİ --- */}
      {/* State'i ve kapatma fonksiyonunu prop olarak gönderiyoruz */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* --- MOBİL OVERLAY (PERDE) --- */}
      {/* Menü açıksa ve ekran mobilse arkaya siyah yarı saydam katman atar */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)} // Boşluğa tıklayınca kapat
        />
      )}

      {/* --- ANA İÇERİK --- */}
      {/* md:ml-64: Masaüstünde sidebar kadar boşluk bırak */}
      <main className="flex-1 md:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
           {children}
        </div>
      </main>
    </div>
  );
}