import { AttendanceRecord, AuditLog, SchoolClass, Student, User, Session, ConflictItem, SyncStatus } from '../types';
import { INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_USERS, INITIAL_SESSIONS, getInitialAttendanceRecords } from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'absensi_sae_pamekasan_users_v2',
  CURRENT_USER: 'absensi_sae_pamekasan_current_user_v2',
  CLASSES: 'absensi_sae_pamekasan_classes_v2',
  STUDENTS: 'absensi_sae_pamekasan_students_v2',
  SESSIONS: 'absensi_sae_pamekasan_sessions_v2',
  ATTENDANCE: 'absensi_sae_pamekasan_attendance_records_v2',
  SERVER_ATTENDANCE: 'absensi_sae_pamekasan_server_attendance_records_v2', // Simulated server master copy
  AUDIT_LOGS: 'absensi_sae_pamekasan_audit_logs_v2',
  FORCE_OFFLINE: 'absensi_sae_pamekasan_force_offline_sim_v2',
};

// Event emitter helper for cross-component reactivity
const EVENT_DATA_UPDATED = 'absensi_pwa_data_updated';

export function notifyDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_DATA_UPDATED));
  }
}

export function subscribeToDataChanges(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT_DATA_UPDATED, callback);
  return () => window.removeEventListener(EVENT_DATA_UPDATED, callback);
}

// Storage helpers
function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

// Initialize seed data if not present
export function initializeStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    setItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]); // MOH. BADRIT TAMAM, S.Mat (Wali Kelas VII)
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
    setItem(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    setItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
    setItem(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    const initialRecs = getInitialAttendanceRecords();
    setItem(STORAGE_KEYS.ATTENDANCE, initialRecs);
    setItem(STORAGE_KEYS.SERVER_ATTENDANCE, initialRecs);
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    const sampleLogs: AuditLog[] = [
      {
        id: 'log-001',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        userId: 'user-guru-badrit',
        userName: 'MOH. BADRIT TAMAM, S.Mat',
        userRole: 'guru',
        action: 'SUBMIT',
        className: 'Kelas VII (Al-Khawarizmi)',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        sessionName: 'Sesi Pagi / Apel & Jam 1-2',
        details: 'Absensi SMP Alam Excellentia Pamekasan diserahkan: 1 Hadir.',
      },
    ];
    setItem(STORAGE_KEYS.AUDIT_LOGS, sampleLogs);
  }
}

// User & Role APIs
export function getCurrentUser(): User {
  return getItem<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
}

export function setCurrentUser(user: User): void {
  setItem(STORAGE_KEYS.CURRENT_USER, user);
  notifyDataChanged();
}

export function getAllUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

