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

  const statusOptions: Array<{ value: EnquiryStatus; label: string }> = [
    { value: 'new', label: 'New / Unread' },
    { value: 'pending', label: 'Pending Docs' },
    { value: 'in-progress', label: 'In Progress / At Counter' },
    { value: 'completed', label: 'Completed & Delivered' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[#24160a]/30 dark:bg-black/60 backdrop-blur-[5px] flex justify-end"
      onClick={() => setSelectedEnquiry(null)}
    >
      <div
        className="w-full max-w-lg h-full studio-glass-popover border-l border-[var(--st-line-strong)] flex flex-col justify-between overflow-y-auto admin-studio-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="p-5 border-b border-[var(--st-line)] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#C9A96E]/15 border border-[#C9A96E]/35 text-[#C9A96E]">
                  {selectedEnquiry.id}
                </span>
                {selectedEnquiry.urgency === 'urgent' && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/15 text-rose-500 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    URGENT
                  </span>
                )}
              </div>
              <h2 className="font-editorial text-2xl text-[var(--st-tx)] mt-1.5 tracking-tight">
                Customer Enquiry Details
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedEnquiry(null)}
              className="p-1.5 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-[var(--st-mut)] hover:text-[var(--st-tx)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-[var(--st-line)] grid grid-cols-2 gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
            <a
              href={callUrl}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#1c1208] font-semibold text-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Customer</span>
            </a>
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--st-mut)]">
                Customer Name &amp; Phone
              </span>
              <div className="flex items-center gap-2 text-base font-semibold text-[var(--st-tx)]">
                <User className="w-4 h-4 text-[#C9A96E]" />
                {selectedEnquiry.customerName}
              </div>
              <div className="text-xs font-mono text-[var(--st-mut)] pl-6">
                {selectedEnquiry.phoneNumber}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--st-mut)]">
                Requested Service
              </span>
              <div className="p-3 rounded-xl studio-glass-card">
                <div className="text-sm font-medium text-[var(--st-tx)]">
                  {selectedEnquiry.serviceName}
                </div>
                {selectedEnquiry.estimatedCost && (
                  <div className="text-xs font-mono text-[#C9A96E] mt-0.5">
                    Est. Counter Rate: {selectedEnquiry.estimatedCost}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--st-mut)]">
                Customer Note / Query Message
              </span>
              <div className="p-3 rounded-xl bg-black/[0.04] dark:bg-black/30 border border-[var(--st-line)] text-xs text-[var(--st-tx)] leading-relaxed">
                &ldquo;{selectedEnquiry.customerMessage}&rdquo;
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--st-mut)] py-2 border-y border-[var(--st-line)]">
              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#C9A96E]" />
                Received: {selectedEnquiry.createdAt}
              </span>
              <span>Operator: {selectedEnquiry.assignedOperator || 'Sharique Aman'}</span>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-medium text-[var(--st-tx)] block">
                Update Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateEnquiryStatus(selectedEnquiry.id, opt.value)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium text-left border transition-all flex items-center justify-between cursor-pointer ${
                      selectedEnquiry.status === opt.value
                        ? 'bg-[#C9A96E]/18 text-[var(--st-tx)] border-[#C9A96E]/55'
                        : 'bg-black/[0.03] dark:bg-white/[0.03] border-[var(--st-line)] text-[var(--st-mut)] hover:border-[#C9A96E]/35 hover:text-[var(--st-tx)]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedEnquiry.status === opt.value && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-medium text-[var(--st-tx)] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>Internal Counter Notes</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add private counter notes (e.g. documents verified, follow-up scheduled)..."
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
        </div>

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
