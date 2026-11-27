import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Copy,
  Download,
  Eye,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { Customer, CustomerCategory } from '../types';
import { CmsModal, CmsPageHeader, CmsSurfaceCard } from '../components/CmsPrimitives';
import {
  ENQUIRY_STATUS_META,
  buildWhatsAppHref,
  formatDisplayTimestamp,
  formatTelHref,
  normalizeIndianPhoneKey,
} from '../services/enquiryAnalyticsService';

const CATEGORIES: CustomerCategory[] = [
  'Student / Job Aspirant',
  'Regular Citizen',
  'Farmer / PM-Kisan',
  'Business / Trader',
];

export const CustomersView: React.FC = () => {
  const {
    customers,
    addCustomer,
    deleteCustomer,
    exportCustomersCSV,
    receipts,
    enquiries,
    setSelectedEnquiry,
    setCurrentTab,
    recordEnquiryContactAction,
    showToast,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<CustomerCategory>('Student / Job Aspirant');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setName('');
    setPhone('+91 ');
    setAddress('Varanasi');
    setCategory('Student / Job Aspirant');
    setNotes('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      category,
      notes: notes.trim() || undefined,
    });
    setModalOpen(false);
  };

  const selectedPhoneKey = useMemo(
    () => (selectedCustomer ? normalizeIndianPhoneKey(selectedCustomer.phone) : ''),
    [selectedCustomer]
  );

  const customerReceipts = useMemo(() => {
    if (!selectedCustomer) return [];
    return receipts.filter((r) => {
      if (r.customerId === selectedCustomer.id) return true;
      if (selectedPhoneKey && normalizeIndianPhoneKey(r.customerPhone) === selectedPhoneKey) {
        return true;
      }
      return false;
    });
  }, [selectedCustomer, selectedPhoneKey, receipts]);

  const customerEnquiries = useMemo(() => {
    if (!selectedCustomer || !selectedPhoneKey) return [];
    return enquiries.filter(
      (e) => normalizeIndianPhoneKey(e.phoneNumber) === selectedPhoneKey
    );
  }, [selectedCustomer, selectedPhoneKey, enquiries]);

  const handleCopyPhone = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast('Mobile Copied', value);
    } catch {
      showToast('Mobile Number', value, 'info');
    }
  };

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Client Directory"
        title="Customers"
        description="Maintain client records, verified contact numbers, linked enquiry history, and counter service slips."
        actions={
          <>
            <button
              type="button"
              onClick={exportCustomersCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[var(--st-line)] studio-glass-soft text-xs font-medium text-[var(--st-tx)] hover:border-[#C9A96E]/45 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#1c1208] text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Customer</span>
            </button>
          </>
        }
      />

      <CmsSurfaceCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--st-mut)]" />
            <input
              type="text"
              placeholder="Search customers by name, phone number, or locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl studio-glass-input text-xs outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#20150b] text-[#f6ecdc] dark:bg-[#C9A96E] dark:text-[#1c1208] font-semibold'
                  : 'bg-black/[0.04] dark:bg-white/[0.04] border border-[var(--st-line)] text-[var(--st-mut)] hover:text-[var(--st-tx)]'
              }`}
            >
              All ({customers.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#20150b] text-[#f6ecdc] dark:bg-[#C9A96E] dark:text-[#1c1208] font-semibold'
                    : 'bg-black/[0.04] dark:bg-white/[0.04] border border-[var(--st-line)] text-[var(--st-mut)] hover:text-[var(--st-tx)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </CmsSurfaceCard>

      {/* Table */}
      <div className="rounded-[20px] studio-glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--st-line)] bg-black/[0.03] dark:bg-black/25 text-[var(--st-mut)] font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Customer Name &amp; ID</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Visits</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Last Visit</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--st-line)]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[var(--st-mut)]">
                    No customers match your current filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const waUrl = buildWhatsAppHref(cust.phone, `Namaste ${cust.name}`);

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-black/[0.025] dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                      onClick={() => setSelectedCustomer(cust)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[var(--st-tx)]">{cust.name}</div>
                        <div className="text-[10px] font-mono text-[var(--st-mut)]">{cust.id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[var(--st-tx)]">{cust.phone}</div>
                        <div className="text-[10px] text-[var(--st-mut)] truncate max-w-[160px]">
                          {cust.address}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#C9A96E]/15 border border-[#C9A96E]/35 text-[#8c5d23] dark:text-[#DFC492]">
                          {cust.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[var(--st-tx)] tabular-nums">
                        {cust.totalVisits} visits
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        ₹{cust.totalSpent.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] font-mono text-[var(--st-mut)] tabular-nums">
                        {cust.lastVisitDate}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="WhatsApp Customer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={formatTelHref(cust.phone)}
                            className="p-1.5 rounded-lg text-[#8c5d23] dark:text-[#C9A96E] hover:bg-[#C9A96E]/10 transition-colors"
                            title="Call Customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(cust)}
                            className="p-1.5 rounded-lg text-[#8c5d23] dark:text-[#C9A96E] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(`Remove ${cust.name} from customer directory?`)
                              ) {
                                deleteCustomer(cust.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Customer Detail Modal */}
      <CmsModal
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || ''}
        subtitle={selectedCustomer ? `${selectedCustomer.category} · ${selectedCustomer.id}` : ''}
        maxWidthClass="max-w-2xl"
      >
        {selectedCustomer && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl studio-glass-soft">
                <div className="text-[10px] text-[var(--st-mut)] font-mono">Total Visits</div>
                <div className="text-lg font-mono text-[var(--st-tx)] mt-0.5 tabular-nums">
                  {selectedCustomer.totalVisits}
                </div>
              </div>
              <div className="p-3 rounded-xl studio-glass-soft">
                <div className="text-[10px] text-[var(--st-mut)] font-mono">Total Spent</div>
                <div className="text-lg font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 tabular-nums">
                  ₹{selectedCustomer.totalSpent}
                </div>
              </div>
              <div className="p-3 rounded-xl studio-glass-soft">
                <div className="text-[10px] text-[var(--st-mut)] font-mono">Enquiries</div>
                <div className="text-lg font-mono text-[#8c5d23] dark:text-[#DFC492] mt-0.5 tabular-nums">
                  {customerEnquiries.length}
                </div>
              </div>
              <div className="p-3 rounded-xl studio-glass-soft">
                <div className="text-[10px] text-[var(--st-mut)] font-mono">Registered</div>
                <div className="text-xs font-mono text-[var(--st-tx)] mt-1">
                  {selectedCustomer.createdAt}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl studio-glass-soft text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[var(--st-tx)]">
                  <Phone className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span className="font-mono">{selectedCustomer.phone}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyPhone(selectedCustomer.phone)}
                    className="p-1 rounded hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[var(--st-mut)] cursor-pointer"
                    title="Copy Mobile Number"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={buildWhatsAppHref(
                      selectedCustomer.phone,
                      `Namaste ${selectedCustomer.name}, from Aman Computer:`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-medium"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={formatTelHref(selectedCustomer.phone)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C9A96E] text-[#1c1208] text-[11px] font-semibold"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[var(--st-tx)]">
                <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>{selectedCustomer.address}</span>
              </div>
              {selectedCustomer.notes && (
                <div className="pt-2 text-[11px] text-[var(--st-mut)] border-t border-[var(--st-line)]">
                  Note: {selectedCustomer.notes}
                </div>
              )}
            </div>

            {/* Verified Phone-Matched Enquiry History */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-[var(--st-tx)]">
                <span>Linked Enquiry History (Matched by Mobile)</span>
                <span className="text-[var(--st-mut)] font-mono text-[11px]">
                  {customerEnquiries.length} enquiries
                </span>
              </div>

              {customerEnquiries.length === 0 ? (
                <div className="p-4 rounded-xl studio-glass-soft text-center text-xs text-[var(--st-mut)]">
                  No enquiries matched to {selectedCustomer.phone}.
                </div>
              ) : (
                <div className="divide-y divide-[var(--st-line)] max-h-44 overflow-y-auto admin-studio-scroll rounded-xl border border-[var(--st-line)]">
                  {customerEnquiries.map((enq) => {
                    const meta = ENQUIRY_STATUS_META[enq.status] || ENQUIRY_STATUS_META.new;
                    return (
                      <div
                        key={enq.id}
                        className="p-3 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-[var(--st-tx)] truncate">
                            {enq.id} — {enq.serviceName}
                          </div>
                          <div className="text-[10px] text-[var(--st-mut)] font-mono">
                            {formatDisplayTimestamp(enq.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${meta.badgeClass}`}>
                            {meta.shortLabel}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              recordEnquiryContactAction(enq.id, 'call');
                              setSelectedCustomer(null);
                              setSelectedEnquiry(enq);
                              setCurrentTab('enquiries');
                            }}
                            className="px-2.5 py-1 rounded-lg border border-[var(--st-line)] hover:border-[#C9A96E]/55 text-[11px] font-medium text-[var(--st-tx)] cursor-pointer"
                          >
                            Inspect
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-[var(--st-tx)]">
                <span>Past Slip History</span>
                <span className="text-[var(--st-mut)] font-mono text-[11px]">
                  {customerReceipts.length} records
                </span>
              </div>

              {customerReceipts.length === 0 ? (
                <div className="p-4 rounded-xl studio-glass-soft text-center text-xs text-[var(--st-mut)]">
                  No past slips associated with this customer yet.
                </div>
              ) : (
                <div className="divide-y divide-[var(--st-line)] max-h-40 overflow-y-auto admin-studio-scroll">
                  {customerReceipts.map((r) => (
                    <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-[var(--st-tx)]">
                          Token #{r.tokenNumber} — {r.serviceName}
                        </div>
                        <div className="text-[10px] text-[var(--st-mut)] font-mono">
                          {r.createdAt} · Ref: {r.applicationRefNo || 'Counter'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold text-[var(--st-tx)]">
                          ₹{r.totalAmount}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          {r.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--st-line)]">
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomer(null);
                  setCurrentTab('enquiries');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#1c1208] text-xs font-semibold cursor-pointer"
              >
                <span>Open Enquiries Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl border border-[var(--st-line)] text-xs font-medium text-[var(--st-mut)] hover:text-[var(--st-tx)] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </CmsModal>

      {/* Add Customer Modal */}
      <CmsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New Customer"
        subtitle="Add a client record to the Aman Computer directory"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
              Full Customer Name *
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Ramesh Chandra Maurya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl studio-glass-input outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
              Phone Number *
            </label>
            <input
              required
              type="text"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl studio-glass-input font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
              Customer Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CustomerCategory)}
              className="w-full px-3 py-2.5 rounded-xl studio-glass-input outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
              Locality / Address
            </label>
            <input
              type="text"
              placeholder="e.g. Lanka, Varanasi - 221005"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl studio-glass-input outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--st-tx)] mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Prefers SMS alerts, applies for SSC / Railway..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl studio-glass-input outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--st-line)]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[var(--st-line)] text-[var(--st-mut)] hover:text-[var(--st-tx)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#1c1208] font-semibold cursor-pointer"
            >
              Save Customer
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
};
