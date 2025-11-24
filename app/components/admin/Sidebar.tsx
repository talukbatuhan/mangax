"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Layers,
  Users,
  MessageSquare,
  Settings,
  Image as ImageIcon,
  Globe,
  Server,
  LogOut,
  X // Kapatma ikonu
} from "lucide-react";

// Props tanımı: Layout'tan gelen verileri karşılamak için
interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Overview",
      items: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard }],
    },
    {
      title: "Content Management",
      items: [
        { name: "All Manga", href: "/admin/mangas", icon: BookOpen },
        { name: "Add New", href: "/admin/mangas/new", icon: PlusCircle },
        { name: "Categories", href: "/admin/genres", icon: Layers },
        { name: "Chapter Management", href: "/admin/chapters", icon: Layers },
      ],
    },
    {
      title: "User & Community",
      items: [
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Comments", href: "/admin/comments", icon: MessageSquare },
      ],
    },
    {
      title: "Appearance & Settings",
      items: [
        { name: "Showcase Management", href: "/admin/appearance", icon: ImageIcon },
        { name: "SEO Settings", href: "/admin/settings/seo", icon: Globe },
        { name: "Server / CDN", href: "/admin/settings/server", icon: Server },
        { name: "General Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Ana Kapsayıcı:
         - fixed, h-screen: Sabit ve tam boy.
         - z-50: Diğer her şeyin üstünde.
         - transition-transform: Açılıp kapanma animasyonu.
         - md:translate-x-0: Masaüstünde (md) HER ZAMAN görünür (0 kaydırma).
         - isOpen ? "translate-x-0" : "-translate-x-full": Mobilde açıksa göster, değilse sola sakla.
      */}
      <div
        className={`
          fixed left-0 top-0 h-screen w-64 bg-black border-r border-white/10 z-50 flex flex-col
          transition-transform duration-300 ease-in-out
          overflow-y-auto scrollbar-hide
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
        `}
      >
        {/* Logo Alanı */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-green-500">Taluc</span>Admin
          </h1>
          
          {/* MOBİL İÇİN KAPAT BUTONU (Sadece mobilde görünür: md:hidden) */}
          <button 
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menü Linkleri */}
        <nav className="flex-1 p-4 space-y-8">
          {menuItems.map((section, index) => (
            <div key={index}>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pl-3">
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
                      onClick={onClose} // Mobilde linke tıklayınca menü kapansın
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-green-600/10 text-green-400 border border-green-600/20"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
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
          <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-400/10 w-full rounded-lg transition">
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </div>
    </>
  );
}