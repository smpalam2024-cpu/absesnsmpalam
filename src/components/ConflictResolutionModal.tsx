import React from 'react';
import { AlertTriangle, Check, RefreshCw, X, ArrowRight, ShieldAlert } from 'lucide-react';
import { ConflictItem, Student } from '../types';
import { STATUS_CONFIG } from '../data/initialData';
import { resolveConflict } from '../services/storageService';

interface ConflictResolutionModalProps {
  conflict: ConflictItem | null;
  students: Student[];
  onClose: () => void;
  onResolved: () => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  conflict,
  students,
  onClose,
  onResolved,
}) => {
  if (!conflict) return null;

  const { localRecord, serverRecord, className, date, sessionName } = conflict;

  const handleResolve = (choice: 'local' | 'server' | 'merge') => {
    resolveConflict(conflict.recordId, choice);
    onResolved();
    onClose();
  };

  // Find differing students
  const studentMap = new Map(students.map((s) => [s.id, s]));
  const allStudentIds = Array.from(
    new Set([...Object.keys(localRecord.entries), ...Object.keys(serverRecord.entries)])
  );

  const diffs = allStudentIds
    .map((sId) => {
      const localEntry = localRecord.entries[sId];
      const serverEntry = serverRecord.entries[sId];
      const student = studentMap.get(sId);
      const isDifferent = localEntry?.status !== serverEntry?.status || localEntry?.note !== serverEntry?.note;
      return {
        studentId: sId,
        studentName: student?.name || sId,
        nis: student?.nis || '-',
        localStatus: localEntry?.status,
        localNote: localEntry?.note,
        serverStatus: serverEntry?.status,
        serverNote: serverEntry?.note,
        isDifferent,
      };
    })
    .filter((d) => d.isDifferent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-5 bg-amber-50 border-b border-amber-200 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-950 flex items-center gap-2">
                Konflik Data Sinkronisasi Terdeteksi
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Absensi untuk <strong>{className}</strong> ({date} • {sessionName}) telah diubah di server oleh pengguna lain saat Anda offline.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-800 hover:text-amber-950 p-1.5 rounded-lg hover:bg-amber-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Versi Lokal */}
            <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  Versi Perangkat Ini (Lokal)
                </span>
                <span className="text-xs text-slate-500 font-mono">Rev #{localRecord.revision}</span>
              </div>
              <div className="text-sm font-semibold text-slate-800">{localRecord.createdByUserName}</div>
              <div className="text-xs text-slate-500 mb-3">
                Waktu: {new Date(localRecord.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </div>
              <div className="grid grid-cols-5 gap-1 text-center text-xs">
                <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded">
                  <div className="font-bold">{localRecord.summary.hadir}</div>
                  <div className="text-[10px]">Hadir</div>
                </div>
                <div className="bg-amber-100 text-amber-800 p-1.5 rounded">
                  <div className="font-bold">{localRecord.summary.terlambat}</div>
                  <div className="text-[10px]">T</div>
                </div>
                <div className="bg-blue-100 text-blue-800 p-1.5 rounded">
                  <div className="font-bold">{localRecord.summary.izin}</div>
                  <div className="text-[10px]">Izin</div>
                </div>
                <div className="bg-purple-100 text-purple-800 p-1.5 rounded">
                  <div className="font-bold">{localRecord.summary.sakit}</div>
                  <div className="text-[10px]">Sakit</div>
                </div>
                <div className="bg-rose-100 text-rose-800 p-1.5 rounded">
                  <div className="font-bold">{localRecord.summary.alpa}</div>
                  <div className="text-[10px]">Alpa</div>
                </div>
              </div>
            </div>

            {/* Versi Server */}
            <div className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                  Versi Server Sekolah
                </span>
                <span className="text-xs text-slate-500 font-mono">Rev #{serverRecord.revision}</span>
              </div>
              <div className="text-sm font-semibold text-slate-800">{serverRecord.createdByUserName}</div>
              <div className="text-xs text-slate-500 mb-3">
                Waktu: {new Date(serverRecord.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </div>
              <div className="grid grid-cols-5 gap-1 text-center text-xs">
                <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded">
                  <div className="font-bold">{serverRecord.summary.hadir}</div>
                  <div className="text-[10px]">Hadir</div>
                </div>
                <div className="bg-amber-100 text-amber-800 p-1.5 rounded">
                  <div className="font-bold">{serverRecord.summary.terlambat}</div>
                  <div className="text-[10px]">T</div>
                </div>
                <div className="bg-blue-100 text-blue-800 p-1.5 rounded">
                  <div className="font-bold">{serverRecord.summary.izin}</div>
                  <div className="text-[10px]">Izin</div>
                </div>
                <div className="bg-purple-100 text-purple-800 p-1.5 rounded">
                  <div className="font-bold">{serverRecord.summary.sakit}</div>
                  <div className="text-[10px]">Sakit</div>
                </div>
                <div className="bg-rose-100 text-rose-800 p-1.5 rounded">
                  <div className="font-bold">{serverRecord.summary.alpa}</div>
                  <div className="text-[10px]">Alpa</div>
                </div>
              </div>
            </div>
          </div>

          {/* Differences comparison */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Daftar Siswa dengan Perbedaan Status ({diffs.length} Siswa)
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              {diffs.map((d) => {
                const localCfg = d.localStatus ? STATUS_CONFIG[d.localStatus] : null;
                const serverCfg = d.serverStatus ? STATUS_CONFIG[d.serverStatus] : null;
                return (
                  <div key={d.studentId} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-800">{d.studentName}</div>
                      <div className="text-[11px] text-slate-400">NIS: {d.nis}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 rounded font-medium ${localCfg ? localCfg.color + ' bg-slate-100' : ''}`}>
                          Lokal: {localCfg?.label || '-'}
                        </span>
                        {d.localNote && <div className="text-[10px] text-slate-500 italic mt-0.5">{d.localNote}</div>}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded font-medium ${serverCfg ? serverCfg.color + ' bg-slate-100' : ''}`}>
                          Server: {serverCfg?.label || '-'}
                        </span>
                        {d.serverNote && <div className="text-[10px] text-slate-500 italic mt-0.5">{d.serverNote}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            onClick={() => handleResolve('server')}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition shadow-xs"
          >
            Pakai Versi Server (Sekolah)
          </button>
          <button
            onClick={() => handleResolve('merge')}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-xs"
          >
            Gabungkan Keduanya (Merge)
          </button>
          <button
            onClick={() => handleResolve('local')}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
          >
            Pakai Versi Perangkat Ini (Lokal)
          </button>
        </div>
      </div>
    </div>
  );
};
