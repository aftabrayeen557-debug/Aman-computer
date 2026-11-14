import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { X, Printer, CheckCircle2, Ticket, ShieldCheck } from 'lucide-react';

export const ReceiptPrintModal: React.FC = () => {
  const { activePrintReceipt, setActivePrintReceipt, businessProfile } = useAdmin();

  if (!activePrintReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#F0ECE9] dark:bg-[#1A1818] border border-[rgba(196,176,176,0.35)] dark:border-[rgba(196,176,176,0.2)] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)] shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-sm text-[#1A1818] dark:text-[#E8E4E0]">
              Customer Counter Slip / Token
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={() => setActivePrintReceipt(null)}
              className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#857878] dark:text-[#B5A8A8]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Counter Receipt Slip */}
        <div className="p-6 overflow-y-auto font-mono text-xs select-text">
          <div className="bg-white dark:bg-[#141212] p-6 rounded-2xl border border-[rgba(196,176,176,0.3)] shadow-inner text-[#1A1818] dark:text-[#E8E4E0] space-y-4">
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-gray-300 dark:border-gray-800 space-y-1">
              <div className="font-sans font-black text-lg tracking-tight uppercase">
                {businessProfile.businessName}
              </div>
              <div className="text-[10px] text-gray-500">{businessProfile.tagline}</div>
              <div className="text-[10px] text-gray-500">
                {businessProfile.addressLine}, {businessProfile.city} - {businessProfile.pincode}
              </div>
              <div className="text-[10px] text-gray-500 font-bold">
                WhatsApp / Support: {businessProfile.primaryPhone}
              </div>
              <div className="text-[9px] text-gray-400">
                Reg/Trade No: {businessProfile.tradeLicenseNo}
              </div>
            </div>

            {/* Token Highlight Banner */}
            <div className="py-2.5 px-4 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-center">
              <div className="text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold">
                Daily Counter Token Number
              </div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-300 tracking-wider my-0.5">
                #{String(activePrintReceipt.tokenNumber).padStart(3, '0')}
              </div>
              <div className="text-[10px] text-gray-500">
                Receipt ID: {activePrintReceipt.id} • Issued: {activePrintReceipt.createdAt}
              </div>
            </div>

            {/* Customer & Service Info */}
            <div className="space-y-1.5 py-2 border-b border-dashed border-gray-300 dark:border-gray-800 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Customer Name:</span>
                <span className="font-bold">{activePrintReceipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact Number:</span>
                <span>{activePrintReceipt.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service Category:</span>
                <span>{activePrintReceipt.serviceCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service Requested:</span>
                <span className="font-bold text-right max-w-[200px] truncate">{activePrintReceipt.serviceName}</span>
              </div>
              {activePrintReceipt.applicationRefNo && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Portal / Ref No:</span>
                  <span>{activePrintReceipt.applicationRefNo}</span>
                </div>
              )}
            </div>

            {/* Fees Breakdown */}
            <div className="space-y-1.5 py-2 border-b border-dashed border-gray-300 dark:border-gray-800 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Govt Challan / Portal Fee:</span>
                <span>₹{activePrintReceipt.govtChallanFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Operator / Form Processing Fee:</span>
                <span>₹{activePrintReceipt.operatorServiceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-800 font-bold text-sm">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-600 dark:text-emerald-400">₹{activePrintReceipt.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment & Status */}
            <div className="space-y-1 text-[10px] text-gray-500">
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {activePrintReceipt.paymentMode} ({activePrintReceipt.paymentStatus})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Processing Status:</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{activePrintReceipt.status}</span>
              </div>
              {activePrintReceipt.expectedDeliveryDate && (
                <div className="flex justify-between">
                  <span>Est. Pickup / Delivery:</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{activePrintReceipt.expectedDeliveryDate}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Attended By Operator:</span>
                <span>{activePrintReceipt.operatorName}</span>
              </div>
            </div>

            {/* Notes & Verification Stamp */}
            {activePrintReceipt.notes && (
              <div className="p-2 rounded bg-black/5 dark:bg-white/5 text-[10px] italic text-gray-500">
                Note: {activePrintReceipt.notes}
              </div>
            )}

            <div className="pt-3 border-t border-dashed border-gray-300 dark:border-gray-800 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>VERIFIED DIGITAL COUNTER TRANSACTION</span>
              </div>
              <div className="text-[9px] text-gray-400">
                Please retain this token slip for physical card pickup or status inquiries.
              </div>
              <div className="text-[9px] text-gray-400 font-sans">
                UPI Payment: <span className="font-mono font-semibold">{businessProfile.upiId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
