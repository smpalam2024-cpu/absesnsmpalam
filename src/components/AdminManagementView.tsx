import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  ShieldCheck,
  Activity,
  Layers,
  RotateCcw,
  CheckCircle,
  X,
  Search,
} from 'lucide-react';
import { SchoolClass, Student, User, AuditLog } from '../types';
import {
  getAllClasses,
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  getAuditLogs,
  resetToDemoData,
} from '../services/storageService';

interface AdminManagementViewProps {
  currentUser: User;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'classes' | 'audit'>('students');

  const classes = useMemo(() => getAllClasses(), []);
  const [students, setStudents] = useState<Student[]>(() => getAllStudents());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getAuditLogs());

  // Search & filter
  const [studentSearch, setStudentSearch] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');

  // Student Form Modal (Add / Edit)
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nis: '',
    nisn: '',
    gender: 'L' as 'L' | 'P',
    classId: 'cls-7a',
    parentName: '',
    parentPhone: '',
  });

  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      nis: `${Math.floor(260000 + Math.random() * 9999)}`,
      nisn: `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      gender: 'L',
      classId: classes[0]?.id || 'cls-7a',
      parentName: '',
      parentPhone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
    });
    setShowStudentModal(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      nis: student.nis,
      nisn: student.nisn,
      gender: student.gender,
      classId: student.classId,
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
    });
    setShowStudentModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nis.trim()) {
      alert('Nama dan NIS wajib diisi.');
      return;
    }

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        ...formData,
      });
    } else {
      addStudent(formData);
    }

    setStudents(getAllStudents());
    setShowStudentModal(false);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`Hapus data siswa "${name}"?`)) {
      deleteStudent(id);
      setStudents(getAllStudents());
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Kembalikan seluruh data sistem ke contoh awal demo? Semua catatan absensi baru akan direset.'
      )
    ) {
      resetToDemoData();
      setStudents(getAllStudents());
      setAuditLogs(getAuditLogs());
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (filterClass !== 'all' && s.classId !== filterClass) return false;
      if (studentSearch) {
        return (
          s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.nis.includes(studentSearch)
        );
      }
      return true;
    });
  }, [students, filterClass, studentSearch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/assets/aistudio/1713909500616_5b14171f.png"
            alt="Logo SMP Alam Excellentia"
            className="w-14 h-14 object-contain shrink-0 drop-shadow-xs"
          />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Panel Administrasi & Tata Usaha
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              SMP ALAM EXCELLENTIA PAMEKASAN
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jl. Lawangan Daya No 114 Pademawu, Pamekasan • Master Data Kelas & Siswa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'students' && (
            <button
              onClick={handleOpenAddStudent}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>
          )}

          <button
            onClick={handleResetData}
            title="Reset ke data awal"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === 'students'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Data Siswa ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === 'classes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Data Kelas & Wali ({classes.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('audit');
            setAuditLogs(getAuditLogs());
          }}
          className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Riwayat Aktivitas & Audit ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Students Management */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama atau NIS siswa..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Kelas:</span>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="all">Semua Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">NIS / NISN</th>
                  <th className="p-3.5">Nama Lengkap</th>
                  <th className="p-3.5">Gender</th>
                  <th className="p-3.5">Kelas</th>
                  <th className="p-3.5">Wali Murid</th>
                  <th className="p-3.5">No. HP Orang Tua</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => {
                  const cls = classes.find((c) => c.id === s.classId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-mono text-slate-500">
                        <div className="font-semibold text-slate-800">{s.nis}</div>
                        <div className="text-[10px] text-slate-400">{s.nisn}</div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">{s.name}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.gender === 'L' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">{cls?.name || s.classId}</td>
                      <td className="p-3.5 text-slate-600">{s.parentName || '-'}</td>
                      <td className="p-3.5 text-slate-500 font-mono">{s.parentPhone || '-'}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditStudent(s)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit data siswa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id, s.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Classes Management */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const classStudents = students.filter((s) => s.classId === cls.id);
            return (
              <div key={cls.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    Tingkat {cls.grade}
                  </span>
                  <span className="text-xs text-slate-400">TA {cls.academicYear}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{cls.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Wali Kelas: <strong>{cls.homeroomTeacherName}</strong>
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Total Siswa Terdaftar:</span>
                  <span className="font-bold text-slate-900">{classStudents.length} Siswa</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Audit Trail Log (PRD 5) */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900">Audit Trail Riwayat Aktivitas Absensi</span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Mencatat setiap pembuatan draf, pengiriman, perbaikan catatan, dan sinkronisasi data PWA.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Belum ada aktivitas tercatat.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 hover:bg-slate-50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.action === 'SUBMIT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action === 'CREATE_DRAFT'
                          ? 'bg-amber-100 text-amber-800'
                          : log.action === 'SYNC'
                          ? 'bg-blue-100 text-blue-800'
                          : log.action === 'CONFLICT_RESOLVED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {log.action}
                      </span>
                      <span className="font-bold text-slate-800">{log.userName}</span>
                      <span className="text-slate-400">({log.userRole})</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    <strong>{log.className}</strong> • {log.date}
                  </div>
                  <div className="text-slate-500 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {log.details}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden text-slate-800">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIS (Nomor Induk)</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN Nasional</label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  placeholder="Nama orang tua/wali siswa"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp / HP Wali</label>
                <input
                  type="text"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="0812xxxxxxx"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-xs"
                >
                  {editingStudent ? 'Perbarui Data' : 'Simpan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
