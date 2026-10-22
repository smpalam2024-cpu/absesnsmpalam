import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, Clock, CloudOff, AlertTriangle, Database, Zap } from 'lucide-react';
import { AttendanceRecord, ConflictItem, Student } from '../types';
import { getAllClasses, getAllSessions, syncPendingRecords, simulateConflict } from '../services/storageService';

interface SyncQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: AttendanceRecord[];
  isOnline: boolean;
  onSelectConflict: (conflict: ConflictItem) => void;
  students: Student[];
  onRefresh: () => void;
}

export const SyncQueueDrawer: React.FC<SyncQueueDrawerProps> = ({
  isOpen,
  onClose,
  records,
  isOnline,
  onSelectConflict,
  students,
  onRefresh,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const classes = getAllClasses();
  const sessions = getAllSessions();

  const pendingRecords = records.filter((r) => r.syncStatus === 'pending_sync' || r.syncStatus === 'local_saved');
  const conflictRecords = records.filter((r) => r.syncStatus === 'conflict');
  const syncedRecords = records.filter((r) => r.syncStatus === 'synced');

  const handleManualSync = () => {
    if (!isOnline) {
      setLastSyncResult('Gagal: Perangkat sedang offline. Periksa koneksi internet Anda.');
      return;
    }
    setIsSyncing(true);
    setTimeout(() => {
      const { syncedCount, conflicts } = syncPendingRecords();
      setIsSyncing(false);
      onRefresh();

      if (conflicts.length > 0) {
        setLastSyncResult(`Ditemukan ${conflicts.length} konflik sinkronisasi. Harap selesaikan konflik terlebih dahulu.`);
        onSelectConflict(conflicts[0]);
      } else {
        setLastSyncResult(`Berhasil menyinkronkan ${syncedCount} catatan ke server.`);
      }
    }, 600);
  };

  const handleTestConflict = (record: AttendanceRecord) => {
    simulateConflict(record.id);
    onRefresh();
    setLastSyncResult('Simulasi konflik dibuat pada catatan ini. Silakan klik "Sinkronkan Sekarang" untuk menguji modal resolusi konflik!');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col text-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Pusat Sinkronisasi & Antrean PWA
              </h3>
              <p className="text-xs text-slate-500">
                Status data lokal & server sekolah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connectivity status alert */}
        <div className={`px-4 py-3 text-xs flex items-center justify-between border-b ${
          isOnline ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-amber-50 text-amber-800 border-amber-100'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-medium">
              {isOnline ? 'Terhubung ke Jaringan (Online)' : 'Mode Offline — Data tersimpan di memori perangkat'}
            </span>
          </div>
          <button
            onClick={handleManualSync}
            disabled={isSyncing || !isOnline}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold shadow-xs transition ${
              isOnline
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sinkronkan
          </button>
        </div>

        {lastSyncResult && (
          <div className="p-3 mx-4 my-2 text-xs bg-slate-100 rounded-lg border border-slate-200 text-slate-700">
            {lastSyncResult}
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Summary counters */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
              <div className="text-lg font-bold text-amber-700">{pendingRecords.length}</div>
              <div className="text-[11px] text-amber-800">Menunggu Sync</div>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
              <div className="text-lg font-bold text-rose-700">{conflictRecords.length}</div>
              <div className="text-[11px] text-rose-800">Konflik</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
              <div className="text-lg font-bold text-emerald-700">{syncedRecords.length}</div>
              <div className="text-[11px] text-emerald-800">Tersinkron</div>
            </div>
          </div>

          {/* Pending items */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Menunggu Sinkronisasi ({pendingRecords.length})
            </h4>

            {pendingRecords.length === 0 ? (
              <div className="p-3 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                Semua catatan lokal telah tersinkronkan ke server.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingRecords.map((r) => {
                  const className = classes.find((c) => c.id === r.classId)?.name || r.classId;
                  const sessionName = sessions.find((s) => s.id === r.sessionId)?.name || r.sessionId;
                  return (
                    <div key={r.id} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{className}</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-semibold text-[10px]">
                          Tersimpan di Perangkat
                        </span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        {r.date} • {sessionName}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Ringkasan: {r.summary.hadir} Hadir, {r.summary.sakit} Sakit, {r.summary.izin} Izin, {r.summary.alpa} Alpa
                      </div>
                      <div className="pt-1 text-[10px] text-amber-700 flex items-center justify-between">
                        <span>Disimpan: {new Date(r.updatedAt).toLocaleTimeString('id-ID')} WIB</span>
                        <span className="font-mono">Rev #{r.revision}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Conflict items */}
          {conflictRecords.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Perlu Resolusi Konflik ({conflictRecords.length})
              </h4>
              <div className="space-y-2">
                {conflictRecords.map((r) => {
                  const className = classes.find((c) => c.id === r.classId)?.name || r.classId;
                  const sessionName = sessions.find((s) => s.id === r.sessionId)?.name || r.sessionId;
                  return (
                    <div key={r.id} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-950">{className}</span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 font-semibold text-[10px]">
                          Konflik Versi
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-800">
                        Catatan ini telah diubah di server dengan revisi lebih baru.
                      </p>
                      <button
                        onClick={() => {
                          const conflict: ConflictItem = {
                            recordId: r.id,
                            classId: r.classId,
                            className,
                            date: r.date,
                            sessionName,
                            localRecord: r,
                            serverRecord: r, // Will be fetched inside modal or service
                          };
                          onSelectConflict(conflict);
                        }}
                        className="w-full py-1.5 bg-rose-600 text-white font-semibold rounded-lg text-xs hover:bg-rose-700 transition"
                      >
                        Buka & Selesaikan Konflik
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Synced items */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Tersinkronkan ke Server ({syncedRecords.length})
            </h4>
            <div className="space-y-2">
              {syncedRecords.slice(0, 5).map((r) => {
                const className = classes.find((c) => c.id === r.classId)?.name || r.classId;
                const sessionName = sessions.find((s) => s.id === r.sessionId)?.name || r.sessionId;
                return (
                  <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{className}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Tersinkron
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {r.date} • {sessionName}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Sync: {r.syncedAt ? new Date(r.syncedAt).toLocaleTimeString('id-ID') : '-'} WIB</span>
                      <button
                        onClick={() => handleTestConflict(r)}
                        title="Simulasikan modifikasi di server untuk menguji deteksi konflik"
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                      >
                        <Zap className="w-2.5 h-2.5" />
                        Uji Simulasi Konflik
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed">
          <strong>Perlindungan Data Lokal:</strong> Sesuai PRD 3.5, data kehadiran yang belum tersinkronisasi aman disimpan di perangkat Anda dan tidak akan dihapus tanpa konfirmasi.
        </div>
      </div>
    </div>
  );
};
