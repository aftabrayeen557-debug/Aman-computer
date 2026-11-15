import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Settings2,
  Save,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  CreditCard,
  FileText,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { terminalSettings, updateTerminalSettings, darkMode, toggleDarkMode } = useAdmin();

  const [form, setForm] = useState(terminalSettings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTerminalSettings(form);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0] flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <span>Terminal Settings & Configuration</span>
          </h1>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8] mt-0.5">
            Configure counter fee defaults, print receipt footers, audio alerts, and interface theme.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Terminal Preferences */}
        <div className="p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] space-y-4 shadow-xs">
          <div className="text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0]">
            Interface & Counter Preferences
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Theme Toggle */}
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/20 border border-[rgba(196,176,176,0.2)] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#1A1818] dark:text-[#E8E4E0]">Dark / Light Theme</div>
                <div className="text-[11px] text-[#857878] dark:text-[#B5A8A8]">
                  Current mode: {darkMode ? 'Dark Terminal (High Contrast)' : 'Light Ceramic'}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
              >
                {darkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-600" />}
              </button>
            </div>

            {/* Audio Feedback */}
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/20 border border-[rgba(196,176,176,0.2)] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#1A1818] dark:text-[#E8E4E0]">Operator Audio Chimes</div>
                <div className="text-[11px] text-[#857878] dark:text-[#B5A8A8]">
                  {form.audioChimes ? 'Sound enabled on token generation' : 'Silent counter mode'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, audioChimes: !p.audioChimes }))}
                className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
              >
                {form.audioChimes ? (
                  <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Counter POS Defaults */}
        <div className="p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] space-y-4 shadow-xs">
          <div className="text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0]">
            Billing & Token Receipt Defaults
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                Default Operator Service Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={form.defaultServiceFee}
                onChange={(e) => setForm((p) => ({ ...p, defaultServiceFee: Number(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={form.currencySymbol}
                onChange={(e) => setForm((p) => ({ ...p, currencySymbol: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                Receipt Notice Note (Printed at base of token slips)
              </label>
              <textarea
                rows={2}
                value={form.receiptHeaderNote}
                onChange={(e) => setForm((p) => ({ ...p, receiptHeaderNote: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Workspace & Online Sync Status */}
        <div className="p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0]">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Account &amp; Website Sync Status</span>
          </div>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8] leading-relaxed">
            Your Aman Computer workspace is protected with verified owner access. Updates made to your services, notices, documents, and gallery sync automatically to the public website.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
