import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileEdit,
  Save,
  Send,
  Sparkles,
  MessageSquare,
  Check,
  Search,
  Filter,
  History,
  RotateCcw,
} from 'lucide-react';
import {
  AttendanceRecord,
  AttendanceStatus,
  SchoolClass,
  Session,
  Student,
  StudentAttendanceEntry,
  User,
} from '../types';
import { STATUS_CONFIG } from '../data/initialData';
import {
  findExistingRecord,
  getAllClasses,
  getAllSessions,
  getClassesForUser,
  getStudentsByClass,
  saveAttendanceRecord,
} from '../services/storageService';
import { AttendanceSummaryModal } from './AttendanceSummaryModal';

interface AttendanceFormProps {
  currentUser: User;
  isOnline: boolean;
  onOpenSyncQueue: () => void;
  onViewReports: (classId?: string) => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  currentUser,
  isOnline,
  onOpenSyncQueue,
  onViewReports,
}) => {
  // Available classes for current user
  const availableClasses = useMemo(() => getClassesForUser(currentUser), [currentUser]);
  const sessions = useMemo(() => getAllSessions(), []);

  // Form selections
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return availableClasses[0]?.id || 'cls-7a';
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [selectedSessionId, setSelectedSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'sesi-pagi';
  });

  // Search filter inside student list
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');

  // Students in selected class
  const students = useMemo(() => {
    return getStudentsByClass(selectedClassId);
  }, [selectedClassId]);

  // Existing record check for duplicate prevention (PRD 3.2)
  const existingRecord = useMemo(() => {
    return findExistingRecord(selectedClassId, selectedDate, selectedSessionId);
  }, [selectedClassId, selectedDate, selectedSessionId]);

  // Current entries in form: studentId -> StudentAttendanceEntry
  const [entries, setEntries] = useState<Record<string, StudentAttendanceEntry>>({});
  const [activeNoteStudentId, setActiveNoteStudentId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // UI modals & notifications
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<{
    text: string;
    wasOffline: boolean;
    syncedAt?: string;
  } | null>(null);

  // When class, date, or session changes, check if existing record exists; if yes, load it!
  useEffect(() => {
    if (existingRecord) {
      setEntries(existingRecord.entries);
    } else {
      // Default: empty or prefill from previous state
      const initial: Record<string, StudentAttendanceEntry> = {};
      setEntries(initial);
    }
    setSaveSuccessMessage(null);
  }, [selectedClassId, selectedDate, selectedSessionId, existingRecord]);

  // Handle setting status for a single student
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setEntries((prev) => {
      const existing = prev[studentId];
      return {
        ...prev,
        [studentId]: {
          studentId,
          status,
          note: existing?.note || '',
          recordedAt: new Date().toISOString(),
        },
      };
    });
  };

  // Bulk: Mark All Present ("Tandai Semua Hadir")
  const handleMarkAllHadir = () => {
    const now = new Date().toISOString();
    const updated: Record<string, StudentAttendanceEntry> = {};
    students.forEach((s) => {
      updated[s.id] = {
        studentId: s.id,
        status: 'hadir',
        note: entries[s.id]?.note || '',
        recordedAt: now,
      };
    });
    setEntries(updated);
  };

  // Reset all
  const handleReset = () => {
    if (window.confirm('Reset pilihan status kehadiran untuk seluruh siswa pada form ini?')) {
      setEntries({});
    }
  };

  // Note dialog handlers
  const handleOpenNote = (studentId: string) => {
    setActiveNoteStudentId(studentId);
    setTempNoteText(entries[studentId]?.note || '');
  };

  const handleSaveNote = () => {
    if (activeNoteStudentId) {
      setEntries((prev) => {
        const curr = prev[activeNoteStudentId] || {
          studentId: activeNoteStudentId,
          status: 'hadir',
          recordedAt: new Date().toISOString(),
        };
        return {
          ...prev,
          [activeNoteStudentId]: {
            ...curr,
            note: tempNoteText.trim(),
          },
        };
      });
      setActiveNoteStudentId(null);
    }
  };

  // Compute live summary counts
  const summary = useMemo(() => {
    let hadir = 0;
    let terlambat = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;

    students.forEach((s) => {
      const e = entries[s.id];
      if (!e) return;
      if (e.status === 'hadir') hadir++;
      else if (e.status === 'terlambat') terlambat++;
      else if (e.status === 'izin') izin++;
      else if (e.status === 'sakit') sakit++;
      else if (e.status === 'alpa') alpa++;
    });

    const total = students.length;
    const filledCount = hadir + terlambat + izin + sakit + alpa;
    const percentage = total > 0 ? Math.round(((hadir + terlambat) / total) * 1000) / 10 : 0;

    return {
      total,
      filledCount,
      hadir,
      terlambat,
      izin,
      sakit,
      alpa,
      percentage,
    };
  }, [students, entries]);

  // Execute Save (Draft or Final Submit)
  const executeSave = (isFinalSubmit: boolean) => {
    const recordId = existingRecord?.id || `rec-${selectedClassId}-${selectedDate}-${selectedSessionId}`;
    const now = new Date().toISOString();

    // Default unmarked students to 'hadir' if submitting, or leave blank if draft
    const finalEntries: Record<string, StudentAttendanceEntry> = { ...entries };
    if (isFinalSubmit) {
      students.forEach((s) => {
        if (!finalEntries[s.id]?.status) {
          finalEntries[s.id] = {
            studentId: s.id,
            status: 'hadir',
            note: '',
            recordedAt: now,
          };
        }
      });
    }

    // Recompute summary for final entries
    let h = 0, t = 0, i = 0, s = 0, a = 0;
    Object.values(finalEntries).forEach((e) => {
      if (e.status === 'hadir') h++;
      else if (e.status === 'terlambat') t++;
      else if (e.status === 'izin') i++;
      else if (e.status === 'sakit') s++;
      else if (e.status === 'alpa') a++;
    });
    const tot = students.length;
    const pct = tot > 0 ? Math.round(((h + t) / tot) * 1000) / 10 : 0;

    const recordToSave = {
      id: recordId,
      classId: selectedClassId,
      date: selectedDate,
      sessionId: selectedSessionId,
      status: (isFinalSubmit ? 'submitted' : 'draft') as 'draft' | 'submitted',
      entries: finalEntries,
      summary: {
        total: tot,
        hadir: h,
        terlambat: t,
        izin: i,
        sakit: s,
        alpa: a,
        percentage: pct,
      },
      createdByUserId: currentUser.id,
      createdByUserName: currentUser.name,
      createdRole: currentUser.role,
      createdAt: existingRecord?.createdAt || now,
      updatedAt: now,
    };

    const res = saveAttendanceRecord(recordToSave, isOnline);
    setEntries(finalEntries);
    setSaveSuccessMessage({
      text: res.message,
      wasOffline: res.wasOffline,
      syncedAt: res.record.syncedAt,
    });

    if (isFinalSubmit) {
      setShowSummaryModal(false);
    }
  };

  // Filter students based on search query & status filter
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery);

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      const st = entries[s.id]?.status;
      return st === statusFilter;
    });
  }, [students, searchQuery, statusFilter, entries]);

  const selectedClass = availableClasses.find((c) => c.id === selectedClassId) || availableClasses[0];
  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  return (
    <div className="space-y-6 pb-24">
      {/* Save Success Alert / Confirmation banner (PRD 3.4) */}
      {saveSuccessMessage && (
        <div className={`p-4 rounded-xl shadow-xs border flex items-start justify-between gap-3 animate-in fade-in ${
          saveSuccessMessage.wasOffline
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${saveSuccessMessage.wasOffline ? 'text-amber-600' : 'text-emerald-600'}`} />
            <div>
              <div className="font-bold text-sm">{saveSuccessMessage.text}</div>
              <div className="text-xs opacity-90 mt-0.5">
                {saveSuccessMessage.wasOffline
                  ? 'Catatan aman di perangkat Anda. Sistem akan sinkron otomatis saat online.'
                  : `Waktu Sinkronisasi Server: ${new Date(saveSuccessMessage.syncedAt || Date.now()).toLocaleTimeString('id-ID')} WIB`}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="text-xs font-semibold px-2 py-1 rounded hover:bg-black/5"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Selector Card (Date, Class, Session) */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/1713909500616_5b14171f.png"
              alt="Logo SMP Alam Excellentia"
              className="w-12 h-12 object-contain shrink-0 drop-shadow-xs"
            />
            <div>
              <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                SMP ALAM EXCELLENTIA PAMEKASAN
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Pencatatan Kehadiran Siswa
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedClass?.name} • Wali Kelas: <strong>{selectedClass?.homeroomTeacherName}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
            >
              Hari Ini
            </button>
            <button
              onClick={() => {
                const y = new Date();
                y.setDate(y.getDate() - 1);
                setSelectedDate(y.toISOString().split('T')[0]);
              }}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              Kemarin
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Tanggal Absensi
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-sm font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Kelas */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Pilih Kelas
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-sm font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.homeroomTeacherName})
                </option>
              ))}
            </select>
          </div>

          {/* Sesi / Mata Pelajaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Mata Pelajaran / Sesi
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full text-sm font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              {sessions.map((ses) => (
                <option key={ses.id} value={ses.id}>
                  {ses.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Existing Record Indicator & Double-Entry Prevention (PRD 3.2) */}
        {existingRecord ? (
          <div className="mt-4 p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <History className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <span>Catatan Absensi Sesi Ini Sudah Dibuat</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    existingRecord.status === 'submitted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {existingRecord.status === 'submitted' ? 'Final Dikirim' : 'Draf Lokal'}
                  </span>
                </div>
                <div className="text-indigo-800 mt-0.5 text-[11px]">
                  Dicatat oleh <strong>{existingRecord.createdByUserName}</strong> pada{' '}
                  {new Date(existingRecord.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB • Revisi #{existingRecord.revision}.
                  Sistem mencegah absensi ganda; perubahan yang Anda simpan akan memperbarui catatan ini.
                </div>
              </div>
            </div>
            <button
              onClick={() => onViewReports(selectedClassId)}
              className="text-xs font-semibold px-3 py-1.5 bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 rounded-lg shadow-xs transition shrink-0"
            >
              Lihat di Rekap Laporan
            </button>
          </div>
        ) : (
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sesi absensi baru untuk kelas dan tanggal ini siap diisi.</span>
          </div>
        )}
      </div>

      {/* Summary Stats Header Bar & Quick Actions */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Statistik Sesi: {summary.filledCount}/{summary.total} Terisi ({summary.percentage}% Hadir)
            </span>
          </div>

          {/* Quick Actions (Mark All Present, Reset) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllHadir}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tandai Semua Hadir
            </button>
            <button
              onClick={handleReset}
              title="Reset Pilihan"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <button
            onClick={() => setStatusFilter(statusFilter === 'hadir' ? 'all' : 'hadir')}
            className={`p-2.5 rounded-xl border transition text-left cursor-pointer ${
              statusFilter === 'hadir'
                ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-400'
                : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/60'
            }`}
          >
            <div className="text-[11px] text-emerald-800 font-medium">Hadir (H)</div>
            <div className="text-lg font-bold text-emerald-700">{summary.hadir}</div>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'terlambat' ? 'all' : 'terlambat')}
            className={`p-2.5 rounded-xl border transition text-left cursor-pointer ${
              statusFilter === 'terlambat'
                ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400'
                : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/60'
            }`}
          >
            <div className="text-[11px] text-amber-800 font-medium">Terlambat (T)</div>
            <div className="text-lg font-bold text-amber-700">{summary.terlambat}</div>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'izin' ? 'all' : 'izin')}
            className={`p-2.5 rounded-xl border transition text-left cursor-pointer ${
              statusFilter === 'izin'
                ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-400'
                : 'bg-blue-50/70 border-blue-200 hover:bg-blue-100/60'
            }`}
          >
            <div className="text-[11px] text-blue-800 font-medium">Izin (I)</div>
            <div className="text-lg font-bold text-blue-700">{summary.izin}</div>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'sakit' ? 'all' : 'sakit')}
            className={`p-2.5 rounded-xl border transition text-left cursor-pointer ${
              statusFilter === 'sakit'
                ? 'bg-purple-100 border-purple-500 ring-2 ring-purple-400'
                : 'bg-purple-50/70 border-purple-200 hover:bg-purple-100/60'
            }`}
          >
            <div className="text-[11px] text-purple-800 font-medium">Sakit (S)</div>
            <div className="text-lg font-bold text-purple-700">{summary.sakit}</div>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'alpa' ? 'all' : 'alpa')}
            className={`p-2.5 rounded-xl border transition text-left cursor-pointer ${
              statusFilter === 'alpa'
                ? 'bg-rose-100 border-rose-500 ring-2 ring-rose-400'
                : 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/60'
            }`}
          >
            <div className="text-[11px] text-rose-800 font-medium">Alpa (A)</div>
            <div className="text-lg font-bold text-rose-700">{summary.alpa}</div>
          </button>
        </div>

        {/* Search bar & filter notice */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama atau NIS siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {statusFilter !== 'all' && (
            <div className="text-xs text-slate-600 flex items-center gap-1.5 self-start sm:self-auto">
              <span>Menampilkan filter: <strong>{STATUS_CONFIG[statusFilter].label}</strong></span>
              <button
                onClick={() => setStatusFilter('all')}
                className="text-blue-600 hover:underline font-semibold"
              >
                Hapus Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Student List Container (PRD 3.3) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <span>Daftar Siswa ({filteredStudents.length} Siswa)</span>
          <span className="hidden sm:inline">Pilihan Cepat Status Kehadiran</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Tidak ada siswa yang sesuai dengan filter atau pencarian.
            </div>
          ) : (
            filteredStudents.map((student, idx) => {
              const currentEntry = entries[student.id];
              const currentStatus = currentEntry?.status;
              const hasNote = Boolean(currentEntry?.note);

              return (
                <div
                  key={student.id}
                  className={`p-3.5 sm:p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    currentStatus ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  {/* Student details */}
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-xs font-mono font-semibold text-slate-400 w-6 pt-1 text-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {student.name}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          student.gender === 'L' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>NIS: {student.nis}</span>
                        {student.parentName && (
                          <span className="hidden md:inline">• Wali: {student.parentName}</span>
                        )}
                      </div>

                      {/* Display note preview if any */}
                      {hasNote && (
                        <div className="mt-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-blue-100">
                          <MessageSquare className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate max-w-xs">{currentEntry?.note}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Status Buttons (H, T, I, S, A) & Note Trigger */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    {(['hadir', 'terlambat', 'izin', 'sakit', 'alpa'] as AttendanceStatus[]).map((st) => {
                      const cfg = STATUS_CONFIG[st];
                      const isSelected = currentStatus === st;
                      return (
                        <button
                          key={st}
                          onClick={() => handleSetStatus(student.id, st)}
                          title={`${cfg.label} - ${cfg.desc}`}
                          className={`w-9 h-9 sm:w-10 sm:h-9 rounded-xl font-bold text-xs flex items-center justify-center transition active:scale-90 cursor-pointer ${
                            isSelected
                              ? `${cfg.bg} text-white shadow-sm ring-2 ring-offset-1 ${cfg.border}`
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {cfg.badge}
                        </button>
                      );
                    })}

                    {/* Note Popover / Edit Button */}
                    <button
                      onClick={() => handleOpenNote(student.id)}
                      title={hasNote ? `Ubah catatan (${currentEntry?.note})` : 'Tambah catatan/alasan'}
                      className={`h-9 px-2.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                        hasNote
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">{hasNote ? 'Catatan' : '+Alasan'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Note Dialog Modal */}
      {activeNoteStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5 text-slate-800">
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Tambah Catatan / Alasan Kehadiran
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Siswa: <strong>{students.find((s) => s.id === activeNoteStudentId)?.name}</strong>
            </p>

            <textarea
              rows={3}
              value={tempNoteText}
              onChange={(e) => setTempNoteText(e.target.value)}
              placeholder="Contoh: Sakit demam ada surat dokter / Izin upacara adat / Terlambat 15 menit..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveNoteStudentId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Action Bar for Easy Mobile Submissions */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-3">
            <span className="font-semibold text-slate-800">
              {selectedClass?.name} • {selectedDate}
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="text-slate-500">
              Terisi: <strong>{summary.filledCount}</strong> dari {summary.total} siswa
            </span>
            <span className="hidden md:inline text-emerald-600 font-semibold">
              ({summary.percentage}% Hadir)
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Simpan Draf (PRD 3.3) */}
            <button
              onClick={() => executeSave(false)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              Simpan Draf
            </button>

            {/* Tinjau & Kirim Absensi (PRD 3.4) */}
            <button
              onClick={() => setShowSummaryModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Tinjau & Kirim Absensi
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Summary Modal (PRD 3.4) */}
      <AttendanceSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        onConfirm={() => executeSave(true)}
        className={selectedClass?.name || selectedClassId}
        date={selectedDate}
        sessionName={selectedSession?.name || selectedSessionId}
        students={students}
        entries={entries}
        summary={summary}
        isOnline={isOnline}
      />
    </div>
  );
};
