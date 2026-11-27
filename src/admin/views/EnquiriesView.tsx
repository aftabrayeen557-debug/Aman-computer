import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  CalendarClock,
  Copy,
  Eye,
  FileSpreadsheet,
  Filter,
  Inbox,
  MessageSquare,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { EnquiryPriority, EnquiryStatus } from '../types';
import { CmsModal, CmsPageHeader, CmsSurfaceCard } from '../components/CmsPrimitives';
import { EnquiryDetailDrawer } from '../components/EnquiryDetailDrawer';
import { EnquiryAnalyticsPanel } from '../components/EnquiryAnalyticsPanel';
import { EnquiryFollowUpsPanel } from '../components/EnquiryFollowUpsPanel';
import { EnquiryCustomerHistoryPanel } from '../components/EnquiryCustomerHistoryPanel';
import {
  ALL_ENQUIRY_STATUSES,
  ENQUIRY_PRIORITY_META,
  ENQUIRY_STATUS_META,
  buildWhatsAppHref,
  computeResponseMetrics,
  formatDisplayTimestamp,
  formatTelHref,
  getEffectivePriority,
  isEnquiryActive,
  parseFlexibleTimestamp,
  toLocalDateKey,
} from '../services/enquiryAnalyticsService';

type EnquirySubView = 'queue' | 'analytics' | 'followups' | 'customers';
type PriorityFilter = 'all' | 'urgent-only' | EnquiryPriority;
type SortOption = 'newest' | 'oldest' | 'priority-desc' | 'followup-asc';

