import React, { useState } from 'react';
import {
  ClipboardCheck,
  Wifi,
  WifiOff,
  CloudUpload,
  User as UserIcon,
  ChevronDown,
  FileSpreadsheet,
  Settings,
  Shield,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
} from 'lucide-react';
import { User } from '../types';
import { getAllUsers, setCurrentUser } from '../services/storageService';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentUser: User;
  activeView: 'attendance' | 'reports' | 'admin';
  onNavigate: (view: 'attendance' | 'reports' | 'admin') => void;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  pendingSyncCount: number;
  conflictCount: number;
  onOpenSyncDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  onNavigate,
  isOnline,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  pendingSyncCount,
  conflictCount,
  onOpenSyncDrawer,
}) => {
  const allUsers = getAllUsers();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    setShowRoleMenu(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/1713909500616_5b14171f.png"
              alt="Logo SMP Alam Excellentia Pamekasan"
              className="w-11 h-11 object-contain drop-shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 leading-none tracking-tight">
                  SMP ALAM EXCELLENTIA
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5 font-medium truncate max-w-sm">
                Jl. Lawangan Daya No 114 Pademawu, Pamekasan
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => onNavigate('attendance')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeView === 'attendance'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Catat Kehadiran
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeView === 'reports'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laporan & Rekap
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kelola Data & Audit
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Network status & Offline toggle */}
            <div className="flex items-center">
              <button
                onClick={onToggleSimulatedOffline}
                title={
                  isSimulatedOffline
                    ? 'Klik untuk kembali Online (Sinkron otomatis)'
                    : 'Klik untuk menguji simulasi mode Offline'
                }
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
                }`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                    <span>Offline</span>
                  </>
                )}
                <span className="text-[10px] text-slate-400 hidden lg:inline">
                  ({isSimulatedOffline ? 'Simulasi' : 'Jaringan'})
                </span>
              </button>
            </div>

            {/* Sync Queue Button with Badge */}
            <button
              onClick={onOpenSyncDrawer}
              title="Buka Pusat Antrean Sinkronisasi PWA"
              className="relative p-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition border border-slate-200 cursor-pointer"
            >
              <CloudUpload className="w-4 h-4" />
              {(pendingSyncCount > 0 || conflictCount > 0) && (
                <span className={`absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full text-white ${
                  conflictCount > 0 ? 'bg-rose-600 animate-bounce' : 'bg-amber-500'
                }`}>
                  {conflictCount > 0 ? '!' : pendingSyncCount}
                </span>
              )}
            </button>

            {/* PWA Install Button */}
            <div className="hidden sm:block">
              <PWAInstallButton variant="navbar" />
            </div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left text-xs leading-tight">
                  <div className="font-bold text-slate-800 truncate max-w-[120px]">
                    {currentUser.name.split(',')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {currentUser.roleLabel}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Dropdown Menu */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Ganti Akun & Hak Akses (PRD 2)
                    </span>
                  </div>

                  <div className="divide-y divide-slate-50">
                    {allUsers.map((u) => {
                      const isCurrent = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSwitchUser(u)}
                          className={`w-full p-3 text-left transition flex items-start gap-2.5 hover:bg-slate-50 cursor-pointer ${
                            isCurrent ? 'bg-blue-50/70' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 truncate">
                              {u.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {u.roleLabel}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              NIP: {u.nip}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {showMobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {showMobileNav && (
          <div className="md:hidden border-t border-slate-200 bg-white p-3 space-y-2">
            <button
              onClick={() => {
                onNavigate('attendance');
                setShowMobileNav(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                activeView === 'attendance' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Catat Kehadiran Siswa
            </button>
            <button
              onClick={() => {
                onNavigate('reports');
                setShowMobileNav(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                activeView === 'reports' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Laporan & Rekap Kehadiran
            </button>
            <button
              onClick={() => {
                onNavigate('admin');
                setShowMobileNav(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                activeView === 'admin' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Kelola Data & Audit Log
            </button>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <PWAInstallButton variant="navbar" />
              <button
                onClick={onOpenSyncDrawer}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Pusat Sinkronisasi ({pendingSyncCount})
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
