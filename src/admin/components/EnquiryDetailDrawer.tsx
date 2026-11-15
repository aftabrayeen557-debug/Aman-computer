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
      className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex justify-end"
      onClick={() => setSelectedEnquiry(null)}
    >
      <div
        className="w-full max-w-lg h-full bg-[#101014] border-l border-[#C9A96E]/25 shadow-2xl flex flex-col justify-between overflow-y-auto admin-studio-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="p-5 border-b border-white/[0.07] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#211B16] border border-[#C9A96E]/30 text-[#C9A96E]">
                  {selectedEnquiry.id}
                </span>
                {selectedEnquiry.urgency === 'urgent' && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    URGENT
                  </span>
                )}
              </div>
              <h2 className="font-editorial text-2xl text-[#E8E5DF] mt-1.5 tracking-tight">
                Customer Enquiry Details
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedEnquiry(null)}
              className="p-1.5 rounded-lg hover:bg-white/[0.05] text-[#85838A] hover:text-[#E8E5DF] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 bg-[#141419] border-b border-white/[0.07] grid grid-cols-2 gap-3">
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
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] font-semibold text-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Customer</span>
            </a>
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#85838A]">
                Customer Name &amp; Phone
              </span>
              <div className="flex items-center gap-2 text-base font-semibold text-[#E8E5DF]">
                <User className="w-4 h-4 text-[#C9A96E]" />
                {selectedEnquiry.customerName}
              </div>
              <div className="text-xs font-mono text-[#85838A] pl-6">
                {selectedEnquiry.phoneNumber}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#85838A]">
                Requested Service
              </span>
              <div className="p-3 rounded-xl bg-[#141419] border border-white/[0.07]">
                <div className="text-sm font-medium text-[#E8E5DF]">
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
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#85838A]">
                Customer Note / Query Message
              </span>
              <div className="p-3 rounded-xl bg-[#0A0A0E] border border-white/[0.07] text-xs text-[#E8E5DF] leading-relaxed">
                "{selectedEnquiry.customerMessage}"
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#85838A] py-2 border-y border-white/[0.07]">
              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#C9A96E]" />
                Received: {selectedEnquiry.createdAt}
              </span>
              <span>Operator: {selectedEnquiry.assignedOperator || 'Sharique Aman'}</span>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-medium text-[#E8E5DF] block">
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
                        ? 'bg-[#211B16] text-[#E8E5DF] border-[#C9A96E]/50'
                        : 'bg-[#141419] border-white/[0.07] text-[#85838A] hover:border-[#C9A96E]/30 hover:text-[#E8E5DF]'
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
              <label className="text-xs font-medium text-[#E8E5DF] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>Internal Counter Notes</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add private counter notes (e.g. documents verified, follow-up scheduled)..."
                className="w-full p-3 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
              />
              <button
                type="button"
                onClick={() => updateEnquiryNotes(selectedEnquiry.id, notes)}
                className="w-full py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
              >
                Save Internal Notes
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/[0.07] flex items-center justify-between bg-[#0A0A0E]/60">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete enquiry ${selectedEnquiry.id}?`)) {
                deleteEnquiry(selectedEnquiry.id);
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Record</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedEnquiry(null)}
            className="py-2 px-5 rounded-xl border border-white/[0.1] text-xs font-medium text-[#E8E5DF] hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
