import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Copy,
  Eye,
  MessageSquare,
  Phone,
  Search,
  UserCheck,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import {
  ENQUIRY_STATUS_META,
  VerifiedCustomerHistory,
  buildVerifiedCustomerHistories,
  buildWhatsAppHref,
  formatDisplayTimestamp,
  formatTelHref,
} from '../services/enquiryAnalyticsService';
import { CmsModal } from './CmsPrimitives';

export const EnquiryCustomerHistoryPanel: React.FC = () => {
  const {
    enquiries,
    enquiryFollowUps,
    customers,
    receipts,
    setSelectedEnquiry,
    recordEnquiryContactAction,
    showToast,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingCustomer, setInspectingCustomer] = useState<VerifiedCustomerHistory | null>(null);

  const histories = useMemo(
    () => buildVerifiedCustomerHistories(enquiries, enquiryFollowUps, customers, receipts),
    [enquiries, enquiryFollowUps, customers, receipts]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return histories;
    return histories.filter((c) => {
      if (c.primaryName.toLowerCase().includes(q)) return true;
      if (c.displayPhone.toLowerCase().includes(q) || c.normalizedPhone.includes(q.replace(/\D/g, ''))) {
        return true;
      }
      if (c.requestedServices.some((s) => s.serviceName.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [histories, searchQuery]);

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} Copied`, text);
    } catch {
      showToast(label, text, 'info');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[18px] studio-glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-[var(--st-mut)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, verified mobile number, or requested service..."
            className="w-full pl-9 pr-3 py-2 rounded-xl studio-glass-input text-xs outline-none"
          />
        </div>
        <div className="text-[11px] font-mono text-[var(--st-mut)] shrink-0">
          Matched strictly by verified mobile number ({filtered.length} customers)
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[20px] studio-glass-card py-14 px-6 text-center space-y-2">
          <UserCheck className="w-8 h-8 text-[#C9A96E] mx-auto opacity-75" />
          <p className="text-sm font-medium text-[var(--st-tx)]">
            No customer enquiry history found
          </p>
          <p className="text-xs text-[var(--st-mut)]">
            Records are grouped by verified phone number so applicants sharing the same name never merge accidentally.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const latestStatusMeta = ENQUIRY_STATUS_META[item.latestStatus] || ENQUIRY_STATUS_META.new;
            const latestEnq = item.enquiries[0];
            const waUrl = buildWhatsAppHref(
              item.displayPhone,
              `Namaste ${item.primaryName}, regarding your enquiries at Aman Computer Digital Center:`
            );

            return (
              <div
                key={item.customerKey}
                className="p-5 rounded-[20px] studio-glass-card hover:border-[#C9A96E]/45 transition-colors flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold text-[var(--st-tx)] truncate">
                          {item.primaryName}
                        </h4>
                        {item.linkedCustomer && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C9A96E]/15 border border-[#C9A96E]/35 text-[#8c5d23] dark:text-[#DFC492]">
                            Directory Client
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs font-mono text-[var(--st-mut)]">
                        <span>{item.displayPhone}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.displayPhone, 'Mobile')}
                          className="p-1 rounded hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[var(--st-mut)] hover:text-[var(--st-tx)] cursor-pointer"
                          title="Copy Mobile Number"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      {item.nameAliases.length > 0 && (
                        <div className="text-[10px] text-[var(--st-mut)] mt-0.5">
                          Also submitted as: {item.nameAliases.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-editorial text-2xl font-semibold text-[#94652a] dark:text-[#C9A96E] tabular-nums">
                        {item.totalEnquiries}
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--st-mut)]">
                        Enquiries
                      </div>
                    </div>
                  </div>

                  {/* Services Requested */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--st-mut)]">
                      Requested Services
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.requestedServices.slice(0, 4).map((srv) => (
                        <span
                          key={srv.serviceName}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.05] border border-[var(--st-line)] text-[var(--st-tx)]"
                        >
                          {srv.serviceName}
                          {srv.count > 1 ? ` ×${srv.count}` : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status + Latest Date */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--st-line)] text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--st-mut)] block">
                        Latest Status
                      </span>
                      <span
                        className={`mt-1 inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${latestStatusMeta.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${latestStatusMeta.dotClass}`} />
                        {latestStatusMeta.shortLabel}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[var(--st-mut)] block">
                        Latest Request
                      </span>
                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-mono text-[var(--st-tx)]">
                        <Calendar className="w-3 h-3 text-[#C9A96E]" />
                        {formatDisplayTimestamp(item.latestEnquiryDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-3 border-t border-[var(--st-line)] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => latestEnq && recordEnquiryContactAction(latestEnq.id, 'whatsapp')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={formatTelHref(item.displayPhone)}
                      onClick={() => latestEnq && recordEnquiryContactAction(latestEnq.id, 'call')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#C9A96E] hover:bg-[#DFC492] text-[#1c1208] text-xs font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInspectingCustomer(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--st-line)] hover:border-[#C9A96E]/55 text-xs font-medium text-[var(--st-tx)] cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Full History ({item.enquiries.length})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Customer History Modal */}
      <CmsModal
        open={Boolean(inspectingCustomer)}
        onClose={() => setInspectingCustomer(null)}
        title={inspectingCustomer?.primaryName || ''}
        subtitle={
          inspectingCustomer
            ? `${inspectingCustomer.displayPhone} · ${inspectingCustomer.totalEnquiries} enquiries · ${inspectingCustomer.followUps.length} follow-ups`
            : ''
        }
        maxWidthClass="max-w-2xl"
      >
        {inspectingCustomer && (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl studio-glass-soft">
                <div className="text-[10px] font-mono text-[var(--st-mut)]">Total Enquiries</div>
                <div className="text-xl font-editorial font-semibold text-[var(--st-tx)] tabular-nums mt-0.5">
                  {inspectingCustomer.totalEnquiries}
                </div>
              </div>
              <div className="p-3 rounded-xl studio-glass-soft">
                <div className="text-[10px] font-mono text-[var(--st-mut)]">Completed</div>
                <div className="text-xl font-editorial font-semibold text-emerald-600 dark:text-emerald-300 tabular-nums mt-0.5">
                  {inspectingCustomer.completedEnquiries}
                </div>
              </div>
              <div className="p-3 rounded-xl studio-glass-soft">
                <div className="text-[10px] font-mono text-[var(--st-mut)]">Open Requests</div>
                <div className="text-xl font-editorial font-semibold text-[#94652a] dark:text-[#C9A96E] tabular-nums mt-0.5">
                  {inspectingCustomer.activeEnquiries}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#C9A96E]">
                Enquiry Timeline
              </h4>
              <div className="divide-y divide-[var(--st-line)] rounded-xl border border-[var(--st-line)] overflow-hidden">
                {inspectingCustomer.enquiries.map((enq) => {
                  const st = ENQUIRY_STATUS_META[enq.status] || ENQUIRY_STATUS_META.new;
                  return (
                    <div
                      key={enq.id}
                      className="p-3.5 bg-black/[0.02] dark:bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] text-[#94652a] dark:text-[#C9A96E] font-semibold">
                            {enq.id}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${st.badgeClass}`}>
                            {st.shortLabel}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--st-mut)]">
                            {formatDisplayTimestamp(enq.createdAt)}
                          </span>
                        </div>
                        <div className="font-medium text-[var(--st-tx)]">{enq.serviceName}</div>
                        {enq.customerMessage && (
                          <div className="text-[11px] text-[var(--st-mut)] line-clamp-2">
                            “{enq.customerMessage}”
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setInspectingCustomer(null);
                          setSelectedEnquiry(enq);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[var(--st-line)] hover:border-[#C9A96E]/55 text-xs font-medium text-[var(--st-tx)] shrink-0 cursor-pointer"
                      >
                        Open Enquiry
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {inspectingCustomer.followUps.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#C9A96E]">
                  Follow-up Log ({inspectingCustomer.followUps.length})
                </h4>
                <div className="space-y-2">
                  {inspectingCustomer.followUps.map((fu) => (
                    <div
                      key={fu.id}
                      className="p-3 rounded-xl border border-[var(--st-line)] bg-black/[0.02] dark:bg-black/20 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-[11px] text-[var(--st-tx)]">
                          {fu.scheduledDate} {fu.scheduledTime} · {fu.enquiryId}
                        </div>
                        <div className="text-[11px] text-[var(--st-mut)] truncate">
                          {fu.notes || fu.completedNotes || 'Scheduled follow-up'}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-[#C9A96E]">
                        {fu.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CmsModal>
    </div>
  );
};