// Class & Student APIs
export function getAllClasses(): SchoolClass[] {
  return getItem<SchoolClass[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
}

export function getClassesForUser(user: User): SchoolClass[] {
  const allClasses = getAllClasses();
  if (user.role === 'admin' || user.role === 'kepala_sekolah') {
    return allClasses;
  }
  // Guru only sees assigned classes
  return allClasses.filter((c) => user.assignedClassIds.includes(c.id));
}

export function getAllStudents(): Student[] {
  return getItem<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
}

export function getStudentsByClass(classId: string): Student[] {
  const students = getAllStudents();
  return students.filter((s) => s.classId === classId);
}

export function getAllSessions(): Session[] {
  return getItem<Session[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
}

// Simulated Network state
export function getSimulatedOffline(): boolean {
  return getItem<boolean>(STORAGE_KEYS.FORCE_OFFLINE, false);
}

export function setSimulatedOffline(isForced: boolean): void {
  setItem(STORAGE_KEYS.FORCE_OFFLINE, isForced);
  notifyDataChanged();
}

// Attendance Records APIs
export function getAllAttendanceRecords(): AttendanceRecord[] {
  return getItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
}

export function getServerAttendanceRecords(): AttendanceRecord[] {
  return getItem<AttendanceRecord[]>(STORAGE_KEYS.SERVER_ATTENDANCE, []);
}

export function findExistingRecord(classId: string, date: string, sessionId: string): AttendanceRecord | undefined {
  const records = getAllAttendanceRecords();
  return records.find((r) => r.classId === classId && r.date === date && r.sessionId === sessionId);
}

// Save or Update Attendance Record
export function saveAttendanceRecord(
  record: Omit<AttendanceRecord, 'syncStatus' | 'syncedAt' | 'revision'> & { revision?: number },
  isOnlineEffective: boolean
): { success: boolean; record: AttendanceRecord; message: string; wasOffline: boolean } {
  const allRecords = getAllAttendanceRecords();
  const existingIndex = allRecords.findIndex((r) => r.id === record.id);
  const now = new Date().toISOString();

  let targetSyncStatus: SyncStatus = isOnlineEffective ? 'synced' : 'pending_sync';
  let syncedAt = isOnlineEffective ? now : undefined;
  const currentRevision = (existingIndex >= 0 ? allRecords[existingIndex].revision : 0) + 1;

  const finalRecord: AttendanceRecord = {
    ...record,
    revision: currentRevision,
    syncStatus: targetSyncStatus,
    syncedAt,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    allRecords[existingIndex] = finalRecord;
  } else {
    allRecords.unshift(finalRecord);
  }
  setItem(STORAGE_KEYS.ATTENDANCE, allRecords);

  // If online, also mirror to server master copy
  if (isOnlineEffective) {
    const serverRecords = getServerAttendanceRecords();
    const sIndex = serverRecords.findIndex((r) => r.id === record.id);
    if (sIndex >= 0) {
      serverRecords[sIndex] = { ...finalRecord };
    } else {
      serverRecords.unshift({ ...finalRecord });
    }
    setItem(STORAGE_KEYS.SERVER_ATTENDANCE, serverRecords);
  }

  // Audit log
  addAuditLog({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    userId: record.createdByUserId,
    userName: record.createdByUserName,
    userRole: record.createdRole,
    action: record.status === 'draft' ? 'CREATE_DRAFT' : existingIndex >= 0 ? 'UPDATE' : 'SUBMIT',
    className: getAllClasses().find((c) => c.id === record.classId)?.name || record.classId,
    date: record.date,
    sessionName: getAllSessions().find((s) => s.id === record.sessionId)?.name || record.sessionId,
    details: `${record.status === 'draft' ? 'Disimpan sebagai Draf' : 'Absensi Dikirim'}: ${record.summary.hadir} Hadir, ${record.summary.terlambat} Terlambat, ${record.summary.izin} Izin, ${record.summary.sakit} Sakit, ${record.summary.alpa} Alpa. (${isOnlineEffective ? 'Tersinkron' : 'Tersimpan Lokal - Offline'})`,
  });

  notifyDataChanged();

  return {
    success: true,
    record: finalRecord,
    message: isOnlineEffective
      ? 'Absensi berhasil disimpan dan disinkronkan ke server sekolah.'
      : 'Absensi disimpan di perangkat (Offline). Akan disinkronkan otomatis saat online.',
    wasOffline: !isOnlineEffective,
  };
}

// Background sync processing
export function syncPendingRecords(): { syncedCount: number; conflicts: ConflictItem[] } {
  const localRecords = getAllAttendanceRecords();
  const serverRecords = getServerAttendanceRecords();
  const conflicts: ConflictItem[] = [];
  let syncedCount = 0;
  const now = new Date().toISOString();

  const updatedLocal = localRecords.map((local) => {
    if (local.syncStatus !== 'pending_sync' && local.syncStatus !== 'local_saved' && local.syncStatus !== 'conflict') {
      return local;
    }

    const serverMatch = serverRecords.find((s) => s.id === local.id);

    // Conflict detection: If server copy exists and has been modified with a divergent revision
    if (serverMatch && serverMatch.updatedAt > local.createdAt && serverMatch.revision >= local.revision && serverMatch.createdByUserId !== local.createdByUserId) {
      const className = getAllClasses().find((c) => c.id === local.classId)?.name || local.classId;
      const sessionName = getAllSessions().find((s) => s.id === local.sessionId)?.name || local.sessionId;
      conflicts.push({
        recordId: local.id,
        classId: local.classId,
        className,
        date: local.date,
        sessionName,
        localRecord: local,
        serverRecord: serverMatch,
      });
      return {
        ...local,
        syncStatus: 'conflict' as SyncStatus,
      };
    }

    // Otherwise, successfully push to server
    syncedCount++;
    const syncedRec: AttendanceRecord = {
      ...local,
      syncStatus: 'synced',
      syncedAt: now,
    };

    // Update server master copy
    const sIndex = serverRecords.findIndex((s) => s.id === local.id);
    if (sIndex >= 0) {
      serverRecords[sIndex] = syncedRec;
    } else {
      serverRecords.unshift(syncedRec);
    }

    return syncedRec;
  });

  setItem(STORAGE_KEYS.ATTENDANCE, updatedLocal);
  setItem(STORAGE_KEYS.SERVER_ATTENDANCE, serverRecords);

  if (syncedCount > 0) {
    addAuditLog({
      id: `log-sync-${Date.now()}`,
      timestamp: now,
      userId: getCurrentUser().id,
      userName: getCurrentUser().name,
      userRole: getCurrentUser().role,
      action: 'SYNC',
      className: 'Semua Kelas',
      date: new Date().toISOString().split('T')[0],
      sessionName: '-',
      details: `Berhasil menyinkronkan ${syncedCount} catatan absensi dari antrean lokal ke server sekolah.`,
    });
  }

  notifyDataChanged();
  return { syncedCount, conflicts };
}

// Resolve Conflict
export function resolveConflict(recordId: string, choice: 'local' | 'server' | 'merge'): void {
  const localRecords = getAllAttendanceRecords();
  const serverRecords = getServerAttendanceRecords();
  const now = new Date().toISOString();

  const localIdx = localRecords.findIndex((r) => r.id === recordId);
  const serverIdx = serverRecords.findIndex((r) => r.id === recordId);

  if (localIdx === -1) return;

  let resolvedRecord: AttendanceRecord;

  if (choice === 'server' && serverIdx !== -1) {
    resolvedRecord = {
      ...serverRecords[serverIdx],
      syncStatus: 'synced',
      syncedAt: now,
    };
  } else if (choice === 'merge' && serverIdx !== -1) {
    // Merge: union entries, local takes priority for conflicts
    const mergedEntries = {
      ...serverRecords[serverIdx].entries,
      ...localRecords[localIdx].entries,
    };
    let hadir = 0, terlambat = 0, izin = 0, sakit = 0, alpa = 0;
    Object.values(mergedEntries).forEach((e) => {
      if (e.status === 'hadir') hadir++;
      else if (e.status === 'terlambat') terlambat++;
      else if (e.status === 'izin') izin++;
      else if (e.status === 'sakit') sakit++;
      else if (e.status === 'alpa') alpa++;
    });
    const total = Object.keys(mergedEntries).length;
    resolvedRecord = {
      ...localRecords[localIdx],
      entries: mergedEntries,
      summary: {
        total,
        hadir,
        terlambat,
        izin,
        sakit,
        alpa,
        percentage: total > 0 ? Math.round(((hadir + terlambat) / total) * 1000) / 10 : 0,
      },
      revision: Math.max(localRecords[localIdx].revision, serverRecords[serverIdx].revision) + 1,
      syncStatus: 'synced',
      syncedAt: now,
      updatedAt: now,
    };
  } else {
    // Use local version, override server
    resolvedRecord = {
      ...localRecords[localIdx],
      revision: (serverIdx !== -1 ? serverRecords[serverIdx].revision : localRecords[localIdx].revision) + 1,
      syncStatus: 'synced',
      syncedAt: now,
      updatedAt: now,
    };
  }

  localRecords[localIdx] = resolvedRecord;
  setItem(STORAGE_KEYS.ATTENDANCE, localRecords);

  if (serverIdx !== -1) {
    serverRecords[serverIdx] = resolvedRecord;
  } else {
    serverRecords.unshift(resolvedRecord);
  }
  setItem(STORAGE_KEYS.SERVER_ATTENDANCE, serverRecords);

  addAuditLog({
    id: `log-conflict-${Date.now()}`,
    timestamp: now,
    userId: getCurrentUser().id,
    userName: getCurrentUser().name,
    userRole: getCurrentUser().role,
    action: 'CONFLICT_RESOLVED',
    className: getAllClasses().find((c) => c.id === resolvedRecord.classId)?.name || resolvedRecord.classId,
    date: resolvedRecord.date,
    sessionName: getAllSessions().find((s) => s.id === resolvedRecord.sessionId)?.name || resolvedRecord.sessionId,
    details: `Konflik absensi diselesaikan dengan pilihan: "${choice.toUpperCase()}". Data diperbarui ke revisi ${resolvedRecord.revision}.`,
  });

  notifyDataChanged();
}

// Simulates a conflict for demo and verification purposes
export function simulateConflict(recordId: string): void {
  const serverRecords = getServerAttendanceRecords();
  const sIdx = serverRecords.findIndex((r) => r.id === recordId);
  if (sIdx >= 0) {
    // Alter server copy with a higher revision and different status by another user
    const updatedServer = {
      ...serverRecords[sIdx],
      revision: serverRecords[sIdx].revision + 2,
      updatedAt: new Date(Date.now() + 60000).toISOString(),
      createdByUserName: 'Pak Budi Santoso (Admin TU)',
      createdByUserId: 'user-admin',
    };
    serverRecords[sIdx] = updatedServer;
    setItem(STORAGE_KEYS.SERVER_ATTENDANCE, serverRecords);

    // Set local copy to pending_sync
    const localRecords = getAllAttendanceRecords();
    const lIdx = localRecords.findIndex((r) => r.id === recordId);
    if (lIdx >= 0) {
      localRecords[lIdx] = {
        ...localRecords[lIdx],
        syncStatus: 'pending_sync',
      };
      setItem(STORAGE_KEYS.ATTENDANCE, localRecords);
    }

    notifyDataChanged();
  }
}

// Audit Logs
export function getAuditLogs(): AuditLog[] {
  return getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
}

export function addAuditLog(log: AuditLog): void {
  const logs = getAuditLogs();
  logs.unshift(log);
  if (logs.length > 200) logs.pop(); // Keep recent 200
  setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
}

// Student Management (Admin)
export function addStudent(student: Omit<Student, 'id'>): Student {
  const students = getAllStudents();
  const newStudent: Student = {
    ...student,
    id: `std-${Date.now()}`,
  };
  students.push(newStudent);
  setItem(STORAGE_KEYS.STUDENTS, students);
  notifyDataChanged();
  return newStudent;
}

export function updateStudent(student: Student): void {
  const students = getAllStudents();
  const idx = students.findIndex((s) => s.id === student.id);
  if (idx >= 0) {
    students[idx] = student;
    setItem(STORAGE_KEYS.STUDENTS, students);
    notifyDataChanged();
  }
}

export function deleteStudent(studentId: string): void {
  const students = getAllStudents().filter((s) => s.id !== studentId);
  setItem(STORAGE_KEYS.STUDENTS, students);
  notifyDataChanged();
}

// Reset data to initial state for easy testing
export function resetToDemoData(): void {
  setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  setItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  setItem(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  setItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  setItem(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
  const initialRecs = getInitialAttendanceRecords();
  setItem(STORAGE_KEYS.ATTENDANCE, initialRecs);
  setItem(STORAGE_KEYS.SERVER_ATTENDANCE, initialRecs);
  setItem(STORAGE_KEYS.FORCE_OFFLINE, false);
  notifyDataChanged();
}
