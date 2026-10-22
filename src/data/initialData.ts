import { SchoolClass, Student, User, Session, AttendanceRecord } from '../types';

export const SCHOOL_INFO = {
  name: 'SMP ALAM EXCELLENTIA PAMEKASAN',
  shortName: 'SMP Alam Excellentia',
  tagline: 'Sekolah Menengah Pertama Alam Berkarakter & Unggul',
  address: 'Jl. Lawangan Daya No 114 Pademawu, Pamekasan',
  logoUrl: '/assets/aistudio/1713909500616_5b14171f.png',
  academicYear: '2026/2027',
  npsn: '699xxxxx',
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-guru-badrit',
    name: 'MOH. BADRIT TAMAM, S.Mat',
    nip: '19920410 201801 1 003',
    role: 'guru',
    roleLabel: 'Wali Kelas VII (Al-Khawarizmi)',
    assignedClassIds: ['cls-7-alkhawarizmi'],
    email: 'badrit.tamam@smpalam-excellentia.sch.id',
  },
  {
    id: 'user-guru-maghfiroh',
    name: 'MAGHFIROH AGUSTINASARI S, M.Pd',
    nip: '19910818 201602 2 005',
    role: 'guru',
    roleLabel: 'Wali Kelas VIII (Albatenius)',
    assignedClassIds: ['cls-8-albatenius'],
    email: 'maghfiroh.agustinasari@smpalam-excellentia.sch.id',
  },
  {
    id: 'user-guru-sitti',
    name: 'SITTI NOERJANNAH, S.Pd.',
    nip: '19881125 201403 2 007',
    role: 'guru',
    roleLabel: 'Wali Kelas IX (Avicena)',
    assignedClassIds: ['cls-9-avicena'],
    email: 'sitti.noerjannah@smpalam-excellentia.sch.id',
  },
  {
    id: 'user-admin',
    name: 'Petugas Administrasi / TU',
    nip: '19940715 202001 1 009',
    role: 'admin',
    roleLabel: 'Petugas Tata Usaha & Absensi',
    assignedClassIds: ['cls-7-alkhawarizmi', 'cls-8-albatenius', 'cls-9-avicena'],
    email: 'admin@smpalam-excellentia.sch.id',
  },
  {
    id: 'user-kepsek',
    name: 'Kepala Sekolah SMP Alam Excellentia',
    nip: '19820514 200604 1 001',
    role: 'kepala_sekolah',
    roleLabel: 'Kepala Sekolah',
    assignedClassIds: ['cls-7-alkhawarizmi', 'cls-8-albatenius', 'cls-9-avicena'],
    email: 'kepsek@smpalam-excellentia.sch.id',
  },
];

export const INITIAL_CLASSES: SchoolClass[] = [
  {
    id: 'cls-7-alkhawarizmi',
    name: 'Kelas VII (Al-Khawarizmi)',
    grade: '7',
    homeroomTeacherName: 'MOH. BADRIT TAMAM, S.Mat',
    academicYear: '2026/2027',
    studentCount: 1,
  },
  {
    id: 'cls-8-albatenius',
    name: 'Kelas VIII (Albatenius)',
    grade: '8',
    homeroomTeacherName: 'MAGHFIROH AGUSTINASARI S, M.Pd',
    academicYear: '2026/2027',
    studentCount: 5,
  },
  {
    id: 'cls-9-avicena',
    name: 'Kelas IX (Avicena)',
    grade: '9',
    homeroomTeacherName: 'SITTI NOERJANNAH, S.Pd.',
    academicYear: '2026/2027',
    studentCount: 6,
  },
];

export const INITIAL_SESSIONS: Session[] = [
  { id: 'sesi-pagi', name: 'Sesi Pagi / Apel & Jam 1-2', code: 'SESI-1', timeRange: '07:00 - 08:30 WIB' },
  { id: 'sesi-siang', name: 'Sesi Siang / Jam 5-6', code: 'SESI-2', timeRange: '10:30 - 12:00 WIB' },
  { id: 'sesi-harian', name: 'Absensi Harian Terpadu', code: 'HARIAN', timeRange: 'Sepanjang Hari Sekolah' },
];

