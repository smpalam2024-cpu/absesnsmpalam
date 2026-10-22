export type AttendanceStatus = 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpa';

export type UserRole = 'guru' | 'admin' | 'kepala_sekolah';

export interface User {
  id: string;
  name: string;
  nip: string;
  role: UserRole;
  roleLabel: string;
  assignedClassIds: string[]; // Classes this teacher manages or teaches
  email: string;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classId: string;
  parentName?: string;
  parentPhone?: string;
  avatarColor?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  grade: '7' | '8' | '9';
  homeroomTeacherName: string;
  academicYear: string;
  studentCount?: number;
}

export interface Session {
  id: string;
  name: string;
  code: string;
  timeRange: string;
}

export type SyncStatus = 'synced' | 'pending_sync' | 'local_saved' | 'conflict' | 'failed';

export interface StudentAttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  recordedAt: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  sessionId: string; // e.g., 'sesi-pagi' or 'sesi-1-2'
  status: 'draft' | 'submitted';
  entries: Record<string, StudentAttendanceEntry>; // studentId -> entry
  summary: {
    total: number;
    hadir: number;
    terlambat: number;
    izin: number;
    sakit: number;
    alpa: number;
    percentage: number;
  };
  createdByUserId: string;
  createdByUserName: string;
  createdRole: UserRole;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  syncStatus: SyncStatus;
  revision: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'CREATE_DRAFT' | 'SUBMIT' | 'UPDATE' | 'SYNC' | 'CONFLICT_RESOLVED' | 'DELETE';
  className: string;
  date: string;
  sessionName: string;
  details: string;
}

export interface ConflictItem {
  recordId: string;
  classId: string;
  className: string;
  date: string;
  sessionName: string;
  localRecord: AttendanceRecord;
  serverRecord: AttendanceRecord;
}
