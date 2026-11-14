import React, { useState, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  exportLocalVaultBackup,
  migrateLocalDataToSupabase,
  MigrationSummary,
} from '../services/dataMigrationService';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  HardDrive,
  AlertTriangle,
  CloudUpload,
  Loader2,
} from 'lucide-react';

export const BackupRestoreView: React.FC = () => {
  const {
    exportCompleteBackupJSON,
    restoreBackupJSON,
    resetAllData,
    showToast,
    isSupabaseActive,
    isFirebaseActive,
    dbSyncStatus,
    hydrateFromSupabase,
  } = useAdmin();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [migrating, setMigrating] = useState(false);
  const [migrationSummary, setMigrationSummary] = useState<MigrationSummary | null>(null);

  // Estimate localStorage consumption
  let totalBytes = 0;
  if (typeof window !== 'undefined') {
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        totalBytes += (localStorage[key].length + key.length) * 2;
      }
    }
  }
  const storageKb = Math.round(totalBytes / 1024);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = restoreBackupJSON(content);
        if (success && fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadPreMigrationSnapshot = () => {
    const jsonString = exportLocalVaultBackup();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aman_PreMigration_LocalVault_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Pre-Migration Snapshot Saved', 'Local vault exported before cloud sync.');
  };

  const handleMigrateToSupabase = async () => {
    if (!isSupabaseActive) {
      showToast(
        'Supabase Not Configured',
        'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env before running migration.',
        'error'
      );
      return;
    }
    setMigrating(true);
    try {
      const summary = await migrateLocalDataToSupabase();
      setMigrationSummary(summary);
      if (summary.errors.length === 0) {
        showToast('Cloud Migration Complete', 'All existing localStorage data synced safely to Supabase PostgreSQL.');
        await hydrateFromSupabase();
      } else {
        showToast(
          'Migration Completed With Warnings',
          `${summary.errors.length} record(s) failed to migrate. Review errors below.`,
          'warning'
        );
      }
    } finally {
      setMigrating(false);
    }
  };

  const handleExecuteReset = () => {
    if (resetConfirmText.trim().toLowerCase() !== 'reset') {
      showToast('Validation Failed', 'Please type "RESET" to confirm data wipe.', 'error');
      return;
    }
    resetAllData();
    setResetConfirmOpen(false);
    setResetConfirmText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0] flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>Data Vault, Cloud Sync & System Backup</span>
          </h1>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8] mt-0.5">
            Migrate local data to Supabase PostgreSQL, export full JSON backups, and verify cloud persistence.
          </p>
        </div>
      </div>

      {/* Storage & Health Gauge Card */}
      <div className="p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0]">
              Hybrid Terminal Vault & Cloud Backend
            </div>
            <div className="text-xs text-[#857878] dark:text-[#B5A8A8] font-mono mt-0.5">
              Browser Cache: ~{storageKb} KB • Firebase Auth: {isFirebaseActive ? 'Configured' : 'Missing .env'} • Supabase DB: {isSupabaseActive ? dbSyncStatus.toUpperCase() : 'Missing .env'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl ${
              isSupabaseActive && dbSyncStatus !== 'error'
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                : 'text-amber-700 dark:text-amber-400 bg-amber-500/10'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSupabaseActive
                ? dbSyncStatus === 'error'
                  ? 'Sync Attention Needed'
                  : 'Supabase Connected'
                : 'Local Cache Mode'}
            </span>
          </span>
        </div>
      </div>

      {/* Cloud Migration Card */}
      <div className="p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-emerald-500/25 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0]">
              <CloudUpload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Sync Local Data to Supabase PostgreSQL (Non-Destructive)</span>
            </div>
            <p className="text-xs text-[#857878] dark:text-[#B5A8A8] max-w-2xl leading-relaxed">
              Safely migrates all existing Services, Latest Updates (Door 0), Document Requirements (Door 1), Gallery items (Door 4), Our Journey milestones, Customers, Enquiries, Receipts, FAQs, Testimonials, and Business Profile to Supabase using deduplicating upserts. Existing local records are preserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPreMigrationSnapshot}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[rgba(196,176,176,0.35)] bg-white/60 dark:bg-black/25 text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pre-Migration Backup</span>
            </button>
            <button
              type="button"
              disabled={migrating || !isSupabaseActive}
              onClick={handleMigrateToSupabase}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {migrating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
              <span>{migrating ? 'Migrating...' : 'Migrate Local Data to Cloud'}</span>
            </button>
          </div>
        </div>

        {migrationSummary && (
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-black/30 border border-[rgba(196,176,176,0.2)] text-xs font-mono space-y-2">
            <div className="font-bold text-[#1A1818] dark:text-[#E8E4E0]">Migration Report:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#6B5C5C] dark:text-[#C4B0B0]">
              <span>Services: {migrationSummary.services}</span>
              <span>Customers: {migrationSummary.customers}</span>
              <span>Enquiries: {migrationSummary.enquiries}</span>
              <span>Updates: {migrationSummary.latestUpdates}</span>
              <span>Doc Cards: {migrationSummary.docRequirements}</span>
              <span>Gallery: {migrationSummary.gallery}</span>
              <span>Journey: {migrationSummary.journey}</span>
              <span>Receipts: {migrationSummary.receipts}</span>
              <span>FAQs: {migrationSummary.faqs}</span>
              <span>Testimonials: {migrationSummary.testimonials}</span>
              <span>Media: {migrationSummary.media}</span>
              <span>Staff: {migrationSummary.staff}</span>
            </div>
            {migrationSummary.errors.length > 0 && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 space-y-1">
                <div className="font-bold">Errors ({migrationSummary.errors.length}):</div>
                {migrationSummary.errors.map((err, i) => (
                  <div key={i} className="text-[11px]">• {err}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export JSON Card */}
        <div className="p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0]">
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Full System JSON Export</span>
            </div>
            <p className="text-xs text-[#857878] dark:text-[#B5A8A8] leading-relaxed">
              Creates a structured JSON snapshot including all modules: customer directory, POS receipt tokens, enquiries, services, and live website CMS records.
            </p>
          </div>

          <button
            onClick={exportCompleteBackupJSON}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Complete Backup JSON</span>
          </button>
        </div>

        {/* Restore JSON Card */}
        <div className="p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0]">
              <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Restore from Backup Snapshot</span>
            </div>
            <p className="text-xs text-[#857878] dark:text-[#B5A8A8] leading-relaxed">
              Upload a previously exported Aman Computer backup JSON. The system verifies JSON integrity before populating modules.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="restoreFilePicker"
            />
            <label
              htmlFor="restoreFilePicker"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[rgba(196,176,176,0.4)] dark:border-[rgba(196,176,176,0.2)] bg-white/50 dark:bg-black/20 text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Select & Upload Backup File (.json)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Reset Local Cache to Defaults</span>
          </div>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8] max-w-xl">
            Resets browser localStorage cache to default records without deleting remote Supabase database rows.
          </p>
        </div>

        <button
          onClick={() => setResetConfirmOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Local Cache</span>
        </button>
      </div>

      {/* Safety Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#F0ECE9] dark:bg-[#1A1818] border border-rose-500/30 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
              <ShieldAlert className="w-5 h-5" />
              <span>Confirm System Reset</span>
            </div>

            <p className="text-xs text-[#857878] dark:text-[#B5A8A8] leading-relaxed">
              Are you sure you want to reset all operational records? To confirm, please type <strong className="text-[#1A1818] dark:text-[#E8E4E0] font-mono">RESET</strong> below:
            </p>

            <input
              type="text"
              placeholder="Type RESET to confirm"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-rose-500/30 font-mono text-center text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setResetConfirmOpen(false);
                  setResetConfirmText('');
                }}
                className="px-3 py-2 rounded-xl border border-[rgba(196,176,176,0.3)] text-xs font-semibold text-[#857878]"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReset}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
              >
                Permanently Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
