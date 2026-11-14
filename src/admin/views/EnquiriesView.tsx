import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { EnquiryStatus } from '../types';
import {
  Search,
  Filter,
  Download,
  Phone,
  MessageSquare,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';

export const EnquiriesView: React.FC = () => {
  const {
    enquiries,
    updateEnquiryStatus,
    setSelectedEnquiry,
    exportEnquiriesCSV,
    deleteEnquiry,
  } = useAdmin();

  const [activeStatusTab, setActiveStatusTab] = useState<'all' | EnquiryStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filtered list
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      // Status filter
      if (activeStatusTab !== 'all' && e.status !== activeStatusTab) {
        return false;
      }
      // Service filter
      if (selectedServiceFilter !== 'all' && e.serviceId !== selectedServiceFilter) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = e.customerName.toLowerCase().includes(q);
        const matchesPhone = e.phoneNumber.includes(q);
        const matchesService = e.serviceName.toLowerCase().includes(q);
        const matchesId = e.id.toLowerCase().includes(q);
        const matchesMsg = e.customerMessage.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesService && !matchesId && !matchesMsg) {
          return false;
        }
      }
      return true;
    });
  }, [enquiries, activeStatusTab, selectedServiceFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage) || 1;
  const paginatedEnquiries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEnquiries.slice(start, start + itemsPerPage);
  }, [filteredEnquiries, currentPage]);

  const uniqueServices = useMemo(() => {
    const map = new Map<string, string>();
    enquiries.forEach((e) => map.set(e.serviceId, e.serviceName));
    return Array.from(map.entries());
  }, [enquiries]);

  const tabCounts = {
    all: enquiries.length,
    new: enquiries.filter((e) => e.status === 'new').length,
    pending: enquiries.filter((e) => e.status === 'pending').length,
    'in-progress': enquiries.filter((e) => e.status === 'in-progress').length,
    completed: enquiries.filter((e) => e.status === 'completed').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0]">
            Customer Enquiry Management
          </h1>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8]">
            Process walk-ins, WhatsApp queries & exam form applications with live status tracking
          </p>
        </div>

        <button
          onClick={exportEnquiriesCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1818] hover:bg-[#302A2A] dark:bg-[#E8E4E0] dark:hover:bg-white text-[#E8E4E0] dark:text-[#1A1818] font-semibold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export All Enquiries (CSV)</span>
        </button>
      </div>

      {/* Status Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.06)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] overflow-x-auto scrollbar-none">
        {(
          [
            { id: 'all', label: 'All Enquiries' },
            { id: 'new', label: 'New / Unread' },
            { id: 'pending', label: 'Pending Docs' },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ] as const
        ).map((tab) => {
          const isActive = activeStatusTab === tab.id;
          const count = tabCounts[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveStatusTab(tab.id);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] shadow-xs'
                  : 'text-[#6B5C5C] dark:text-[#B5A8A8] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black font-bold'
                    : 'bg-[rgba(196,176,176,0.2)] text-[#6B5C5C] dark:text-[#B5A8A8]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)]">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-[#857878] dark:text-[#B5A8A8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone number, enquiry ID, or message keywords..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-transparent border-none text-xs text-[#1A1818] dark:text-[#E8E4E0] placeholder-[#857878] dark:placeholder-[#B5A8A8] outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-[#857878] dark:text-[#B5A8A8]" />
          <select
            value={selectedServiceFilter}
            onChange={(e) => {
              setSelectedServiceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-semibold py-1.5 px-3 rounded-xl bg-white/70 dark:bg-black/20 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
          >
            <option value="all">Filter by Service: All Services</option>
            {uniqueServices.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Enquiries Table */}
      <div className="rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] backdrop-blur-md shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)] text-[10px] font-mono uppercase tracking-wider text-[#857878] dark:text-[#B5A8A8]">
                <th className="py-3 px-4">ID & Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Requested Service</th>
                <th className="py-3 px-4">Message / Query</th>
                <th className="py-3 px-4">Status & Urgency</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(196,176,176,0.15)] dark:divide-[rgba(196,176,176,0.08)]">
              {paginatedEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#857878] dark:text-[#B5A8A8]">
                    No enquiries match your current filters.
                  </td>
                </tr>
              ) : (
                paginatedEnquiries.map((enq) => {
                  const cleanPhone = enq.phoneNumber.replace(/[^0-9]/g, '');
                  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Namaste ${enq.customerName}, regarding your ${enq.serviceName} at Aman Computer:`
                  )}`;

                  return (
                    <tr
                      key={enq.id}
                      className="hover:bg-[rgba(196,176,176,0.1)] dark:hover:bg-[rgba(196,176,176,0.05)] transition-colors cursor-pointer"
                      onClick={() => setSelectedEnquiry(enq)}
                    >
                      {/* ID & Date */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-[#1A1818] dark:text-[#E8E4E0]">{enq.id}</div>
                        <div className="text-[10px] text-[#857878] dark:text-[#B5A8A8]">{enq.createdAt}</div>
                      </td>

                      {/* Customer Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1A1818] dark:text-[#E8E4E0]">{enq.customerName}</div>
                        <div className="text-[11px] font-mono text-[#857878] dark:text-[#B5A8A8]">{enq.phoneNumber}</div>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#1A1818] dark:text-[#E8E4E0] max-w-[200px] truncate">
                          {enq.serviceName}
                        </div>
                        {enq.estimatedCost && (
                          <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                            {enq.estimatedCost}
                          </div>
                        )}
                      </td>

                      {/* Message Preview */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <p className="line-clamp-2 text-[#857878] dark:text-[#B5A8A8]">
                          "{enq.customerMessage}"
                        </p>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1 items-start">
                          <select
                            value={enq.status}
                            onChange={(e) => updateEnquiryStatus(enq.id, e.target.value as EnquiryStatus)}
                            className={`text-[10px] font-mono font-semibold px-2 py-1 rounded-full border outline-hidden ${
                              enq.status === 'new'
                                ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                : enq.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : enq.status === 'in-progress'
                                ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
                                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            <option value="new">NEW / UNREAD</option>
                            <option value="pending">PENDING DOCS</option>
                            <option value="in-progress">IN PROGRESS</option>
                            <option value="completed">COMPLETED</option>
                          </select>
                          {enq.urgency === 'urgent' && (
                            <span className="text-[9px] font-mono font-bold text-rose-600 dark:text-rose-400">
                              ● URGENT
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                            title="WhatsApp Customer"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                          <a
                            href={`tel:${enq.phoneNumber}`}
                            className="p-1.5 rounded-lg text-[#6B5C5C] dark:text-[#C4B0B0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            title="Call Customer"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => setSelectedEnquiry(enq)}
                            className="p-1.5 rounded-lg text-[#857878] hover:text-[#1A1818] dark:hover:text-[#E8E4E0] transition-colors"
                            title="View Full Details Drawer"
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

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)] flex items-center justify-between text-xs text-[#857878] dark:text-[#B5A8A8]">
          <span>
            Showing {paginatedEnquiries.length} of {filteredEnquiries.length} enquiries
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg border border-[rgba(196,176,176,0.3)] disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-semibold"
            >
              Previous
            </button>
            <span className="font-mono text-xs font-semibold px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg border border-[rgba(196,176,176,0.3)] disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
