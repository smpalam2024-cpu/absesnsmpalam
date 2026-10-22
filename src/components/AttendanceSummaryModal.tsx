import React from 'react';
import { CheckCircle, AlertCircle, X, Send, ArrowLeft, Info } from 'lucide-react';
import { Student, AttendanceStatus, StudentAttendanceEntry } from '../types';
import { STATUS_CONFIG } from '../data/initialData';

interface AttendanceSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  className: string;
  date: string;
  sessionName: string;
  students: Student[];
  entries: Record<string, StudentAttendanceEntry>;
  summary: {
    total: number;
    hadir: number;
    terlambat: number;
    izin: number;
    sakit: number;
    alpa: number;
    percentage: number;
  };
  isOnline: boolean;
}

export const AttendanceSummaryModal: React.FC<AttendanceSummaryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  className,
  date,
  sessionName,
  students,
  entries,
  summary,
  isOnline,
}) => {
  if (!isOpen) return null;

  // Unmarked students
  const unmarkedStudents = students.filter((s) => !entries[s.id]?.status);

  // Non-present students (Terlambat, Izin, Sakit, Alpa)
  const nonHadirEntries = students
    .map((s) => ({
      student: s,
      entry: entries[s.id],
    }))
    .filter((item) => item.entry && item.entry.status !== 'hadir');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/1713909500616_5b14171f.png"
              alt="Logo SMP Alam Excellentia"
              className="w-12 h-12 object-contain bg-white/10 rounded-full p-1 shrink-0"
            />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                SMP ALAM EXCELLENTIA PAMEKASAN
              </span>
              <h3 className="text-lg font-bold leading-tight mt-0.5">
                Konfirmasi Absensi {className}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Tanggal: <strong>{date}</strong> • {sessionName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Unmarked warning if any */}
          {unmarkedStudents.length > 0 && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Perhatian:</strong> Masih ada <strong>{unmarkedStudents.length} siswa</strong> yang belum dipilih status kehadirannya. Siswa yang belum ditandai akan diisi status default jika Anda tetap mengirim.
              </div>
            </div>
          )}

          {/* Quick Counter Badges */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Statistik Kehadiran
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                Tingkat Kehadiran: {summary.percentage}%
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                <div className="text-xl font-bold text-emerald-700">{summary.hadir}</div>
                <div className="text-[11px] font-semibold text-emerald-800">Hadir</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                <div className="text-xl font-bold text-amber-700">{summary.terlambat}</div>
                <div className="text-[11px] font-semibold text-amber-800">Terlambat</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
                <div className="text-xl font-bold text-blue-700">{summary.izin}</div>
                <div className="text-[11px] font-semibold text-blue-800">Izin</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-2.5 rounded-xl">
                <div className="text-xl font-bold text-purple-700">{summary.sakit}</div>
                <div className="text-[11px] font-semibold text-purple-800">Sakit</div>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                <div className="text-xl font-bold text-rose-700">{summary.alpa}</div>
                <div className="text-[11px] font-semibold text-rose-800">Alpa</div>
              </div>
            </div>
          </div>

          {/* Detail Siswa Tidak Hadir / Terlambat */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Daftar Siswa Tidak Hadir / Keterangan Khusus ({nonHadirEntries.length})
              </span>
            </div>

            {nonHadirEntries.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Semua <strong>{summary.total} siswa</strong> hadir tepat waktu! Luar biasa.</span>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {nonHadirEntries.map(({ student, entry }) => {
                  const cfg = STATUS_CONFIG[entry.status];
                  return (
                    <div key={student.id} className="p-3 bg-white flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <div className="font-semibold text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-400">NIS: {student.nis}</div>
                        {entry.note && (
                          <div className="text-[11px] text-slate-600 italic mt-0.5 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block">
                            Catatan: "{entry.note}"
                          </div>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color} ${cfg.bg}/15 border ${cfg.border}/30`}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Network Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              {isOnline
                ? 'Perangkat dalam kondisi Online. Data akan langsung disinkronkan ke server sekolah.'
                : 'Perangkat dalam kondisi Offline. Data akan tersimpan lokal di perangkat dan siap disinkronkan otomatis begitu jaringan terhubung.'}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali Periksa
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Konfirmasi & Kirim Absensi
          </button>
        </div>
      </div>
    </div>
  );
};
