import AdminSidebar from "@/app/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex">
      {/* Sol Menü (Sabit) */}
      <AdminSidebar />

      {/* Sağ İçerik (Değişken) */}
      {/* ml-64: Sidebar genişliği kadar soldan boşluk bırakıyoruz */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
           {children}
        </div>
      </main>
    </div>
  );
}