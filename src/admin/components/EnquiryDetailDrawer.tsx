import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { EnquiryStatus } from '../types';
import { X, Phone, MessageSquare, Clock, User, FileText, CheckCircle2, ShieldAlert, Trash2 } from 'lucide-react';

export const EnquiryDetailDrawer: React.FC = () => {
  const { selectedEnquiry, setSelectedEnquiry, updateEnquiryStatus, updateEnquiryNotes, deleteEnquiry } = useAdmin();
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedEnquiry) {
      setNotes(selectedEnquiry.adminNotes || '');
    }
  }, [selectedEnquiry]);

  if (!selectedEnquiry) return null;

  const cleanPhone = selectedEnquiry.phoneNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Namaste ${selectedEnquiry.customerName}, regarding your enquiry for "${selectedEnquiry.serviceName}" at Aman Computer Digital Center:`
  )}`;
  const callUrl = `tel:${selectedEnquiry.phoneNumber}`;

  const statusOptions: Array<{ value: EnquiryStatus; label: string; color: string }> = [
    { value: 'new', label: 'New / Unread', color: 'text-blue-500' },
    { value: 'pending', label: 'Pending Docs', color: 'text-amber-500' },
    { value: 'in-progress', label: 'In Progress / At Counter', color: 'text-purple-500' },
    { value: 'completed', label: 'Completed & Delivered', color: 'text-emerald-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg h-full bg-[#F0ECE9] dark:bg-[#1A1818] border-l border-[rgba(196,176,176,0.35)] dark:border-[rgba(196,176,176,0.18)] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div>
          <div className="p-5 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[rgba(107,92,92,0.15)] dark:bg-[rgba(196,176,176,0.12)] text-[#6B5C5C] dark:text-[#C4B0B0]">
                  {selectedEnquiry.id}
                </span>
                {selectedEnquiry.urgency === 'urgent' && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    URGENT
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-[#1A1818] dark:text-[#E8E4E0] mt-1 tracking-tight">
                Customer Enquiry Details
              </h2>
            </div>
            <button
              onClick={() => setSelectedEnquiry(null)}
              className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#857878] dark:text-[#B5A8A8]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Contact Action Bar */}
          <div className="p-4 bg-[rgba(196,176,176,0.12)] dark:bg-[rgba(196,176,176,0.04)] border-b border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)] grid grid-cols-2 gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
            <a
              href={callUrl}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#1A1818] hover:bg-[#302A2A] dark:bg-[#E8E4E0] dark:hover:bg-white text-[#E8E4E0] dark:text-[#1A1818] font-semibold text-xs transition-colors shadow-xs"
            >
              <Phone className="w-4 h-4" />
              <span>Call Customer</span>
            </a>
          </div>

          {/* Customer & Service Information Block */}
          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#857878] dark:text-[#B5A8A8]">
                Customer Name & Phone
              </span>
              <div className="flex items-center gap-2 text-base font-bold text-[#1A1818] dark:text-[#E8E4E0]">
                <User className="w-4 h-4 text-[#857878]" />
                {selectedEnquiry.customerName}
              </div>
              <div className="text-xs font-mono text-[#857878] dark:text-[#B5A8A8] pl-6">
                {selectedEnquiry.phoneNumber}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#857878] dark:text-[#B5A8A8]">
                Requested Service
              </span>
              <div className="p-3 rounded-xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.06)] border border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
                <div className="text-sm font-semibold text-[#1A1818] dark:text-[#E8E4E0]">
                  {selectedEnquiry.serviceName}
                </div>
                {selectedEnquiry.estimatedCost && (
                  <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Est. Counter Rate: {selectedEnquiry.estimatedCost}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#857878] dark:text-[#B5A8A8]">
                Customer Note / Query Message
              </span>
              <div className="p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-[rgba(196,176,176,0.2)] text-xs text-[#1A1818] dark:text-[#E8E4E0] leading-relaxed">
                "{selectedEnquiry.customerMessage}"
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#857878] dark:text-[#B5A8A8] py-1 border-t border-b border-[rgba(196,176,176,0.15)]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Received: {selectedEnquiry.createdAt}
              </span>
              <span>Operator: {selectedEnquiry.assignedOperator || 'Aman Sharma'}</span>
            </div>

            {/* Status Management Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block">
                Update Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateEnquiryStatus(selectedEnquiry.id, opt.value)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-left border transition-all flex items-center justify-between ${
                      selectedEnquiry.status === opt.value
                        ? 'bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] border-transparent shadow-xs'
                        : 'bg-transparent border-[rgba(196,176,176,0.3)] text-[#857878] hover:border-[#1A1818] dark:hover:border-[#E8E4E0]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedEnquiry.status === opt.value && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Admin Operator Notes */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Internal Counter Notes</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add private operator notes (e.g. Doc checked, fee paid by cash, token issued #14)..."
                className="w-full p-3 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden focus:border-[#1A1818] dark:focus:border-[#E8E4E0]"
              />
              <button
                type="button"
                onClick={() => updateEnquiryNotes(selectedEnquiry.id, notes)}
                className="w-full py-2 rounded-xl bg-[#6B5C5C] hover:bg-[#524646] text-white text-xs font-semibold transition-colors"
              >
                Save Internal Notes
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete enquiry ${selectedEnquiry.id}?`)) {
                deleteEnquiry(selectedEnquiry.id);
              }
            }}
            className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-semibold p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Record</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedEnquiry(null)}
            className="py-2 px-5 rounded-xl border border-[rgba(196,176,176,0.4)] text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
