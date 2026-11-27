import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  History,
  MessageSquare,
  Phone,
  Plus,
  ShieldAlert,
  Trash2,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { EnquiryPriority, EnquiryStatus } from '../types';
import {
  ALL_ENQUIRY_STATUSES,
  ENQUIRY_PRIORITY_META,
  ENQUIRY_STATUS_META,
  buildVerifiedCustomerHistories,
  buildWhatsAppHref,
  classifyFollowUpDateBucket,
  formatDisplayTimestamp,
  formatDurationHuman,
  formatTelHref,
  getEffectivePriority,
  normalizeIndianPhoneKey,
  parseFlexibleTimestamp,
  toLocalDateKey,
} from '../services/enquiryAnalyticsService';

type DrawerTab = 'details' | 'followups' | 'history';

export const EnquiryDetailDrawer: React.FC = () => {
  const {
    selectedEnquiry,
    setSelectedEnquiry,
    enquiries,
    enquiryFollowUps,
    enquiryAuditLogs,
    customers,
    receipts,
    updateEnquiryStatus,
    updateEnquiryPriority,
    updateEnquiryNotes,
    recordEnquiryContactAction,
    scheduleEnquiryFollowUp,
    completeEnquiryFollowUp,
    cancelEnquiryFollowUp,
    deleteEnquiry,
    showToast,
  } = useAdmin();

  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTab>('details');
  const [notes, setNotes] = useState('');

  // Follow-up scheduling inside drawer
  const [fuDate, setFuDate] = useState(() => toLocalDateKey(new Date()));
  const [fuTime, setFuTime] = useState('11:00');
  const [fuNotes, setFuNotes] = useState('');
  const [completingFuId, setCompletingFuId] = useState<string | null>(null);
  const [fuOutcomeNote, setFuOutcomeNote] = useState('');

  useEffect(() => {
    if (selectedEnquiry) {
      setNotes(selectedEnquiry.adminNotes || '');
      setActiveDrawerTab('details');
      setCompletingFuId(null);
      setFuOutcomeNote('');
      setFuNotes('');
      setFuDate(selectedEnquiry.nextFollowUpDate || toLocalDateKey(new Date()));
      setFuTime(selectedEnquiry.nextFollowUpTime || '11:00');
    }
  }, [selectedEnquiry?.id]);

  const enquiryFollowUpsList = useMemo(() => {
    if (!selectedEnquiry) return [];
    const now = new Date();
    return enquiryFollowUps
      .filter((f) => f.enquiryId === selectedEnquiry.id)
      .map((f) => ({
        followUp: f,
        bucket: classifyFollowUpDateBucket(f.scheduledDate, f.status, now),
      }))
      .sort((a, b) => b.followUp.createdAt.localeCompare(a.followUp.createdAt));
  }, [enquiryFollowUps, selectedEnquiry]);

  const enquiryAudits = useMemo(() => {
    if (!selectedEnquiry) return [];
    return enquiryAuditLogs.filter((a) => a.enquiryId === selectedEnquiry.id);
  }, [enquiryAuditLogs, selectedEnquiry]);

  const customerHistory = useMemo(() => {
    if (!selectedEnquiry) return null;
    const phoneKey = normalizeIndianPhoneKey(selectedEnquiry.phoneNumber);
    const allHistories = buildVerifiedCustomerHistories(
      enquiries,
      enquiryFollowUps,
      customers,
      receipts
    );
    if (phoneKey) {
      return allHistories.find((h) => h.normalizedPhone === phoneKey) || null;
    }
    return allHistories.find((h) => h.enquiries.some((e) => e.id === selectedEnquiry.id)) || null;
  }, [selectedEnquiry, enquiries, enquiryFollowUps, customers, receipts]);

  if (!selectedEnquiry) return null;

  const effectivePriority = getEffectivePriority(selectedEnquiry);
  const priorityMeta = ENQUIRY_PRIORITY_META[effectivePriority];
  const statusMeta = ENQUIRY_STATUS_META[selectedEnquiry.status] || ENQUIRY_STATUS_META.new;

  const whatsappUrl = buildWhatsAppHref(
    selectedEnquiry.phoneNumber,
    `Namaste ${selectedEnquiry.customerName}, regarding your enquiry (${selectedEnquiry.id}) for "${selectedEnquiry.serviceName}" at Aman Computer Digital Center:`
  );
  const callUrl = formatTelHref(selectedEnquiry.phoneNumber);

  const createdMs = parseFlexibleTimestamp(selectedEnquiry.createdAt);
  const firstRespMs = parseFlexibleTimestamp(selectedEnquiry.firstResponseAt);
  const completedMs = parseFlexibleTimestamp(selectedEnquiry.completedAt);

  const firstResponseDurationMin =
    createdMs !== null && firstRespMs !== null && firstRespMs >= createdMs
      ? (firstRespMs - createdMs) / 60000
      : null;
  const resolutionDurationMin =
    selectedEnquiry.status === 'completed' &&
    createdMs !== null &&
    completedMs !== null &&
    completedMs >= createdMs
      ? (completedMs - createdMs) / 60000
      : null;

  const openFollowUpsCount = enquiryFollowUpsList.filter(
    (x) => x.followUp.status === 'scheduled'
  ).length;

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast(`${label} Copied`, value);
    } catch {
      showToast(label, value, 'info');
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuDate) return;
    scheduleEnquiryFollowUp(selectedEnquiry.id, {
      scheduledDate: fuDate,
      scheduledTime: fuTime,
      notes: fuNotes,
    });
    setFuNotes('');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[#24160a]/35 dark:bg-black/65 backdrop-blur-[6px] flex justify-end"
      onClick={() => setSelectedEnquiry(null)}
    >
      <div
        className="w-full max-w-xl h-full studio-glass-popover border-l border-[var(--st-line-strong)] flex flex-col justify-between overflow-y-auto admin-studio-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Top Header */}
          <div className="p-5 border-b border-[var(--st-line)] flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(selectedEnquiry.id, 'Reference ID')}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-[#C9A96E]/15 border border-[#C9A96E]/35 text-[#8c5d23] dark:text-[#DFC492] hover:bg-[#C9A96E]/25 cursor-pointer"
                  title="Copy Enquiry Reference ID"
                >
                  <span>{selectedEnquiry.id}</span>
                  <Copy className="w-3 h-3" />
                </button>

                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${statusMeta.badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                  {statusMeta.shortLabel}
                </span>

                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${priorityMeta.badgeClass}`}
                >
                  {effectivePriority === 'high' && <ShieldAlert className="w-3 h-3" />}
                  {priorityMeta.label.toUpperCase()} PRIORITY
                </span>
              </div>

              <h2 className="font-editorial text-2xl text-[var(--st-tx)] mt-2 tracking-tight truncate">
                {selectedEnquiry.customerName}
              </h2>
              <p className="text-xs text-[var(--st-mut)] truncate">
                {selectedEnquiry.serviceName}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedEnquiry(null)}
              className="p-1.5 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-[var(--st-mut)] hover:text-[var(--st-tx)] cursor-pointer shrink-0"
              aria-label="Close enquiry drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Direct User-Initiated Contact Strip */}
          <div className="p-4 border-b border-[var(--st-line)] grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordEnquiryContactAction(selectedEnquiry.id, 'whatsapp')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            <a
              href={callUrl}
              onClick={() => recordEnquiryContactAction(selectedEnquiry.id, 'call')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#1c1208] font-semibold text-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Customer</span>
            </a>

            <button
              type="button"
              onClick={() => handleCopy(selectedEnquiry.phoneNumber, 'Mobile Number')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[var(--st-line)] hover:border-[#C9A96E]/50 text-[var(--st-tx)] font-medium text-xs transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>Copy Mobile</span>
            </button>
          </div>

          {/* Internal Drawer Sub-Tabs */}
          <div className="px-5 pt-3 border-b border-[var(--st-line)] flex items-center gap-1.5 overflow-x-auto">
            {(
              [
                { id: 'details', label: 'Details & Actions', icon: FileText },
                {
                  id: 'followups',
                  label:
                    openFollowUpsCount > 0
                      ? `Follow-ups (${openFollowUpsCount})`
                      : 'Follow-ups',
                  icon: CalendarClock,
                },
                {
                  id: 'history',
                  label: `History & Audit (${enquiryAudits.length})`,
                  icon: History,
                },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeDrawerTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDrawerTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'border-[#C9A96E] text-[var(--st-tx)] font-semibold'
                      : 'border-transparent text-[var(--st-mut)] hover:text-[var(--st-tx)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeDrawerTab === 'details' && (
            <div className="p-5 space-y-5">
              {/* Customer & Preferred Channel */}
              <div className="p-4 rounded-xl studio-glass-card space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--st-mut)]">
                    Applicant Contact Profile
                  </span>
                  {selectedEnquiry.source && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] text-[var(--st-mut)]">
                      Source: {selectedEnquiry.source}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--st-tx)]">
                  <User className="w-4 h-4 text-[#C9A96E]" />
                  <span>{selectedEnquiry.customerName}</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-[var(--st-mut)] pl-6">
                  <span>{selectedEnquiry.phoneNumber}</span>
                  <span className="text-[#8c5d23] dark:text-[#C9A96E]">
                    Prefers:{' '}
                    {selectedEnquiry.preferredContactMethod === 'whatsapp'
                      ? 'WhatsApp'
                      : selectedEnquiry.preferredContactMethod === 'phone'
                      ? 'Phone Call'
                      : 'Either / Any'}
                  </span>
                </div>

                {selectedEnquiry.estimatedCost && (
                  <div className="text-xs font-mono text-emerald-700 dark:text-emerald-300 pl-6">
                    Est. Counter Fee: {selectedEnquiry.estimatedCost}
                  </div>
                )}
              </div>

              {/* Customer Requirement Note */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--st-mut)]">
                  Customer Query / Requirement
                </span>
                <div className="p-3.5 rounded-xl bg-black/[0.04] dark:bg-black/30 border border-[var(--st-line)] text-xs text-[var(--st-tx)] leading-relaxed">
                  {selectedEnquiry.customerMessage
                    ? `“${selectedEnquiry.customerMessage}”`
                    : 'No additional requirement message entered.'}
                </div>
              </div>

              {/* Priority Selector */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-[var(--st-tx)] block">
                  Priority Level
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['high', 'medium', 'low'] as EnquiryPriority[]).map((pri) => {
                    const meta = ENQUIRY_PRIORITY_META[pri];
                    const selected = effectivePriority === pri;
                    return (
                      <button
                        key={pri}
                        type="button"
                        onClick={() => updateEnquiryPriority(selectedEnquiry.id, pri)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          selected
                            ? `${meta.badgeClass} font-semibold shadow-xs`
                            : 'bg-black/[0.03] dark:bg-white/[0.03] border-[var(--st-line)] text-[var(--st-mut)] hover:text-[var(--st-tx)]'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
                        <span>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lifecycle Status Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--st-tx)] block">
                  Lifecycle Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_ENQUIRY_STATUSES.map((status) => {
                    const meta = ENQUIRY_STATUS_META[status];
                    const active = selectedEnquiry.status === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateEnquiryStatus(selectedEnquiry.id, status)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium text-left border transition-all flex items-center justify-between cursor-pointer ${
                          active
                            ? 'bg-[#C9A96E]/18 text-[var(--st-tx)] border-[#C9A96E]/60 font-semibold'
                            : 'bg-black/[0.03] dark:bg-white/[0.03] border-[var(--st-line)] text-[var(--st-mut)] hover:border-[#C9A96E]/35 hover:text-[var(--st-tx)]'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
                          <span>{meta.label}</span>
                        </span>
                        {active && <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real Timestamps & Response SLA Metrics */}
              <div className="p-4 rounded-xl studio-glass-soft space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A96E] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Recorded Timestamps</span>
                  </span>
                  <span className="text-[11px] font-mono text-[var(--st-mut)]">
                    Operator: {selectedEnquiry.assignedOperator || 'Sharique Aman'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-[var(--st-line)]">
                  <div>
                    <div className="text-[10px] font-mono text-[var(--st-mut)]">Received</div>
                    <div className="font-mono text-[11px] text-[var(--st-tx)] mt-0.5">
                      {formatDisplayTimestamp(selectedEnquiry.createdAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[var(--st-mut)]">
                      First Response{' '}
                      {firstResponseDurationMin !== null
                        ? `(${formatDurationHuman(firstResponseDurationMin)})`
                        : ''}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--st-tx)] mt-0.5">
                      {selectedEnquiry.firstResponseAt
                        ? formatDisplayTimestamp(selectedEnquiry.firstResponseAt)
                        : '— (Not logged yet)'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[var(--st-mut)]">Last Contacted</div>
                    <div className="font-mono text-[11px] text-[var(--st-tx)] mt-0.5">
                      {selectedEnquiry.lastContactedAt
                        ? formatDisplayTimestamp(selectedEnquiry.lastContactedAt)
                        : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[var(--st-mut)]">
                      Completed{' '}
                      {resolutionDurationMin !== null
                        ? `(${formatDurationHuman(resolutionDurationMin)})`
                        : ''}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--st-tx)] mt-0.5">
                      {selectedEnquiry.completedAt
                        ? formatDisplayTimestamp(selectedEnquiry.completedAt)
                        : '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--st-tx)] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>Internal Counter Notes</span>
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add private counter notes (e.g. documents verified, acknowledgement ref, follow-up plan)..."
                  className="w-full p-3 rounded-xl studio-glass-input text-xs placeholder-[var(--st-mut)] outline-none"
                />
                <button
                  type="button"
                  onClick={() => updateEnquiryNotes(selectedEnquiry.id, notes)}
                  className="w-full py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#1c1208] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Save Internal Notes
                </button>
              </div>
            </div>
          )}

          {activeDrawerTab === 'followups' && (
            <div className="p-5 space-y-5">
              {/* Inline Schedule Follow-up Form */}
              <form
                onSubmit={handleScheduleSubmit}
                className="p-4 rounded-xl studio-glass-card space-y-3 text-xs"
              >
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#C9A96E]">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule Follow-up Reminder</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-[var(--st-mut)] mb-1">
                      Follow-up Date *
                    </label>
                    <input
                      required
                      type="date"
                      value={fuDate}
                      onChange={(e) => setFuDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl studio-glass-input font-mono text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[var(--st-mut)] mb-1">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      value={fuTime}
                      onChange={(e) => setFuTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl studio-glass-input font-mono text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[var(--st-mut)] mb-1">
                    Reminder Notes
                  </label>
                  <textarea
                    rows={2}
                    value={fuNotes}
                    onChange={(e) => setFuNotes(e.target.value)}
                    placeholder="e.g. Call regarding pending Aadhaar OTP or original certificate..."
                    className="w-full px-3 py-2 rounded-xl studio-glass-input text-xs outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#1c1208] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Save Follow-up Reminder
                </button>
              </form>

              {/* Follow-up Timeline for this Enquiry */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--st-mut)]">
                  Scheduled &amp; Past Follow-ups ({enquiryFollowUpsList.length})
                </div>

                {enquiryFollowUpsList.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-[var(--st-line)] text-center text-xs text-[var(--st-mut)]">
                    No follow-ups logged for this enquiry yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {enquiryFollowUpsList.map(({ followUp, bucket }) => (
                      <div
                        key={followUp.id}
                        className="p-3.5 rounded-xl studio-glass-soft space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-semibold text-[var(--st-tx)]">
                            {followUp.scheduledDate}
                            {followUp.scheduledTime ? ` · ${followUp.scheduledTime}` : ''}
                          </span>
                          {bucket === 'overdue' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/12 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              OVERDUE
                            </span>
                          )}
                          {bucket === 'today' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C9A96E]/20 text-[#7a501c] dark:text-[#DFC492] border border-[#C9A96E]/40">
                              DUE TODAY
                            </span>
                          )}
                          {bucket === 'upcoming' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/12 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                              UPCOMING
                            </span>
                          )}
                          {bucket === 'completed' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                              COMPLETED
                            </span>
                          )}
                          {bucket === 'cancelled' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-500/15 text-stone-600 dark:text-stone-300">
                              CANCELLED
                            </span>
                          )}
                        </div>

                        {followUp.notes && (
                          <p className="text-[var(--st-tx)] leading-relaxed">{followUp.notes}</p>
                        )}
                        {followUp.completedNotes && (
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                            Outcome: {followUp.completedNotes}
                          </p>
                        )}

                        {followUp.status === 'scheduled' && (
                          <div className="pt-2 border-t border-[var(--st-line)]">
                            {completingFuId === followUp.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={fuOutcomeNote}
                                  onChange={(e) => setFuOutcomeNote(e.target.value)}
                                  placeholder="Optional outcome summary..."
                                  className="w-full px-2.5 py-1.5 rounded-lg studio-glass-input text-xs outline-none"
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      completeEnquiryFollowUp(followUp.id, fuOutcomeNote);
                                      setCompletingFuId(null);
                                      setFuOutcomeNote('');
                                    }}
                                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold cursor-pointer"
                                  >
                                    Confirm Completed
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCompletingFuId(null)}
                                    className="px-2.5 py-1 rounded-lg border border-[var(--st-line)] text-[var(--st-mut)] cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCompletingFuId(followUp.id);
                                    setFuOutcomeNote('');
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/12 border border-emerald-600/30 text-emerald-700 dark:text-emerald-300 font-semibold cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Mark Completed</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => cancelEnquiryFollowUp(followUp.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--st-line)] text-[var(--st-mut)] hover:text-rose-500 cursor-pointer"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>Dismiss</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeDrawerTab === 'history' && (
            <div className="p-5 space-y-5 text-xs">
              {/* Verified Phone-Matched Customer History */}
              <div className="p-4 rounded-xl studio-glass-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A96E]">
                    Verified Customer History
                  </span>
                  <span className="text-[10px] font-mono text-[var(--st-mut)]">
                    Matched by mobile number
                  </span>
                </div>

                {customerHistory ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-lg studio-glass-soft">
                        <div className="text-[10px] font-mono text-[var(--st-mut)]">Enquiries</div>
                        <div className="text-lg font-editorial font-semibold text-[var(--st-tx)] tabular-nums">
                          {customerHistory.totalEnquiries}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg studio-glass-soft">
                        <div className="text-[10px] font-mono text-[var(--st-mut)]">Completed</div>
                        <div className="text-lg font-editorial font-semibold text-emerald-600 dark:text-emerald-300 tabular-nums">
                          {customerHistory.completedEnquiries}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg studio-glass-soft">
                        <div className="text-[10px] font-mono text-[var(--st-mut)]">Receipts</div>
                        <div className="text-lg font-editorial font-semibold text-[#94652a] dark:text-[#C9A96E] tabular-nums">
                          {customerHistory.receipts.length}
                        </div>
                      </div>
                    </div>

                    {customerHistory.enquiries.length > 1 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-mono text-[var(--st-mut)]">
                          Other Enquiries from {customerHistory.displayPhone}
                        </div>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto admin-studio-scroll">
                          {customerHistory.enquiries
                            .filter((e) => e.id !== selectedEnquiry.id)
                            .map((other) => {
                              const st = ENQUIRY_STATUS_META[other.status] || ENQUIRY_STATUS_META.new;
                              return (
                                <button
                                  key={other.id}
                                  type="button"
                                  onClick={() => setSelectedEnquiry(other)}
                                  className="w-full text-left p-2.5 rounded-lg border border-[var(--st-line)] hover:border-[#C9A96E]/55 bg-black/[0.02] dark:bg-black/20 flex items-center justify-between gap-2 cursor-pointer"
                                >
                                  <div className="min-w-0">
                                    <div className="font-mono text-[10px] text-[#94652a] dark:text-[#C9A96E]">
                                      {other.id} · {formatDisplayTimestamp(other.createdAt)}
                                    </div>
                                    <div className="font-medium text-[var(--st-tx)] truncate">
                                      {other.serviceName}
                                    </div>
                                  </div>
                                  <span
                                    className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${st.badgeClass}`}
                                  >
                                    {st.shortLabel}
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[var(--st-mut)]">
                    No prior phone-matched records found for this applicant.
                  </p>
                )}
              </div>

              {/* Chronological Audit Trail */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--st-mut)]">
                  Enquiry Activity Log ({enquiryAudits.length})
                </div>

                {enquiryAudits.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-[var(--st-line)] text-center text-[var(--st-mut)]">
                    Activity entries appear automatically when status, priority, notes, or follow-ups are updated.
                  </div>
                ) : (
                  <div className="relative pl-4 space-y-3 before:content-[''] before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--st-line)]">
                    {enquiryAudits.map((entry) => (
                      <div key={entry.id} className="relative">
                        <span className="absolute -left-[15px] top-1.5 w-2 h-2 rounded-full bg-[#C9A96E]" />
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-medium text-[var(--st-tx)]">
                            {entry.details}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--st-mut)] shrink-0">
                            {formatDisplayTimestamp(entry.createdAt)}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-[var(--st-mut)] mt-0.5">
                          By {entry.performedBy}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Drawer Footer */}
        <div className="p-4 border-t border-[var(--st-line)] flex items-center justify-between bg-black/[0.04] dark:bg-black/30">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete enquiry ${selectedEnquiry.id}?`)) {
                deleteEnquiry(selectedEnquiry.id);
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 hover:opacity-80 font-medium px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Record</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedEnquiry(null)}
            className="py-2 px-5 rounded-xl border border-[var(--st-line)] text-xs font-medium text-[var(--st-tx)] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
