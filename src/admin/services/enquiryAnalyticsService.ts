import {
  Customer,
  Enquiry,
  EnquiryFollowUp,
  EnquiryPriority,
  EnquiryStatus,
  Receipt,
} from '../types';

export type AnalyticsDatePreset =
  | 'today'
  | '7d'
  | '30d'
  | 'this-month'
  | 'custom'
  | 'all';

export interface CustomDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export const ENQUIRY_STATUS_META: Record<
  EnquiryStatus,
  {
    label: string;
    shortLabel: string;
    isTerminal: boolean;
    isClosedLost: boolean;
    dotClass: string;
    badgeClass: string;
    chartColor: string;
  }
> = {
  new: {
    label: 'New / Unread',
    shortLabel: 'New',
    isTerminal: false,
    isClosedLost: false,
    dotClass: 'bg-sky-500 dark:bg-sky-400',
    badgeClass:
      'bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-500/30',
    chartColor: '#38bdf8',
  },
  contacted: {
    label: 'Contacted',
    shortLabel: 'Contacted',
    isTerminal: false,
    isClosedLost: false,
    dotClass: 'bg-indigo-500 dark:bg-indigo-400',
    badgeClass:
      'bg-indigo-500/12 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    chartColor: '#818cf8',
  },
  pending: {
    label: 'Pending Docs',
    shortLabel: 'Pending',
    isTerminal: false,
    isClosedLost: false,
    dotClass: 'bg-amber-500 dark:bg-amber-400',
    badgeClass:
      'bg-[#C9A96E]/15 text-[#7a501c] dark:text-[#DFC492] border-[#C9A96E]/40',
    chartColor: '#C9A96E',
  },
  'in-progress': {
    label: 'In Progress',
    shortLabel: 'In Progress',
    isTerminal: false,
    isClosedLost: false,
    dotClass: 'bg-violet-500 dark:bg-violet-400',
    badgeClass:
      'bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-500/30',
    chartColor: '#a78bfa',
  },
  completed: {
    label: 'Completed',
    shortLabel: 'Completed',
    isTerminal: true,
    isClosedLost: false,
    dotClass: 'bg-emerald-600 dark:bg-emerald-400',
    badgeClass:
      'bg-emerald-500/14 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    chartColor: '#34d399',
  },
  cancelled: {
    label: 'Cancelled',
    shortLabel: 'Cancelled',
    isTerminal: true,
    isClosedLost: true,
    dotClass: 'bg-stone-500 dark:bg-stone-400',
    badgeClass:
      'bg-stone-500/14 text-stone-700 dark:text-stone-300 border-stone-500/30',
    chartColor: '#78716c',
  },
  'not-interested': {
    label: 'Not Interested',
    shortLabel: 'Not Interested',
    isTerminal: true,
    isClosedLost: true,
    dotClass: 'bg-rose-500 dark:bg-rose-400',
    badgeClass:
      'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/30',
    chartColor: '#fb7185',
  },
};

export const ALL_ENQUIRY_STATUSES: EnquiryStatus[] = [
  'new',
  'contacted',
  'pending',
  'in-progress',
  'completed',
  'cancelled',
  'not-interested',
];

export const ENQUIRY_PRIORITY_META: Record<
  EnquiryPriority,
  {
    label: string;
    rank: number;
    badgeClass: string;
    dotClass: string;
  }
> = {
  high: {
    label: 'High',
    rank: 3,
    badgeClass:
      'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/30',
    dotClass: 'bg-rose-500 dark:bg-rose-400',
  },
  medium: {
    label: 'Medium',
    rank: 2,
    badgeClass:
      'bg-[#C9A96E]/15 text-[#7a501c] dark:text-[#DFC492] border-[#C9A96E]/40',
    dotClass: 'bg-[#C9A96E]',
  },
  low: {
    label: 'Low',
    rank: 1,
    badgeClass:
      'bg-stone-500/12 text-stone-700 dark:text-stone-300 border-stone-500/25',
    dotClass: 'bg-stone-400',
  },
};

/**
 * Canonicalizes Indian & international phone numbers strictly on digits so
 * `+91 98765 43210`, `09876543210`, and `9876543210` match the same verified number.
 * Never matches on customer name alone.
 */
