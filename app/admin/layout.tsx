"use client"; // State kullandığımız için Client Component olmalı

import { useState } from "react";
import AdminSidebar from "@/app/components/admin/Sidebar";
import { Menu } from "lucide-react"; // Hamburger ikonu

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex">
      
      {/* MOBİL İÇİN MENÜ AÇMA BUTONU (Sadece mobilde görünür) */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-gray-800 rounded-lg border border-white/10 text-white shadow-lg"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sol Menü (Props gönderiyoruz) */}
      <AdminSidebar 
         isOpen={isSidebarOpen} 
         onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Sağ İçerik */}
      {/* md:ml-64: Masaüstünde 64 birim boşluk bırak, mobilde bırakma */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto pt-16 md:pt-8">
        <div className="max-w-7xl mx-auto">
           {children}
        </div>
      </main>
    </div>
  );
}