export const EnquiriesView: React.FC = () => {
  const {
    enquiries,
    enquiryFollowUps,
    enquirySchemaPending,
    services,
    addEnquiry,
    updateEnquiryStatus,
    updateEnquiryPriority,
    recordEnquiryContactAction,
    setSelectedEnquiry,
    exportEnquiriesCSV,
    showToast,
  } = useAdmin();

  const [subView, setSubView] = useState<EnquirySubView>(() => {
    if (typeof window === 'undefined') return 'queue';
    const sub = new URLSearchParams(window.location.search).get('sub');
    if (sub === 'analytics' || sub === 'followups' || sub === 'customers' || sub === 'queue') {
      return sub;
    }
    return 'queue';
  });

  const [activeStatusTab, setActiveStatusTab] = useState<'all' | EnquiryStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Walk-in / Manual Counter Enquiry modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftPhone, setDraftPhone] = useState('+91 ');
  const [draftServiceId, setDraftServiceId] = useState('');
  const [draftContactMethod, setDraftContactMethod] = useState<'whatsapp' | 'phone' | 'either'>('whatsapp');
  const [draftSource, setDraftSource] = useState<'walk-in' | 'phone' | 'whatsapp'>('walk-in');
  const [draftPriority, setDraftPriority] = useState<EnquiryPriority>('medium');
  const [draftMessage, setDraftMessage] = useState('');

  const responseMetrics = useMemo(
    () => computeResponseMetrics(enquiries, enquiryFollowUps),
    [enquiries, enquiryFollowUps]
  );

  const openFollowUpsCount = useMemo(
    () => enquiryFollowUps.filter((f) => f.status === 'scheduled').length,
    [enquiryFollowUps]
  );

  const activeQueueCount = useMemo(
    () => enquiries.filter((e) => isEnquiryActive(e.status)).length,
    [enquiries]
  );

  const todayKey = useMemo(() => toLocalDateKey(new Date()), []);

  const filteredEnquiries = useMemo(() => {
    const filtered = enquiries.filter((e) => {
      if (activeStatusTab !== 'all' && e.status !== activeStatusTab) {
        return false;
      }
      const effPri = getEffectivePriority(e);
      if (priorityFilter === 'urgent-only') {
        if (effPri !== 'high' && e.urgency !== 'urgent') return false;
      } else if (priorityFilter !== 'all' && effPri !== priorityFilter) {
        return false;
      }
      if (selectedServiceFilter !== 'all' && e.serviceId !== selectedServiceFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = e.customerName.toLowerCase().includes(q);
        const matchesPhone = e.phoneNumber.toLowerCase().includes(q);
        const matchesService = e.serviceName.toLowerCase().includes(q);
        const matchesId = e.id.toLowerCase().includes(q);
        const matchesMsg = (e.customerMessage || '').toLowerCase().includes(q);
        const matchesNotes = (e.adminNotes || '').toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesService && !matchesId && !matchesMsg && !matchesNotes) {
          return false;
        }
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'oldest') {
        return (parseFlexibleTimestamp(a.createdAt) ?? 0) - (parseFlexibleTimestamp(b.createdAt) ?? 0);
      }
      if (sortBy === 'priority-desc') {
        const rankDiff =
          ENQUIRY_PRIORITY_META[getEffectivePriority(b)].rank -
          ENQUIRY_PRIORITY_META[getEffectivePriority(a)].rank;
        if (rankDiff !== 0) return rankDiff;
        return (parseFlexibleTimestamp(b.createdAt) ?? 0) - (parseFlexibleTimestamp(a.createdAt) ?? 0);
      }
      if (sortBy === 'followup-asc') {
        const da = a.nextFollowUpDate || '9999-99-99';
        const db = b.nextFollowUpDate || '9999-99-99';
        const cmp = da.localeCompare(db);
        if (cmp !== 0) return cmp;
        return (parseFlexibleTimestamp(b.createdAt) ?? 0) - (parseFlexibleTimestamp(a.createdAt) ?? 0);
      }
      // newest
      return (parseFlexibleTimestamp(b.createdAt) ?? 0) - (parseFlexibleTimestamp(a.createdAt) ?? 0);
    });
  }, [enquiries, activeStatusTab, priorityFilter, selectedServiceFilter, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedEnquiries = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredEnquiries.slice(start, start + itemsPerPage);
  }, [filteredEnquiries, safePage]);

  const uniqueServices = useMemo(() => {
    const map = new Map<string, string>();
    enquiries.forEach((e) => map.set(e.serviceId, e.serviceName));
    return Array.from(map.entries());
  }, [enquiries]);

  const statusTabCounts = useMemo(() => {
    const counts: Record<'all' | EnquiryStatus, number> = {
      all: enquiries.length,
      new: 0,
      contacted: 0,
      pending: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0,
      'not-interested': 0,
    };
    for (const e of enquiries) {
      if (e.status in counts) counts[e.status] += 1;
    }
    return counts;
  }, [enquiries]);

  const handleCopyText = async (value: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      showToast(`${label} Copied`, value);
    } catch {
      showToast(label, value, 'info');
    }
  };

  const handleOpenAddModal = () => {
    setDraftName('');
    setDraftPhone('+91 ');
    setDraftServiceId(services[0]?.id || 'srv-1');
    setDraftContactMethod('whatsapp');
    setDraftSource('walk-in');
    setDraftPriority('medium');
    setDraftMessage('');
    setAddModalOpen(true);
  };

  const handleCreateWalkInEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim() || !draftPhone.trim()) return;
    const matchedService = services.find((s) => s.id === draftServiceId);
    addEnquiry({
      customerName: draftName.trim(),
      phoneNumber: draftPhone.trim(),
      serviceId: matchedService?.id || draftServiceId || 'srv-general',
      serviceName: matchedService?.title || 'General Counter Enquiry',
      customerMessage: draftMessage.trim(),
      urgency: draftPriority === 'high' ? 'urgent' : 'normal',
      priority: draftPriority,
      preferredContactMethod: draftContactMethod,
      source: draftSource,
      status: 'new',
      estimatedCost: matchedService?.priceStartingAt,
      adminNotes: '',
    });
    setAddModalOpen(false);
    setSubView('queue');
    setActiveStatusTab('all');
    setCurrentPage(1);
  };

  const handleJumpToStatus = (status: EnquiryStatus) => {
    setActiveStatusTab(status);
    setCurrentPage(1);
    setSubView('queue');
  };

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Customer Enquiry & Growth System"
        title="Customer Enquiries"
        description="Triage incoming customer leads, track first-response times, schedule follow-ups, and inspect phone-verified applicant history."
        actions={
          <>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#1c1208] font-semibold text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Counter Enquiry</span>
            </button>
            <button
              type="button"
              onClick={exportEnquiriesCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--st-line)] studio-glass-soft hover:border-[#C9A96E]/55 text-[var(--st-tx)] font-medium text-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#C9A96E]" />
              <span>Export CSV</span>
            </button>
          </>
        }
      />

      {enquirySchemaPending && (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold">Cloud Workspace Migration Pending</div>
            <p className="opacity-90 leading-relaxed">
              Your database project still needs the latest enquiry schema update applied. Core enquiry tracking works normally, and extended follow-up schedules and audit history are preserved in your authenticated session until the update is run.
            </p>
          </div>
        </div>
      )}

      {/* Workspace Sub-Navigation */}
      <div className="rounded-2xl studio-glass-card p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {(
          [
            {
              id: 'queue' as const,
              label: 'Queue & Triage',
              icon: Inbox,
              badge: activeQueueCount,
              badgeTone: 'default',
            },
            {
              id: 'analytics' as const,
              label: 'Analytics & Trends',
              icon: BarChart3,
              badge: null,
              badgeTone: 'default',
            },
            {
              id: 'followups' as const,
              label: 'Follow-ups',
              icon: CalendarClock,
              badge:
                responseMetrics.overdueFollowUpsCount > 0
                  ? responseMetrics.overdueFollowUpsCount
                  : openFollowUpsCount,
              badgeTone: responseMetrics.overdueFollowUpsCount > 0 ? 'urgent' : 'default',
            },
            {
              id: 'customers' as const,
              label: 'Customer History',
              icon: UserCheck,
              badge: null,
              badgeTone: 'default',
            },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = subView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubView(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? 'bg-[#20150b] text-[#f6ecdc] dark:bg-[#C9A96E] dark:text-[#1c1208] font-semibold shadow-xs'
                  : 'text-[var(--st-mut)] hover:text-[var(--st-tx)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== null && tab.badge > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md tabular-nums ${
                    tab.badgeTone === 'urgent'
                      ? 'bg-rose-500 text-white'
                      : active
                      ? 'bg-white/20 text-current dark:bg-black/15'
                      : 'bg-black/[0.07] dark:bg-white/[0.08] text-[var(--st-tx)]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-View 1: Queue & Triage */}
      {subView === 'queue' && (
        <div className="space-y-4">
          {/* Full Lifecycle Status Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl studio-glass-soft overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setActiveStatusTab('all');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeStatusTab === 'all'
                  ? 'bg-[#C9A96E]/20 border border-[#C9A96E]/45 text-[var(--st-tx)] font-semibold'
                  : 'text-[var(--st-mut)] hover:text-[var(--st-tx)]'
              }`}
            >
              <span>All Enquiries</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/[0.06] dark:bg-black/30 tabular-nums">
                {statusTabCounts.all}
              </span>
            </button>

            {ALL_ENQUIRY_STATUSES.map((st) => {
              const meta = ENQUIRY_STATUS_META[st];
              const isActive = activeStatusTab === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setActiveStatusTab(st);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#C9A96E]/20 border border-[#C9A96E]/45 text-[var(--st-tx)] font-semibold'
                      : 'text-[var(--st-mut)] hover:text-[var(--st-tx)]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
                  <span>{meta.shortLabel}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/[0.06] dark:bg-black/30 tabular-nums">
                    {statusTabCounts[st]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search, Priority, Service & Sort Filters */}
          <CmsSurfaceCard className="p-4">
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-[var(--st-mut)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by customer name, mobile number, ENQ ID, service, or notes..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl studio-glass-input text-xs outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <select
                    aria-label="Filter by priority"
                    value={priorityFilter}
                    onChange={(e) => {
                      setPriorityFilter(e.target.value as PriorityFilter);
                      setCurrentPage(1);
                    }}
                    className="text-xs py-2 px-3 rounded-xl studio-glass-input outline-none cursor-pointer"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent-only">Urgent / High Only</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[var(--st-mut)]" />
                  <select
                    aria-label="Filter by service"
                    value={selectedServiceFilter}
                    onChange={(e) => {
                      setSelectedServiceFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="text-xs py-2 px-3 rounded-xl studio-glass-input outline-none cursor-pointer max-w-[180px]"
                  >
                    <option value="all">All Services</option>
                    {uniqueServices.map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[var(--st-mut)]" />
                  <select
                    aria-label="Sort enquiries"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as SortOption);
                      setCurrentPage(1);
                    }}
                    className="text-xs py-2 px-3 rounded-xl studio-glass-input outline-none cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priority-desc">Highest Priority</option>
                    <option value="followup-asc">Next Follow-up Soonest</option>
                  </select>
                </div>
              </div>
            </div>
          </CmsSurfaceCard>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-[20px] studio-glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--st-line)] bg-black/[0.03] dark:bg-black/25 text-[10px] font-mono uppercase tracking-wider text-[var(--st-mut)]">
                    <th className="py-3.5 px-4">Ref &amp; Received</th>
                    <th className="py-3.5 px-4">Customer &amp; Contact</th>
                    <th className="py-3.5 px-4">Service &amp; Note</th>
                    <th className="py-3.5 px-4">Priority &amp; Follow-up</th>
                    <th className="py-3.5 px-4">Lifecycle Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--st-line)]">
                  {paginatedEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[var(--st-mut)]">
                        No enquiries match your current search or filter selection.
                      </td>
                    </tr>
                  ) : (
                    paginatedEnquiries.map((enq) => {
                      const effPriority = getEffectivePriority(enq);
                      const priorityMeta = ENQUIRY_PRIORITY_META[effPriority];
                      const statusMeta = ENQUIRY_STATUS_META[enq.status] || ENQUIRY_STATUS_META.new;
                      const whatsappUrl = buildWhatsAppHref(
                        enq.phoneNumber,
                        `Namaste ${enq.customerName}, regarding your ${enq.serviceName} enquiry (${enq.id}) at Aman Computer:`
                      );
                      const callUrl = formatTelHref(enq.phoneNumber);
                      const isOverdueFollowUp =
                        Boolean(enq.nextFollowUpDate) &&
                        isEnquiryActive(enq.status) &&
                        (enq.nextFollowUpDate || '') < todayKey;

                      return (
                        <tr
                          key={enq.id}
                          className="hover:bg-black/[0.025] dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                          onClick={() => setSelectedEnquiry(enq)}
                        >
                          <td className="py-3.5 px-4 font-mono align-top whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[#8c5d23] dark:text-[#C9A96E]">
                                {enq.id}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyText(enq.id, 'Reference ID', e)}
                                className="p-0.5 rounded text-[var(--st-mut)] hover:text-[var(--st-tx)] cursor-pointer"
                                title="Copy Reference ID"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-[10px] text-[var(--st-mut)] mt-0.5 tabular-nums">
                              {formatDisplayTimestamp(enq.createdAt)}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <div className="font-semibold text-[var(--st-tx)]">
                              {enq.customerName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--st-mut)] mt-0.5">
                              <span>{enq.phoneNumber}</span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyText(enq.phoneNumber, 'Mobile Number', e)}
                                className="p-0.5 rounded text-[var(--st-mut)] hover:text-[var(--st-tx)] cursor-pointer"
                                title="Copy Mobile Number"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-[#8c5d23] dark:text-[#C9A96E]">
                              <span>
                                Pref:{' '}
                                {enq.preferredContactMethod === 'whatsapp'
                                  ? 'WhatsApp'
                                  : enq.preferredContactMethod === 'phone'
                                  ? 'Phone'
                                  : 'Either'}
                              </span>
                              {enq.source && (
                                <span className="text-[var(--st-mut)]">· {enq.source}</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-top max-w-[260px]">
                            <div className="font-medium text-[var(--st-tx)] truncate">
                              {enq.serviceName}
                            </div>
                            <p className="line-clamp-2 text-[11px] text-[var(--st-mut)] mt-0.5">
                              {enq.customerMessage
                                ? `“${enq.customerMessage}”`
                                : 'No extra note provided.'}
                            </p>
                          </td>

                          <td
                            className="py-3.5 px-4 align-top"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex flex-col items-start gap-1.5">
                              <select
                                aria-label={`Priority for ${enq.id}`}
                                value={effPriority}
                                onChange={(e) =>
                                  updateEnquiryPriority(enq.id, e.target.value as EnquiryPriority)
                                }
                                className={`text-[10px] font-mono font-semibold px-2 py-1 rounded-md border outline-none cursor-pointer ${priorityMeta.badgeClass}`}
                              >
                                <option value="high">HIGH</option>
                                <option value="medium">MEDIUM</option>
                                <option value="low">LOW</option>
                              </select>

                              {enq.nextFollowUpDate && (
                                <span
                                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                    isOverdueFollowUp
                                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 font-semibold'
                                      : 'bg-black/[0.05] dark:bg-white/[0.06] text-[var(--st-mut)]'
                                  }`}
                                >
                                  FU: {enq.nextFollowUpDate}
                                </span>
                              )}
                            </div>
                          </td>

                          <td
                            className="py-3.5 px-4 align-top"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              aria-label={`Status for ${enq.id}`}
                              value={enq.status}
                              onChange={(e) =>
                                updateEnquiryStatus(enq.id, e.target.value as EnquiryStatus)
                              }
                              className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md border outline-none cursor-pointer ${statusMeta.badgeClass}`}
                            >
                              {ALL_ENQUIRY_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {ENQUIRY_STATUS_META[st].label.toUpperCase()}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td
                            className="py-3.5 px-4 text-right align-top"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1">
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => recordEnquiryContactAction(enq.id, 'whatsapp')}
                                className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                title="WhatsApp Customer"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </a>
                              <a
                                href={callUrl}
                                onClick={() => recordEnquiryContactAction(enq.id, 'call')}
                                className="p-1.5 rounded-lg text-[#8c5d23] dark:text-[#C9A96E] hover:bg-[#C9A96E]/10 transition-colors"
                                title="Call Customer"
                              >
                                <Phone className="w-4 h-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => setSelectedEnquiry(enq)}
                                className="p-1.5 rounded-lg text-[var(--st-mut)] hover:text-[var(--st-tx)] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                                title="Inspect Enquiry"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Responsive Card List */}
          <div className="md:hidden space-y-3">
            {paginatedEnquiries.length === 0 ? (
              <div className="rounded-2xl studio-glass-card py-12 px-6 text-center text-xs text-[var(--st-mut)]">
                No enquiries match your current filters.
              </div>
            ) : (
              paginatedEnquiries.map((enq) => {
                const effPriority = getEffectivePriority(enq);
                const priorityMeta = ENQUIRY_PRIORITY_META[effPriority];
                const statusMeta = ENQUIRY_STATUS_META[enq.status] || ENQUIRY_STATUS_META.new;
                const whatsappUrl = buildWhatsAppHref(
                  enq.phoneNumber,
                  `Namaste ${enq.customerName}, regarding your ${enq.serviceName} enquiry (${enq.id}) at Aman Computer:`
                );
                const callUrl = formatTelHref(enq.phoneNumber);

                return (
                  <div
                    key={enq.id}
                    onClick={() => setSelectedEnquiry(enq)}
                    className="p-4 rounded-2xl studio-glass-card space-y-3 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-semibold text-[#8c5d23] dark:text-[#C9A96E]">
                            {enq.id}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${priorityMeta.badgeClass}`}>
                            {priorityMeta.label}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-[var(--st-tx)] mt-1">
                          {enq.customerName}
                        </h4>
                        <div className="text-[11px] font-mono text-[var(--st-mut)]">
                          {enq.phoneNumber}
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusMeta.badgeClass}`}>
                        {statusMeta.shortLabel}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-[var(--st-tx)]">{enq.serviceName}</div>

                    {enq.customerMessage && (
                      <p className="text-xs text-[var(--st-mut)] line-clamp-2">
                        “{enq.customerMessage}”
                      </p>
                    )}

                    <div
                      className="pt-2 border-t border-[var(--st-line)] flex items-center justify-between gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        aria-label={`Mobile status for ${enq.id}`}
                        value={enq.status}
                        onChange={(e) =>
                          updateEnquiryStatus(enq.id, e.target.value as EnquiryStatus)
                        }
                        className={`text-[10px] font-mono font-semibold px-2 py-1 rounded-lg border outline-none ${statusMeta.badgeClass}`}
                      >
                        {ALL_ENQUIRY_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {ENQUIRY_STATUS_META[st].shortLabel.toUpperCase()}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => recordEnquiryContactAction(enq.id, 'whatsapp')}
                          className="p-2 rounded-lg bg-emerald-600 text-white"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={callUrl}
                          onClick={() => recordEnquiryContactAction(enq.id, 'call')}
                          className="p-2 rounded-lg bg-[#C9A96E] text-[#1c1208]"
                          title="Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={(e) => handleCopyText(enq.phoneNumber, 'Mobile Number', e)}
                          className="p-2 rounded-lg border border-[var(--st-line)] text-[var(--st-mut)]"
                          title="Copy Mobile"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Bar */}
          <div className="rounded-2xl studio-glass-soft px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--st-mut)]">
            <span>
              Showing {paginatedEnquiries.length} of {filteredEnquiries.length} matching enquiries
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-[var(--st-line)] disabled:opacity-40 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors font-medium cursor-pointer"
              >
                Previous
              </button>
              <span className="font-mono text-xs px-2 text-[var(--st-tx)] tabular-nums">
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-lg border border-[var(--st-line)] disabled:opacity-40 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors font-medium cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 2: Analytics & Trends */}
      {subView === 'analytics' && (
        <EnquiryAnalyticsPanel
          onOpenFollowUps={() => setSubView('followups')}
          onFilterByStatus={handleJumpToStatus}
        />
      )}

      {/* Sub-View 3: Follow-up Workspace */}
      {subView === 'followups' && <EnquiryFollowUpsPanel />}

      {/* Sub-View 4: Verified Customer History */}
      {subView === 'customers' && <EnquiryCustomerHistoryPanel />}

      {/* Walk-In / Counter Enquiry Modal */}
      <CmsModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Log Counter / Phone Enquiry"
        subtitle="Record an incoming walk-in, phone, or WhatsApp enquiry into the pipeline"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreateWalkInEnquiry} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
              Customer Name *
            </label>
            <input
              required
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="e.g. Rohan Kumar Patel"
              className="w-full px-3 py-2.5 rounded-xl studio-glass-input outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
                Mobile Number *
              </label>
              <input
                required
                type="text"
                value={draftPhone}
                onChange={(e) => setDraftPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2.5 rounded-xl studio-glass-input font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
                Priority Level
              </label>
              <select
                value={draftPriority}
                onChange={(e) => setDraftPriority(e.target.value as EnquiryPriority)}
                className="w-full px-3 py-2.5 rounded-xl studio-glass-input outline-none"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
              Requested Service
            </label>
            <select
              value={draftServiceId}
              onChange={(e) => setDraftServiceId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl studio-glass-input outline-none"
            >
              {services.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
                Preferred Contact
              </label>
              <select
                value={draftContactMethod}
                onChange={(e) =>
                  setDraftContactMethod(e.target.value as 'whatsapp' | 'phone' | 'either')
                }
                className="w-full px-3 py-2.5 rounded-xl studio-glass-input outline-none"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone Call</option>
                <option value="either">Either</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
                Enquiry Source
              </label>
              <select
                value={draftSource}
                onChange={(e) =>
                  setDraftSource(e.target.value as 'walk-in' | 'phone' | 'whatsapp')
                }
                className="w-full px-3 py-2.5 rounded-xl studio-glass-input outline-none"
              >
                <option value="walk-in">Walk-in Counter</option>
                <option value="phone">Incoming Call</option>
                <option value="whatsapp">WhatsApp Message</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
              Requirement / Note
            </label>
            <textarea
              rows={2}
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              placeholder="Briefly describe what documents or digital service the customer asked about..."
              className="w-full px-3 py-2.5 rounded-xl studio-glass-input outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--st-line)]">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[var(--st-line)] text-[var(--st-mut)] hover:text-[var(--st-tx)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#1c1208] font-semibold cursor-pointer"
            >
              Save Enquiry
            </button>
          </div>
        </form>
      </CmsModal>

      <EnquiryDetailDrawer />
    </div>
  );
};