export const normalizeIndianPhoneKey = (rawPhone?: string | null): string => {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length < 7) return '';
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  if (digits.length > 10 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(-10))) {
    return digits.slice(-10);
  }
  return digits;
};

export const formatTelHref = (rawPhone: string): string => {
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '#';
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `tel:+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `tel:+${digits}`;
  }
  return `tel:${rawPhone.replace(/[^0-9+]/g, '')}`;
};

export const buildWhatsAppHref = (rawPhone: string, message: string): string => {
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '#';
  const waDigits =
    digits.length === 10 && /^[6-9]/.test(digits) ? `91${digits}` : digits;
  return `https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`;
};

export const getEffectivePriority = (enquiry: Pick<Enquiry, 'priority' | 'urgency'>): EnquiryPriority => {
  if (enquiry.priority === 'high' || enquiry.priority === 'medium' || enquiry.priority === 'low') {
    return enquiry.priority;
  }
  return enquiry.urgency === 'urgent' ? 'high' : 'medium';
};

export const isEnquiryActive = (status: EnquiryStatus): boolean =>
  !ENQUIRY_STATUS_META[status]?.isTerminal;

export const isEnquiryUrgent = (enquiry: Pick<Enquiry, 'priority' | 'urgency' | 'status'>): boolean =>
  isEnquiryActive(enquiry.status) &&
  (getEffectivePriority(enquiry) === 'high' || enquiry.urgency === 'urgent');

export const parseFlexibleTimestamp = (raw?: string | null): number | null => {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Handle legacy DD/MM/YYYY [HH:MM AM/PM]
  const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(.*))?$/.exec(trimmed);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy, rest] = ddmmyyyy;
    const candidate = new Date(
      `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}${rest ? ' ' + rest : 'T00:00:00'}`
    );
    if (!Number.isNaN(candidate.getTime())) return candidate.getTime();
  }

  // Handle YYYY-MM-DD HH:MM AM/PM
  const ymd12 = /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2}\s*(?:AM|PM))$/i.exec(trimmed);
  if (ymd12) {
    const candidate = new Date(`${ymd12[1]} ${ymd12[2]}`);
    if (!Number.isNaN(candidate.getTime())) return candidate.getTime();
  }

  // Handle bare YYYY-MM-DD in local timezone cleanly
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const candidate = new Date(`${trimmed}T00:00:00`);
    if (!Number.isNaN(candidate.getTime())) return candidate.getTime();
  }

  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
};

export const toLocalDateKey = (dateOrMs: Date | number): string => {
  const d = typeof dateOrMs === 'number' ? new Date(dateOrMs) : dateOrMs;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDurationHuman = (minutes: number | null): string => {
  if (minutes === null || !Number.isFinite(minutes) || minutes < 0) return '—';
  const rounded = Math.round(minutes);
  if (rounded < 1) return '< 1m';
  if (rounded < 60) return `${rounded}m`;
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
};

export const formatDisplayTimestamp = (raw?: string | null): string => {
  const ms = parseFlexibleTimestamp(raw);
  if (ms === null) return raw || '—';
  return new Date(ms).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export interface FollowUpItemWithEnquiry {
  followUp: EnquiryFollowUp;
  enquiry: Enquiry | undefined;
  bucket: 'overdue' | 'today' | 'upcoming' | 'completed' | 'cancelled';
}

export const classifyFollowUpDateBucket = (
  scheduledDate: string,
  status: EnquiryFollowUp['status'],
  nowDate: Date = new Date()
): FollowUpItemWithEnquiry['bucket'] => {
  if (status === 'completed') return 'completed';
  if (status === 'cancelled') return 'cancelled';
  const todayKey = toLocalDateKey(nowDate);
  const cleanDate = scheduledDate.slice(0, 10);
  if (cleanDate < todayKey) return 'overdue';
  if (cleanDate === todayKey) return 'today';
  return 'upcoming';
};

export interface ResponseTimeMetrics {
  averageFirstResponseMinutes: number | null;
  firstResponseSampleCount: number;
  averageResolutionMinutes: number | null;
  resolutionSampleCount: number;
  unansweredCount: number;
  overdueFollowUpsCount: number;
  dueTodayFollowUpsCount: number;
}

/**
 * Computes real SLA timing metrics strictly from non-null recorded timestamps.
 * Never fabricates response durations or invents synthetic timestamps.
 */
export const computeResponseMetrics = (
  enquiries: Enquiry[],
  followUps: EnquiryFollowUp[],
  nowDate: Date = new Date()
): ResponseTimeMetrics => {
  let firstRespSumMin = 0;
  let firstRespCount = 0;
  let resSumMin = 0;
  let resCount = 0;
  let unansweredCount = 0;

  for (const enq of enquiries) {
    const createdMs = parseFlexibleTimestamp(enq.createdAt);
    const firstRespMs = parseFlexibleTimestamp(enq.firstResponseAt);
    const completedMs = parseFlexibleTimestamp(enq.completedAt);

    if (createdMs !== null && firstRespMs !== null && firstRespMs >= createdMs) {
      firstRespSumMin += (firstRespMs - createdMs) / 60000;
      firstRespCount += 1;
    }

    if (
      enq.status === 'completed' &&
      createdMs !== null &&
      completedMs !== null &&
      completedMs >= createdMs
    ) {
      resSumMin += (completedMs - createdMs) / 60000;
      resCount += 1;
    }

    if (isEnquiryActive(enq.status) && (!enq.firstResponseAt || enq.status === 'new')) {
      unansweredCount += 1;
    }
  }

  const todayKey = toLocalDateKey(nowDate);
  const trackedByFollowUpId = new Set<string>();
  let overdueFollowUpsCount = 0;
  let dueTodayFollowUpsCount = 0;

  for (const fu of followUps) {
    if (fu.status !== 'scheduled') continue;
    trackedByFollowUpId.add(fu.enquiryId);
    const dateKey = fu.scheduledDate.slice(0, 10);
    if (dateKey < todayKey) {
      overdueFollowUpsCount += 1;
    } else if (dateKey === todayKey) {
      dueTodayFollowUpsCount += 1;
    }
  }

  // Fallback for enquiries carrying inline nextFollowUpDate without a child followUp row yet
  for (const enq of enquiries) {
    if (!isEnquiryActive(enq.status)) continue;
    if (!enq.nextFollowUpDate || trackedByFollowUpId.has(enq.id)) continue;
    const dateKey = enq.nextFollowUpDate.slice(0, 10);
    if (dateKey < todayKey) {
      overdueFollowUpsCount += 1;
    } else if (dateKey === todayKey) {
      dueTodayFollowUpsCount += 1;
    }
  }

  return {
    averageFirstResponseMinutes:
      firstRespCount > 0 ? firstRespSumMin / firstRespCount : null,
    firstResponseSampleCount: firstRespCount,
    averageResolutionMinutes: resCount > 0 ? resSumMin / resCount : null,
    resolutionSampleCount: resCount,
    unansweredCount,
    overdueFollowUpsCount,
    dueTodayFollowUpsCount,
  };
};

export const getDateRangeBounds = (
  preset: AnalyticsDatePreset,
  custom?: CustomDateRange,
  nowDate: Date = new Date()
): { startMs: number | null; endMs: number | null; label: string } => {
  if (preset === 'all') {
    return { startMs: null, endMs: null, label: 'All Recorded Dates' };
  }

  const startOfToday = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfToday = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate(),
    23,
    59,
    59,
    999
  );

  if (preset === 'today') {
    return {
      startMs: startOfToday.getTime(),
      endMs: endOfToday.getTime(),
      label: 'Today',
    };
  }

  if (preset === '7d') {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - 6);
    return {
      startMs: start.getTime(),
      endMs: endOfToday.getTime(),
      label: 'Last 7 Days',
    };
  }

  if (preset === '30d') {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - 29);
    return {
      startMs: start.getTime(),
      endMs: endOfToday.getTime(),
      label: 'Last 30 Days',
    };
  }

  if (preset === 'this-month') {
    const start = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1, 0, 0, 0, 0);
    return {
      startMs: start.getTime(),
      endMs: endOfToday.getTime(),
      label: 'This Month',
    };
  }

  // Custom range
  const startRaw = custom?.startDate?.trim();
  const endRaw = custom?.endDate?.trim();
  const startMs = startRaw ? new Date(`${startRaw}T00:00:00`).getTime() : null;
  const endMs = endRaw ? new Date(`${endRaw}T23:59:59.999`).getTime() : null;
  return {
    startMs: startMs !== null && !Number.isNaN(startMs) ? startMs : null,
    endMs: endMs !== null && !Number.isNaN(endMs) ? endMs : null,
    label:
      startRaw && endRaw
        ? `${startRaw} to ${endRaw}`
        : startRaw
        ? `From ${startRaw}`
        : endRaw
        ? `Until ${endRaw}`
        : 'Custom Range',
  };
};

export const filterEnquiriesByDateRange = (
  enquiries: Enquiry[],
  preset: AnalyticsDatePreset,
  custom?: CustomDateRange,
  nowDate: Date = new Date()
): Enquiry[] => {
  if (preset === 'all') return enquiries;
  const { startMs, endMs } = getDateRangeBounds(preset, custom, nowDate);
  if (startMs === null && endMs === null) return enquiries;

  return enquiries.filter((enq) => {
    const ms = parseFlexibleTimestamp(enq.createdAt);
    if (ms === null) return false;
    if (startMs !== null && ms < startMs) return false;
    if (endMs !== null && ms > endMs) return false;
    return true;
  });
};

export interface TrendBucketPoint {
  key: string;
  label: string;
  total: number;
  completed: number;
  active: number;
}

export const buildEnquiryTrendSeries = (
  enquiries: Enquiry[],
  granularity: 'daily' | 'weekly' | 'monthly',
  nowDate: Date = new Date()
): TrendBucketPoint[] => {
  if (granularity === 'daily') {
    const points: TrendBucketPoint[] = [];
    const anchor = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
    for (let i = 13; i >= 0; i--) {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() - i);
      const key = toLocalDateKey(d);
      points.push({
        key,
        label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        total: 0,
        completed: 0,
        active: 0,
      });
    }
    const indexMap = new Map(points.map((p, idx) => [p.key, idx]));
    for (const enq of enquiries) {
      const ms = parseFlexibleTimestamp(enq.createdAt);
      if (ms === null) continue;
      const key = toLocalDateKey(ms);
      const idx = indexMap.get(key);
      if (idx !== undefined) {
        points[idx].total += 1;
        if (enq.status === 'completed') points[idx].completed += 1;
        else if (isEnquiryActive(enq.status)) points[idx].active += 1;
      }
    }
    return points;
  }

  if (granularity === 'weekly') {
    // Last 8 weeks grouped Sunday-Saturday or rolling 7-day windows anchored today
    const points: Array<TrendBucketPoint & { startMs: number; endMs: number }> = [];
    const endAnchor = new Date(
      nowDate.getFullYear(),
      nowDate.getMonth(),
      nowDate.getDate(),
      23,
      59,
      59,
      999
    );
    for (let w = 7; w >= 0; w--) {
      const end = new Date(endAnchor);
      end.setDate(endAnchor.getDate() - w * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      points.push({
        key: `${toLocalDateKey(start)}_${toLocalDateKey(end)}`,
        label: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        startMs: start.getTime(),
        endMs: end.getTime(),
        total: 0,
        completed: 0,
        active: 0,
      });
    }
    for (const enq of enquiries) {
      const ms = parseFlexibleTimestamp(enq.createdAt);
      if (ms === null) continue;
      const bucket = points.find((p) => ms >= p.startMs && ms <= p.endMs);
      if (bucket) {
        bucket.total += 1;
        if (enq.status === 'completed') bucket.completed += 1;
        else if (isEnquiryActive(enq.status)) bucket.active += 1;
      }
    }
    return points.map(({ key, label, total, completed, active }) => ({
      key,
      label,
      total,
      completed,
      active,
    }));
  }

  // Monthly (last 6 months)
  const points: TrendBucketPoint[] = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date(nowDate.getFullYear(), nowDate.getMonth() - m, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    points.push({
      key,
      label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      total: 0,
      completed: 0,
      active: 0,
    });
  }
  const monthMap = new Map(points.map((p, idx) => [p.key, idx]));
  for (const enq of enquiries) {
    const ms = parseFlexibleTimestamp(enq.createdAt);
    if (ms === null) continue;
    const d = new Date(ms);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const idx = monthMap.get(key);
    if (idx !== undefined) {
      points[idx].total += 1;
      if (enq.status === 'completed') points[idx].completed += 1;
      else if (isEnquiryActive(enq.status)) points[idx].active += 1;
    }
  }
  return points;
};

export interface DistributionSlice {
  key: string;
  label: string;
  count: number;
  completedCount: number;
  percentage: number;
  color: string;
}

export interface EnquiryAnalyticsSummary {
  total: number;
  newCount: number;
  contactedCount: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
  notInterestedCount: number;
  activeCount: number;
  validForConversionCount: number;
  conversionRate: number; // completed / (total - cancelled - notInterested) * 100
  conversionFormulaLabel: string;
  priorityCounts: Record<EnquiryPriority, number>;
  urgentCount: number;
  serviceDistribution: DistributionSlice[];
  contactMethodDistribution: DistributionSlice[];
  statusDistribution: DistributionSlice[];
  responseMetrics: ResponseTimeMetrics;
}

/**
 * Aggregates real enquiry analytics strictly from actual records.
 * Conversion formula: Completed / (Total - Cancelled - Not Interested) * 100
 * so cancelled and not-interested leads do not distort live funnel completion.
 */
export const buildEnquiryAnalytics = (
  filteredEnquiries: Enquiry[],
  followUps: EnquiryFollowUp[],
  nowDate: Date = new Date()
): EnquiryAnalyticsSummary => {
  const total = filteredEnquiries.length;
  let newCount = 0;
  let contactedCount = 0;
  let pendingCount = 0;
  let inProgressCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;
  let notInterestedCount = 0;
  let urgentCount = 0;
  const priorityCounts: Record<EnquiryPriority, number> = {
    high: 0,
    medium: 0,
    low: 0,
  };

  const serviceMap = new Map<string, { label: string; count: number; completed: number }>();
  const contactMap = new Map<string, { label: string; count: number; completed: number }>([
    ['whatsapp', { label: 'WhatsApp', count: 0, completed: 0 }],
    ['phone', { label: 'Phone Call', count: 0, completed: 0 }],
    ['either', { label: 'Either / Walk-in', count: 0, completed: 0 }],
  ]);

  for (const enq of filteredEnquiries) {
    switch (enq.status) {
      case 'new':
        newCount += 1;
        break;
      case 'contacted':
        contactedCount += 1;
        break;
      case 'pending':
        pendingCount += 1;
        break;
      case 'in-progress':
        inProgressCount += 1;
        break;
      case 'completed':
        completedCount += 1;
        break;
      case 'cancelled':
        cancelledCount += 1;
        break;
      case 'not-interested':
        notInterestedCount += 1;
        break;
    }

    const pri = getEffectivePriority(enq);
    priorityCounts[pri] += 1;
    if (isEnquiryUrgent(enq)) urgentCount += 1;

    const srvKey = enq.serviceName || enq.serviceId || 'General Service';
    const existingSrv = serviceMap.get(srvKey) || { label: srvKey, count: 0, completed: 0 };
    existingSrv.count += 1;
    if (enq.status === 'completed') existingSrv.completed += 1;
    serviceMap.set(srvKey, existingSrv);

    const prefKey =
      enq.preferredContactMethod === 'whatsapp' || enq.preferredContactMethod === 'phone'
        ? enq.preferredContactMethod
        : 'either';
    const existingContact = contactMap.get(prefKey)!;
    existingContact.count += 1;
    if (enq.status === 'completed') existingContact.completed += 1;
  }

  const activeCount = newCount + contactedCount + pendingCount + inProgressCount;
  const validForConversionCount = Math.max(0, total - cancelledCount - notInterestedCount);
  const conversionRate =
    validForConversionCount > 0
      ? Math.round((completedCount / validForConversionCount) * 1000) / 10
      : 0;

  const servicePalette = ['#C9A96E', '#34d399', '#38bdf8', '#a78bfa', '#fb923c', '#94a3b8'];
  const serviceDistribution: DistributionSlice[] = Array.from(serviceMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([key, item], index) => ({
      key,
      label: item.label,
      count: item.count,
      completedCount: item.completed,
      percentage: total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0,
      color: servicePalette[index % servicePalette.length],
    }));

  const contactColors: Record<string, string> = {
    whatsapp: '#34d399',
    phone: '#C9A96E',
    either: '#38bdf8',
  };
  const contactMethodDistribution: DistributionSlice[] = Array.from(contactMap.entries()).map(
    ([key, item]) => ({
      key,
      label: item.label,
      count: item.count,
      completedCount: item.completed,
      percentage: total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0,
      color: contactColors[key] || '#C9A96E',
    })
  );

  const statusCountsMap: Record<EnquiryStatus, number> = {
    new: newCount,
    contacted: contactedCount,
    pending: pendingCount,
    'in-progress': inProgressCount,
    completed: completedCount,
    cancelled: cancelledCount,
    'not-interested': notInterestedCount,
  };

  const statusDistribution: DistributionSlice[] = ALL_ENQUIRY_STATUSES.map((status) => {
    const count = statusCountsMap[status];
    return {
      key: status,
      label: ENQUIRY_STATUS_META[status].label,
      count,
      completedCount: status === 'completed' ? count : 0,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
      color: ENQUIRY_STATUS_META[status].chartColor,
    };
  });

  const relevantIds = new Set(filteredEnquiries.map((e) => e.id));
  const scopedFollowUps = followUps.filter((f) => relevantIds.has(f.enquiryId));
  const responseMetrics = computeResponseMetrics(filteredEnquiries, scopedFollowUps, nowDate);

  return {
    total,
    newCount,
    contactedCount,
    pendingCount,
    inProgressCount,
    completedCount,
    cancelledCount,
    notInterestedCount,
    activeCount,
    validForConversionCount,
    conversionRate,
    conversionFormulaLabel: 'Completed ÷ (Total − Cancelled − Not Interested)',
    priorityCounts,
    urgentCount,
    serviceDistribution,
    contactMethodDistribution,
    statusDistribution,
    responseMetrics,
  };
};

export interface VerifiedCustomerHistory {
  customerKey: string;
  normalizedPhone: string;
  displayPhone: string;
  primaryName: string;
  nameAliases: string[];
  linkedCustomer?: Customer;
  totalEnquiries: number;
  activeEnquiries: number;
  completedEnquiries: number;
  requestedServices: Array<{ serviceName: string; count: number }>;
  enquiryDates: string[];
  latestEnquiryDate: string;
  latestStatus: EnquiryStatus;
  enquiries: Enquiry[];
  followUps: EnquiryFollowUp[];
  receipts: Receipt[];
}

/**
 * Aggregates customer history strictly by verified normalized phone identifier.
 * Customers sharing the same name with different phone numbers are NEVER merged.
 */
export const buildVerifiedCustomerHistories = (
  enquiries: Enquiry[],
  followUps: EnquiryFollowUp[],
  customers: Customer[] = [],
  receipts: Receipt[] = []
): VerifiedCustomerHistory[] => {
  const customerByPhone = new Map<string, Customer>();
  for (const cust of customers) {
    const phoneKey = normalizeIndianPhoneKey(cust.phone);
    if (phoneKey && !customerByPhone.has(phoneKey)) {
      customerByPhone.set(phoneKey, cust);
    }
  }

  const followUpsByEnquiry = new Map<string, EnquiryFollowUp[]>();
  for (const fu of followUps) {
    const list = followUpsByEnquiry.get(fu.enquiryId) || [];
    list.push(fu);
    followUpsByEnquiry.set(fu.enquiryId, list);
  }

  const receiptsByPhone = new Map<string, Receipt[]>();
  for (const r of receipts) {
    const key = normalizeIndianPhoneKey(r.customerPhone);
    if (!key) continue;
    const list = receiptsByPhone.get(key) || [];
    list.push(r);
    receiptsByPhone.set(key, list);
  }

  const groups = new Map<
    string,
    {
      normalizedPhone: string;
      displayPhone: string;
      names: Set<string>;
      primaryName: string;
      enquiries: Enquiry[];
      latestMs: number;
      latestDate: string;
      latestStatus: EnquiryStatus;
    }
  >();

  for (const enq of enquiries) {
    const phoneKey = normalizeIndianPhoneKey(enq.phoneNumber);
    const groupKey = phoneKey ? `phone:${phoneKey}` : `unverified:${enq.id}`;
    const enqMs = parseFlexibleTimestamp(enq.createdAt) ?? 0;
    const existing = groups.get(groupKey);

    if (!existing) {
      const names = new Set<string>();
      if (enq.customerName.trim()) names.add(enq.customerName.trim());
      groups.set(groupKey, {
        normalizedPhone: phoneKey,
        displayPhone: enq.phoneNumber,
        names,
        primaryName: enq.customerName.trim() || 'Unknown Applicant',
        enquiries: [enq],
        latestMs: enqMs,
        latestDate: enq.createdAt,
        latestStatus: enq.status,
      });
    } else {
      existing.enquiries.push(enq);
      if (enq.customerName.trim()) existing.names.add(enq.customerName.trim());
      if (enqMs >= existing.latestMs) {
        existing.latestMs = enqMs;
        existing.latestDate = enq.createdAt;
        existing.latestStatus = enq.status;
        if (enq.customerName.trim()) existing.primaryName = enq.customerName.trim();
        if (enq.phoneNumber.trim()) existing.displayPhone = enq.phoneNumber.trim();
      }
    }
  }

  const results: VerifiedCustomerHistory[] = [];
  for (const [customerKey, grp] of groups.entries()) {
    const sortedEnquiries = [...grp.enquiries].sort((a, b) => {
      const ma = parseFlexibleTimestamp(a.createdAt) ?? 0;
      const mb = parseFlexibleTimestamp(b.createdAt) ?? 0;
      return mb - ma;
    });

    const serviceCounts = new Map<string, number>();
    let activeEnquiries = 0;
    let completedEnquiries = 0;
    const enquiryFollowUps: EnquiryFollowUp[] = [];

    for (const e of sortedEnquiries) {
      serviceCounts.set(e.serviceName, (serviceCounts.get(e.serviceName) || 0) + 1);
      if (isEnquiryActive(e.status)) activeEnquiries += 1;
      if (e.status === 'completed') completedEnquiries += 1;
      const fus = followUpsByEnquiry.get(e.id);
      if (fus) enquiryFollowUps.push(...fus);
    }

    const linkedCustomer = grp.normalizedPhone
      ? customerByPhone.get(grp.normalizedPhone)
      : undefined;
    const linkedReceipts = grp.normalizedPhone
      ? receiptsByPhone.get(grp.normalizedPhone) || []
      : [];

    const aliases = Array.from(grp.names).filter((n) => n !== grp.primaryName);

    results.push({
      customerKey,
      normalizedPhone: grp.normalizedPhone,
      displayPhone: linkedCustomer?.phone || grp.displayPhone,
      primaryName: linkedCustomer?.name || grp.primaryName,
      nameAliases: aliases,
      linkedCustomer,
      totalEnquiries: sortedEnquiries.length,
      activeEnquiries,
      completedEnquiries,
      requestedServices: Array.from(serviceCounts.entries())
        .map(([serviceName, count]) => ({ serviceName, count }))
        .sort((a, b) => b.count - a.count),
      enquiryDates: sortedEnquiries.map((e) => e.createdAt),
      latestEnquiryDate: grp.latestDate,
      latestStatus: sortedEnquiries[0]?.status || grp.latestStatus,
      enquiries: sortedEnquiries,
      followUps: enquiryFollowUps.sort((a, b) =>
        b.scheduledDate.localeCompare(a.scheduledDate)
      ),
      receipts: linkedReceipts,
    });
  }

  return results.sort((a, b) => {
    const ma = parseFlexibleTimestamp(a.latestEnquiryDate) ?? 0;
    const mb = parseFlexibleTimestamp(b.latestEnquiryDate) ?? 0;
    return mb - ma;
  });
};
