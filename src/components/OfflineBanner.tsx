import React from 'react';
import { WifiOff, CloudUpload, RefreshCw } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
  isSimulated: boolean;
  pendingCount: number;
  onOpenSync: () => void;
  onReconnect: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  isSimulated,
  pendingCount,
  onOpenSync,
  onReconnect,
}) => {
  if (isOnline) return null;

  return (
    <aside
      aria-label="Status Koneksi"
      className="fixed bottom-20 sm:bottom-6 right-4 z-40 max-w-sm bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5">
          <WifiOff className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <span>Mode Offline Aktif</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
            Data tersimpan aman di perangkat.
            {pendingCount > 0 && ` Ada ${pendingCount} catatan menunggu sinkronisasi.`}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={onOpenSync}
              className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 underline cursor-pointer"
            >
              Lihat Antrean ({pendingCount})
            </button>
            {isSimulated && (
              <button
                onClick={onReconnect}
                className="text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded-md cursor-pointer"
              >
                Kembalikan Online
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