export const INITIAL_STUDENTS: Student[] = [
  // Kelas VII (Al-Khawarizmi) - 1 Siswa
  {
    id: 'std-7-01',
    nis: '260701',
    nisn: '0098710101',
    name: 'Yusuf Alauddin',
    gender: 'L',
    classId: 'cls-7-alkhawarizmi',
    parentName: 'Wali Yusuf Alauddin',
    parentPhone: '081234567101',
  },

  // Kelas VIII (Albatenius) - 5 Siswa
  {
    id: 'std-8-01',
    nis: '250801',
    nisn: '0087710201',
    name: 'Aklul Firdaus Thoif',
    gender: 'L',
    classId: 'cls-8-albatenius',
    parentName: 'Wali Aklul Firdaus',
    parentPhone: '081234567201',
  },
  {
    id: 'std-8-02',
    nis: '250802',
    nisn: '0087710202',
    name: 'Zidane Raditya Haris',
    gender: 'L',
    classId: 'cls-8-albatenius',
    parentName: 'Wali Zidane Raditya',
    parentPhone: '081234567202',
  },
  {
    id: 'std-8-03',
    nis: '250803',
    nisn: '0087710203',
    name: 'Jameikha Neladani Muhammad',
    gender: 'L',
    classId: 'cls-8-albatenius',
    parentName: 'Wali Jameikha Neladani',
    parentPhone: '081234567203',
  },
  {
    id: 'std-8-04',
    nis: '250804',
    nisn: '0087710204',
    name: 'Ibrahim Teguh Prasetyo',
    gender: 'L',
    classId: 'cls-8-albatenius',
    parentName: 'Wali Ibrahim Teguh',
    parentPhone: '081234567204',
  },
  {
    id: 'std-8-05',
    nis: '250805',
    nisn: '0087710205',
    name: 'Mery Hardian Syafarina',
    gender: 'P',
    classId: 'cls-8-albatenius',
    parentName: 'Wali Mery Hardian',
    parentPhone: '081234567205',
  },

  // Kelas IX (Avicena) - 6 Siswa
  {
    id: 'std-9-01',
    nis: '240901',
    nisn: '0076610301',
    name: 'Alif Chandra Alfatih',
    gender: 'L',
    classId: 'cls-9-avicena',
    parentName: 'Wali Alif Chandra',
    parentPhone: '081234567301',
  },
  {
    id: 'std-9-02',
    nis: '240902',
    nisn: '0076610302',
    name: 'Nadhif Irsyad Rabbani',
    gender: 'L',
    classId: 'cls-9-avicena',
    parentName: 'Wali Nadhif Irsyad',
    parentPhone: '081234567302',
  },
  {
    id: 'std-9-03',
    nis: '240903',
    nisn: '0076610303',
    name: 'Belva Renny Fhayona',
    gender: 'P',
    classId: 'cls-9-avicena',
    parentName: 'Wali Belva Renny',
    parentPhone: '081234567303',
  },
  {
    id: 'std-9-04',
    nis: '240904',
    nisn: '0076610304',
    name: 'Varo Ramdhan Gunawan',
    gender: 'L',
    classId: 'cls-9-avicena',
    parentName: 'Wali Varo Ramdhan',
    parentPhone: '081234567304',
  },
  {
    id: 'std-9-05',
    nis: '240905',
    nisn: '0076610305',
    name: 'Moh. Shidqi Alfaruq',
    gender: 'L',
    classId: 'cls-9-avicena',
    parentName: 'Wali Moh. Shidqi',
    parentPhone: '081234567305',
  },
  {
    id: 'std-9-06',
    nis: '240906',
    nisn: '0076610306',
    name: 'Fawaizal Akbar Rahman',
    gender: 'L',
    classId: 'cls-9-avicena',
    parentName: 'Wali Fawaizal Akbar',
    parentPhone: '081234567306',
  },
];

export const STATUS_CONFIG: Record<string, { label: string; badge: string; color: string; bg: string; border: string; desc: string }> = {
  hadir: {
    label: 'Hadir',
    badge: 'H',
    color: 'text-emerald-700',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500',
    desc: 'Siswa hadir tepat waktu di sekolah',
  },
  terlambat: {
    label: 'Terlambat',
    badge: 'T',
    color: 'text-amber-700',
    bg: 'bg-amber-500',
    border: 'border-amber-500',
    desc: 'Siswa hadir setelah bel masuk',
  },
  izin: {
    label: 'Izin',
    badge: 'I',
    color: 'text-blue-700',
    bg: 'bg-blue-500',
    border: 'border-blue-500',
    desc: 'Izin resmi disertai keterangan orang tua',
  },
  sakit: {
    label: 'Sakit',
    badge: 'S',
    color: 'text-purple-700',
    bg: 'bg-purple-500',
    border: 'border-purple-500',
    desc: 'Sakit dengan surat dokter / pemberitahuan',
  },
  alpa: {
    label: 'Alpa',
    badge: 'A',
    color: 'text-rose-700',
    bg: 'bg-rose-500',
    border: 'border-rose-500',
    desc: 'Tidak hadir tanpa keterangan yang sah',
  },
};

