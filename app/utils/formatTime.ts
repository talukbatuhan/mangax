// utils/formatTime.ts

export function formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    if (weeks > 0) {
        return weeks === 1 ? '1 hafta önce' : `${weeks} hafta önce`;
    }
    if (days > 0) {
        return days === 1 ? '1 gün önce' : `${days} gün önce`;
    }
    if (hours > 0) {
        return hours === 1 ? '1 saat önce' : `${hours} saat önce`;
    }
    if (minutes > 0) {
        return minutes === 1 ? '1 dakika önce' : `${minutes} dakika önce`;
    }
    return 'Şimdi';
}