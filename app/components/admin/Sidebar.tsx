"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, BookOpen, PlusCircle, Layers, 
  Users, MessageSquare, Settings, Image as ImageIcon,
  LogOut, Tag, X // X ikonunu ekledik (Kapatmak için)
} from "lucide-react";
import { signOut } from "@/app/actions";

// 1. TİP TANIMI: Dışarıdan hangi verilerin geleceğini belirtiyoruz
interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// 2. FONKSİYON PARAMETRELERİ: Props'ları içeri alıyoruz
export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Genel Bakış",
      items: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ]
    },
    {
      title: "İçerik Yönetimi",
      items: [
        { name: "Tüm Mangalar", href: "/admin/mangas", icon: BookOpen },
        { name: "Yeni Ekle", href: "/admin/mangas/new", icon: PlusCircle },
        { name: "Türler / Kategoriler", href: "/admin/genres", icon: Tag },
        { name: "Bölüm Yönetimi", href: "/admin/chapters", icon: Layers },
      ]
    },
    {
      title: "Kullanıcı & Topluluk",
      items: [
        { name: "Üyeler", href: "/admin/users", icon: Users },
        { name: "Yorumlar", href: "/admin/comments", icon: MessageSquare },
      ]
    },
    {
      title: "Görünüm & Ayarlar",
      items: [
        { name: "Slider Yönetimi", href: "/admin/appearance", icon: ImageIcon },
        { name: "Ayarlar", href: "/admin/settings", icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* MOBİL İÇİN ARKA PLAN KARARTMA (Overlay) */}
      {/* Sadece mobilde ve menü açıksa görünür */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose} // Boşluğa tıklayınca kapat
        />
      )}

      {/* SIDEBAR */}
      <div className={`
        w-64 bg-black border-r border-white/10 h-screen fixed left-0 top-0 flex flex-col z-50
        transition-transform duration-300 ease-in-out
        scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']
        
        /* RESPONSIVE MANTIK: */
        /* Masaüstünde (md): Her zaman görünür (translate-x-0) */
        /* Mobilde: isOpen true ise görünür, false ise sola gizlenir (-translate-x-full) */
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}>
        
        {/* Logo Alanı */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-green-500">Taluc</span>Admin
          </h1>
          {/* Mobilde Kapatma Butonu */}
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Menü Linkleri */}
        <nav className="flex-1 p-4 space-y-8 overflow-y-auto">
          {menuItems.map((section, index) => (
            <div key={index}>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pl-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose} // Mobilde linke tıklayınca menüyü kapat
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? "bg-green-600/10 text-green-400 border border-green-600/20" 
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Alt Kısım */}
        <div className="p-4 border-t border-white/10">
          <form action={signOut}>
              <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-400/10 w-full rounded-lg transition">
              <LogOut size={18} />
              Çıkış Yap
              </button>
          </form>
        </div>
      </div>
    </>
  );
}