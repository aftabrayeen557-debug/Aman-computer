import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  MessageSquare,
  Phone,
  Plus,
  XCircle,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { EnquiryFollowUp } from '../types';
import {
  buildWhatsAppHref,
  classifyFollowUpDateBucket,
  formatTelHref,
  toLocalDateKey,
} from '../services/enquiryAnalyticsService';
import { CmsModal } from './CmsPrimitives';

type FollowUpFilter = 'open' | 'overdue' | 'today' | 'upcoming' | 'completed';

export const EnquiryFollowUpsPanel: React.FC = () => {
  const {
    enquiries,
    enquiryFollowUps,
    scheduleEnquiryFollowUp,
    completeEnquiryFollowUp,
    cancelEnquiryFollowUp,
    setSelectedEnquiry,
    recordEnquiryContactAction,
    showToast,
  } = useAdmin();

  const [filterBucket, setFilterBucket] = useState<FollowUpFilter>('open');
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // Schedule modal state
  const [targetEnquiryId, setTargetEnquiryId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => toLocalDateKey(new Date()));
  const [scheduledTime, setScheduledTime] = useState('11:00');
  const [scheduleNotes, setScheduleNotes] = useState('');

  const enquiryMap = useMemo(
    () => new Map(enquiries.map((e) => [e.id, e])),
    [enquiries]
  );

  const enriched = useMemo(() => {
    const now = new Date();
    const list = enquiryFollowUps.map((followUp) => ({
      followUp,
      enquiry: enquiryMap.get(followUp.enquiryId),
      bucket: classifyFollowUpDateBucket(followUp.scheduledDate, followUp.status, now),
    }));

    return list.sort((a, b) => {
      const order: Record<string, number> = {
        overdue: 0,
        today: 1,
        upcoming: 2,
        completed: 3,
        cancelled: 4,
      };
      const diff = (order[a.bucket] ?? 9) - (order[b.bucket] ?? 9);
      if (diff !== 0) return diff;
      return a.followUp.scheduledDate.localeCompare(b.followUp.scheduledDate);
    });
  }, [enquiryFollowUps, enquiryMap]);

  const counts = useMemo(() => {
    const c = { overdue: 0, today: 0, upcoming: 0, completed: 0, open: 0 };
    for (const item of enriched) {
      if (item.bucket === 'overdue') {
        c.overdue += 1;
        c.open += 1;
      } else if (item.bucket === 'today') {
        c.today += 1;
        c.open += 1;
      } else if (item.bucket === 'upcoming') {
        c.upcoming += 1;
        c.open += 1;
      } else if (item.bucket === 'completed' || item.bucket === 'cancelled') {
        c.completed += 1;
      }
    }
    return c;
  }, [enriched]);

  const visibleItems = useMemo(() => {
    return enriched.filter((item) => {
      if (filterBucket === 'open') {
        return item.bucket === 'overdue' || item.bucket === 'today' || item.bucket === 'upcoming';
      }
      if (filterBucket === 'completed') {
        return item.bucket === 'completed' || item.bucket === 'cancelled';
      }
      return item.bucket === filterBucket;
    });
  }, [enriched, filterBucket]);

  const activeEnquiries = useMemo(
    () => enquiries.filter((e) => e.status !== 'completed' && e.status !== 'cancelled' && e.status !== 'not-interested'),
    [enquiries]
  );

  const handleOpenSchedule = () => {
    setTargetEnquiryId(activeEnquiries[0]?.id || enquiries[0]?.id || '');
    setScheduledDate(toLocalDateKey(new Date()));
    setScheduledTime('11:00');
    setScheduleNotes('');
    setScheduleModalOpen(true);
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEnquiryId || !scheduledDate) return;
    scheduleEnquiryFollowUp(targetEnquiryId, {
      scheduledDate,
      scheduledTime,
      notes: scheduleNotes,
    });
    setScheduleModalOpen(false);
  };

  const handleCopyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      showToast('Mobile Copied', phone);
    } catch {
      showToast('Copy Unavailable', phone, 'info');
    }
  };

  const handleConfirmComplete = (fu: EnquiryFollowUp) => {
    completeEnquiryFollowUp(fu.id, completionNotes);
    setCompletingId(null);
    setCompletionNotes('');
  };

  return (
    <div className="space-y-5">
      {/* Top Queue Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-[18px] studio-glass-soft">
          <div className="text-[11px] font-medium text-[var(--st-mut)]">Overdue</div>
          <div className="mt-1.5 font-editorial text-3xl font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
            {counts.overdue}
          </div>
          <div className="text-[10px] font-mono text-[var(--st-mut)] mt-1">
            Past scheduled date
          </div>
        </div>
        <div className="p-4 rounded-[18px] studio-glass-soft">
          <div className="text-[11px] font-medium text-[var(--st-mut)]">Due Today</div>
          <div className="mt-1.5 font-editorial text-3xl font-semibold text-[#94652a] dark:text-[#C9A96E] tabular-nums">
            {counts.today}
          </div>
          <div className="text-[10px] font-mono text-[var(--st-mut)] mt-1">
            Requires attention today
          </div>
        </div>
        <div className="p-4 rounded-[18px] studio-glass-soft">
          <div className="text-[11px] font-medium text-[var(--st-mut)]">Upcoming</div>
          <div className="mt-1.5 font-editorial text-3xl font-semibold text-sky-600 dark:text-sky-300 tabular-nums">
            {counts.upcoming}
          </div>
          <div className="text-[10px] font-mono text-[var(--st-mut)] mt-1">
            Scheduled ahead
          </div>
        </div>
        <div className="p-4 rounded-[18px] studio-glass-soft">
          <div className="text-[11px] font-medium text-[var(--st-mut)]">Completed Log</div>
          <div className="mt-1.5 font-editorial text-3xl font-semibold text-emerald-600 dark:text-emerald-300 tabular-nums">
            {counts.completed}
          </div>
          <div className="text-[10px] font-mono text-[var(--st-mut)] mt-1">
            Finished follow-ups
          </div>
        </div>
      </div>

      {/* Filter Tabs + Schedule Action */}
      <div className="rounded-[18px] studio-glass-card p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'open', label: `All Active (${counts.open})` },
              { id: 'overdue', label: `Overdue (${counts.overdue})` },
              { id: 'today', label: `Due Today (${counts.today})` },
              { id: 'upcoming', label: `Upcoming (${counts.upcoming})` },
              { id: 'completed', label: `History (${counts.completed})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterBucket(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                filterBucket === tab.id
                  ? 'bg-[#20150b] text-[#f6ecdc] dark:bg-[#C9A96E] dark:text-[#1c1208] font-semibold'
                  : 'bg-black/[0.04] dark:bg-white/[0.04] border border-[var(--st-line)] text-[var(--st-mut)] hover:text-[var(--st-tx)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={enquiries.length === 0}
          onClick={handleOpenSchedule}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] disabled:opacity-45 text-[#1c1208] text-xs font-semibold transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Follow-up</span>
        </button>
      </div>

      {/* Follow-up Queue Cards */}
      {visibleItems.length === 0 ? (
        <div className="rounded-[20px] studio-glass-card py-14 px-6 text-center space-y-2">
          <CalendarClock className="w-8 h-8 text-[#C9A96E] mx-auto opacity-75" />
          <p className="text-sm font-medium text-[var(--st-tx)]">
            No follow-ups in this queue
          </p>
          <p className="text-xs text-[var(--st-mut)] max-w-md mx-auto">
            {enquiries.length === 0
              ? 'Customer follow-up reminders will appear here once enquiries are logged.'
              : 'Schedule a callback or document reminder to keep pending applicants moving forward.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleItems.map(({ followUp, enquiry, bucket }) => {
            const phone = enquiry?.phoneNumber || '';
            const name = enquiry?.customerName || 'Unknown Customer';
            const service = enquiry?.serviceName || 'Enquiry';
            const waUrl = phone
              ? buildWhatsAppHref(
                  phone,
                  `Namaste ${name}, following up on your ${service} enquiry (${followUp.enquiryId}) at Aman Computer:`
                )
              : '#';
            const telUrl = phone ? formatTelHref(phone) : '#';

            return (
              <div
                key={followUp.id}
                className="p-4 sm:p-5 rounded-[18px] studio-glass-card space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#C9A96E]/15 border border-[#C9A96E]/35 text-[#8c5d23] dark:text-[#DFC492]">
                        {followUp.enquiryId}
                      </span>

                      {bucket === 'overdue' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/12 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          OVERDUE
                        </span>
                      )}
                      {bucket === 'today' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#C9A96E]/20 text-[#7a501c] dark:text-[#DFC492] border border-[#C9A96E]/45">
                          <Clock className="w-3 h-3" />
                          DUE TODAY
                        </span>
                      )}
                      {bucket === 'upcoming' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-500/12 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                          UPCOMING
                        </span>
                      )}
                      {bucket === 'completed' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          COMPLETED
                        </span>
                      )}
                      {bucket === 'cancelled' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-stone-500/15 text-stone-600 dark:text-stone-300">
                          CANCELLED
                        </span>
                      )}

                      <span className="text-xs font-mono text-[var(--st-mut)] tabular-nums">
                        {followUp.scheduledDate}
                        {followUp.scheduledTime ? ` · ${followUp.scheduledTime}` : ''}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h4 className="text-sm sm:text-base font-semibold text-[var(--st-tx)]">
                        {name}
                      </h4>
                      <span className="text-xs font-mono text-[var(--st-mut)]">{phone}</span>
                      <span className="text-xs text-[var(--st-mut)] truncate">{service}</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {phone && (
                      <>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => recordEnquiryContactAction(followUp.enquiryId, 'whatsapp')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                          title="Open WhatsApp Chat"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                        <a
                          href={telUrl}
                          onClick={() => recordEnquiryContactAction(followUp.enquiryId, 'call')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#C9A96E] hover:bg-[#DFC492] text-[#1c1208] text-xs font-semibold transition-colors"
                          title="Call Customer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(phone)}
                          className="p-1.5 rounded-lg border border-[var(--st-line)] text-[var(--st-mut)] hover:text-[var(--st-tx)] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                          title="Copy Mobile Number"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {enquiry && (
                      <button
                        type="button"
                        onClick={() => setSelectedEnquiry(enquiry)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--st-line)] text-xs text-[var(--st-tx)] hover:border-[#C9A96E]/45 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C9A96E]" />
                        <span>Inspect</span>
                      </button>
                    )}
                  </div>
                </div>

                {followUp.notes && (
                  <p className="text-xs text-[var(--st-tx)] bg-black/[0.03] dark:bg-black/25 border border-[var(--st-line)] rounded-xl px-3.5 py-2.5 leading-relaxed">
                    {followUp.notes}
                  </p>
                )}

                {followUp.status === 'completed' && followUp.completedNotes && (
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-3.5 py-2">
                    <span className="font-semibold">Outcome:</span> {followUp.completedNotes}
                  </div>
                )}

                {followUp.status === 'scheduled' && (
                  <div className="pt-2 border-t border-[var(--st-line)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {completingId === followUp.id ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                        <input
                          type="text"
                          value={completionNotes}
                          onChange={(e) => setCompletionNotes(e.target.value)}
                          placeholder="Optional outcome note (e.g. Customer visiting tomorrow 11 AM)..."
                          className="flex-1 px-3 py-1.5 rounded-xl studio-glass-input text-xs outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleConfirmComplete(followUp)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                          >
                            Confirm Done
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCompletingId(null);
                              setCompletionNotes('');
                            }}
                            className="px-3 py-1.5 rounded-xl border border-[var(--st-line)] text-xs text-[var(--st-mut)] hover:text-[var(--st-tx)] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-[11px] font-mono text-[var(--st-mut)]">
                          Logged by {followUp.createdBy}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCompletingId(followUp.id);
                              setCompletionNotes('');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/12 border border-emerald-600/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600/20 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Completed</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelEnquiryFollowUp(followUp.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[var(--st-line)] text-xs text-[var(--st-mut)] hover:text-rose-500 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Dismiss</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Follow-Up Modal */}
      <CmsModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Customer Follow-up"
        subtitle="Set a callback date, time slot, and reminder note for an enquiry"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
              Select Enquiry *
            </label>
            <select
              required
              value={targetEnquiryId}
              onChange={(e) => setTargetEnquiryId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl studio-glass-input text-xs outline-none"
            >
              {enquiries.map((enq) => (
                <option key={enq.id} value={enq.id}>
                  {enq.id} — {enq.customerName} ({enq.serviceName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
                Follow-up Date *
              </label>
              <input
                required
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl studio-glass-input font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
                Preferred Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl studio-glass-input font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
              Reminder Note *
            </label>
            <textarea
              required
              rows={3}
              value={scheduleNotes}
              onChange={(e) => setScheduleNotes(e.target.value)}
              placeholder="e.g. Ask applicant to bring original marksheet & registered mobile for OTP..."
              className="w-full px-3 py-2.5 rounded-xl studio-glass-input outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--st-line)]">
            <button
              type="button"
              onClick={() => setScheduleModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[var(--st-line)] text-[var(--st-mut)] hover:text-[var(--st-tx)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#1c1208] font-semibold cursor-pointer"
            >
              Save Follow-up
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
};
