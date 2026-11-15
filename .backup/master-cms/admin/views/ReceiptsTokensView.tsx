import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Receipt, ReceiptPaymentMode, ReceiptStatus } from '../types';
import {
  Ticket,
  Search,
  Plus,
  Download,
  Printer,
  Trash2,
  X,
  CreditCard,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
} from 'lucide-react';

const STATUS_OPTIONS: ReceiptStatus[] = [
  'Pending Processing',
  'Ready for Pickup',
  'Completed & Delivered',
];

export const ReceiptsTokensView: React.FC = () => {
  const {
    receipts,
    addReceipt,
    updateReceiptStatus,
    deleteReceipt,
    exportReceiptsCSV,
    services,
    customers,
    setActivePrintReceipt,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // New Receipt Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+91 ');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [applicationRefNo, setApplicationRefNo] = useState('');
  const [govtChallanFee, setGovtChallanFee] = useState<number>(0);
  const [operatorServiceFee, setOperatorServiceFee] = useState<number>(70);
  const [paymentMode, setPaymentMode] = useState<ReceiptPaymentMode>('UPI');
  const [status, setStatus] = useState<ReceiptStatus>('Pending Processing');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
  );
  const [operatorName, setOperatorName] = useState('Aman Sharma');
  const [notes, setNotes] = useState('');

  const totalAmount = (Number(govtChallanFee) || 0) + (Number(operatorServiceFee) || 0);

  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerPhone.includes(searchQuery) ||
      r.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.applicationRefNo && r.applicationRefNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      String(r.tokenNumber).includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setCustomerName('');
    setCustomerPhone('+91 ');
    setSelectedServiceId(services[0]?.id || '');
    setApplicationRefNo('');
    setGovtChallanFee(0);
    setOperatorServiceFee(70);
    setPaymentMode('UPI');
    setStatus('Pending Processing');
    setNotes('');
    setModalOpen(true);
  };

  const handleSelectCustomerPreset = (customerId: string) => {
    const found = customers.find((c) => c.id === customerId);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    const srv = services.find((s) => s.id === selectedServiceId) || services[0];

    const newRcp = addReceipt({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      serviceName: srv ? srv.title : 'General Cyber Cafe Service',
      serviceCategory: srv ? srv.category : 'Government Forms',
      applicationRefNo: applicationRefNo.trim() || undefined,
      govtChallanFee: Number(govtChallanFee) || 0,
      operatorServiceFee: Number(operatorServiceFee) || 0,
      totalAmount,
      paymentMode,
      paymentStatus: paymentMode === 'Pending' ? 'Unpaid' : 'Paid',
      status,
      expectedDeliveryDate,
      operatorName,
      notes: notes.trim() || undefined,
    });

    setModalOpen(false);
    // Automatically trigger slip print modal for counter convenience
    setActivePrintReceipt(newRcp);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0] flex items-center gap-2">
            <Ticket className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Counter POS Receipts & Tokens</span>
          </h1>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8] mt-0.5">
            Issue customer tokens, calculate government challan vs service fees, and print verified counter slips.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportReceiptsCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] bg-white/50 dark:bg-black/20 text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Token</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#857878] dark:text-[#B5A8A8]" />
          <input
            type="text"
            placeholder="Search by token number, customer name, portal ref #, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.06)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] text-xs text-[#1A1818] dark:text-[#E8E4E0] placeholder-[#857878] dark:placeholder-[#B5A8A8] outline-hidden focus:border-[#1A1818] dark:focus:border-[#E8E4E0]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
                : 'bg-black/5 dark:bg-white/5 text-[#857878] dark:text-[#B5A8A8] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]'
            }`}
          >
            All Tokens ({receipts.length})
          </button>
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
                statusFilter === st
                  ? 'bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
                  : 'bg-black/5 dark:bg-white/5 text-[#857878] dark:text-[#B5A8A8] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Receipts & Tokens Table */}
      <div className="rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)] bg-black/5 dark:bg-white/5 text-[#857878] dark:text-[#B5A8A8] font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Token # & ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Service & Portal Ref</th>
                <th className="py-3 px-4">Challan / Fee</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(196,176,176,0.15)] dark:divide-[rgba(196,176,176,0.08)]">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#857878] dark:text-[#B5A8A8]">
                    No receipts found matching filters.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rcp) => (
                  <tr key={rcp.id} className="hover:bg-[rgba(196,176,176,0.1)] transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300">
                          #{rcp.tokenNumber}
                        </span>
                        <span className="text-[10px] font-mono text-[#857878] dark:text-[#B5A8A8]">
                          {rcp.id}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1A1818] dark:text-[#E8E4E0]">{rcp.customerName}</div>
                      <div className="font-mono text-[10px] text-[#857878] dark:text-[#B5A8A8]">{rcp.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-semibold text-[#1A1818] dark:text-[#E8E4E0] truncate">
                        {rcp.serviceName}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 truncate">
                        {rcp.applicationRefNo || 'Counter Kiosk'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#857878] dark:text-[#B5A8A8]">
                      <div>Challan: ₹{rcp.govtChallanFee}</div>
                      <div>Service: ₹{rcp.operatorServiceFee}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#1A1818] dark:text-[#E8E4E0]">
                      ₹{rcp.totalAmount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/5 dark:bg-white/10 text-[#1A1818] dark:text-[#E8E4E0]">
                        {rcp.paymentMode} ({rcp.paymentStatus})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={rcp.status}
                        onChange={(e) => updateReceiptStatus(rcp.id, e.target.value as ReceiptStatus)}
                        className={`text-[10px] font-mono font-semibold px-2 py-1 rounded-lg border-none outline-hidden cursor-pointer ${
                          rcp.status === 'Completed & Delivered'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : rcp.status === 'Ready for Pickup'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActivePrintReceipt(rcp)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-[10px] font-semibold hover:opacity-90 transition-opacity"
                          title="Print Receipt Slip"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete Token #${rcp.tokenNumber} for ${rcp.customerName}?`)) {
                              deleteReceipt(rcp.id);
                            }
                          }}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete Receipt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Token / Receipt Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#F0ECE9] dark:bg-[#1A1818] border border-[rgba(196,176,176,0.35)] dark:border-[rgba(196,176,176,0.2)] rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-bold text-[#1A1818] dark:text-[#E8E4E0]">
                  Generate Counter Token & Receipt
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-[#857878] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {/* Optional Quick Customer Pick */}
              {customers.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                    Quick Pick Registered Customer (Optional)
                  </label>
                  <select
                    onChange={(e) => handleSelectCustomerPreset(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  >
                    <option value="">-- Choose existing customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                    Customer Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                    Mobile Number *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Service Selection *
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Application Portal / Acknowledgement Ref No. (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SSC-CGL-2026-98214 / UTI-PAN-9412"
                  value={applicationRefNo}
                  onChange={(e) => setApplicationRefNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              {/* Fees Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[rgba(196,176,176,0.2)]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                    Govt Challan Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={govtChallanFee}
                    onChange={(e) => setGovtChallanFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                    Operator Service Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={operatorServiceFee}
                    onChange={(e) => setOperatorServiceFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center justify-between pt-1 border-t border-[rgba(196,176,176,0.15)] text-xs font-bold">
                  <span className="text-[#857878] dark:text-[#B5A8A8]">Total Counter Bill:</span>
                  <span className="text-base font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as ReceiptPaymentMode)}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Pending">Payment Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                    Estimated Pickup / TAT
                  </label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Operator Notes / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Photo cropped, OTP verified on phone..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-[rgba(196,176,176,0.3)] text-[#857878] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] font-semibold hover:opacity-90"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Generate & Print Slip</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
