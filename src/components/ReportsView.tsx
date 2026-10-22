import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  Users,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import {
  AttendanceRecord,
  AttendanceStatus,
  SchoolClass,
  Student,
  User,
} from '../types';
import { STATUS_CONFIG } from '../data/initialData';
import {
  getAllAttendanceRecords,
  getAllClasses,
  getAllSessions,
  getAllStudents,
  getClassesForUser,
} from '../services/storageService';

interface ReportsViewProps {
  currentUser: User;
  initialClassId?: string;
  onSelectRecordForEdit?: (record: AttendanceRecord) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentUser,
  initialClassId,
  onSelectRecordForEdit,
}) => {
  const classes = useMemo(() => getClassesForUser(currentUser), [currentUser]);
  const allStudents = useMemo(() => getAllStudents(), []);
  const sessions = useMemo(() => getAllSessions(), []);
  const records = useMemo(() => getAllAttendanceRecords(), []);

  // Filter states
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || (classes.length > 0 ? 'all' : 'cls-7a')
  );

  const [dateRangeMode, setDateRangeMode] = useState<'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [searchStudent, setSearchStudent] = useState('');
  const [activeTab, setActiveTab] = useState<'records' | 'students'>('records');

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Class filter
      if (selectedClassId !== 'all' && r.classId !== selectedClassId) {
        return false;
      }
      // Guru role check: can only see assigned classes
      if (currentUser.role === 'guru' && !currentUser.assignedClassIds.includes(r.classId)) {
        return false;
      }
      // Date filter
      if (dateRangeMode === 'custom') {
        if (r.date < startDate || r.date > endDate) return false;
      }
      return true;
    });
  }, [records, selectedClassId, currentUser, dateRangeMode, startDate, endDate]);

  // Aggregated Overall Totals
  const totals = useMemo(() => {
    let totalEntries = 0;
    let hadir = 0;
    let terlambat = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;

    filteredRecords.forEach((r) => {
      totalEntries += r.summary.total;
      hadir += r.summary.hadir;
      terlambat += r.summary.terlambat;
      izin += r.summary.izin;
      sakit += r.summary.sakit;
      alpa += r.summary.alpa;
    });

    const attendanceRate =
      totalEntries > 0 ? Math.round(((hadir + terlambat) / totalEntries) * 1000) / 10 : 0;

    return {
      recordCount: filteredRecords.length,
      totalEntries,
      hadir,
      terlambat,
      izin,
      sakit,
      alpa,
      attendanceRate,
    };
  }, [filteredRecords]);

  // Per-student aggregated metrics
  const studentStats = useMemo(() => {
    const relevantStudents = allStudents.filter((s) => {
      if (selectedClassId !== 'all' && s.classId !== selectedClassId) return false;
      if (currentUser.role === 'guru' && !currentUser.assignedClassIds.includes(s.classId)) return false;
      if (searchStudent) {
        return (
          s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
          s.nis.includes(searchStudent)
        );
      }
      return true;
    });

    return relevantStudents.map((student) => {
      let hadir = 0, terlambat = 0, izin = 0, sakit = 0, alpa = 0;
      let recordedSessions = 0;

      filteredRecords.forEach((rec) => {
        const entry = rec.entries[student.id];
        if (entry) {
          recordedSessions++;
          if (entry.status === 'hadir') hadir++;
          else if (entry.status === 'terlambat') terlambat++;
          else if (entry.status === 'izin') izin++;
          else if (entry.status === 'sakit') sakit++;
          else if (entry.status === 'alpa') alpa++;
        }
      });

      const rate =
        recordedSessions > 0
          ? Math.round(((hadir + terlambat) / recordedSessions) * 1000) / 10
          : 0;

      const cls = classes.find((c) => c.id === student.classId);

      return {
        student,
        className: cls?.name || student.classId,
        recordedSessions,
        hadir,
        terlambat,
        izin,
        sakit,
        alpa,
        rate,
      };
    });
  }, [allStudents, selectedClassId, currentUser, searchStudent, filteredRecords, classes]);

  // Export to CSV / Excel spreadsheet (PRD 5)
  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Microsoft Excel

    if (activeTab === 'students') {
      csvContent += 'NIS,NISN,Nama Siswa,Kelas,Total Sesi,Hadir,Terlambat,Izin,Sakit,Alpa,Persentase Kehadiran (%)\n';
      studentStats.forEach((row) => {
        csvContent += `"${row.student.nis}","${row.student.nisn}","${row.student.name}","${row.className}",${row.recordedSessions},${row.hadir},${row.terlambat},${row.izin},${row.sakit},${row.alpa},${row.rate}%\n`;
      });
    } else {
      csvContent += 'Tanggal,Kelas,Sesi,Status Catatan,Pencatat,Total Siswa,Hadir,Terlambat,Izin,Sakit,Alpa,% Kehadiran,Status Sinkronisasi,Waktu Dibuat\n';
      filteredRecords.forEach((r) => {
        const clsName = classes.find((c) => c.id === r.classId)?.name || r.classId;
        const sesName = sessions.find((s) => s.id === r.sessionId)?.name || r.sessionId;
        csvContent += `"${r.date}","${clsName}","${sesName}","${r.status}","${r.createdByUserName}",${r.summary.total},${r.summary.hadir},${r.summary.terlambat},${r.summary.izin},${r.summary.sakit},${r.summary.alpa},${r.summary.percentage}%,"${r.syncStatus}","${r.createdAt}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `laporan_absensi_siswa_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Kop Resmi Sekolah / School Letterhead */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
        <img
          src="/assets/aistudio/1713909500616_5b14171f.png"
          alt="SMP Alam Excellentia Pamekasan"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-sm shrink-0"
        />
        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            SAE • PAMEKASAN
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
            SMP ALAM EXCELLENTIA PAMEKASAN
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Jl. Lawangan Daya No 114 Pademawu, Pamekasan • Tahun Pelajaran 2026/2027
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Presensi Siswa PWA
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              Sinkronisasi Terpadu
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV / Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Kelas */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Filter Kelas
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Rentang Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Periode Waktu
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDateRangeMode('all')}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition cursor-pointer ${
                  dateRangeMode === 'all'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Semua Riwayat
              </button>
              <button
                onClick={() => setDateRangeMode('custom')}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition cursor-pointer ${
                  dateRangeMode === 'custom'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Atur Tanggal
              </button>
            </div>
          </div>

          {/* Rentang Tanggal Picker */}
          {dateRangeMode === 'custom' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Rentang Mulai - Akhir
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-1/2 text-xs font-medium px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
                <span className="text-xs text-slate-400">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-1/2 text-xs font-medium px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-end">
              <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-200 w-full">
                Menampilkan seluruh riwayat absensi yang tersimpan di sistem.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Aggregate KPI Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Tingkat Kehadiran</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{totals.attendanceRate}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{totals.recordCount} Sesi Tercatat</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-emerald-700 font-semibold">Total Hadir</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{totals.hadir}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Siswa</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-amber-700 font-semibold">Total Terlambat</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{totals.terlambat}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Siswa</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-blue-700 font-semibold">Total Izin</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{totals.izin}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Siswa</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-purple-700 font-semibold">Total Sakit</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{totals.sakit}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Siswa</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-rose-700 font-semibold">Total Alpa</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{totals.alpa}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Siswa</div>
        </div>
      </div>

      {/* Tabs: Records vs Students */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('records')}
          className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === 'records'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Daftar Sesi Absensi ({filteredRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === 'students'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Rekap Per Siswa ({studentStats.length})</span>
        </button>
      </div>

      {/* Tab 1: Records View */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Tidak ada data absensi yang sesuai filter.
              </div>
            ) : (
              filteredRecords.map((r) => {
                const cls = classes.find((c) => c.id === r.classId);
                const ses = sessions.find((s) => s.id === r.sessionId);
                return (
                  <div key={r.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">
                          {cls?.name || r.classId}
                        </span>
                        <span className="text-xs text-slate-500">
                          {r.date} • {ses?.name || r.sessionId}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'submitted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.status === 'submitted' ? 'Final Dikirim' : 'Draf'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          r.syncStatus === 'synced'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {r.syncStatus === 'synced' ? 'Tersinkron Server' : 'Tersimpan Lokal'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400">
                        Dicatat oleh: <strong>{r.createdByUserName}</strong>
                      </div>
                    </div>

                    {/* Breakdown counts */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
                        Hadir: {r.summary.hadir}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-100">
                        Terlambat: {r.summary.terlambat}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold border border-blue-100">
                        Izin: {r.summary.izin}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 font-semibold border border-purple-100">
                        Sakit: {r.summary.sakit}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 font-semibold border border-rose-100">
                        Alpa: {r.summary.alpa}
                      </span>
                      <span className="ml-auto font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        Kehadiran: {r.summary.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Students Aggregate Matrix */}
      {activeTab === 'students' && (
        <div className="space-y-3">
          {/* Search student */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari siswa di laporan..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">NIS</th>
                  <th className="p-3.5">Nama Siswa</th>
                  <th className="p-3.5">Kelas</th>
                  <th className="p-3.5 text-center">Hadir</th>
                  <th className="p-3.5 text-center">Terlambat</th>
                  <th className="p-3.5 text-center">Izin</th>
                  <th className="p-3.5 text-center">Sakit</th>
                  <th className="p-3.5 text-center">Alpa</th>
                  <th className="p-3.5 text-right">% Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentStats.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      Tidak ada data siswa ditemukan.
                    </td>
                  </tr>
                ) : (
                  studentStats.map((row) => (
                    <tr key={row.student.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-mono text-slate-400">{row.student.nis}</td>
                      <td className="p-3.5 font-bold text-slate-900">{row.student.name}</td>
                      <td className="p-3.5 text-slate-600">{row.className}</td>
                      <td className="p-3.5 text-center font-bold text-emerald-600">{row.hadir}</td>
                      <td className="p-3.5 text-center font-bold text-amber-600">{row.terlambat}</td>
                      <td className="p-3.5 text-center font-bold text-blue-600">{row.izin}</td>
                      <td className="p-3.5 text-center font-bold text-purple-600">{row.sakit}</td>
                      <td className="p-3.5 text-center font-bold text-rose-600">{row.alpa}</td>
                      <td className="p-3.5 text-right font-bold text-slate-900">
                        <span className={`px-2 py-0.5 rounded ${
                          row.rate >= 85 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {row.rate}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