// Seed sample attendance records for SMP Alam Excellentia
export function getInitialAttendanceRecords(): AttendanceRecord[] {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Kelas VII (Al-Khawarizmi)
  const record7: AttendanceRecord = {
    id: `rec-cls-7-alkhawarizmi-${yesterdayStr}-sesi-pagi`,
    classId: 'cls-7-alkhawarizmi',
    date: yesterdayStr,
    sessionId: 'sesi-pagi',
    status: 'submitted',
    entries: {
      'std-7-01': { studentId: 'std-7-01', status: 'hadir', recordedAt: `${yesterdayStr}T07:15:00Z` },
    },
    summary: {
      total: 1,
      hadir: 1,
      terlambat: 0,
      izin: 0,
      sakit: 0,
      alpa: 0,
      percentage: 100.0,
    },
    createdByUserId: 'user-guru-badrit',
    createdByUserName: 'MOH. BADRIT TAMAM, S.Mat',
    createdRole: 'guru',
    createdAt: `${yesterdayStr}T07:20:00Z`,
    updatedAt: `${yesterdayStr}T07:20:00Z`,
    syncedAt: `${yesterdayStr}T07:20:05Z`,
    syncStatus: 'synced',
    revision: 1,
  };

  // Kelas VIII (Albatenius)
  const record8: AttendanceRecord = {
    id: `rec-cls-8-albatenius-${yesterdayStr}-sesi-pagi`,
    classId: 'cls-8-albatenius',
    date: yesterdayStr,
    sessionId: 'sesi-pagi',
    status: 'submitted',
    entries: {
      'std-8-01': { studentId: 'std-8-01', status: 'hadir', recordedAt: `${yesterdayStr}T07:15:00Z` },
      'std-8-02': { studentId: 'std-8-02', status: 'hadir', recordedAt: `${yesterdayStr}T07:15:00Z` },
      'std-8-03': { studentId: 'std-8-03', status: 'terlambat', note: 'Terlambat 10 menit karena ban bocor', recordedAt: `${yesterdayStr}T07:25:00Z` },
      'std-8-04': { studentId: 'std-8-04', status: 'hadir', recordedAt: `${yesterdayStr}T07:15:00Z` },
      'std-8-05': { studentId: 'std-8-05', status: 'hadir', recordedAt: `${yesterdayStr}T07:15:00Z` },
    },
    summary: {
      total: 5,
      hadir: 4,
      terlambat: 1,
      izin: 0,
      sakit: 0,
      alpa: 0,
      percentage: 100.0,
    },
    createdByUserId: 'user-guru-maghfiroh',
    createdByUserName: 'MAGHFIROH AGUSTINASARI S, M.Pd',
    createdRole: 'guru',
    createdAt: `${yesterdayStr}T07:28:00Z`,
    updatedAt: `${yesterdayStr}T07:28:00Z`,
    syncedAt: `${yesterdayStr}T07:28:06Z`,
    syncStatus: 'synced',
    revision: 1,
  };

  // Kelas IX (Avicena)
  const record9: AttendanceRecord = {
    id: `rec-cls-9-avicena-${yesterdayStr}-sesi-pagi`,
    classId: 'cls-9-avicena',
    date: yesterdayStr,
    sessionId: 'sesi-pagi',
    status: 'submitted',
    entries: {
      'std-9-01': { studentId: 'std-9-01', status: 'hadir', recordedAt: `${yesterdayStr}T07:12:00Z` },
      'std-9-02': { studentId: 'std-9-02', status: 'hadir', recordedAt: `${yesterdayStr}T07:12:00Z` },
      'std-9-03': { studentId: 'std-9-03', status: 'izin', note: 'Mengikuti lomba tahfidz', recordedAt: `${yesterdayStr}T07:12:00Z` },
      'std-9-04': { studentId: 'std-9-04', status: 'hadir', recordedAt: `${yesterdayStr}T07:12:00Z` },
      'std-9-05': { studentId: 'std-9-05', status: 'sakit', note: 'Demam, istirahat di rumah', recordedAt: `${yesterdayStr}T07:12:00Z` },
      'std-9-06': { studentId: 'std-9-06', status: 'hadir', recordedAt: `${yesterdayStr}T07:12:00Z` },
    },
    summary: {
      total: 6,
      hadir: 4,
      terlambat: 0,
      izin: 1,
      sakit: 1,
      alpa: 0,
      percentage: 66.7,
    },
    createdByUserId: 'user-guru-sitti',
    createdByUserName: 'SITTI NOERJANNAH, S.Pd.',
    createdRole: 'guru',
    createdAt: `${yesterdayStr}T07:30:00Z`,
    updatedAt: `${yesterdayStr}T07:30:00Z`,
    syncedAt: `${yesterdayStr}T07:30:10Z`,
    syncStatus: 'synced',
    revision: 1,
  };

  return [record7, record8, record9];
}
