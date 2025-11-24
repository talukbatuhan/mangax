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
  BarChart,
  Globe,
  Server,
  LogOut,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Genel Bakış",
      items: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard }],
    },
    {
      title: "İçerik Yönetimi",
      items: [
        { name: "Tüm Mangalar", href: "/admin/mangas", icon: BookOpen },
        { name: "Yeni Ekle", href: "/admin/mangas/new", icon: PlusCircle },
        { name: "Türler / Kategoriler", href: "/admin/genres", icon: Layers },
        { name: "Bölüm Yönetimi", href: "/admin/chapters", icon: Layers },
      ],
    },
    {
      title: "Kullanıcı & Topluluk",
      items: [
        { name: "Üyeler", href: "/admin/users", icon: Users },
        { name: "Yorumlar", href: "/admin/comments", icon: MessageSquare },
      ],
    },
    {
      title: "Görünüm & Ayarlar",
      items: [
        { name: "Slider Yönetimi", href: "/admin/appearance", icon: ImageIcon },
        { name: "SEO Ayarları", href: "/admin/settings/seo", icon: Globe },
        { name: "Sunucu / CDN", href: "/admin/settings/server", icon: Server },
        { name: "Genel Ayarlar", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <div
      className="w-64 bg-black border-r border-white/10 h-screen fixed left-0 top-0 overflow-y-auto flex flex-col 
    scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
    >
      {/* Logo Alanı */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-green-500">Taluc</span>Admin
        </h1>
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
  );
}
