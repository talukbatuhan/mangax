import Link from "next/link";

const CATEGORIES = [
    "Aksiyon", "Aşırı Güçlü", "Bilim Kurgu", "Büyü", "Canavar", 
    "Dahi MC", "Dedektif", "Doğaüstü", "Dram", "Fantastik", 
    "Gerilim", "Gizem", "Harem", "Isekai", "Komedi", 
    "Korku", "Macera", "Mecha", "Okul", "Psikolojik", 
    "Romantik", "Savaş", "Spor", "Tarihi", "Wuxia"
];

export default function CategoryBar() {
  return (
    // DEĞİŞİKLİK: Düz siyah yerine yarı saydam, bulanık ve altı parlayan bir bar.
    <div className="w-full bg-black/60 backdrop-blur-md border-b border-green-500/20 sticky top-16 z-40 shadow-[0_4px_20px_-5px_rgba(34,197,94,0.2)]">
      
      <div className="container mx-auto">
        <div className="flex items-center overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] py-2">
          
          {CATEGORIES.map((cat) => (
            <Link 
              key={cat}
              href={`/search?genre=${cat}`}
              className="
                relative group
                px-5 py-3
                // DEĞİŞİKLİK: Varsayılan renk gri yerine hafif yeşile çalan beyaz.
                text-sm font-bold text-green-100/70 
                hover:text-white
                transition-all duration-300
                flex items-center justify-center
              "
            >
              {/* Hover'da hafif yukarı kalkma efekti */}
              <span className="group-hover:-translate-y-0.5 transition-transform duration-300">{cat}</span>
              
              {/* DEĞİŞİKLİK: Alt çizgi daha parlak ve canlı yeşil */}
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-green-400 to-green-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left shadow-[0_0_10px_rgba(34,197,94,0.7)]"></span>
            </Link>
          ))}
          
        </div>
      </div>
    </div>
  );
}