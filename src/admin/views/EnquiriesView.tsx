import React, { useMemo, useState } from 'react';
import {
  Eye,
  FileSpreadsheet,
  Filter,
  MessageSquare,
  Phone,
  Search,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { EnquiryStatus } from '../types';
import { CmsPageHeader, CmsSurfaceCard } from '../components/CmsPrimitives';
import { EnquiryDetailDrawer } from '../components/EnquiryDetailDrawer';

export const EnquiriesView: React.FC = () => {
  const {
    enquiries,
    updateEnquiryStatus,
    setSelectedEnquiry,
    exportEnquiriesCSV,
  } = useAdmin();

  const [activeStatusTab, setActiveStatusTab] = useState<'all' | EnquiryStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      if (activeStatusTab !== 'all' && e.status !== activeStatusTab) {
        return false;
      }
      if (selectedServiceFilter !== 'all' && e.serviceId !== selectedServiceFilter) {
        return false;
      }
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
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Customer Support Desk"
        title="Customer Enquiries"
        description="Process walk-in requests, website queries, and application follow-ups with status tracking and WhatsApp handoff."
        actions={
          <button
            type="button"
            onClick={exportEnquiriesCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] font-semibold text-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Enquiries (CSV)</span>
          </button>
        }
      />

      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#141419] border border-white/[0.07] overflow-x-auto scrollbar-none">
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
              type="button"
              onClick={() => {
                setActiveStatusTab(tab.id);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#211B16] border border-[#C9A96E]/40 text-[#DFC492]'
                  : 'text-[#85838A] hover:text-[#E8E5DF]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? 'bg-[#C9A96E]/20 text-[#DFC492]'
                    : 'bg-[#0A0A0E] text-[#85838A]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <CmsSurfaceCard className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-[#85838A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, phone number, enquiry ID, or message..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-[#85838A]" />
            <select
              value={selectedServiceFilter}
              onChange={(e) => {
                setSelectedServiceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs py-2 px-3 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60 cursor-pointer"
            >
              <option value="all">All Services</option>
              {uniqueServices.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CmsSurfaceCard>

      {/* Table */}
      <div className="rounded-2xl bg-[#141419] border border-white/[0.07] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.07] bg-[#101014] text-[10px] font-mono uppercase tracking-wider text-[#85838A]">
                <th className="py-3.5 px-4">ID &amp; Date</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Requested Service</th>
                <th className="py-3.5 px-4">Query Message</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {paginatedEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#85838A]">
                    No enquiries match your current filters.
                  </td>
                </tr>
              ) : (
                paginatedEnquiries.map((enq) => {
                  const cleanPhone = enq.phoneNumber.replace(/[^0-9]/g, '');
                  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Namaste ${enq.customerName}, regarding your ${enq.serviceName} enquiry at Aman Computer:`
                  )}`;

                  return (
                    <tr
                      key={enq.id}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                      onClick={() => setSelectedEnquiry(enq)}
                    >
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-semibold text-[#C9A96E]">{enq.id}</div>
                        <div className="text-[10px] text-[#85838A]">{enq.createdAt}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#E8E5DF]">{enq.customerName}</div>
                        <div className="text-[11px] font-mono text-[#85838A]">
                          {enq.phoneNumber}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#E8E5DF] max-w-[200px] truncate">
                          {enq.serviceName}
                        </div>
                        {enq.estimatedCost && (
                          <div className="text-[10px] font-mono text-emerald-400">
                            {enq.estimatedCost}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-[240px]">
                        <p className="line-clamp-2 text-[#85838A]">&ldquo;{enq.customerMessage}&rdquo;</p>
                      </td>

                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1 items-start">
                          <select
                            value={enq.status}
                            onChange={(e) =>
                              updateEnquiryStatus(enq.id, e.target.value as EnquiryStatus)
                            }
                            className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md border outline-none cursor-pointer ${
                              enq.status === 'new'
                                ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                : enq.status === 'pending'
                                ? 'bg-[#211B16] text-[#DFC492] border-[#C9A96E]/35'
                                : enq.status === 'in-progress'
                                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            <option value="new">NEW / UNREAD</option>
                            <option value="pending">PENDING DOCS</option>
                            <option value="in-progress">IN PROGRESS</option>
                            <option value="completed">COMPLETED</option>
                          </select>
                          {enq.urgency === 'urgent' && (
                            <span className="text-[9px] font-mono font-bold text-rose-400">
                              URGENT
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="WhatsApp Customer"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                          <a
                            href={`tel:${enq.phoneNumber}`}
                            className="p-1.5 rounded-lg text-[#C9A96E] hover:bg-white/[0.05] transition-colors"
                            title="Call Customer"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setSelectedEnquiry(enq)}
                            className="p-1.5 rounded-lg text-[#85838A] hover:text-[#E8E5DF] hover:bg-white/[0.05] transition-colors cursor-pointer"
                            title="View Details"
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

        {/* Pagination */}
        <div className="p-4 border-t border-white/[0.07] flex items-center justify-between text-xs text-[#85838A]">
          <span>
            Showing {paginatedEnquiries.length} of {filteredEnquiries.length} enquiries
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg border border-white/[0.1] disabled:opacity-40 hover:bg-white/[0.05] transition-colors font-medium cursor-pointer"
            >
              Previous
            </button>
            <span className="font-mono text-xs px-2 text-[#E8E5DF]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg border border-white/[0.1] disabled:opacity-40 hover:bg-white/[0.05] transition-colors font-medium cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <EnquiryDetailDrawer />
    </div>
  );
};
