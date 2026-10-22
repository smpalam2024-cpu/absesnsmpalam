/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  initializeStorage,
  getCurrentUser,
  getAllAttendanceRecords,
  getAllStudents,
  subscribeToDataChanges,
} from './services/storageService';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { Navbar } from './components/Navbar';
import { AttendanceForm } from './components/AttendanceForm';
import { ReportsView } from './components/ReportsView';
import { AdminManagementView } from './components/AdminManagementView';
import { SyncQueueDrawer } from './components/SyncQueueDrawer';
import { ConflictResolutionModal } from './components/ConflictResolutionModal';
import { OfflineBanner } from './components/OfflineBanner';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ConflictItem, User, AttendanceRecord, Student } from './types';
import { ClipboardCheck, BarChart3, Database, CloudUpload } from 'lucide-react';

export default function App() {
  // Initialize initial data in LocalStorage if first visit
  useEffect(() => {
    initializeStorage();
  }, []);

  const { isOnline, isSimulatedOffline, toggleSimulatedOffline } = useNetworkStatus();

  const [currentUser, setCurrentUserState] = useState<User>(() => getCurrentUser());
  const [records, setRecords] = useState<AttendanceRecord[]>(() => getAllAttendanceRecords());
  const [students, setStudents] = useState<Student[]>(() => getAllStudents());

  const [activeView, setActiveView] = useState<'attendance' | 'reports' | 'admin'>('attendance');
  const [reportInitialClassId, setReportInitialClassId] = useState<string | undefined>(undefined);

  // Sync drawer & conflict state
  const [isSyncDrawerOpen, setIsSyncDrawerOpen] = useState(false);
  const [activeConflict, setActiveConflict] = useState<ConflictItem | null>(null);

  // Refresh records and state
  const refreshState = useCallback(() => {
    setCurrentUserState(getCurrentUser());
    setRecords(getAllAttendanceRecords());
    setStudents(getAllStudents());
  }, []);

  useEffect(() => {
    const unsub = subscribeToDataChanges(refreshState);
    return unsub;
  }, [refreshState]);

  // Counts
  const pendingSyncCount = records.filter(
    (r) => r.syncStatus === 'pending_sync' || r.syncStatus === 'local_saved'
  ).length;

  const conflictCount = records.filter((r) => r.syncStatus === 'conflict').length;

  const handleViewReportsForClass = (classId?: string) => {
    setReportInitialClassId(classId);
    setActiveView('reports');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={toggleSimulatedOffline}
        pendingSyncCount={pendingSyncCount}
        conflictCount={conflictCount}
        onOpenSyncDrawer={() => setIsSyncDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12">
        {/* PWA Prominent Install Banner (Suppresses automatically if already standalone) */}
        <PWAInstallButton variant="banner" />

        {/* View Switcher */}
        {activeView === 'attendance' && (
          <AttendanceForm
            currentUser={currentUser}
            isOnline={isOnline}
            onOpenSyncQueue={() => setIsSyncDrawerOpen(true)}
            onViewReports={handleViewReportsForClass}
          />
        )}

        {activeView === 'reports' && (
          <ReportsView
            currentUser={currentUser}
            initialClassId={reportInitialClassId}
            onSelectRecordForEdit={() => setActiveView('attendance')}
          />
        )}

        {activeView === 'admin' && (
          <AdminManagementView currentUser={currentUser} />
        )}
      </main>

      {/* Offline Status Float Indicator */}
      <OfflineBanner
        isOnline={isOnline}
        isSimulated={isSimulatedOffline}
        pendingCount={pendingSyncCount}
        onOpenSync={() => setIsSyncDrawerOpen(true)}
        onReconnect={toggleSimulatedOffline}
      />

      {/* Sync Queue Drawer */}
      <SyncQueueDrawer
        isOpen={isSyncDrawerOpen}
        onClose={() => setIsSyncDrawerOpen(false)}
        records={records}
        isOnline={isOnline}
        onSelectConflict={(conflict) => {
          setIsSyncDrawerOpen(false);
          setActiveConflict(conflict);
        }}
        students={students}
        onRefresh={refreshState}
      />

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        conflict={activeConflict}
        students={students}
        onClose={() => setActiveConflict(null)}
        onResolved={refreshState}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav aria-label="Navigasi Bawah" className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveView('attendance')}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer transition ${
            activeView === 'attendance' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <ClipboardCheck className="w-5 h-5" />
          <span className="text-[10px]">Absensi</span>
        </button>

        <button
          onClick={() => setActiveView('reports')}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer transition ${
            activeView === 'reports' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px]">Laporan</span>
        </button>

        <button
          onClick={() => setActiveView('admin')}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer transition ${
            activeView === 'admin' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Database className="w-5 h-5" />
          <span className="text-[10px]">Data & Audit</span>
        </button>

        <button
          onClick={() => setIsSyncDrawerOpen(true)}
          className="relative flex flex-col items-center gap-1 p-1 cursor-pointer text-slate-500"
        >
          <CloudUpload className="w-5 h-5" />
          <span className="text-[10px]">Sync</span>
          {pendingSyncCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
      </nav>
    </div>
  );
}
