/**
 * Resmi tarayıcıda sıkıştırır ve WebP formatına çevirir.
 * @param file - Orijinal dosya
 * @param quality - Kalite (0 ile 1 arası, varsayılan 0.8)
 * @param maxWidth - Maksimum genişlik (varsayılan 1600px)
 */
export async function compressImage(file: File, quality = 0.8, maxWidth = 1600): Promise<File> {
  return new Promise((resolve, reject) => {
    // 1. Dosya resim değilse olduğu gibi döndür
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        // 2. Yeni boyutları hesapla (Aspect Ratio korunur)
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // 3. Canvas oluştur ve resmi çiz
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error('Canvas context oluşturulamadı'));
            return;
        }
        
        // Pürüzsüzleştirme (Opsiyonel)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);

        // 4. Canvas'ı WebP blob'una dönüştür
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Sıkıştırma başarısız oldu'));
            return;
          }

          // 5. Yeni bir File nesnesi oluştur
          // Dosya adının uzantısını .webp yap
          const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          
          const compressedFile = new File([blob], newName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        }, 'image/webp', quality);
      };

      img.onerror = (error) => reject(error);
    };

    reader.onerror = (error) => reject(error);
  });
}