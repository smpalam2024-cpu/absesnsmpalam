import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'banner' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed and running as standalone PWA, suppress
  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        PWA Terpasang
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General prompt or info
      setShowIOSGuide(true);
    }
  };

  if (variant === 'banner') {
    return (
      <>
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-3 sm:p-4 rounded-xl shadow-md mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-lg shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base leading-tight">
                Pasang Aplikasi Absensi di Perangkat Anda (PWA)
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                Buka lebih cepat, bisa digunakan saat offline, tanpa perlu instalasi dari App Store/Play Store.
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 bg-white text-blue-800 hover:bg-blue-50 font-medium px-4 py-2 rounded-lg text-xs sm:text-sm shadow transition shrink-0 active:scale-95"
          >
            <Download className="w-4 h-4" />
            {isIOS ? 'Cara Pasang di iOS' : 'Pasang Aplikasi'}
          </button>
        </div>

        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Pasang PWA ke layar utama"
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition active:scale-95 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isIOS ? 'Pasang di iOS' : 'Pasang PWA'}</span>
      </button>

      {showIOSGuide && (
        <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
      )}
    </>
  );
};

interface IOSInstallModalProps {
  onClose: () => void;
}

const IOSInstallModal: React.FC<IOSInstallModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pasang Aplikasi di Layar Utama (PWA)
            </h3>
            <p className="text-xs text-slate-500">
              Akses cepat seperti aplikasi bawaan di HP & Tablet Anda
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div className="leading-snug">
              Buka aplikasi ini di browser (Safari di iPhone/iPad, atau Chrome di Android).
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div className="leading-snug flex items-center gap-1.5 flex-wrap">
              Tekan tombol <Share2 className="w-4 h-4 text-blue-600 inline" /> <strong>Bagikan (Share)</strong> di bilah navigasi bawah browser.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div className="leading-snug flex items-center gap-1.5 flex-wrap">
              Gulir ke bawah dan pilih <PlusSquare className="w-4 h-4 text-blue-600 inline" /> <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Setelah ditambahkan, aplikasi dapat dibuka langsung secara offline dari layar beranda Anda.</span>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition active:scale-98"
        >
          Mengerti, Tutup
        </button>
      </div>
    </div>
  );
};
